import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox, webkit } from "playwright";

const baseUrl = process.env.QUALITY_QA_URL ?? "http://127.0.0.1:4174";
const apiUrl = process.env.QUALITY_QA_API_URL ?? "http://127.0.0.1:4000";
const artifactDir = path.resolve(process.cwd(), "../../qa/quality");
const managedApi = process.env.QUALITY_QA_URL ? null : await startApiServer(apiUrl);
const managedWeb = process.env.QUALITY_QA_URL ? null : await startPreviewServer(baseUrl);
const allBrowserTypes = { chromium, firefox, webkit };
const browserTypes = process.env.QUALITY_QA_BROWSER
  ? { [process.env.QUALITY_QA_BROWSER]: allBrowserTypes[process.env.QUALITY_QA_BROWSER] }
  : allBrowserTypes;
const routes = [
  { name: "market", path: "/", selector: ".market-hero, .feed-area" },
  { name: "profile", path: "/profile", selector: ".profile-band" },
  { name: "admin", path: "/admin", selector: ".admin-band" }
].filter((route) => !process.env.QUALITY_QA_ROUTE || route.name === process.env.QUALITY_QA_ROUTE);
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 }
].filter((viewport) => !process.env.QUALITY_QA_VIEWPORT || viewport.name === process.env.QUALITY_QA_VIEWPORT);
const failures = [];
const skippedBrowsers = [];

await mkdir(artifactDir, { recursive: true });

try {
  for (const [browserName, browserType] of Object.entries(browserTypes)) {
    const browser = await browserType.launch();
    try {
      // Some local Playwright installations expose Firefox but cannot create a
      // page. Keep that environment limitation explicit without hiding page QA
      // failures for browsers that can actually run.
      try {
        const probeContext = await browser.newContext();
        const probePage = await probeContext.newPage();
        await probePage.close();
        await probeContext.close();
      } catch (error) {
        skippedBrowsers.push(`${browserName}: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
      for (const route of routes) {
        for (const viewport of viewports) {
          const caseName = `${browserName}-${viewport.name}-${route.name}`;
          const context = await browser.newContext({
            locale: "fa-IR",
            viewport: { width: viewport.width, height: viewport.height }
          });
          const page = await context.newPage();
          // Register the proxy on the page. Firefox in the local Playwright runtime
          // can fail when a context route is installed before its first page exists.
          await page.route("https://api.4dbazar.ir/**", (route) => proxyToLocalApi(route));
          const pageErrors = [];
          page.on("pageerror", (error) => pageErrors.push(error.message));

          await page.goto(new URL(route.path, baseUrl).toString(), {
            waitUntil: "networkidle",
            timeout: 30_000
          });
          await page.locator(route.selector).first().waitFor({ state: "visible", timeout: 10_000 });

          const pageState = await page.evaluate(() => ({
            bodyLength: document.body.innerText.trim().length,
            horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
            title: document.title,
            lang: document.documentElement.lang,
            dir: document.documentElement.dir
          }));
          if (pageState.bodyLength < 100) failures.push(`${caseName}: page appears blank`);
          if (pageState.horizontalOverflow) failures.push(`${caseName}: horizontal overflow detected`);
          if (!pageState.title.includes("4D")) failures.push(`${caseName}: document title is incomplete`);
          if (pageState.lang !== "fa" || pageState.dir !== "rtl") failures.push(`${caseName}: language direction metadata is invalid`);
          if (pageErrors.length) failures.push(`${caseName}: ${pageErrors.join(" | ")}`);

          const accessibility = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze();
          const blockingViolations = accessibility.violations.filter((violation) =>
            violation.impact === "critical" || violation.impact === "serious"
          );
          for (const violation of blockingViolations) {
            const targets = violation.nodes
              .map((node) => `${node.target.join(" ")} [${node.failureSummary ?? "no details"}]`)
              .join(", ");
            failures.push(`${caseName}: a11y ${violation.id} (${violation.nodes.length} node(s)): ${targets}`);
          }

          await page.screenshot({
            path: path.join(artifactDir, `${caseName}.png`),
            fullPage: false
          });
          await context.close();
        }
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  managedWeb?.kill();
  managedApi?.kill();
}

if (failures.length) {
  console.error([...new Set(failures)].join("\n"));
  process.exit(1);
}

console.info(`Cross-browser quality QA passed. Artifacts: ${artifactDir}`);
if (skippedBrowsers.length) {
  console.warn(`Browsers skipped because their local runtime could not create a page:\n- ${skippedBrowsers.join("\n- ")}`);
}

async function proxyToLocalApi(route) {
  const request = route.request();
  const headers = request.headers();
  delete headers.host;
  delete headers["content-length"];
  headers.origin = baseUrl;
  const response = await fetch(request.url().replace("https://api.4dbazar.ir", apiUrl), {
    method: request.method(),
    headers,
    body: ["GET", "HEAD"].includes(request.method()) ? undefined : request.postDataBuffer()
  });
  const responseHeaders = Object.fromEntries(response.headers.entries());
  responseHeaders["access-control-allow-origin"] = baseUrl;
  await route.fulfill({
    status: response.status,
    headers: responseHeaders,
    body: Buffer.from(await response.arrayBuffer())
  });
}

async function startPreviewServer(url) {
  const server = spawn("npm", ["run", "preview", "--", "--port", new URL(url).port], {
    shell: true,
    stdio: "ignore",
    windowsHide: true
  });
  await waitForUrl(url, server, "preview server");
  return server;
}

async function startApiServer(url) {
  const server = spawn(process.execPath, ["../api/dist/main.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: "test",
      API_HOST: "127.0.0.1",
      API_PORT: new URL(url).port,
      CORS_ORIGINS: baseUrl,
      DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:59999/four_d"
    },
    stdio: "ignore",
    windowsHide: true
  });
  await waitForUrl(new URL("/health/live", url).toString(), server, "API server");
  return server;
}

async function waitForUrl(url, server, label) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      if (server.exitCode !== null) break;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  server.kill();
  throw new Error(`${label} did not become ready at ${url}`);
}
