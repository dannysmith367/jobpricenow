// ============================================================
// JobPriceNow — Blog Topic Queue
//
// A simple list of SEO topics the blog automation cycles through,
// one per post. Editable from /admin so Dan can add, remove, or
// reorder without touching code. Once a topic is used it's marked
// used so the automation doesn't repeat it — when the whole list
// has been used, it starts back over from the top.
//
// The starting list isn't hand-typed — it's generated from every
// job already in job-data.mjs (the same list the price calculator
// itself uses), across the three phrasings that dominate real
// searches from homeowners and contractors: "how much does it
// cost", "what should I charge", and "DIY vs. hire a pro". A
// handful of evergreen, non-job-specific topics round it out.
// ============================================================

import { kvGet, kvSet } from "./kv-store.mjs";
import { referenceJobs } from "./job-data.mjs";

const KEY = "blog-topics";

const SMALL_WORDS = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "in", "of", "on", "or", "the", "to", "vs", "vs.", "with"]);

function titleCase(str) {
  return str
    .split(" ")
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i !== 0 && SMALL_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

// Evergreen topics that aren't tied to one specific job — pricing
// philosophy, rate-setting, and business-practice questions that
// both homeowners and contractors search for.
const EVERGREEN_TOPICS = [
  "Handyman Hourly Rate: What's Fair to Charge in 2026",
  "How to Price a Multi-Task Handyman Punch List",
  "When Should a Handyman Turn Down a Job and Refer a Licensed Pro?",
  "Flat Rate vs. Hourly Pricing: Which Should Handymen Use?",
  "How to Give a Homeowner an Accurate Quote Over the Phone",
  "Why Handyman Prices Vary So Much by Region",
  "How to Explain a Price Increase to a Repeat Customer",
];

/**
 * Generates SEO-oriented topic strings for every job in the reference
 * database, across the three highest-intent search patterns:
 *   - Cost lookup (mostly homeowners): "X: How Much Does It Cost?"
 *   - Pricing lookup (mostly contractors): "X: What Should You Charge?"
 *   - DIY consideration (either): "X: Cost to DIY vs. Hire a Pro"
 * Phrasing this way (rather than conjugating a verb per job) works
 * cleanly for any job name without needing a hand-written verb map.
 */
export function generateSeoTopics() {
  const jobTopics = referenceJobs.flatMap((job) => {
    const name = titleCase(job.name);
    return [
      `${name}: How Much Does It Cost?`,
      `${name}: What Should You Charge?`,
      `${name}: Cost to DIY vs. Hire a Pro`,
    ];
  });
  return [...EVERGREEN_TOPICS, ...jobTopics];
}

export const defaultTopics = generateSeoTopics().map((topic) => ({ topic, used: false, usedAt: null }));

export async function getTopics() {
  const stored = await kvGet(KEY);
  return Array.isArray(stored) && stored.length ? stored : structuredClone(defaultTopics);
}

export async function saveTopics(topics) {
  await kvSet(KEY, topics);
  return topics;
}

export async function addTopic(topic) {
  const topics = await getTopics();
  const clean = String(topic || "").trim();
  if (!clean) throw new Error("Topic cannot be empty");
  topics.push({ topic: clean, used: false, usedAt: null });
  await saveTopics(topics);
  return topics;
}

export async function removeTopic(index) {
  const topics = await getTopics();
  if (index < 0 || index >= topics.length) throw new Error("Topic not found");
  topics.splice(index, 1);
  await saveTopics(topics);
  return topics;
}

// Tops up the queue with any freshly-generated SEO topics not already
// present (case-insensitive match on the topic text), without touching
// existing entries or their used/unused status. Safe to call anytime —
// e.g. after adding new jobs to job-data.mjs, or just to widen the mix.
export async function refillSeoTopics() {
  const topics = await getTopics();
  const existing = new Set(topics.map((t) => t.topic.trim().toLowerCase()));
  let added = 0;
  for (const topic of generateSeoTopics()) {
    const key = topic.trim().toLowerCase();
    if (!existing.has(key)) {
      topics.push({ topic, used: false, usedAt: null });
      existing.add(key);
      added++;
    }
  }
  await saveTopics(topics);
  return { topics, added };
}

// Returns the next unused topic WITHOUT marking it used yet — call
// markTopicUsed() only after a post is successfully generated from it,
// so a failed generation (missing API key, AI error, etc.) doesn't
// permanently burn a topic for nothing.
export async function peekNextTopic() {
  let topics = await getTopics();
  if (topics.every((t) => t.used)) {
    topics = topics.map((t) => ({ ...t, used: false, usedAt: null }));
    await saveTopics(topics);
  }
  const next = topics.find((t) => !t.used);
  return next ? next.topic : null;
}

export async function markTopicUsed(topicText) {
  const topics = await getTopics();
  const entry = topics.find((t) => t.topic === topicText && !t.used);
  if (entry) {
    entry.used = true;
    entry.usedAt = new Date().toISOString();
    await saveTopics(topics);
  }
}
