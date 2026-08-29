// ============================================================
// JobPriceNow — Usage Stats Store
//
// Tracks two things, using the same Netlify Blobs storage
// (kv-store.mjs) already used everywhere else on the site:
//
//  1. Aggregate totals (stats-summary) — running counts + a
//     day-by-day breakdown, kept small so the admin panel loads
//     fast without scanning detailed history.
//
//  2. Detailed event log (stats-estimate-events / stats-quote-events)
//     — the last N individual records, so Dan can later dig into
//     patterns like "what job types get estimated most." Capped
//     at MAX_EVENT_RECORDS so the blob never grows unbounded.
//
// Note on reliability: Netlify Blobs uses a "last write wins"
// model. Every write here does a read-modify-write of the whole
// record, so two requests landing in the exact same instant could
// in theory clobber each other. At JobPriceNow's current traffic
// this is a non-issue — worth revisiting only if volume grows into
// many simultaneous requests per second.
//
// All functions here are intentionally fail-soft: if a stats write
// fails for any reason, it's logged and swallowed, never thrown —
// tracking usage should never be able to break the actual estimate
// or quote flow it's observing.
// ============================================================

import { kvGet, kvSet } from "./kv-store.mjs";

const SUMMARY_KEY = "stats-summary";
const ESTIMATE_EVENTS_KEY = "stats-estimate-events";
const QUOTE_EVENTS_KEY = "stats-quote-events";

const MAX_EVENT_RECORDS = 5000;
const DAILY_HISTORY_DAYS = 90; // trim daily buckets older than this so the summary blob stays small

const defaultSummary = {
  totalEstimates: 0,
  totalQuotesPaid: 0,
  totalQuotesComped: 0,
  totalRevenueCents: 0,
  daily: {}, // "YYYY-MM-DD": { estimates, quotesPaid, quotesComped, revenueCents }
};

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function trimOldDailyEntries(daily) {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - DAILY_HISTORY_DAYS);
  const cutoffKey = todayKey(cutoff);
  const trimmed = {};
  for (const [day, val] of Object.entries(daily)) {
    if (day >= cutoffKey) trimmed[day] = val;
  }
  return trimmed;
}

async function loadSummary() {
  const stored = await kvGet(SUMMARY_KEY);
  if (!stored) return structuredClone(defaultSummary);
  return {
    ...structuredClone(defaultSummary),
    ...stored,
    daily: { ...(stored.daily || {}) },
  };
}

async function appendEvent(key, record) {
  const stored = await kvGet(key);
  const events = Array.isArray(stored) ? stored : [];
  events.push(record);
  // Keep only the most recent MAX_EVENT_RECORDS — drop oldest first.
  const trimmed = events.length > MAX_EVENT_RECORDS ? events.slice(events.length - MAX_EVENT_RECORDS) : events;
  await kvSet(key, trimmed);
}

// ---------------- Recording ----------------

/**
 * Call this once an estimate successfully completes (a real price was
 * returned to the visitor). Never call this for failed/invalid requests.
 */
export async function recordEstimate({ jobType, zip, persona, priceLow, priceHigh } = {}) {
  try {
    const now = new Date();
    const day = todayKey(now);

    const summary = await loadSummary();
    summary.totalEstimates += 1;
    summary.daily[day] = summary.daily[day] || { estimates: 0, quotesPaid: 0, quotesComped: 0, revenueCents: 0 };
    summary.daily[day].estimates += 1;
    summary.daily = trimOldDailyEntries(summary.daily);
    await kvSet(SUMMARY_KEY, summary);

    await appendEvent(ESTIMATE_EVENTS_KEY, {
      timestamp: now.toISOString(),
      jobType: jobType || "unknown",
      zip: zip || null,
      persona: persona || null,
      priceLow: typeof priceLow === "number" ? priceLow : null,
      priceHigh: typeof priceHigh === "number" ? priceHigh : null,
    });
  } catch (err) {
    console.error("stats: failed to record estimate (non-fatal)", err);
  }
}

/**
 * Call this once a quote is fully generated — either paid via Stripe or
 * redeemed with a promo code. paidVia distinguishes the two so revenue
 * numbers never get inflated by comp'd/free quotes.
 */
export async function recordQuoteCompletion({ paidVia, amountCents = 0, jobType } = {}) {
  try {
    const now = new Date();
    const day = todayKey(now);
    const isPaid = paidVia === "stripe";

    const summary = await loadSummary();
    summary.daily[day] = summary.daily[day] || { estimates: 0, quotesPaid: 0, quotesComped: 0, revenueCents: 0 };

    if (isPaid) {
      summary.totalQuotesPaid += 1;
      summary.totalRevenueCents += amountCents || 0;
      summary.daily[day].quotesPaid += 1;
      summary.daily[day].revenueCents += amountCents || 0;
    } else {
      summary.totalQuotesComped += 1;
      summary.daily[day].quotesComped += 1;
    }
    summary.daily = trimOldDailyEntries(summary.daily);
    await kvSet(SUMMARY_KEY, summary);

    await appendEvent(QUOTE_EVENTS_KEY, {
      timestamp: now.toISOString(),
      paidVia: paidVia || "unknown",
      amountCents: isPaid ? amountCents || 0 : 0,
      jobType: jobType || null,
    });
  } catch (err) {
    console.error("stats: failed to record quote completion (non-fatal)", err);
  }
}

// ---------------- Reading (for the admin panel) ----------------

export async function getStatsSummary({ dailyDays = 30 } = {}) {
  const summary = await loadSummary();

  const totalQuotesAll = summary.totalQuotesPaid + summary.totalQuotesComped;
  const conversionRatePercent =
    summary.totalEstimates > 0 ? Math.round((summary.totalQuotesPaid / summary.totalEstimates) * 1000) / 10 : 0;

  const dailyEntries = Object.entries(summary.daily)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, dailyDays)
    .map(([date, d]) => ({ date, ...d }));

  return {
    totalEstimates: summary.totalEstimates,
    totalQuotesPaid: summary.totalQuotesPaid,
    totalQuotesComped: summary.totalQuotesComped,
    totalQuotesAll,
    totalRevenueCents: summary.totalRevenueCents,
    conversionRatePercent,
    daily: dailyEntries,
  };
}

/**
 * Simple aggregation over the stored detail log — "what job types get
 * estimated most." Computed on read rather than maintained incrementally,
 * since MAX_EVENT_RECORDS keeps the source array small enough that this
 * stays fast.
 */
export async function getTopJobTypes({ limit = 10 } = {}) {
  const stored = await kvGet(ESTIMATE_EVENTS_KEY);
  const events = Array.isArray(stored) ? stored : [];
  const counts = new Map();
  for (const e of events) {
    const key = e.jobType || "unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([jobType, count]) => ({ jobType, count }));
}
