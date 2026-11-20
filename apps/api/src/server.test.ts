import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { loadConfig } from "./config.js";
import { buildFixtureServer as buildServer } from "./testing/fixture-server.js";
import { buildServer as buildRuntimeServer } from "./server.js";
import { isPushDeliveryConfigured, parseExpoPushTickets } from "./modules/notifications/push-delivery.js";

const unavailableDatabaseConfig = loadConfig({
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:59999/four_d"
});

test("health endpoint responds", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({ method: "GET", url: "/health/live" });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: "ok" });
  assert.equal(response.headers["x-content-type-options"], "nosniff");
  assert.equal(response.headers["x-frame-options"], "DENY");
  assert.match(String(response.headers["content-security-policy"]), /default-src 'none'/);
});

test("captcha proof rejects malformed bodies without returning an internal error", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const missingBody = await app.inject({ method: "POST", url: "/api/v1/auth/captcha-proof" });
  const invalidValue = await app.inject({
    method: "POST",
    url: "/api/v1/auth/captcha-proof",
    payload: { challenge_id: "00000000-0000-0000-0000-000000000000", value: "42" }
  });

  assert.equal(missingBody.statusCode, 400);
  assert.equal(invalidValue.statusCode, 400);
  assert.equal(missingBody.json().error.code, "validation_failed");
  assert.equal(invalidValue.json().error.code, "validation_failed");
});

test("captcha proof is one-time and replay is rejected", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const proof = await getCaptchaProof(app);
  const first = await app.inject({ method: "POST", url: "/api/v1/auth/request-otp", payload: { phone_number: "09900000001", captcha_proof: proof } });
  const replay = await app.inject({ method: "POST", url: "/api/v1/auth/request-otp", payload: { phone_number: "09900000001", captcha_proof: proof } });
  assert.equal(first.statusCode, 202);
  assert.equal(replay.statusCode, 400);
  assert.equal(replay.json().error.code, "captcha_invalid");
});

test("empty JSON requests stay client errors instead of becoming internal errors", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "DELETE",
    url: "/api/v1/me/contents/not-a-listing",
    headers: {
      "content-type": "application/json",
      "x-4d-user-id": "user_1",
      "x-4d-mobile-verified": "true"
    }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, "validation_failed");
});

test("cors allows configured web origin and rejects unknown origins", async () => {
  const app = buildServer(
    loadConfig({ NODE_ENV: "test", CORS_ORIGINS: "https://4dbazar.ir,http://127.0.0.1:5173" })
  );
  const allowed = await app.inject({ method: "GET", url: "/health/live", headers: { origin: "https://4dbazar.ir" } });
  const rejected = await app.inject({ method: "GET", url: "/health/live", headers: { origin: "https://untrusted.example" } });

  assert.equal(allowed.headers["access-control-allow-origin"], "https://4dbazar.ir");
  assert.equal(rejected.headers["access-control-allow-origin"], undefined);
});

test("cors preflight explicitly allows profile PUT", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test", CORS_ORIGINS: "https://4dbazar.ir" }));
  const response = await app.inject({
    method: "OPTIONS",
    url: "/api/v1/me/profile",
    headers: {
      origin: "https://4dbazar.ir",
      "access-control-request-method": "PUT",
      "access-control-request-headers": "content-type,authorization"
    }
  });

  assert.equal(response.statusCode, 204);
  assert.equal(response.headers["access-control-allow-origin"], "https://4dbazar.ir");
  assert.match(String(response.headers["access-control-allow-methods"]), /PUT/);
  assert.match(String(response.headers["access-control-allow-headers"]), /Authorization/);
});

test("Expo push response parser ignores malformed data", () => {
  assert.deepEqual(parseExpoPushTickets({ data: [{ id: "ticket-1", status: "ok" }, null, "bad"] }), [{ id: "ticket-1", status: "ok" }]);
  assert.deepEqual(parseExpoPushTickets({}), []);
});

test("notification outbox summary requires moderator role", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({ method: "GET", url: "/api/v1/admin/notifications/outbox-summary", headers: { "x-4d-user-id": "user_1", "x-4d-roles": "user" } });
  assert.equal(response.statusCode, 403);
});

test("auth request otp validates phone number", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/request-otp",
    payload: { phone_number: "12345" }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, "invalid_phone");
});

