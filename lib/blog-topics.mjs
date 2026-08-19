// ============================================================
// JobPriceNow — Blog Topic Queue
//
// A simple list of SEO topics the blog automation cycles through,
// one per post. Editable from /admin so Dan can add, remove, or
// reorder without touching code. Once a topic is used it's marked
// used so the automation doesn't repeat it — when the whole list
// has been used, it starts back over from the top.
// ============================================================

import { kvGet, kvSet } from "./kv-store.mjs";

const KEY = "blog-topics";

// Seeded from the kinds of long-tail, high-intent searches a
// handyman pricing tool should rank for.
export const defaultTopics = [
  "How much should I charge to mount a TV?",
  "How much should I charge to replace a faucet?",
  "Drywall repair pricing: what to charge",
  "Handyman hourly rate: what's fair to charge in 2026",
  "How much should I charge to install a ceiling fan?",
  "Toilet replacement pricing guide for handymen",
  "Fence repair pricing: what to charge per section",
  "Pressure washing pricing guide for a driveway or deck",
  "How much should I charge to hang shelves or a mirror?",
  "Interior door replacement pricing guide",
  "How much should I charge for furniture assembly?",
  "Gutter cleaning pricing: what's a fair rate?",
  "How much should I charge to install a smoke detector?",
  "Baseboard installation and repair pricing",
  "How much should I charge to paint a room?",
  "Garbage disposal replacement pricing guide",
  "How much should I charge for deck board repair?",
  "Cabinet hardware installation pricing",
  "How to price a multi-task handyman punch list",
  "When should a handyman turn down a job and refer a licensed pro?",
].map((topic) => ({ topic, used: false, usedAt: null }));

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
