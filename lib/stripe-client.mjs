// ============================================================
// JobPriceNow — Stripe Client (REST, no SDK)
//
// Uses Stripe's plain REST API via fetch, the same pattern as
// the Anthropic calls elsewhere in this codebase — avoids adding
// a heavy SDK dependency for two simple calls.
// ============================================================

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_API_BASE = "https://api.stripe.com/v1";

function formEncode(obj, prefix = "") {
  const params = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (value == null) continue;
    if (typeof value === "object" && !Array.isArray(value)) {
      params.push(...formEncode(value, fullKey).split("&").filter(Boolean));
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === "object") {
          params.push(...formEncode(item, `${fullKey}[${i}]`).split("&").filter(Boolean));
        } else {
          params.push(`${encodeURIComponent(`${fullKey}[${i}]`)}=${encodeURIComponent(item)}`);
        }
      });
    } else {
      params.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`);
    }
  }
  return params.join("&");
}

export function isStripeConfigured() {
  return Boolean(STRIPE_SECRET_KEY);
}

/**
 * Creates a one-time $2.99 Checkout Session for a professional quote.
 * @returns {Promise<{id: string, url: string}>}
 */
export async function createCheckoutSession({ requestId, successUrl, cancelUrl, amountCents = 299 }) {
  if (!STRIPE_SECRET_KEY) throw new Error("Stripe is not configured (missing STRIPE_SECRET_KEY)");

  const body = formEncode({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: requestId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: { name: "JobPriceNow Professional Quote" },
        },
      },
    ],
    metadata: { requestId },
  });

  const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Stripe checkout session creation failed: ${errBody}`);
  }

  const session = await response.json();
  return { id: session.id, url: session.url };
}

/**
 * Retrieves a Checkout Session to verify payment status server-side.
 * NEVER trust a frontend "payment successful" flag — always verify here.
 */
export async function getCheckoutSession(sessionId) {
  if (!STRIPE_SECRET_KEY) throw new Error("Stripe is not configured (missing STRIPE_SECRET_KEY)");
  const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Stripe session lookup failed: ${errBody}`);
  }
  return response.json();
}
