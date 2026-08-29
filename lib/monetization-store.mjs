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
  // Controls the Homeowner view ONLY. "products" = show the materials/
  // shoppable-links box (default, existing behavior). "findAPro" = replace
  // that box with a single "Find a Pro" CTA using leadGenPartners below, for
  // sending the visitor to hire someone instead of buying materials
  // themselves. The Pro view always shows material product suggestions
  // regardless of this setting — a contractor doesn't need a "find a pro"
  // link, they are the pro.
  homeownerMaterialsMode: "products",
  // Lead-gen / "Find a Pro" partners — provider-agnostic on purpose, since
  // approval for any single program (Angi, Modernize, etc.) isn't guaranteed
  // and it should be easy to switch or add providers without a code change.
  // Only ONE partner is shown at a time, picked by activeLeadGenPartner —
  // add a new key here (and in admin.js) any time a new program is approved.
  leadGenPartners: {
    angi: { label: "Angi", enabled: false, urlTemplate: "" },
    modernize: { label: "Modernize", enabled: false, urlTemplate: "" },
    homeAdvisor: { label: "HomeAdvisor", enabled: false, urlTemplate: "" },
  },
  // Which key in leadGenPartners is actually shown to homeowners right now.
  activeLeadGenPartner: "angi",
  // Pro tier stays off until Dan is ready — the toggle exists now so
  // turning it on later is a config change, not a code change.
  proEnabled: false,
  // GA4 Measurement ID (e.g. "G-XXXXXXXXXX"). Blank = no analytics loaded.
  googleAnalyticsId: "",
};

export async function getMonetizationConfig() {
  const stored = await kvGet(KEY);
  if (!stored) return structuredClone(defaultMonetizationConfig);
  // Merge with defaults so new fields introduced later don't break old saved data.
  // Also migrate the old global "materialsSectionMode" field (pre persona-split)
  // into the new homeowner-only field, so an existing saved "findAPro" choice
  // carries over instead of silently resetting to "products".
  const migratedHomeownerMode = stored.homeownerMaterialsMode || stored.materialsSectionMode;
  // Migrate the old single-provider angiPartner field (pre lead-gen-partner
  // generalization) into leadGenPartners.angi, so an existing saved Angi
  // link/toggle carries over instead of silently resetting to blank.
  const migratedLeadGenPartners = stored.leadGenPartners || (stored.angiPartner ? { angi: stored.angiPartner } : {});
  return {
    ...structuredClone(defaultMonetizationConfig),
    ...stored,
    ...(migratedHomeownerMode ? { homeownerMaterialsMode: migratedHomeownerMode } : {}),
    adSlots: { ...structuredClone(defaultMonetizationConfig.adSlots), ...(stored.adSlots || {}) },
    affiliatePartners: {
      ...structuredClone(defaultMonetizationConfig.affiliatePartners),
      ...(stored.affiliatePartners || {}),
    },
    leadGenPartners: {
      ...structuredClone(defaultMonetizationConfig.leadGenPartners),
      ...migratedLeadGenPartners,
    },
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
    leadGenPartners: {
      ...structuredClone(defaultMonetizationConfig.leadGenPartners),
      ...(next.leadGenPartners || {}),
    },
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
    homeownerMaterialsMode: config.homeownerMaterialsMode,
    leadGenPartners: config.leadGenPartners,
    activeLeadGenPartner: config.activeLeadGenPartner,
    proEnabled: config.proEnabled,
    googleAnalyticsId: config.googleAnalyticsId,
  };
}
