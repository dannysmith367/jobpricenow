// ============================================================
// JobPriceNow — Paid Quote Feature: Shared Logic
//
// Flow:
//  1. handleQuoteRequestCreate — Quote Builder form submits here.
//     Stores the request. If a valid promo code was given, skips
//     Stripe entirely and finalizes immediately. Otherwise creates
//     a Stripe Checkout Session and returns its URL.
//  2. handleQuoteFinalize — called when the browser returns from
//     Stripe with a session_id. Verifies payment SERVER-SIDE
//     (never trusts the frontend), then writes + generates the
//     quote. Idempotent: re-calling with the same requestId after
//     it's already completed just returns the same quote again,
//     so a page refresh can never cause a double charge.
//  3. handleQuoteGet / handleQuotePdf — fetch a finished quote.
//  4. handleQuoteEmailSend — email the finished quote via Resend.
// ============================================================

import { pricingConfig } from "./lib/pricing-config.mjs";
import { kvSet } from "./lib/kv-store.mjs";
import { createPendingRequest, getPendingRequest, updatePendingRequest, saveFinishedQuote, getFinishedQuote } from "./lib/quote-store.mjs";
import { redeemPromoCode } from "./lib/promo-codes.mjs";
import { createCheckoutSession, getCheckoutSession, isStripeConfigured } from "./lib/stripe-client.mjs";
import { writeQuoteContent } from "./lib/quote-writer.mjs";
import { generateQuotePdf } from "./lib/pdf-generator.mjs";
import { sendQuoteEmail, isEmailConfigured } from "./lib/email-client.mjs";

const QUOTE_PRICE_CENTS = 299;

function pickPrice(pricing, selectedPriceTier, customPrice) {
  if (selectedPriceTier === "custom") {
    const n = Number(customPrice);
    if (!Number.isFinite(n) || n <= 0) throw new Error("Enter a valid custom price.");
    return n;
  }
  const map = { competitive: pricing?.prices?.competitive, recommended: pricing?.prices?.recommended, highMargin: pricing?.prices?.highMargin };
  const price = map[selectedPriceTier] ?? pricing?.prices?.recommended;
  if (!Number.isFinite(price)) throw new Error("Couldn't determine a price for this quote.");
  return price;
}

function quoteNumberFrom(token) {
  return `JPN-${token.slice(0, 6).toUpperCase()}`;
}

// Overwrites a finished-quote record in place, keeping its token stable
// (saveFinishedQuote() always mints a fresh random token, which we don't
// want on the second write of the same quote).
async function overwriteFinishedQuote(token, { quote, pdfBase64 }) {
  await kvSet(`quote:${token}`, { token, createdAt: new Date().toISOString(), quote, pdfBase64 });
}

async function buildAndStoreQuote(request) {
  const { estimate, contractor, customer, options, selectedPriceTier, customPrice } = request;

  const price = pickPrice(estimate?.pricing, selectedPriceTier, customPrice);

  const rawTasks = Array.isArray(estimate?.tasks) ? estimate.tasks : [];
  const tasks = rawTasks.map((t) => (typeof t === "string" ? { name: t } : t));

  const content = await writeQuoteContent({
    jobDescription: estimate?.jobDescription || "",
    tasks,
    contractorNotes: options?.additionalNotes || "",
  });

  const now = new Date();
  const validDays = Number(options?.quoteValidDays) > 0 ? Number(options.quoteValidDays) : 30;
  const expiration = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);

  const quoteData = {
    contractor: contractor || {},
    customer: customer || {},
    content: options?.quoteTitleOverride ? { ...content, quoteTitle: options.quoteTitleOverride } : content,
    price,
    additionalNotes: options?.additionalNotes || "",
    paymentTerms: options?.paymentTerms || "Payment due upon completion unless otherwise specified.",
    date: now.toLocaleDateString("en-US"),
    expirationDate: expiration.toLocaleDateString("en-US"),
  };

  // Quote number depends on the token, so store once to reserve a token,
  // then overwrite that same record with the quote number and rendered PDF.
  const saved = await saveFinishedQuote({ quote: { ...quoteData, quoteNumber: "" }, pdfBase64: "" });
  const quoteNumber = quoteNumberFrom(saved.token);
  const finalQuoteData = { ...quoteData, quoteNumber };
  const pdfBuffer = await generateQuotePdf(finalQuoteData);

  await overwriteFinishedQuote(saved.token, { quote: finalQuoteData, pdfBase64: pdfBuffer.toString("base64") });

  return { token: saved.token, quote: finalQuoteData };
}

