import assert from "node:assert/strict";
import test from "node:test";
import { identityDecisionFields } from "./identity-decision.js";

const now = new Date("2026-11-20T00:00:00Z");
test("identity approval records verification and clears revocation", () => {
  const fields = identityDecisionFields("approve", now);
  assert.equal(fields.status, "verified");
  assert.equal(fields.verified_at, now);
  assert.equal(fields.revoked_at, null);
  assert.equal(fields.rejection_reason, null);
});
test("identity revocation preserves historical verification and records its reason", () => {
  const fields = identityDecisionFields("revoke", now, "  بررسی مجدد  ");
  assert.equal(fields.status, "rejected");
  assert.equal(fields.revoked_at, now);
  assert.equal("verified_at" in fields, false);
  assert.equal(fields.rejection_reason, "بررسی مجدد");
});
test("identity rejection is not revocation", () => {
  const fields = identityDecisionFields("reject", now);
  assert.equal(fields.revoked_at, null);
  assert.equal("verified_at" in fields, false);
  assert.ok(fields.rejection_reason);
});
test("identity reasons have bounded length", () => {
  assert.equal(identityDecisionFields("revoke", now, "x".repeat(600)).rejection_reason?.length, 500);
});
