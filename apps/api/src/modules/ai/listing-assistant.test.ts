import assert from "node:assert/strict";
import test from "node:test";
import { parseListingReview, reviewListing, reviewListingWithAi } from "./listing-assistant.js";

test("local listing assistant suggests concrete improvements", () => {
  const review = reviewListing({ title: "گوشی", description: "خوب است" });
  assert.ok(review.score < 100);
  assert.ok(review.suggestions.length >= 2);
});

test("local listing assistant accepts a complete listing", () => {
  const review = reviewListing({
    title: "گوشی سامسونگ A52 تمیز",
    description: "گوشی سالم با جعبه، باتری خوب و تحویل حضوری در جاجرم.",
    price_amount: 8500000
  });
  assert.equal(review.suggestions.length, 0);
  assert.ok(review.score >= 80);
});

test("remote provider is never called when local mode is active", async () => {
  const review = await reviewListingWithAi({
    provider: "local",
    apiUrl: "https://api.avalai.ir/v1",
    apiKey: undefined,
    model: "gpt-5.6-luna"
  }, { title: "کولر آبی سالم", description: "توضیحات کافی برای تست آگهی محلی" });
  assert.equal(review.provider, "local");
});

test("AI JSON is normalized and code fences are accepted", () => {
  const fallback = reviewListing({ title: "آگهی", description: "توضیح" });
  const review = parseListingReview('```json\n{"score": 87, "suggestions": ["عکس واضح اضافه کن"], "improved_title": "کولر آبی سالم", "improved_description": "توضیحات بهتر", "category_suggestion": "لوازم خانه", "price_hint": "قیمت را بررسی کن", "summary": "آماده"}\n```', fallback);
  assert.equal(review.score, 87);
  assert.deepEqual(review.suggestions, ["عکس واضح اضافه کن"]);
  assert.equal(review.improved_title, "کولر آبی سالم");
  assert.equal(review.improved_description, "توضیحات بهتر");
});
