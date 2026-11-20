import assert from "node:assert/strict";
import test from "node:test";
import { OtpService, type OtpChallengeStore } from "./otp.js";

test("kavenegar sms adapter sends local iran phone format without exposing dev code", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  let requestedBody = "";

  globalThis.fetch = async (input, init) => {
    requestedUrl = input.toString();
    requestedBody = init?.body?.toString() ?? "";
    return new Response(
      JSON.stringify({
        return: { status: 200, message: "accepted" },
        entries: [{ messageid: 123, status: 1, statustext: "queued" }]
      }),
      { status: 200 }
    );
  };

  try {
    const otp = new OtpService({
      provider: "sms",
      smsVendor: "kavenegar",
      smsApiKey: "test-key",
      smsSender: "20006535"
    });

    const result = await otp.request("+989121234567");

    assert.equal(result.delivery, "sms");
    assert.equal(result.dev_code, undefined);
    assert.equal(requestedUrl, "https://api.kavenegar.com/v1/test-key/sms/send.json");
    const body = new URLSearchParams(requestedBody);
    assert.equal(body.get("receptor"), "09121234567");
    assert.equal(body.get("sender"), "20006535");
    assert.match(body.get("message") ?? "", /کد تایید 4D: \d{6}/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("kavenegar sms adapter rejects provider errors returned in a successful HTTP response", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ return: { status: 418, message: "insufficient credit" }, entries: null }), {
      status: 200
    });

  try {
    const otp = new OtpService({
      provider: "sms",
      smsVendor: "kavenegar",
      smsApiKey: "test-key",
      smsSender: "20006535"
    });

    await assert.rejects(() => otp.request("+989121234567"), /کد 418/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("kavenegar sms adapter converts network failures to a service error", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    const error = new TypeError("fetch failed");
    error.cause = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
    throw error;
  };

  try {
    const otp = new OtpService({
      provider: "sms",
      smsVendor: "kavenegar",
      smsApiKey: "test-key",
      smsSender: "20006535"
    });

    await assert.rejects(() => otp.request("+989121234567"), /اتصال به سرویس پیامک/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("otp service can use a persisted challenge store", async () => {
  const saved: { code: string; consumed: boolean; attempts: number } = {
    code: "",
    consumed: false,
    attempts: 0
  };
  const store: OtpChallengeStore = {
    async save(_phoneNumber, code) {
      saved.code = code;
      saved.consumed = false;
      saved.attempts = 0;
    },
    async verify(_phoneNumber, code) {
      if (saved.consumed || saved.attempts >= 5) return false;
      saved.attempts += 1;
      if (saved.code !== code) return false;
      saved.consumed = true;
      return true;
    }
  };
  const otp = new OtpService({ provider: "stub" }, store);

  await otp.request("+989121234567");

  assert.equal(await otp.verify("+989121234567", "000000"), false);
  assert.equal(await otp.verify("+989121234567", "123456"), true);
  assert.equal(await otp.verify("+989121234567", "123456"), false);
});

test("otp service requires persistent store when configured for production", async () => {
  const store: OtpChallengeStore = {
    async save() {
      throw new Error("db unavailable");
    },
    async verify() {
      throw new Error("db unavailable");
    }
  };
  const otp = new OtpService({ provider: "stub", requirePersistentStore: true }, store);

  await assert.rejects(() => otp.request("+989121234567"), /امکان ذخیره کد تایید/);
});
