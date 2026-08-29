// ============================================================
// JobPriceNow — Shared Estimate Handler
// Pure request-in/result-out logic, no HTTP framework dependency,
// so it can be reused by server.mjs (Express, local dev) and
// netlify/functions/estimate.mjs (production) without divergence.
// ============================================================

import { pricingConfig } from "./lib/pricing-config.mjs";
import { getLocationMultiplier, isValidZip } from "./lib/location-service.mjs";
import { analyzeJob } from "./lib/ai-analysis.mjs";
import { calculateEstimate } from "./lib/price-calculator.mjs";
import { recordEstimate } from "./lib/stats-store.mjs";

export async function handleEstimateRequest(body) {
  const { description, zip, photos = [], persona } = body || {};

  if (!description || typeof description !== "string" || description.trim().length === 0) {
    return { status: 400, error: "Please describe the job." };
  }
  if (description.length > pricingConfig.maxDescriptionLength) {
    return { status: 400, error: "Description is too long." };
  }
  if (zip && !isValidZip(zip)) {
    return { status: 400, error: "Please enter a valid 5-digit ZIP code." };
  }
  if (!Array.isArray(photos) || photos.length > pricingConfig.maxPhotos) {
    return { status: 400, error: `You can add up to ${pricingConfig.maxPhotos} photos.` };
  }

  const analysis = await analyzeJob({ description, photoDataUrls: photos });

  const { multiplier: locationMultiplier, isEstimate: locationIsEstimate } = getLocationMultiplier(zip || "");

  const pricing = calculateEstimate({
    tasks: analysis.tasks,
    locationMultiplier,
  });

  // Fire-and-forget usage tracking — recordEstimate() never throws, so this
  // can't break the actual estimate response even if storage has a problem.
  await recordEstimate({
    jobType: analysis.jobType,
    zip: zip || null,
    persona: persona || null,
    priceLow: pricing?.prices?.competitive ?? null,
    priceHigh: pricing?.prices?.highMargin ?? null,
  });

  return {
    status: 200,
    data: {
      jobType: analysis.jobType,
      tasks: analysis.tasks.map((t) => t.name),
      suggestedProducts: analysis.suggestedProducts || [],
      confidence: analysis.confidence,
      missingInformation: analysis.missingInformation,
      riskFlags: analysis.riskFlags,
      licenseOrPermitWarning: analysis.licenseOrPermitWarning,
      reasoningSummary: analysis.reasoningSummary,
      source: analysis.source,
      locationIsEstimate,
      pricing,
    },
  };
}
