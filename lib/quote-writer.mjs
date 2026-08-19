// ============================================================
// JobPriceNow — Quote Writer
//
// Turns the structured job estimate + contractor's notes into a
// clean, professional, customer-ready scope of work using Claude.
// Claude ONLY writes descriptive language here — it never sees
// or sets the final price. The price the customer sees comes
// from the contractor's own selection (Competitive / Recommended
// / High-Margin / Custom) made in the Quote Builder, enforced by
// the calling function, not by this module.
// ============================================================

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

const SYSTEM_PROMPT = `You write professional, customer-ready scope-of-work language for a handyman quoting tool, based on structured job data. You do NOT set or mention any price — pricing is handled elsewhere. Keep language professional, clear, concise, and free of unnecessary legal jargon. Do not invent work that isn't implied by the given tasks/description. If the contractor provided additional notes, weave anything customer-relevant into the scope or notes.

Respond with ONLY valid JSON matching this schema, no prose, no markdown fences:
{
  "quote_title": string,
  "scope_of_work": string[],
  "customer_summary": string,
  "estimated_duration": string,
  "notes": string[]
}`;

/**
 * @param {Object} input
 * @param {string} input.jobDescription - original free-text job description
 * @param {Array} input.tasks - the AI-analyzed task list from the free estimate
 * @param {string} [input.contractorNotes] - optional notes from the Quote Builder form
 * @returns {Promise<Object>} { quoteTitle, scopeOfWork, customerSummary, estimatedDuration, notes }
 */
export async function writeQuoteContent({ jobDescription, tasks, contractorNotes }) {
  if (!ANTHROPIC_API_KEY) {
    return fallbackQuoteContent({ jobDescription, tasks });
  }

  const userText = JSON.stringify({
    job_description: jobDescription,
    tasks: (tasks || []).map((t) => ({ name: t.name, category: t.category, difficulty: t.difficulty })),
    contractor_notes: contractorNotes || "",
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
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
          max_tokens: 1200,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userText }],
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Anthropic API returned ${response.status}`);
      const data = await response.json();
      const raw = data.content?.[0]?.text;
      if (!raw) throw new Error("Empty AI response");
      const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
      const parsed = JSON.parse(cleaned);
      return normalize(parsed);
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    console.error("Quote writing failed, using fallback:", err.message);
    return fallbackQuoteContent({ jobDescription, tasks });
  }
}

function normalize(raw) {
  return {
    quoteTitle: String(raw.quote_title || "Job Quote").slice(0, 120),
    scopeOfWork: Array.isArray(raw.scope_of_work) ? raw.scope_of_work.slice(0, 15).map(String) : [],
    customerSummary: String(raw.customer_summary || "").slice(0, 600),
    estimatedDuration: String(raw.estimated_duration || "").slice(0, 100),
    notes: Array.isArray(raw.notes) ? raw.notes.slice(0, 10).map(String) : [],
  };
}

// Used if the AI call fails — keeps the paid quote feature working
// (just less polished) rather than blocking someone who already paid.
function fallbackQuoteContent({ jobDescription, tasks }) {
  const taskNames = (tasks || []).map((t) => t.name).filter(Boolean);
  return {
    quoteTitle: taskNames.length ? taskNames.join(", ") : "Handyman Job Quote",
    scopeOfWork: taskNames.length ? taskNames.map((n) => `Complete: ${n}`) : [String(jobDescription || "").slice(0, 300)],
    customerSummary: String(jobDescription || "").slice(0, 400),
    estimatedDuration: "",
    notes: [],
  };
}