test("auth request otp accepts local iran phone number", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const captchaProof = await getCaptchaProof(app);
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/request-otp",
    payload: { phone_number: "09900000001", captcha_proof: captchaProof }
  });

  assert.equal(response.statusCode, 202);
});

test("auth request otp requires a server captcha proof", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/request-otp",
    payload: { phone_number: "09900000001" }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, "captcha_required");
});

test("production config rejects development auth defaults", async () => {
  assert.throws(() => loadConfig({ NODE_ENV: "production" }), /SESSION_SECRET/);
  assert.throws(
    () =>
      loadConfig({
        NODE_ENV: "production",
        SESSION_SECRET: "production-secret",
        OTP_PROVIDER: "stub"
      }),
    /OTP_PROVIDER/
  );
  assert.throws(
    () =>
      loadConfig({
        NODE_ENV: "production",
        SESSION_SECRET: "production-secret",
        OTP_PROVIDER: "sms"
      }),
    /SMS_API_URL/
  );
  assert.doesNotThrow(() =>
    loadConfig({
      NODE_ENV: "production",
      SESSION_SECRET: "production-secret",
      OTP_PROVIDER: "sms",
      SMS_VENDOR: "kavenegar",
      SMS_API_KEY: "test-key",
      SMS_SENDER: "20006535",
      MEDIA_STORAGE_PROVIDER: "s3",
      MEDIA_S3_BUCKET: "test-bucket",
      MEDIA_S3_ACCESS_KEY_ID: "test-access",
      MEDIA_S3_SECRET_ACCESS_KEY: "test-secret",
      MEDIA_S3_PUBLIC_BASE_URL: "https://cdn.example.test"
    })
  );
});

test("sms api ip accepts only a literal IP address", () => {
  assert.equal(loadConfig({ NODE_ENV: "test", SMS_API_IP: "46.102.138.125" }).SMS_API_IP, "46.102.138.125");
  assert.throws(() => loadConfig({ NODE_ENV: "test", SMS_API_IP: "api.kavenegar.com" }), /ip/i);
});

test("production ignores dev auth headers", async () => {
  const app = buildRuntimeServer(
    loadConfig({
      NODE_ENV: "production",
      SESSION_SECRET: "production-secret",
      OTP_PROVIDER: "sms",
      SMS_VENDOR: "generic",
      SMS_API_URL: "https://sms.example.test/send",
      SMS_API_KEY: "test-key",
      MEDIA_STORAGE_PROVIDER: "s3",
      MEDIA_S3_BUCKET: "test-bucket",
      MEDIA_S3_ACCESS_KEY_ID: "test-access",
      MEDIA_S3_SECRET_ACCESS_KEY: "test-secret",
      MEDIA_S3_PUBLIC_BASE_URL: "https://cdn.example.test"
    })
  );
  const response = await app.inject({
    method: "GET",
    url: "/api/v1/me",
    headers: {
      "x-4d-user-id": "user_1",
      "x-4d-mobile-verified": "true",
      "x-4d-roles": "user,moderator"
    }
  });

  assert.equal(response.statusCode, 401);
});

test("sms otp request supports local dry-run without exposing a dev code", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test", OTP_PROVIDER: "sms" }));
  const captchaProof = await getCaptchaProof(app);
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/request-otp",
    payload: { phone_number: "+989000000000", captcha_proof: captchaProof }
  });

  assert.equal(response.statusCode, 202);
  assert.equal(response.json().data.delivery, "sms");
  assert.equal(response.json().data.dev_code, undefined);
});

test("otp request rate limits repeated requests for the same phone", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const phoneNumber = `+989${Math.floor(100000000 + Math.random() * 899999999)}`;

  for (let index = 0; index < 10; index += 1) {
    const captchaProof = await getCaptchaProof(app);
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/request-otp",
      payload: { phone_number: phoneNumber, captcha_proof: captchaProof }
    });
    assert.equal(response.statusCode, 202);
  }

  const captchaProof = await getCaptchaProof(app);
  const limited = await app.inject({
    method: "POST",
    url: "/api/v1/auth/request-otp",
    payload: { phone_number: phoneNumber, captcha_proof: captchaProof }
  });

  assert.equal(limited.statusCode, 429);
});

