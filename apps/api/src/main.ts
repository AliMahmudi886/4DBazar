import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import { loadConfig } from "./config.js";
import { buildServer } from "./server.js";

loadEnvironment();

void start().catch((error: unknown) => {
  console.error("API startup failed", error);
  process.exitCode = 1;
});

async function start() {
  const config = loadConfig();
  const app = buildServer(config);

  // cPanel/Passenger exposes the assigned port through PORT.
  const runtimePort = process.env.PORT ? Number(process.env.PORT) : config.API_PORT;
  await app.listen({ host: config.API_HOST, port: runtimePort });
  app.log.info(
    {
      nodeEnv: config.NODE_ENV,
      otpProvider: config.OTP_PROVIDER,
      smsVendor: config.SMS_VENDOR,
      smsConfigured: Boolean(config.SMS_API_KEY)
    },
    "api runtime config loaded"
  );
}

function loadEnvironment() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(currentDir, "../../../.env"),
    path.resolve(process.cwd(), "../../.env"),
    path.resolve(process.cwd(), ".env")
  ];

  for (const envPath of candidates) {
    if (existsSync(envPath)) {
      loadDotenv({ path: envPath });
    }
  }
}
