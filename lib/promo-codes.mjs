// ============================================================
// JobPriceNow — Promo Code Store
//
// Lets Dan generate codes in /admin that let a quote skip the
// $2.99 Stripe paywall entirely (comps, testing, friends/family,
// troubleshooting). Codes are case-insensitive, can optionally
// have a limited number of uses, and can be deactivated without
// deleting them (so usage history is preserved).
// ============================================================

import { kvGet, kvSet } from "./kv-store.mjs";

const KEY = "promo-codes";

// { code, note, active, maxUses (null = unlimited), usedCount, createdAt }
export async function listPromoCodes() {
  const stored = await kvGet(KEY);
  return Array.isArray(stored) ? stored : [];
}

export async function savePromoCodes(codes) {
  await kvSet(KEY, codes);
  return codes;
}

export async function createPromoCode({ code, note, maxUses }) {
  const codes = await listPromoCodes();
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) throw new Error("Promo code cannot be empty");
  if (codes.some((c) => c.code === normalized)) {
    throw new Error("That promo code already exists");
  }
  const entry = {
    code: normalized,
    note: String(note || "").slice(0, 200),
    active: true,
    maxUses: maxUses === "" || maxUses == null ? null : Math.max(1, Number(maxUses) || 1),
    usedCount: 0,
    createdAt: new Date().toISOString(),
  };
  codes.push(entry);
  await savePromoCodes(codes);
  return entry;
}

export async function setPromoCodeActive(code, active) {
  const codes = await listPromoCodes();
  const normalized = String(code || "").trim().toUpperCase();
  const entry = codes.find((c) => c.code === normalized);
  if (!entry) throw new Error("Promo code not found");
  entry.active = Boolean(active);
  await savePromoCodes(codes);
  return entry;
}

// Validates a code and, if valid, increments its usage count atomically
// enough for a low-traffic single-admin tool (read-modify-write via KV).
// Returns { valid: boolean, reason?: string }.
export async function redeemPromoCode(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return { valid: false, reason: "No code provided" };

  const codes = await listPromoCodes();
  const entry = codes.find((c) => c.code === normalized);
  if (!entry) return { valid: false, reason: "That code wasn't found" };
  if (!entry.active) return { valid: false, reason: "That code is no longer active" };
  if (entry.maxUses != null && entry.usedCount >= entry.maxUses) {
    return { valid: false, reason: "That code has already been used up" };
  }

  entry.usedCount += 1;
  await savePromoCodes(codes);
  return { valid: true };
}