export async function handleQuoteRequestCreate(body, siteUrl) {
  const { estimate, contractor, customer, options, selectedPriceTier, customPrice, promoCode } = body || {};

  if (!estimate || !Array.isArray(estimate.tasks) || estimate.tasks.length === 0) {
    return { status: 400, error: "Missing or invalid estimate data." };
  }
  if (!selectedPriceTier) {
    return { status: 400, error: "Please choose a price for this quote." };
  }

  let price;
  try {
    price = pickPrice(estimate.pricing, selectedPriceTier, customPrice);
  } catch (err) {
    return { status: 400, error: err.message };
  }

  const pending = await createPendingRequest({ estimate, contractor, customer, options, selectedPriceTier, customPrice, price });

  // ---- Promo code path: skip Stripe entirely ----
  if (promoCode) {
    const redemption = await redeemPromoCode(promoCode);
    if (!redemption.valid) {
      return { status: 400, error: redemption.reason || "That promo code isn't valid." };
    }
    try {
      const { token } = await buildAndStoreQuote(pending);
      await updatePendingRequest(pending.requestId, { status: "completed", quoteToken: token, paidVia: "promo" });
      return { status: 200, data: { requestId: pending.requestId, quoteToken: token, quoteUrl: `/q/${token}` } };
    } catch (err) {
      console.error("Quote generation failed (promo path):", err);
      return { status: 500, error: "We validated your code, but couldn't generate the quote. Please try again — you won't be charged." };
    }
  }

  // ---- Paid path: create Stripe Checkout Session ----
  if (!isStripeConfigured()) {
    return { status: 500, error: "Payments aren't configured yet. Please try again shortly." };
  }
  try {
    const successUrl = `${siteUrl}/quote-builder.html?requestId=${pending.requestId}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/quote-builder.html?requestId=${pending.requestId}&canceled=1`;
    const session = await createCheckoutSession({
      requestId: pending.requestId,
      successUrl,
      cancelUrl,
      amountCents: QUOTE_PRICE_CENTS,
    });
    await updatePendingRequest(pending.requestId, { stripeSessionId: session.id });
    return { status: 200, data: { requestId: pending.requestId, checkoutUrl: session.url } };
  } catch (err) {
    console.error("Stripe checkout session creation failed:", err);
    return { status: 500, error: "Couldn't start checkout. Please try again." };
  }
}

export async function handleQuoteFinalize({ requestId, sessionId }) {
  if (!requestId) return { status: 400, error: "Missing request id." };

  const pending = await getPendingRequest(requestId);
  if (!pending) return { status: 404, error: "Quote request not found or expired." };

  // Idempotent: if this request was already completed (e.g. page refresh
  // after success), just return the existing quote — never charge twice
  // or regenerate.
  if (pending.status === "completed" && pending.quoteToken) {
    return { status: 200, data: { quoteToken: pending.quoteToken, quoteUrl: `/q/${pending.quoteToken}` } };
  }

  if (!sessionId || pending.stripeSessionId !== sessionId) {
    return { status: 400, error: "This doesn't match the payment session for this quote request." };
  }

  let session;
  try {
    session = await getCheckoutSession(sessionId);
  } catch (err) {
    console.error("Stripe session verification failed:", err);
    return { status: 502, error: "Couldn't verify payment right now. Please try again in a moment." };
  }

  if (session.payment_status !== "paid") {
    return { status: 402, error: "Payment hasn't completed yet." };
  }

  try {
    const { token } = await buildAndStoreQuote(pending);
    await updatePendingRequest(requestId, { status: "completed", quoteToken: token, paidVia: "stripe" });
    return { status: 200, data: { quoteToken: token, quoteUrl: `/q/${token}` } };
  } catch (err) {
    console.error("Quote generation failed (paid path):", err);
    // Payment already succeeded — do NOT lose it. Leave status as pending
    // so a retry of this same endpoint (same requestId+sessionId) can
    // pick up where it left off without charging again.
    return { status: 500, error: "Payment succeeded, but we couldn't generate your quote yet. Please refresh this page to try again — you will not be charged again." };
  }
}

export async function handleQuoteGet(token) {
  if (!token) return { status: 400, error: "Missing quote token." };
  const record = await getFinishedQuote(token);
  if (!record) return { status: 404, error: "Quote not found." };
  return { status: 200, data: { token: record.token, quote: record.quote, createdAt: record.createdAt } };
}

export async function handleQuotePdf(token) {
  if (!token) return { status: 400, error: "Missing quote token." };
  const record = await getFinishedQuote(token);
  if (!record || !record.pdfBase64) return { status: 404, error: "Quote PDF not found." };
  return { status: 200, pdfBuffer: Buffer.from(record.pdfBase64, "base64"), quoteNumber: record.quote?.quoteNumber || record.token };
}

export async function handleQuoteEmailSend({ token, toEmail }) {
  if (!token || !toEmail) return { status: 400, error: "Missing token or recipient email." };
  if (!isEmailConfigured()) return { status: 500, error: "Email isn't configured yet." };

  const record = await getFinishedQuote(token);
  if (!record) return { status: 404, error: "Quote not found." };

  const businessName = record.quote?.contractor?.businessName || record.quote?.contractor?.contractorName || "JobPriceNow";
  try {
    await sendQuoteEmail({
      to: toEmail,
      subject: `Estimate from ${businessName}`,
      html: `<p>Hi,</p><p>Attached is the estimate${record.quote?.customer?.name ? ` for ${escapeHtml(record.quote.customer.name)}` : ""}.</p><p>Thank you,<br/>${escapeHtml(businessName)}</p>`,
      pdfBuffer: Buffer.from(record.pdfBase64, "base64"),
      pdfFilename: `${record.quote?.quoteNumber || "quote"}.pdf`,
    });
    return { status: 200, data: { sent: true } };
  } catch (err) {
    console.error("Quote email send failed:", err);
    return { status: 500, error: "We couldn't send the email. Your quote is still available to download." };
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
