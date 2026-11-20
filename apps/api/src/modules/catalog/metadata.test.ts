import test from "node:test";
import assert from "node:assert/strict";
import { validateCategoryMetadata } from "./metadata.js";

const schema = [
  { key: "brand", label_fa: "برند", type: "text" },
  { key: "year", label_fa: "سال ساخت", type: "number" },
  { key: "property_type", label_fa: "نوع ملک", type: "select", required: true, options: [{ value: "house", label_fa: "خانه" }] }
];

test("category metadata normalizes numeric and text values", () => {
  assert.deepEqual(validateCategoryMetadata({ brand: "  سایپا ", year: "1402", property_type: "house" }, schema), {
    metadata: { brand: "سایپا", year: 1402, property_type: "house" }, errors: []
  });
});

test("category metadata rejects invalid required and select values", () => {
  const result = validateCategoryMetadata({ year: "نامعتبر", property_type: "apartment" }, schema);
  assert.equal(result.errors.length, 2);
});