test("auth verify otp rejects malformed code without querying the database", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/verify-otp",
    payload: { phone_number: "+989000000000", otp: "invalid" }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, "invalid_otp");
});

test("password login rate limits repeated failures for a phone", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const phoneNumber = `+989${Math.floor(100000000 + Math.random() * 899999999)}`;

  for (let index = 0; index < 8; index += 1) {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/password-login",
      payload: { phone_number: phoneNumber, password: "wrong-password" }
    });
    assert.equal(response.statusCode, 400);
  }

  const limited = await app.inject({
    method: "POST",
    url: "/api/v1/auth/password-login",
    payload: { phone_number: phoneNumber, password: "wrong-password" }
  });

  assert.equal(limited.statusCode, 429);
  assert.equal(limited.json().error.code, "rate_limited");
});

async function getCaptchaProof(app: ReturnType<typeof buildServer>) {
  const challenge = await app.inject({ method: "GET", url: "/api/v1/auth/captcha-challenge" });
  assert.equal(challenge.statusCode, 200);
  const challengeBody = challenge.json() as { data: { challenge_id: string; target: number } };
  const proof = await app.inject({
    method: "POST",
    url: "/api/v1/auth/captcha-proof",
    payload: {
      challenge_id: challengeBody.data.challenge_id,
      value: challengeBody.data.target
    }
  });
  assert.equal(proof.statusCode, 200);
  return (proof.json() as { data: { captcha_proof: string } }).data.captcha_proof;
}

test("me endpoint returns authenticated roles from dev fallback", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "GET",
    url: "/api/v1/me",
    headers: {
      "x-4d-user-id": "user_1",
      "x-4d-mobile-verified": "true",
      "x-4d-roles": "user,moderator"
    }
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json().data.roles, ["user", "moderator"]);
});

test("push subscription endpoint validates endpoint and keys", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/me/push-subscriptions",
    headers: { "x-4d-user-id": "user_1", "x-4d-mobile-verified": "true" },
    payload: {
      endpoint: "http://not-secure.example.test/push",
      keys: { p256dh: "key" }
    }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, "validation_failed");
});

test("native push token endpoint validates platform and token", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/me/native-push-tokens",
    headers: { "x-4d-user-id": "user_1", "x-4d-mobile-verified": "true" },
    payload: { token: "short-token", platform: "windows", provider: "expo" }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, "validation_failed");
});

test("push delivery stays disabled until VAPID keys are configured", () => {
  assert.equal(isPushDeliveryConfigured(loadConfig({ NODE_ENV: "test" })), false);
  assert.equal(
    isPushDeliveryConfigured(
      loadConfig({
        NODE_ENV: "test",
        VAPID_PUBLIC_KEY: "public-key",
        VAPID_PRIVATE_KEY: "private-key",
        VAPID_SUBJECT: "mailto:test@example.test"
      })
    ),
    true
  );
});

test("push self-test reports skipped delivery when VAPID is not configured", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/me/push-test",
    headers: { "x-4d-user-id": "user_1", "x-4d-mobile-verified": "true" },
    payload: {}
  });

  assert.equal(response.statusCode, 202);
  assert.equal(response.json().data.skipped, true);
});

test("logout with dev fallback requires bearer token", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/logout",
    headers: {
      "x-4d-user-id": "user_1",
      "x-4d-mobile-verified": "true"
    },
    payload: {}
  });

  assert.equal(response.statusCode, 400);
});

test("refresh rejects a missing refresh token without creating a session", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({ method: "POST", url: "/api/v1/auth/refresh", payload: {} });
  assert.equal(response.statusCode, 401);
  assert.equal(response.json().error.code, "unauthorized");
});

test("readiness reports degraded when database is unavailable", async () => {
  const app = buildServer(unavailableDatabaseConfig);
  const response = await app.inject({ method: "GET", url: "/health/ready" });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().status, "degraded");
});

test("cities endpoint falls back when database is unavailable", async () => {
  const app = buildServer(unavailableDatabaseConfig);
  const response = await app.inject({ method: "GET", url: "/api/v1/regions/4d/cities" });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.length, 4);
  assert.equal(response.json().meta.source, "fallback");
});

