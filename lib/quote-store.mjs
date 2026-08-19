// ============================================================
// JobPriceNow — Quote Storage
//
// Two kinds of records, both stored via the existing kv-store
// (Netlify Blobs, no accounts/database needed):
//
// 1. "pending requests" — created the moment someone starts the
//    Quote Builder, BEFORE payment. Holds the estimate + form
//    data so it survives the round trip to Stripe and back.
//    Keyed by a random requestId.
//
// 2. "finished quotes" — created after payment (or a valid promo
//    code) is confirmed. Holds the AI-written scope of work and
//    the generated PDF. Keyed by a random, hard-to-guess token
//    (not a guessable sequential ID), e.g. /q/8af4d91c7b2e
//
// Both expire informally — nothing auto-deletes them today, but
// the shape supports adding a cleanup job later without changing
// callers.
// ============================================================

import crypto from "node:crypto";
import { kvGet, kvSet } from "./kv-store.mjs";

function randomToken(bytes = 12) {
  return crypto.randomBytes(bytes).toString("hex");
}

// ---------------- Pending requests (pre-payment) ----------------

export async function createPendingRequest(payload) {
  const requestId = randomToken();
  const record = {
    requestId,
    status: "pending", // pending -> completed
    createdAt: new Date().toISOString(),
    ...payload,
  };
  await kvSet(`quote-request:${requestId}`, record);
  return record;
}

export async function getPendingRequest(requestId) {
  if (!requestId) return null;
  return kvGet(`quote-request:${requestId}`);
}

export async function updatePendingRequest(requestId, patch) {
  const existing = await getPendingRequest(requestId);
  if (!existing) throw new Error("Quote request not found");
  const next = { ...existing, ...patch };
  await kvSet(`quote-request:${requestId}`, next);
  return next;
}

// ---------------- Finished quotes (post-payment) ----------------

export async function saveFinishedQuote({ quote, pdfBase64 }) {
  const token = randomToken();
  const record = {
    token,
    createdAt: new Date().toISOString(),
    quote, // structured quote data (contractor, customer, scope of work, price, etc.)
    pdfBase64, // the rendered PDF, stored as base64 so it survives serverless restarts
  };
  await kvSet(`quote:${token}`, record);
  return record;
}

export async function getFinishedQuote(token) {
  if (!token) return null;
  return kvGet(`quote:${token}`);
}
