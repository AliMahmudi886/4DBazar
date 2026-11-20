import assert from "node:assert/strict";
import test from "node:test";
import { getListingFieldPolicy, isFourDCityCode } from "./index.js";

test("isFourDCityCode validates supported MVP cities", () => {
  assert.equal(isFourDCityCode("garmeh"), true);
  assert.equal(isFourDCityCode("bojnurd"), false);
});

test("listing field policy only exposes condition for physical goods", () => {
  assert.equal(getListingFieldPolicy("general-used-goods").showItemCondition, true);
  assert.equal(getListingFieldPolicy("vehicles").showItemCondition, true);
  assert.equal(getListingFieldPolicy("real-estate").showItemCondition, false);
  assert.equal(getListingFieldPolicy("local-services", "service_listing").showItemCondition, false);
});

test("listing field policy hides price when the category has no monetary listing price", () => {
  assert.equal(getListingFieldPolicy("jobs").showPrice, false);
  assert.equal(getListingFieldPolicy("local-transport").showPrice, false);
  assert.equal(getListingFieldPolicy("real-estate").showPrice, true);
});