test("feed endpoint falls back when database is unavailable", async () => {
  const app = buildServer(unavailableDatabaseConfig);
  const response = await app.inject({ method: "GET", url: "/api/v1/feed" });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json().data, []);
  assert.equal(response.json().meta.source, "unavailable");
});

test("business profile validates required fields", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "PUT",
    url: "/api/v1/me/business-profile",
    headers: { "x-4d-user-id": "user_1", "x-4d-mobile-verified": "true" },
    payload: { business_name: "فروشگاه" }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, "validation_failed");
});

test("report endpoint validates reason", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/reports",
    headers: { "x-4d-user-id": "user_1", "x-4d-mobile-verified": "true" },
    payload: {
      target_type: "content",
      target_id: "00000000-0000-4000-8000-000000000999",
      reason: "bad_reason"
    }
  });

  assert.equal(response.statusCode, 400);
});

test("report endpoint validates target type", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/reports",
    headers: { "x-4d-user-id": "user_1", "x-4d-mobile-verified": "true" },
    payload: {
      target_type: "unknown",
      target_id: "00000000-0000-4000-8000-000000000999",
      reason: "spam"
    }
  });

  assert.equal(response.statusCode, 400);
});

test("conversation preferences require boolean mute value", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "PUT",
    url: "/api/v1/conversations/00000000-0000-4000-8000-000000000999/preferences",
    headers: { "x-4d-user-id": "user_1", "x-4d-mobile-verified": "true" },
    payload: { is_muted: "yes" }
  });

  assert.equal(response.statusCode, 400);
});

test("conversation block requires boolean value", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "PUT",
    url: "/api/v1/conversations/00000000-0000-4000-8000-000000000999/block",
    headers: { "x-4d-user-id": "user_1", "x-4d-mobile-verified": "true" },
    payload: { is_blocked: "yes" }
  });

  assert.equal(response.statusCode, 400);
});

test("media upload stores a listing image and serves it by public URL", async () => {
  const mediaDir = await mkdtemp(path.join(tmpdir(), "four-d-media-"));
  const app = buildServer(loadConfig({ NODE_ENV: "test", MEDIA_STORAGE_DIR: mediaDir }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/media/listing-images",
    headers: { "x-4d-user-id": "user_1", "x-4d-mobile-verified": "true" },
    payload: {
      image_data_url: "data:image/png;base64,iVBORw0KGgo="
    }
  });

  assert.equal(response.statusCode, 201);
  assert.match(response.json().data.url, /^\/media\/listing-images\/user_1\/.+\.png$/);
  assert.equal(response.json().data.mime_type, "image/png");
  assert.match(response.json().data.checksum_sha256, /^[a-f0-9]{64}$/);

  const assetResponse = await app.inject({ method: "GET", url: response.json().data.url });
  assert.equal(assetResponse.statusCode, 200);
  assert.equal(assetResponse.headers["content-type"], "image/png");
});

test("missing local media returns not found instead of an internal error", async () => {
  const mediaDir = await mkdtemp(path.join(tmpdir(), "four-d-media-missing-"));
  const app = buildServer(loadConfig({ NODE_ENV: "test", MEDIA_STORAGE_DIR: mediaDir }));
  const response = await app.inject({
    method: "GET",
    url: "/media/listing-images/user_1/missing-image.jpg"
  });

  assert.equal(response.statusCode, 404);
  assert.equal(response.json().error.code, "not_found");
  await app.close();
});

test("media upload rejects a spoofed image data URL", async () => {
  const mediaDir = await mkdtemp(path.join(tmpdir(), "four-d-media-spoof-"));
  const app = buildServer(loadConfig({ NODE_ENV: "test", MEDIA_STORAGE_DIR: mediaDir }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/media/listing-images",
    headers: { "x-4d-user-id": "user_1", "x-4d-mobile-verified": "true" },
    payload: { image_data_url: `data:image/png;base64,${Buffer.from("not an image").toString("base64")}` }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, "validation_failed");
});

test("audit persistence failure does not break validation errors", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/listings",
    headers: { "x-4d-user-id": "user_1", "x-4d-mobile-verified": "true" },
    payload: {
      title: "",
      description: "",
      city_id: "",
      category_id: ""
    }
  });

  assert.equal(response.statusCode, 400);
});
