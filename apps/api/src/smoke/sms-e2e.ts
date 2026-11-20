import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { config as loadDotenv } from "dotenv";
import { loadConfig } from "../config.js";
import { buildServer } from "../server.js";

loadDotenv({ path: path.resolve(process.cwd(), "../../.env"), quiet: true });
loadDotenv({ path: path.resolve(process.cwd(), ".env"), quiet: true });

const phoneNumber = process.env.TEST_PHONE_NUMBER?.trim();

if (!phoneNumber) {
  console.error("TEST_PHONE_NUMBER is required. Example: TEST_PHONE_NUMBER=+989121234567 npm run sms:smoke");
  process.exit(1);
}

const config = loadConfig({
  ...process.env,
  OTP_PROVIDER: process.env.OTP_PROVIDER ?? "sms",
  SMS_VENDOR: process.env.SMS_VENDOR ?? "kavenegar"
});

if (config.OTP_PROVIDER !== "sms") {
  console.error("OTP_PROVIDER must be sms for this smoke test.");
  process.exit(1);
}

const app = buildServer(config);
const readline = createInterface({ input, output });

try {
  const captchaProof = await getCaptchaProof();
  const requestResponse = await app.inject({
    method: "POST",
    url: "/api/v1/auth/request-otp",
    payload: { phone_number: phoneNumber, captcha_proof: captchaProof }
  });

  if (requestResponse.statusCode !== 202) {
    console.error(`Request OTP failed: HTTP ${requestResponse.statusCode}`);
    console.error(requestResponse.body);
    process.exit(1);
  }

  console.info(`OTP sent to ${maskPhone(phoneNumber)}. Check the SMS and enter the code here.`);
  const otp = (process.env.OTP_CODE?.trim() || (await askForOtpCode(readline))).trim();

  const verifyResponse = await app.inject({
    method: "POST",
    url: "/api/v1/auth/verify-otp",
    payload: { phone_number: phoneNumber, otp }
  });

  if (verifyResponse.statusCode !== 201) {
    console.error(`Verify OTP failed: HTTP ${verifyResponse.statusCode}`);
    console.error(verifyResponse.body);
    process.exit(1);
  }

  const body = verifyResponse.json() as {
    data: {
      token: string;
      user: {
        id: string;
        phone_number: string;
      };
    };
  };

  console.info("SMS OTP smoke test passed.");
  console.info(`User: ${body.data.user.id}`);
  console.info(`Session token prefix: ${body.data.token.slice(0, 8)}...`);
} finally {
  readline.close();
  await app.close();
}

function maskPhone(value: string) {
  if (value.length <= 6) return "***";
  return `${value.slice(0, 4)}***${value.slice(-3)}`;
}

async function askForOtpCode(readline: ReturnType<typeof createInterface>) {
  try {
    return await readline.question("OTP code: ");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ERR_USE_AFTER_CLOSE") {
      console.error("Interactive stdin is not available. Run this in PowerShell, or set OTP_CODE=123456 for a one-shot verify.");
      process.exit(1);
    }
    throw error;
  }
}

async function getCaptchaProof() {
  const challenge = await app.inject({ method: "GET", url: "/api/v1/auth/captcha-challenge" });
  if (challenge.statusCode !== 200) {
    console.error(`Captcha challenge failed: HTTP ${challenge.statusCode}`);
    process.exit(1);
  }
  const challengeBody = challenge.json() as { data: { challenge_id: string; target: number } };
  const proof = await app.inject({
    method: "POST",
    url: "/api/v1/auth/captcha-proof",
    payload: {
      challenge_id: challengeBody.data.challenge_id,
      value: challengeBody.data.target
    }
  });
  if (proof.statusCode !== 200) {
    console.error(`Captcha proof failed: HTTP ${proof.statusCode}`);
    process.exit(1);
  }
  return (proof.json() as { data: { captcha_proof: string } }).data.captcha_proof;
}
