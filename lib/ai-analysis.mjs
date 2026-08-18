// ============================================================
// JobPriceNow — AI Analysis Layer
//
// Responsibility boundary (see spec section 9-10):
// The AI ONLY produces structured understanding of the job
// (tasks, labor hours, materials, difficulty, confidence).
// It NEVER computes a final dollar price — that happens in
// lib/price-calculator.mjs from this structured output.
//
// If the AI call fails or is unconfigured, analyzeJob() falls
// back to matching against the reference job database so the
// product never becomes fully unusable.
// ============================================================

import { pricingConfig } from "./pricing-config.mjs";
import { regulatedWorkTriggers, matchReferenceJobs } from "./job-data.mjs";

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

const SYSTEM_PROMPT = `You are a job-analysis engine for a handyman pricing tool. You analyze a written job description (and optional photos) and return ONLY structured JSON describing the work. You do NOT calculate any price. Be conservative and realistic about labor hours and materials for a competent independent US handyman. If the description is vague, lower your confidence and list missing_information. Flag any work that likely requires a licensed electrician, plumber, structural contractor, HVAC professional, or permit.

When estimating material costs, price them at current retail rates from major U.S. home improvement retailers such as Home Depot and Lowe's — not wholesale, discount, or bulk-contractor pricing. Underestimating materials is worse than overestimating, so when you're unsure of an exact price, round up rather than down.

Also suggest 2-5 specific, genuinely useful products or materials a handyman or homeowner would need to buy for this job (e.g. "18v cordless drill", "5-gallon joint compound", "3/4 inch PVC pipe fittings"). Keep each one a short, concrete, searchable product name — not a vague category like "tools".

Respond with ONLY valid JSON matching this schema, no prose, no markdown fences:
{
  "job_type": string,
  "tasks": [
    {
      "name": string,
      "category": string,
      "labor_hours_low": number,
      "labor_hours_high": number,
      "estimated_material_cost": number,
      "difficulty": "easy" | "moderate" | "difficult" | "high"
    }
  ],
  "suggested_products": string[],
  "confidence": "low" | "medium" | "high",
  "missing_information": string[],
  "risk_flags": string[],
  "license_or_permit_warning": boolean,
  "reasoning_summary": string
}`;

/**
 * @param {Object} input
 * @param {string} input.description
 * @param {string[]} [input.photoDataUrls] - base64 data URLs, already compressed
 * @returns {Promise<Object>} normalized analysis result + metadata about source
 */
export async function analyzeJob({ description, photoDataUrls = [] }) {
  if (!ANTHROPIC_API_KEY) {
    return fallbackAnalysis(description);
  }

  try {
    const result = await callAnthropic({ description, photoDataUrls });
    return { ...validateAndNormalize(result), source: "ai" };
  } catch (err) {
    console.error("AI analysis failed, using fallback:", err.message);
    return fallbackAnalysis(description);
  }
}

async function callAnthropic({ description, photoDataUrls }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), pricingConfig.aiTimeoutMs);

  // Claude's API takes images as base64 media blocks, not data-URL strings,
  // so each photo needs its media type and raw base64 payload split out.
  const userContent = [{ type: "text", text: description }];
  for (const url of photoDataUrls.slice(0, pricingConfig.maxPhotos)) {
    const match = /^data:(image\/[a-zA-Z]+);base64,(.+)$/.exec(url);
    if (!match) continue;
    userContent.push({
      type: "image",
      source: { type: "base64", media_type: match[1], data: match[2] },
    });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Anthropic API returned ${response.status}`);
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text;
    if (!raw) throw new Error("Empty AI response");

    // Claude doesn't have a strict JSON-mode flag like OpenAI, so it may
    // occasionally wrap output in markdown fences — strip those defensively.
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
    return JSON.parse(cleaned);
  } finally {
    clearTimeout(timeout);
  }
}

function validateAndNormalize(raw) {
  if (!raw || !Array.isArray(raw.tasks) || raw.tasks.length === 0) {
    throw new Error("AI response missing valid tasks array");
  }

  const tasks = raw.tasks.map((t) => ({
    name: String(t.name || "Job task").slice(0, 120),
    category: String(t.category || "general").slice(0, 60),
    laborHoursLow: clampNumber(t.labor_hours_low, 0.25, 40),
    laborHoursHigh: clampNumber(t.labor_hours_high ?? t.labor_hours_low, 0.25, 40),
    materialCost: clampNumber(t.estimated_material_cost, 0, 10000),
    difficulty: ["easy", "moderate", "difficult", "high"].includes(t.difficulty) ? t.difficulty : "moderate",
  }));

  return {
    jobType: String(raw.job_type || "Handyman job").slice(0, 100),
    tasks,
    suggestedProducts: Array.isArray(raw.suggested_products)
      ? raw.suggested_products.slice(0, 5).map((p) => String(p).slice(0, 80)).filter(Boolean)
      : [],
    confidence: ["low", "medium", "high"].includes(raw.confidence) ? raw.confidence : "medium",
    missingInformation: Array.isArray(raw.missing_information) ? raw.missing_information.slice(0, 5).map(String) : [],
    riskFlags: Array.isArray(raw.risk_flags) ? raw.risk_flags.slice(0, 10).map(String) : [],
    licenseOrPermitWarning: Boolean(raw.license_or_permit_warning),
    reasoningSummary: String(raw.reasoning_summary || "").slice(0, 400),
  };
}

function clampNumber(n, min, max) {
  const num = Number(n);
  if (Number.isNaN(num)) return min;
  return Math.min(max, Math.max(min, num));
}

/**
 * Deterministic fallback: matches the description against the
 * reference job database using simple keyword matching. Used when
 * no OpenAI key is configured or the AI call fails.
 */
function fallbackAnalysis(description) {
  const text = (description || "").toLowerCase();
  const matched = matchReferenceJobs(text);

  const tasks =
    matched.length > 0
      ? matched.map((job) => ({
          name: job.name,
          category: job.category,
          laborHoursLow: job.laborLow,
          laborHoursHigh: job.laborHigh,
          materialCost: (job.materialLow + job.materialHigh) / 2,
          difficulty: job.defaultDifficulty,
        }))
      : [
          {
            name: "General handyman task",
            category: "general",
            laborHoursLow: 1,
            laborHoursHigh: 2,
            materialCost: 25,
            difficulty: "moderate",
          },
        ];

  const riskFlags = regulatedWorkTriggers.filter((trigger) => text.includes(trigger));

  // No AI call in the fallback path, so we can't name specific products —
  // just offer the matched job names themselves as a starting search term.
  const suggestedProducts = matched.length > 0 ? matched.slice(0, 5).map((j) => j.name) : [];

  return {
    jobType: matched.length > 0 ? matched.map((j) => j.name).join(", ") : "General handyman job",
    tasks,
    suggestedProducts,
        confidence: matched.length > 0 ? "medium" : "low",
    missingInformation:
      matched.length === 0
        ? ["Could you add a bit more detail about the job, such as size or materials involved?"]
        : [],
    riskFlags,
    licenseOrPermitWarning: riskFlags.length > 0,
    reasoningSummary:
      matched.length > 0
        ? "Estimated using JobPriceNow's reference pricing data for similar jobs."
        : "We couldn't precisely match this job to our reference data, so this is a general estimate.",
    source: "fallback",
  };
}
