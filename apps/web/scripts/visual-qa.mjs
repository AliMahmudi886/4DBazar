import { spawn } from "node:child_process";
import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.VISUAL_QA_URL ?? "http://127.0.0.1:4173";
const screenshotDir = path.resolve(process.cwd(), "../../qa/screenshots");
const managedServer = process.env.VISUAL_QA_URL ? null : await startPreviewServer(baseUrl);

const viewports = [
  { name: "desktop-market", width: 1440, height: 1000, section: "market" },
  { name: "mobile-market", width: 390, height: 844, section: "market" },
  { name: "desktop-admin", width: 1440, height: 1000, section: "admin" },
  { name: "mobile-admin", width: 390, height: 844, section: "admin" },
  { name: "desktop-listing-detail", width: 1440, height: 1000, section: "listing" },
  { name: "mobile-listing-detail", width: 390, height: 844, section: "listing" }
];

await mkdir(screenshotDir, { recursive: true });

const browser = await launchBrowser();
const failures = [];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    if (viewport.section === "listing") await mockListingDetailApi(page);
    const targetUrl = viewport.section === "admin"
      ? new URL("/admin", baseUrl).toString()
      : viewport.section === "listing"
        ? new URL("/listing/qa-listing", baseUrl).toString()
        : baseUrl;
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 20_000 });

    const bodyText = (await page.locator("body").innerText()).trim();
    if (bodyText.length < 100) {
      failures.push(`${viewport.name}: page appears blank or under-rendered`);
    }

    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    if (horizontalOverflow) {
      failures.push(`${viewport.name}: horizontal overflow detected`);
    }

    const visibleCards = await page.locator(".listing-card, .case-card, .empty-state, .access-panel, .listing-detail-grid").count();
    if (visibleCards === 0) {
      failures.push(`${viewport.name}: no primary content card or state is visible`);
    }

    if (viewport.section === "listing") {
      const mediaSize = await page.locator(".listing-detail-main-media img").evaluate((image) => ({
        width: image.getBoundingClientRect().width,
        height: image.getBoundingClientRect().height
      }));
      if (mediaSize.width < 280 || mediaSize.height < 200) {
        failures.push(`${viewport.name}: listing media is undersized (${mediaSize.width}x${mediaSize.height})`);
      }
      if (!(await page.getByRole("heading", { name: "خانه باغ بازسازی شده در درق" }).isVisible())) {
        failures.push(`${viewport.name}: listing title is not visible`);
      }
      if ((await page.getByText("کارکرده", { exact: true }).count()) > 0) {
        failures.push(`${viewport.name}: irrelevant item condition is visible for real estate`);
      }
      if (!(await page.locator(".listing-detail-sticky-actions").isVisible())) {
        failures.push(`${viewport.name}: listing actions are not visible`);
      }
    }

    await page.screenshot({
      path: path.join(screenshotDir, `${viewport.name}.png`),
      fullPage: true
    });

    await page.close();
  }
} finally {
  await browser.close();
  managedServer?.kill();
}

async function mockListingDetailApi(page) {
  const image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="#d8ece8"/><rect y="510" width="1200" height="390" fill="#7aa39b"/><path d="M100 600 480 240l360 360" fill="#fff" opacity=".9"/><rect x="390" y="470" width="510" height="310" fill="#052651"/><circle cx="1020" cy="190" r="82" fill="#ffc107"/></svg>`);

  await page.route("https://api.4dbazar.ir/**", async (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname === "/api/v1/contents/qa-listing") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ data: {
          id: "qa-listing",
          title: "خانه باغ بازسازی شده در درق",
          description: "خانه‌ای آرام با حیاط مستقل، دسترسی مناسب و سند آماده بررسی. اطلاعات ملک شفاف ثبت شده است.",
          content_type: "listing",
          city_id: "qa-city",
          category_id: "qa-real-estate",
          status: "approved",
          price_amount: 4_850_000_000,
          price_type: "fixed",
          item_condition: "used",
          view_count: 128,
          created_at: "2026-08-24T10:30:00.000Z",
          storefront_slug: "qa-store",
          storefront_name: "غرفه املاک محلی",
          media: [
            { url: image, mime_type: "image/svg+xml", sort_order: 0 },
            { url: image, mime_type: "image/svg+xml", sort_order: 1 }
          ],
          metadata_json: { property_type: "garden_house", area_m2: 480, rooms: 2 }
        } })
      });
      return;
    }
    if (pathname === "/api/v1/regions/4d/cities") {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ data: [{ id: "qa-city", code: "dorq", name_fa: "درق" }] }) });
      return;
    }
    if (pathname === "/api/v1/categories") {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ data: [{
        id: "qa-real-estate",
        slug: "real-estate",
        name_fa: "املاک",
        content_types: ["listing"],
        metadata_schema: [
          { key: "property_type", label_fa: "نوع ملک", options: [{ value: "garden_house", label_fa: "خانه باغ" }] },
          { key: "area_m2", label_fa: "متراژ" },
          { key: "rooms", label_fa: "تعداد اتاق" }
        ]
      }] }) });
      return;
    }
    await route.fallback();
  });
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.info(`Visual QA passed. Screenshots saved to ${screenshotDir}`);

async function launchBrowser() {
  try {
    return await chromium.launch();
  } catch (error) {
    const executablePath =
      process.env.PLAYWRIGHT_CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    await access(executablePath);
    console.warn("Bundled Playwright browser is unavailable; using system Chrome.");
    return chromium.launch({ executablePath });
  }
}

async function startPreviewServer(url) {
  const server = spawn("npm", ["run", "preview", "--", "--port", new URL(url).port], {
    shell: true,
    stdio: "ignore",
    windowsHide: true
  });

  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return server;
    } catch {
      // keep waiting
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  server.kill();
  throw new Error(`Preview server did not become ready at ${url}`);
}
