// ============================================================
// JobPriceNow — Netlify Function
// Public, unauthenticated endpoint the client pings when someone
// installs the PWA or opens it in standalone/home-screen mode.
// Writes into the same stats store the admin Stats tab reads from,
// so PWA numbers show up right alongside estimates/quotes with no
// separate dashboard to check.
//
// Deploy path: /.netlify/functions/track-pwa
// netlify.toml's existing /api/* -> function redirect covers this,
// so the client calls /api/track-pwa.
// ============================================================

import { recordPwaEvent } from "../../lib/stats-store.mjs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const type = body?.type;
    const platform = typeof body?.platform === "string" ? body.platform.slice(0, 40) : "unknown";

    if (type !== "install" && type !== "launch") {
      return new Response(JSON.stringify({ error: "Invalid event type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fire-and-forget from the store's perspective — recordPwaEvent is
    // fail-soft internally, so this endpoint always returns success as
    // long as the request itself was well-formed. Tracking should never
    // be something a visitor's browser can see fail.
    await recordPwaEvent({ type, platform });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("track-pwa function error:", err);
    // Still 200 — a malformed beacon from a weird browser shouldn't ever
    // surface as a console error on the visitor's end for a stats ping.
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};
