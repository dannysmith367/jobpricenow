// ============================================================
// JobPriceNow — Deterministic Price Calculator
//
// This is the ONLY place a final dollar amount is computed.
// The AI layer never invents a price; it only produces structured
// task/labor/material data that feeds this pure function.
//
// calculateEstimate() takes normalized tasks + context and returns
// a fully structured pricing result. No side effects, no I/O.
// ============================================================

import { pricingConfig } from "./pricing-config.mjs";

const DIFFICULTY_ORDER = ["easy", "moderate", "difficult", "high"];

/**
 * @param {Object} params
 * @param {Array} params.tasks - [{ name, laborHoursLow, laborHoursHigh, materialCost, difficulty }]
 * @param {number} params.locationMultiplier
 * @param {Object} [params.config] - override pricingConfig for testing
 * @returns {Object} structured pricing result
 */
export function calculateEstimate({ tasks, locationMultiplier, config = pricingConfig }) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error("calculateEstimate requires at least one task");
  }

  // ---- 1. Aggregate labor hours across tasks, applying multi-task efficiency ----
  const sortedTasks = [...tasks];
  let totalLaborLow = 0;
  let totalLaborHigh = 0;

  sortedTasks.forEach((task, index) => {
    const discount = index === 0 ? 0 : config.extraTaskLaborDiscountRate;
    totalLaborLow += task.laborHoursLow * (1 - discount);
    totalLaborHigh += task.laborHoursHigh * (1 - discount);
  });

  const avgLaborHours = (totalLaborLow + totalLaborHigh) / 2;

  // ---- 2. Materials: sum retail cost, apply markup once on the total ----
  const totalMaterialRetail = sortedTasks.reduce((sum, t) => sum + (t.materialCost || 0), 0);
  const materialSellPrice = totalMaterialRetail * (1 + config.materialMarkup);

  // ---- 3. Labor cost, regionally adjusted ----
  const laborCost = avgLaborHours * config.nationalHourlyRate * locationMultiplier;

  // ---- 4. Difficulty: use the HIGHEST difficulty among tasks (not compounded per task) ----
  const overallDifficulty = sortedTasks.reduce((worst, t) => {
    const d = t.difficulty && DIFFICULTY_ORDER.includes(t.difficulty) ? t.difficulty : "easy";
    return DIFFICULTY_ORDER.indexOf(d) > DIFFICULTY_ORDER.indexOf(worst) ? d : worst;
  }, "easy");
  const difficultyMultiplier = 1 + (config.difficulty[overallDifficulty] ?? 0);

  // ---- 5. Base price = (labor + materials) * difficulty multiplier, applied ONCE ----
  let basePrice = (laborCost + materialSellPrice) * difficultyMultiplier;

  // ---- 6. Enforce minimum job price ----
  basePrice = Math.max(basePrice, config.minimumJobPrice);

  // ---- 7. Three price tiers ----
  const round5 = (n) => Math.round(n / 5) * 5;
  const competitive = round5(basePrice * config.priceTiers.competitive);
  const recommended = round5(basePrice * config.priceTiers.recommended);
  const highMargin = round5(basePrice * config.priceTiers.highMargin);

  return {
    tasks: sortedTasks.map((t) => t.name),
    laborHoursLow: round1(totalLaborLow),
    laborHoursHigh: round1(totalLaborHigh),
    materialCost: Math.round(materialSellPrice),
    materialCostRetail: Math.round(totalMaterialRetail),
    difficulty: overallDifficulty,
    difficultyAdjustmentPct: Math.round((difficultyMultiplier - 1) * 100),
    locationMultiplier,
    basePrice: Math.round(basePrice),
    prices: {
      competitive,
      recommended,
      highMargin,
    },
    minimumApplied: (laborCost + materialSellPrice) * difficultyMultiplier < config.minimumJobPrice,
  };
}

function round1(n) {
  return Math.round(n * 10) / 10;
}
