// ============================================================
// JobPriceNow — Pricing Engine Tests
// Run with: node tests/pricing.test.mjs
// ============================================================

import assert from "node:assert/strict";
import { calculateEstimate } from "../lib/price-calculator.mjs";
import { getLocationMultiplier, isValidZip } from "../lib/location-service.mjs";
import { pricingConfig } from "../lib/pricing-config.mjs";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
  }
}

console.log("\nPrice Calculator\n");

test("minimum job price enforced for tiny task", () => {
  const result = calculateEstimate({
    tasks: [{ name: "Tiny task", laborHoursLow: 0.25, laborHoursHigh: 0.25, materialCost: 0, difficulty: "easy" }],
    locationMultiplier: 1.0,
  });
  assert.ok(result.prices.recommended >= pricingConfig.minimumJobPrice, "recommended should be >= minimum");
  assert.equal(result.minimumApplied, true);
});

test("one-hour task at average region prices sensibly above minimum with markup", () => {
  const result = calculateEstimate({
    tasks: [{ name: "Faucet replacement", laborHoursLow: 1, laborHoursHigh: 2, materialCost: 60, difficulty: "moderate" }],
    locationMultiplier: 1.0,
  });
  assert.ok(result.prices.recommended > pricingConfig.minimumJobPrice);
  assert.ok(result.prices.competitive < result.prices.recommended);
  assert.ok(result.prices.recommended < result.prices.highMargin);
});

test("material markup applied once on total, not per task", () => {
  const result = calculateEstimate({
    tasks: [
      { name: "Task A", laborHoursLow: 1, laborHoursHigh: 1, materialCost: 100, difficulty: "easy" },
      { name: "Task B", laborHoursLow: 1, laborHoursHigh: 1, materialCost: 100, difficulty: "easy" },
    ],
    locationMultiplier: 1.0,
  });
  const expectedMaterial = Math.round(200 * (1 + pricingConfig.materialMarkup));
  assert.equal(result.materialCost, expectedMaterial);
});

test("easy job has 0% difficulty adjustment", () => {
  const result = calculateEstimate({
    tasks: [{ name: "Easy task", laborHoursLow: 3, laborHoursHigh: 3, materialCost: 0, difficulty: "easy" }],
    locationMultiplier: 1.0,
  });
  assert.equal(result.difficultyAdjustmentPct, 0);
});

test("moderate job has +10% difficulty adjustment", () => {
  const result = calculateEstimate({
    tasks: [{ name: "Moderate task", laborHoursLow: 3, laborHoursHigh: 3, materialCost: 0, difficulty: "moderate" }],
    locationMultiplier: 1.0,
  });
  assert.equal(result.difficultyAdjustmentPct, 10);
});

test("difficult job has +20% difficulty adjustment", () => {
  const result = calculateEstimate({
    tasks: [{ name: "Difficult task", laborHoursLow: 3, laborHoursHigh: 3, materialCost: 0, difficulty: "difficult" }],
    locationMultiplier: 1.0,
  });
  assert.equal(result.difficultyAdjustmentPct, 20);
});

test("high-risk job has +30% difficulty adjustment", () => {
  const result = calculateEstimate({
    tasks: [{ name: "High risk task", laborHoursLow: 3, laborHoursHigh: 3, materialCost: 0, difficulty: "high" }],
    locationMultiplier: 1.0,
  });
  assert.equal(result.difficultyAdjustmentPct, 30);
});

test("difficulty is not compounded across multiple tasks — uses worst only", () => {
  const result = calculateEstimate({
    tasks: [
      { name: "Easy task", laborHoursLow: 1, laborHoursHigh: 1, materialCost: 0, difficulty: "easy" },
      { name: "High risk task", laborHoursLow: 1, laborHoursHigh: 1, materialCost: 0, difficulty: "high" },
    ],
    locationMultiplier: 1.0,
  });
  assert.equal(result.difficulty, "high");
  assert.equal(result.difficultyAdjustmentPct, 30); // not 30+0=30 doubled or summed
});

test("high-cost ZIP region increases price vs average region", () => {
  const avg = calculateEstimate({
    tasks: [{ name: "Task", laborHoursLow: 3, laborHoursHigh: 3, materialCost: 0, difficulty: "moderate" }],
    locationMultiplier: 1.0,
  });
  const highCost = calculateEstimate({
    tasks: [{ name: "Task", laborHoursLow: 3, laborHoursHigh: 3, materialCost: 0, difficulty: "moderate" }],
    locationMultiplier: 1.2,
  });
  assert.ok(highCost.prices.recommended > avg.prices.recommended);
});

