// ============================================================
// JobPriceNow — Central Pricing Configuration
// All dollar figures, rates, and multipliers live here.
// Nothing else in the codebase should hardcode a pricing number.
// ============================================================

export const pricingConfig = {
  // National baseline hourly labor rate before regional adjustment
  nationalHourlyRate: 85,

  // Retail material markup applied on top of estimated retail cost
  materialMarkup: 0.15,

  // Absolute floor for any single visit, regardless of task size
  minimumJobPrice: 125,

  // Difficulty multipliers, applied once to the labor+material subtotal
  difficulty: {
    easy: 0,
    moderate: 0.10,
    difficult: 0.20,
    high: 0.30,
  },

  // Multi-task "shared visit" efficiency discount.
  // Applied as a flat per-extra-task reduction on labor time (not price directly),
  // reflecting that a handyman doesn't re-drive/re-setup for each task.
  // extraTaskLaborDiscount = fraction of labor hours saved per task beyond the first
  extraTaskLaborDiscountRate: 0.15,

  // The three displayed price tiers, as multipliers off the calculated base price
  priceTiers: {
    competitive: 0.85,
    recommended: 1.0,
    highMargin: 1.15,
  },

  // Regional cost-of-living multiplier bounds (see location-service.mjs)
  regional: {
    low: 0.85,
    average: 1.0,
    high: 1.25,
  },

  // Rate limiting (requests per hour per IP)
  rateLimitPerHour: 20,

  // Upload limits
  maxPhotos: 3,
  maxPhotoBytesEach: 5 * 1024 * 1024, // 5MB pre-compression cap
  maxDescriptionLength: 1500,

  // AI request timeout (ms)
  aiTimeoutMs: 20000,
};

// Feature flags — everything Pro/monetization-related starts OFF
export const featureFlags = {
  pro: false,
  savedEstimates: false,
  pdfQuotes: false,
  customerSignatures: false,
  shareCards: false,
  homeownerMode: false,
  adsEnabled: false,
};

// Affiliate partner configuration — dormant until real IDs exist
export const affiliatePartners = {
  lowes: { enabled: false, urlTemplate: "" },
  ace: { enabled: false, urlTemplate: "" },
  amazon: { enabled: false, urlTemplate: "" },
  harborFreight: { enabled: false, urlTemplate: "" },
};
