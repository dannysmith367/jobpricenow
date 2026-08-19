// ============================================================
// JobPriceNow — Netlify Function
// Thin transport wrapper around the same handleEstimateRequest()
// logic used by the local Express server, so behavior never
// diverges between local dev and production.
//
// Deploy path: /.netlify/functions/estimate
// netlify.toml should redirect /api/estimate -> this function.
// ============================================================

import { handleEstimateRequest } from "../../server-logic.mjs";

// Very simple in-memory rate limiting. Note: Netlify Functions are
// stateless/ephemeral per invocation environment, so this is a soft
// best-effort limiter, not a hard guarantee. For stronger limits,
// add Netlify Rate Limiting or a shared store later.
const requestLog = new Map();
const RATE_LIMIT_PER_HOUR = Number(process.env.RATE_LIMIT_PER_HOUR || 20);

function isRateLimited(ip) {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const timestamps = (requestLog.get(ip) || []).filter((t) => t > oneHourAgo);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_PER_HOUR;
}

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const ip = context.ip || req.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please try again in a bit." }), { status: 429 });
  }

  try {
    const body = await req.json();
    const result = await handleEstimateRequest(body);
    return new Response(JSON.stringify(result.status === 200 ? result.data : { error: result.error }), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Estimate function error:", err);
    return new Response(
      JSON.stringify({
        error: "Something went wrong analyzing the job. Your photos are safe. Try again or continue with a description-only estimate.",
      }),
      { status: 500 }
    );
  }
};
