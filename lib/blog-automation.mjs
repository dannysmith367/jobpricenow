// ============================================================
// JobPriceNow — Blog Automation
//
// Generates a new SEO blog post draft (published: false — Dan
// reviews and publishes manually from /admin) on a topic pulled
// from the queue. A scheduled function checks in daily, gated by
// a KV-tracked "last run" timestamp plus an adjustable interval
// (1–30 days, set from /admin) so it only actually generates a
// post once that many days have passed. A manual "Generate Now"
// path from /admin bypasses the gate entirely.
// ============================================================

import { kvGet, kvSet } from "./kv-store.mjs";
import { savePost } from "./blog-store.mjs";
import { peekNextTopic, markTopicUsed } from "./blog-topics.mjs";

const STATE_KEY = "blog-automation-state";
const DEFAULT_INTERVAL_DAYS = 14;
const MIN_INTERVAL_DAYS = 1;
const MAX_INTERVAL_DAYS = 30;

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

const SYSTEM_PROMPT = `You write SEO blog posts for JobPriceNow, a free handyman job pricing calculator (jobpricenow.com). Write genuinely useful, specific content for handymen and homeowners about pricing a particular job — not generic filler. Include real-feeling price ranges, factors that move the price up or down, and a natural mention that JobPriceNow can generate an instant estimate for this kind of job. Keep the tone practical and trustworthy, not salesy. Do not invent statistics, customer counts, or testimonials.

Respond with ONLY valid JSON, no prose, no markdown fences:
{
  "title": string,
  "meta_description": string (under 160 characters),
  "content_html": string (the full post body as HTML using <p>, <h2>, <ul>/<li> tags — no <html>/<head>/<body> wrapper, no inline styles)
}`;

export async function getAutomationState() {
  const stored = await kvGet(STATE_KEY);
  return { enabled: false, lastRunAt: null, intervalDays: DEFAULT_INTERVAL_DAYS, ...(stored || {}) };
}

export async function setAutomationEnabled(enabled) {
  const state = await getAutomationState();
  const next = { ...state, enabled: Boolean(enabled) };
  await kvSet(STATE_KEY, next);
  return next;
}

export async function setAutomationInterval(days) {
  const num = Math.round(Number(days));
  if (!Number.isFinite(num) || num < MIN_INTERVAL_DAYS || num > MAX_INTERVAL_DAYS) {
    throw new Error(`Frequency must be between ${MIN_INTERVAL_DAYS} and ${MAX_INTERVAL_DAYS} days.`);
  }
  const state = await getAutomationState();
  const next = { ...state, intervalDays: num };
  await kvSet(STATE_KEY, next);
  return next;
}

function daysSince(isoDate) {
  if (!isoDate) return Infinity;
  return (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * Called by the scheduled function (runs daily). Only actually generates
 * a post if automation is enabled AND enough time has passed since the
 * last run, based on the admin-configurable intervalDays.
 * @returns {Promise<{generated: boolean, reason?: string, post?: object}>}
 */
export async function runScheduledCheck() {
  const state = await getAutomationState();
  if (!state.enabled) return { generated: false, reason: "Automation is turned off." };
  const interval = state.intervalDays || DEFAULT_INTERVAL_DAYS;
  if (daysSince(state.lastRunAt) < interval) {
    return { generated: false, reason: `Last post was generated ${Math.floor(daysSince(state.lastRunAt))} day(s) ago — not due yet (every ${interval} days).` };
  }
  return generateNow();
}

/**
 * Generates one post right now regardless of schedule — used for both
 * the scheduled run (once it's due) and the admin "Generate Now" button.
 */
export async function generateNow() {
  if (!ANTHROPIC_API_KEY) {
    return { generated: false, reason: "AI isn't configured (missing ANTHROPIC_API_KEY)." };
  }

  const topic = await peekNextTopic();
  if (!topic) return { generated: false, reason: "No topics in the queue." };

  try {
    const content = await writePostContent(topic);
    const post = await savePost({
      title: content.title,
      metaDescription: content.metaDescription,
      content: content.contentHtml,
      published: false, // always a draft — Dan reviews before it goes live
    });
    await markTopicUsed(topic);
    const state = await getAutomationState();
    await kvSet(STATE_KEY, { ...state, enabled: true, lastRunAt: new Date().toISOString() });
    return { generated: true, post };
  } catch (err) {
    console.error("Blog automation failed:", err.message);
    return { generated: false, reason: `Generation failed: ${err.message}` };
  }
}

async function writePostContent(topic) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000); // 2 minutes — a full post can take a while to write
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
        messages: [{ role: "user", content: `Write a blog post on this topic: ${topic}` }],
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Anthropic API returned ${response.status}`);
    const data = await response.json();
    const raw = data.content?.[0]?.text;
    if (!raw) throw new Error("Empty AI response");
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
    const parsed = JSON.parse(cleaned);
    return {
      title: String(parsed.title || topic).slice(0, 150),
      metaDescription: String(parsed.meta_description || "").slice(0, 200),
      contentHtml: String(parsed.content_html || ""),
    };
  } finally {
    clearTimeout(timeout);
  }
}
