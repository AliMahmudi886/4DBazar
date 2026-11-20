import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../config.js";
import { buildFixtureServer as buildServer } from "../testing/fixture-server.js";
import { getProfileCompletionMissingFields, isProfileComplete } from "../modules/auth/repository.js";

test("profile completion depends on identity fields, not password", () => {
  const profile = {
    first_name: "علی", last_name: "احمدی", primary_city_id: "city_1"
  } as any;
  assert.equal(isProfileComplete(profile), true);
  assert.deepEqual(getProfileCompletionMissingFields({ first_name: "", last_name: null, primary_city_id: null } as any), ["first_name", "last_name", "primary_city_id"]);
});

test("content creation requires authentication", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({ method: "POST", url: "/api/v1/listings" });

  assert.equal(response.statusCode, 401);
});

test("content creation requires mobile verification", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/listings",
    headers: { "x-4d-user-id": "user_1" }
  });

  assert.equal(response.statusCode, 403);
});

test("moderation queue requires moderator role", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "GET",
    url: "/api/v1/admin/moderation/cases",
    headers: { "x-4d-user-id": "user_1", "x-4d-mobile-verified": "true" }
  });

  assert.equal(response.statusCode, 403);
});

test("moderation decision requires moderator role", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/admin/moderation/cases/00000000-0000-4000-8000-000000000999/decisions",
    headers: { "x-4d-user-id": "user_1", "x-4d-mobile-verified": "true" },
    payload: {
      decision: "dismiss_report",
      reason: "test"
    }
  });

  assert.equal(response.statusCode, 403);
});

test("content moderation queue requires moderator role", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "GET",
    url: "/api/v1/admin/moderation/contents",
    headers: { "x-4d-user-id": "user_1", "x-4d-mobile-verified": "true" }
  });

  assert.equal(response.statusCode, 403);
});

test("admin user list requires admin role", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "GET",
    url: "/api/v1/admin/users",
    headers: { "x-4d-user-id": "user_1", "x-4d-roles": "moderator" }
  });
  assert.equal(response.statusCode, 403);
});

test("admin user contents requires admin role", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "GET",
    url: "/api/v1/admin/users/user_1/contents",
    headers: { "x-4d-user-id": "user_1", "x-4d-roles": "moderator" }
  });
  assert.equal(response.statusCode, 403);
});

test("logout requires authentication", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/logout"
  });

  assert.equal(response.statusCode, 401);
});

test("contact intent requires authentication", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/contact-intents",
    payload: { content_id: "00000000-0000-4000-8000-000000000999" }
  });

  assert.equal(response.statusCode, 401);
});

test("report requires mobile verification", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/reports",
    headers: { "x-4d-user-id": "user_1" },
    payload: {
      target_type: "content",
      target_id: "00000000-0000-4000-8000-000000000999",
      reason: "other"
    }
  });

  assert.equal(response.statusCode, 403);
});
