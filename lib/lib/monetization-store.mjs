// ============================================================
// JobPriceNow — Monetization Config Store
// Ads + affiliate settings, editable live from /admin without
// a redeploy. Defaults mirror the original dormant scaffolding
// in pricing-config.mjs so the site behaves identically until
// Dan actually turns something on.
// ============================================================

import { kvGet, kvSet } from "./kv-store.mjs";

const KEY = "monetization-config";

export const defaultMonetizationConfig = {
  adsEnabled: false,
  adSlots: {
    // Raw ad-network embed code (e.g. AdSense, Ezoic, a direct sponsor snippet).
    // Left blank = slot renders nothing, even if adsEnabled is true.
    result_ad_slot: { label: "Below the price breakdown", html: "" },
    footer_ad_slot: { label: "Page footer", html: "" },
    blog_ad_slot: { label: "Inside blog posts", html: "" },
  },
  affiliatePartners: {
    lowes: { label: "Lowe's", enabled: false, urlTemplate: "" },
    ace: { label: "Ace Hardware", enabled: false, urlTemplate: "" },
    amazon: { label: "Amazon", enabled: false, urlTemplate: "" },
    harborFreight: { label: "Harbor Freight", enabled: false, urlTemplate: "" },
  },
  // "products" = show the materials/shoppable-links box (default, existing
  // behavior). "findAPro" = replace that box with a single "Find a Pro"
  // CTA using angiPartner below, for sending the visitor to hire someone
  // instead of buying materials themselves.
  materialsSectionMode: "products",
  angiPartner: {
    label: "Angi — Find a Pro",
    enabled: false,
    // Full URL to your Angi affiliate link. {ZIP} is optional and gets
    // replaced with the visitor's entered ZIP code if they provided one.
    urlTemplate: "",
  },
  // Pro tier stays off until Dan is ready — the toggle exists now so
  // turning it on later is a config change, not a code change.
  proEnabled: false,
};

export async function getMonetizationConfig() {
  const stored = await kvGet(KEY);
  if (!stored) return structuredClone(defaultMonetizationConfig);
  // Merge with defaults so new fields introduced later don't break old saved data
  return {
    ...structuredClone(defaultMonetizationConfig),
    ...stored,
    adSlots: { ...structuredClone(defaultMonetizationConfig.adSlots), ...(stored.adSlots || {}) },
    affiliatePartners: {
      ...structuredClone(defaultMonetizationConfig.affiliatePartners),
      ...(stored.affiliatePartners || {}),
    },
    angiPartner: { ...structuredClone(defaultMonetizationConfig.angiPartner), ...(stored.angiPartner || {}) },
  };
}

export async function saveMonetizationConfig(next) {
  const merged = {
    ...structuredClone(defaultMonetizationConfig),
    ...next,
    adSlots: { ...structuredClone(defaultMonetizationConfig.adSlots), ...(next.adSlots || {}) },
    affiliatePartners: {
      ...structuredClone(defaultMonetizationConfig.affiliatePartners),
      ...(next.affiliatePartners || {}),
    },
    angiPartner: { ...structuredClone(defaultMonetizationConfig.angiPartner), ...(next.angiPartner || {}) },
  };
  await kvSet(KEY, merged);
  return merged;
}

// Subset that's safe to expose on the public site (identical shape today,
// but kept separate in case admin-only fields get added later).
export function toPublicConfig(config) {
  return {
    adsEnabled: config.adsEnabled,
    adSlots: config.adSlots,
    affiliatePartners: config.affiliatePartners,
    materialsSectionMode: config.materialsSectionMode,
    angiPartner: config.angiPartner,
    proEnabled: config.proEnabled,
  };
}