test("lower-cost ZIP region decreases price vs average region", () => {
  const avg = calculateEstimate({
    tasks: [{ name: "Task", laborHoursLow: 3, laborHoursHigh: 3, materialCost: 0, difficulty: "moderate" }],
    locationMultiplier: 1.0,
  });
  const lowCost = calculateEstimate({
    tasks: [{ name: "Task", laborHoursLow: 3, laborHoursHigh: 3, materialCost: 0, difficulty: "moderate" }],
    locationMultiplier: 0.85,
  });
  assert.ok(lowCost.prices.recommended < avg.prices.recommended);
});

test("multiple tasks do NOT apply the service minimum three times (efficiency discount applied)", () => {
  const tvAlone = calculateEstimate({
    tasks: [{ name: "TV mount", laborHoursLow: 1, laborHoursHigh: 2, materialCost: 20, difficulty: "easy" }],
    locationMultiplier: 1.0,
  });
  const faucetAlone = calculateEstimate({
    tasks: [{ name: "Faucet", laborHoursLow: 1, laborHoursHigh: 2, materialCost: 60, difficulty: "moderate" }],
    locationMultiplier: 1.0,
  });
  const drywallAlone = calculateEstimate({
    tasks: [{ name: "Drywall", laborHoursLow: 2, laborHoursHigh: 4, materialCost: 20, difficulty: "moderate" }],
    locationMultiplier: 1.0,
  });
  const sumOfSeparateVisits = tvAlone.prices.recommended + faucetAlone.prices.recommended + drywallAlone.prices.recommended;

  const combinedVisit = calculateEstimate({
    tasks: [
      { name: "TV mount", laborHoursLow: 1, laborHoursHigh: 2, materialCost: 20, difficulty: "easy" },
      { name: "Faucet", laborHoursLow: 1, laborHoursHigh: 2, materialCost: 60, difficulty: "moderate" },
      { name: "Drywall", laborHoursLow: 2, laborHoursHigh: 4, materialCost: 20, difficulty: "moderate" },
    ],
    locationMultiplier: 1.0,
  });

  assert.ok(
    combinedVisit.prices.recommended < sumOfSeparateVisits,
    "one combined visit should cost less than three separate minimum-charged visits"
  );
  assert.ok(
    combinedVisit.prices.recommended > tvAlone.prices.recommended,
    "combined visit should still cost more than the cheapest single task alone"
  );
});

test("no materials still produces a valid estimate", () => {
  const result = calculateEstimate({
    tasks: [{ name: "Gutter cleaning", laborHoursLow: 1, laborHoursHigh: 3, materialCost: 0, difficulty: "easy" }],
    locationMultiplier: 1.0,
  });
  assert.equal(result.materialCost, 0);
  assert.ok(result.prices.recommended >= pricingConfig.minimumJobPrice);
});

test("large materials increase price proportionally with markup", () => {
  const result = calculateEstimate({
    tasks: [{ name: "Door replacement", laborHoursLow: 3, laborHoursHigh: 3, materialCost: 500, difficulty: "moderate" }],
    locationMultiplier: 1.0,
  });
  assert.equal(result.materialCost, Math.round(500 * 1.15));
});

test("throws on empty task list rather than silently pricing nothing", () => {
  assert.throws(() => calculateEstimate({ tasks: [], locationMultiplier: 1.0 }));
});

console.log("\nLocation Service\n");

test("valid 5-digit ZIP passes validation", () => {
  assert.equal(isValidZip("95945"), true);
});

test("invalid ZIP formats are rejected", () => {
  assert.equal(isValidZip("9594"), false);
  assert.equal(isValidZip("abcde"), false);
  assert.equal(isValidZip(""), false);
  assert.equal(isValidZip(undefined), false);
});

test("missing ZIP falls back to average multiplier, marked as estimate", () => {
  const result = getLocationMultiplier("");
  assert.equal(result.multiplier, pricingConfig.regional.average);
  assert.equal(result.isEstimate, true);
});

test("regional multiplier is always within configured bounds", () => {
  for (const zip of ["01234", "90210", "73301", "59901", "10001"]) {
    const { multiplier } = getLocationMultiplier(zip);
    assert.ok(multiplier >= pricingConfig.regional.low && multiplier <= pricingConfig.regional.high);
  }
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
