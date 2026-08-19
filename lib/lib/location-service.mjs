// ============================================================
// JobPriceNow — Location Service
// Approximates a regional cost-of-living multiplier from a ZIP
// code's first digit (broad US region). This is intentionally
// coarse and clearly labeled as an estimate — it is NOT real
// market data. Swap the implementation of getLocationMultiplier
// later without touching any caller.
// ============================================================

import { pricingConfig } from "./pricing-config.mjs";

const ZIP_REGEX = /^\d{5}$/;

// First-digit-of-ZIP → rough regional cost multiplier.
// This is a coarse approximation, not authoritative market data.
const FIRST_DIGIT_MULTIPLIER = {
  "0": 1.15, // Northeast (CT/MA/NJ/etc.)
  "1": 1.15, // NY/PA
  "2": 1.0,  // DC/VA/NC/SC
  "3": 0.9,  // FL/GA/AL/TN
  "4": 0.9,  // KY/OH/IN/MI
  "5": 0.9,  // IA/WI/MN/SD/ND
  "6": 0.95, // IL/MO/KS/NE
  "7": 0.9,  // TX/LA/OK/AR
  "8": 1.1,  // CO/AZ/UT/NM
  "9": 1.2,  // CA/OR/WA/NV/AK/HI
};

export function isValidZip(zip) {
  return typeof zip === "string" && ZIP_REGEX.test(zip.trim());
}

/**
 * Returns { multiplier, label, isEstimate } for a given ZIP.
 * Always clamps to the configured regional bounds.
 */
export function getLocationMultiplier(zip) {
  const { low, high } = pricingConfig.regional;

  if (!isValidZip(zip)) {
    return { multiplier: pricingConfig.regional.average, label: "Unknown", isEstimate: true };
  }

  const firstDigit = zip.trim()[0];
  let multiplier = FIRST_DIGIT_MULTIPLIER[firstDigit] ?? pricingConfig.regional.average;
  multiplier = Math.min(high, Math.max(low, multiplier));

  return { multiplier, label: "Estimated regional adjustment", isEstimate: true };
}
