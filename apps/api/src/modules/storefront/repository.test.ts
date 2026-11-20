import test from "node:test";
import assert from "node:assert/strict";
import { normalizeStorefrontSlug } from "./repository.js";

test("storefront slug is normalized for public URLs", () => {
  assert.equal(normalizeStorefrontSlug("  Mehrad Tools & Repair  "), "mehrad-tools-repair");
  assert.equal(normalizeStorefrontSlug("---local---"), "local");
  assert.equal(normalizeStorefrontSlug("نام فارسی"), "");
});
