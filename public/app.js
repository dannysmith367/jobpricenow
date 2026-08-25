(() => {
  "use strict";

  const MAX_PHOTOS = 3;
  const MAX_DIMENSION = 1024; // resize target for compression
  const JPEG_QUALITY = 0.72;

  // ---------------------------------------------------------
  // Privacy-conscious analytics hook.
  // Swap the body of track() for a real analytics provider later.
  // Never collects raw photos, full descriptions, or PII.
  // ---------------------------------------------------------
  function track(event, meta = {}) {
    try {
      console.debug("[analytics]", event, meta);
      if (window.gtag) window.gtag("event", event, meta);
    } catch (_) {}
  }

  const els = {
    form: document.getElementById("estimator-form"),
    description: document.getElementById("description"),
    charCount: document.getElementById("char-count"),
    zip: document.getElementById("zip"),
    addPhotoBtn: document.getElementById("add-photo-btn"),
    photoInput: document.getElementById("photo-input"),
    photoPreviews: document.getElementById("photo-previews"),
    priceBtn: document.getElementById("price-btn"),
    priceBtnLabel: document.getElementById("price-btn-label"),
    resultSection: document.getElementById("result-section"),
  };

  let photos = []; // { dataUrl }
  let lastEstimateResponse = null;
  let lastRequestBody = null;
  let siteConfig = null; // ads/affiliate settings, fetched once on load

  // ---------------- Persona: Pro vs Homeowner ----------------
  // Same pricing engine underneath — this only changes framing/copy so
  // each audience sees language that makes sense for them.
  const PERSONA_KEY = "jpn_persona";
  const PERSONA_COPY = {
    pro: {
      heading: "What should I charge for this job?",
      subhead: "Describe the job. Add photos. Get a realistic price in seconds.",
      priceBtnLabel: "Price My Job",
      tierLabels: { competitive: "Competitive", recommended: "Recommended", highMargin: "High-Margin" },
      disclaimer: "JobPriceNow provides pricing guidance only and does not guarantee job costs or profitability. Verify materials, site conditions, permit requirements, licensing requirements, and local regulations before submitting or performing work.",
      showQuoteBtn: true,
    },
    homeowner: {
      heading: "What should this job cost?",
      subhead: "Describe the job. Add photos. See a fair price range before you hire anyone.",
      priceBtnLabel: "See What It Should Cost",
      tierLabels: { competitive: "Low End", recommended: "Fair Price", highMargin: "High End" },
      disclaimer: "JobPriceNow provides pricing guidance only and does not guarantee what any contractor will charge. Prices vary by materials, site conditions, and local rates — get quotes from a couple of licensed pros before hiring.",
      showQuoteBtn: false,
    },
  };

  function getPersona() {
    try {
      return localStorage.getItem(PERSONA_KEY) === "homeowner" ? "homeowner" : "pro";
    } catch (_) {
      return "pro";
    }
  }

  function setPersona(persona) {
    try { localStorage.setItem(PERSONA_KEY, persona); } catch (_) {}
    applyPersonaCopy();
    track("persona_switch", { persona });
  }

  function applyPersonaCopy() {
    const persona = getPersona();
    const copy = PERSONA_COPY[persona];

    document.getElementById("persona-pro").classList.toggle("active", persona === "pro");
    document.getElementById("persona-homeowner").classList.toggle("active", persona === "homeowner");

    const heading = document.getElementById("hero-heading");
    const subhead = document.getElementById("hero-subhead");
    if (heading) heading.textContent = copy.heading;
    if (subhead) subhead.textContent = copy.subhead;
    if (els.priceBtnLabel) els.priceBtnLabel.textContent = copy.priceBtnLabel;

    const disclaimerEl = document.querySelector(".estimator-card .disclaimer");
    if (disclaimerEl) disclaimerEl.textContent = copy.disclaimer;

    // If a result is already showing, re-render it so tier labels / quote button match.
    if (lastEstimateResponse) renderResult(lastEstimateResponse);
  }

  document.getElementById("persona-pro").addEventListener("click", () => setPersona("pro"));
  document.getElementById("persona-homeowner").addEventListener("click", () => setPersona("homeowner"));
  applyPersonaCopy();

  // ---------------- Site config (ads / affiliate) ----------------
  async function loadSiteConfig() {
    try {
      const res = await fetch("/api/site-config");
      if (res.ok) siteConfig = await res.json();
      injectAdSlot(document.getElementById("footer-ad-slot"));
      loadGoogleAnalytics(siteConfig?.googleAnalyticsId);
      renderSocialLinks(siteConfig?.socialLinks);
    } catch (_) {
      // Config fetch failing should never block the estimator — just skip ads/affiliate links.
    }
  }
  loadSiteConfig();

  function loadGoogleAnalytics(measurementId) {
    if (!measurementId || window.__gaLoaded) return;
    window.__gaLoaded = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", measurementId);
  }

  // ---------------- Footer social links ----------------
  const SOCIAL_ICONS = {
    instagram:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/></svg>',
    tiktok:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 3v9.8a3.4 3.4 0 1 1-2.6-3.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M14 3c.4 2.4 2.1 4.2 4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    facebook:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 8h2V5h-2c-2 0-3.5 1.5-3.5 3.5V11H9v3h2.5v6h3v-6H17l.5-3h-3V9c0-.6.4-1 1-1Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    x: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4l16 16M20 4 4 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    youtube:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor"/></svg>',
  };

  function renderSocialLinks(socialLinks) {
    const container = document.getElementById("social-links");
    if (!container || !socialLinks) return;
    const items = Object.entries(socialLinks)
      .filter(([, info]) => info?.url)
      .map(([key, info]) => {
        const icon = SOCIAL_ICONS[key] || "";
        return `<a href="${escapeHtml(info.url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(
          info.label || key
        )}" title="${escapeHtml(info.label || key)}">${icon}</a>`;
      });
    container.innerHTML = items.join("");
  }

  // ---------------- Description char count ----------------
  els.description.addEventListener("input", () => {
    els.charCount.textContent = String(els.description.value.length);
  });

  // ---------------- ZIP: digits only ----------------
  els.zip.addEventListener("input", () => {
    els.zip.value = els.zip.value.replace(/\D/g, "").slice(0, 5);
  });

  // ---------------- Photo upload + compression ----------------
  els.addPhotoBtn.addEventListener("click", () => {
    if (photos.length >= MAX_PHOTOS) return;
    els.photoInput.click();
  });

  els.photoInput.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - photos.length);
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const dataUrl = await compressImage(file);
        photos.push({ dataUrl });
        track("photo_uploaded", { count: photos.length });
      } catch (err) {
        console.error("Photo processing failed", err);
      }
    }
    renderPhotoPreviews();
    els.photoInput.value = "";
  });

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > height && width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderPhotoPreviews() {
    els.photoPreviews.innerHTML = "";
    photos.forEach((p, i) => {
      const div = document.createElement("div");
      div.className = "photo-thumb";
      div.innerHTML = `<img src="${p.dataUrl}" alt="Job photo ${i + 1}" />
        <button type="button" class="photo-remove" aria-label="Remove photo ${i + 1}">×</button>`;
      div.querySelector(".photo-remove").addEventListener("click", () => {
        photos.splice(i, 1);
        renderPhotoPreviews();
      });
      els.photoPreviews.appendChild(div);
    });
    els.addPhotoBtn.style.display = photos.length >= MAX_PHOTOS ? "none" : "flex";
  }

  // ---------------- Submit / estimate ----------------
  els.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const description = els.description.value.trim();
    const zip = els.zip.value.trim();

    if (!description) {
      els.description.focus();
      return;
    }
    if (zip && zip.length !== 5) {
      els.zip.focus();
      return;
    }

    track("estimate_requested", { hasZip: Boolean(zip), photoCount: photos.length });
    setLoading(true);
    renderLoadingState();

    lastRequestBody = { description, zip, photos: photos.map((p) => p.dataUrl) };

    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastRequestBody),
      });
      const data = await res.json();

      if (!res.ok) {
        track("ai_analysis_failed", { status: res.status });
        renderError(data.error || "Something went wrong. Please try again.");
        return;
      }

      track("estimate_completed", { source: data.source, confidence: data.confidence });
      lastEstimateResponse = { ...data, jobDescription: description };
      renderResult(lastEstimateResponse);
    } catch (err) {
      console.error(err);
      renderError("Something went wrong analyzing the job. Your photos are safe. Try again or continue with a description-only estimate.");
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    els.priceBtn.disabled = isLoading;
    els.priceBtnLabel.textContent = isLoading ? "Working..." : "Price My Job";
  }

  function renderLoadingState() {
    const messages = [
      "Reading the job…",
      "Understanding what's involved…",
      "Checking labor hours…",
      "Looking up real material prices…",
      "Comparing with similar jobs…",
      "Factoring in your location…",
      "Double-checking the numbers…",
      "Almost done — thanks for your patience…",
    ];
    els.resultSection.hidden = false;
    els.resultSection.innerHTML = `
      <div class="card loading-box">
        <div class="spinner" aria-hidden="true"></div>
        <div id="loading-message">${messages[0]}</div>
        <div id="loading-submessage" style="font-size:12.5px;color:var(--muted);margin-top:6px;">This can take up to 20 seconds since we check real prices for you.</div>
      </div>`;
    let i = 0;
    const msgEl = document.getElementById("loading-message");
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      if (msgEl) msgEl.textContent = messages[i];
      else clearInterval(interval);
    }, 1600);
    els.resultSection.dataset.loadingInterval = interval;
    els.resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearLoadingInterval() {
    const id = els.resultSection.dataset.loadingInterval;
    if (id) clearInterval(Number(id));
  }

  function renderError(message) {
    clearLoadingInterval();
    els.resultSection.hidden = false;
    els.resultSection.innerHTML = `
      <div class="card error-box">${escapeHtml(message)}</div>
    `;
  }

  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderResult(data) {
    clearLoadingInterval();
    const { pricing } = data;

    let html = "";

    html += `
      <div class="result-status">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Here's your estimate
      </div>
      <p class="result-meta">${escapeHtml(data.jobType)}${data.locationIsEstimate ? " · Prices are estimated for your area" : ""}</p>
    `;

    const tierLabels = PERSONA_COPY[getPersona()].tierLabels;
    html += `
      <div class="price-tiers">
        <div class="price-tier">
          <div class="tier-label">${tierLabels.competitive}</div>
          <div class="tier-value">${money(pricing.prices.competitive)}</div>
        </div>
        <div class="price-tier recommended">
          <div class="tier-label">${tierLabels.recommended}</div>
          <div class="tier-value">${money(pricing.prices.recommended)}</div>
        </div>
        <div class="price-tier">
          <div class="tier-label">${tierLabels.highMargin}</div>
          <div class="tier-value">${money(pricing.prices.highMargin)}</div>
        </div>
      </div>
    `;

    html += `
      <div class="stat-grid">
        <div class="stat-box"><div class="stat-label">Labor</div><div class="stat-value">${pricing.laborHoursLow}–${pricing.laborHoursHigh} hrs</div></div>
        <div class="stat-box"><div class="stat-label">Materials</div><div class="stat-value">${money(pricing.materialCost)}</div></div>
        <div class="stat-box"><div class="stat-label">Difficulty</div><div class="stat-value">${capitalize(pricing.difficulty)}</div></div>
        <div class="stat-box"><div class="stat-label">Confidence</div><div class="stat-value">${capitalize(data.confidence)}</div></div>
      </div>
    `;

    html += `
      <div class="why-box">
        <h3>Why this price?</h3>
        <p>${escapeHtml(buildWhyText(data, pricing))}</p>
        ${data.tasks.length > 1 ? `<ul class="task-list">${data.tasks.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>` : ""}
      </div>
    `;

    if (data.licenseOrPermitWarning || (data.riskFlags && data.riskFlags.length > 0)) {
      html += `
        <div class="warn-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3 2 20h20L12 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10v4M12 17h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          <div>
            <h3>Professional trade may be required</h3>
            <p>This work may require a licensed contractor or permit in your area. Verify local requirements before quoting or performing the work.</p>
          </div>
        </div>
      `;
    }

    if (data.missingInformation && data.missingInformation.length > 0) {
      html += `
        <div class="followup-box">
          <h3>A couple quick questions could sharpen this price:</h3>
          <ul>${data.missingInformation.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>
        </div>
      `;
    }

    const showQuoteBtn = PERSONA_COPY[getPersona()].showQuoteBtn;
    html += `
      <div class="action-row">
        <button type="button" class="btn-outline btn-full" id="new-estimate-btn">${showQuoteBtn ? "Price Another Job" : "Check Another Job"}</button>
      </div>
    `;

    html += renderMaterialsPlaceholder();

    if (showQuoteBtn) {
      html += `
        <div class="card pro-quote-box" style="text-align:center;">
          <p style="font-weight:600;color:var(--navy);margin:0 0 6px;">Ready to send this price to your customer?</p>
          <p style="font-size:13px;color:var(--muted);margin:0 0 12px;">Turn this into a professional, branded quote — PDF, email, or text. $2.99, one time, no account needed.</p>
          <button type="button" class="btn-primary btn-full" id="create-pro-quote-btn">Create Professional Quote — $2.99</button>
        </div>
      `;
    }

    html += `
      <div class="card feedback-box" id="feedback-box">
        <p>Does this price look right?</p>
        <div class="feedback-buttons">
          <button type="button" class="feedback-btn" data-vote="up" aria-label="Yes, this price looks right">👍</button>
          <button type="button" class="feedback-btn" data-vote="down" aria-label="No, this price looks off">👎</button>
        </div>
        <div id="feedback-followup"></div>
      </div>
    `;

    els.resultSection.innerHTML = html;
    injectAdSlot(document.getElementById("result-ad-slot"));
    wireResultInteractions(data, pricing);
    els.resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function buildWhyText(data, pricing) {
    const laborPart = `This job will likely take about ${pricing.laborHoursLow}–${pricing.laborHoursHigh} hours.`;
    const materialPart = pricing.materialCost > 0 ? ` The estimate includes approximately ${money(pricing.materialCost)} in materials.` : "";
    const difficultyPart = pricing.difficultyAdjustmentPct > 0
      ? ` It accounts for ${pricing.difficulty} difficulty (+${pricing.difficultyAdjustmentPct}%).`
      : "";
    const minPart = pricing.minimumApplied ? " Pricing reflects JobPriceNow's minimum service visit." : "";
    return laborPart + materialPart + difficultyPart + minPart;
  }

  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  function renderMaterialsPlaceholder() {
    // "findAPro" in admin forces the Angi box for every visitor (useful if
    // Dan ever wants to go all-in on referrals). Otherwise, Homeowners
    // automatically see the Angi "find a pro" box, and Pros see shoppable
    // materials links — same underlying settings, just routed by persona.
    const forceFindAPro = siteConfig?.materialsSectionMode === "findAPro";
    const showFindAPro = forceFindAPro || getPersona() === "homeowner";

    if (showFindAPro) {
      return renderFindAProBox() + `<div class="ad-slot" id="result-ad-slot" data-slot="result_ad_slot"></div>`;
    }
    const affiliateLinksHtml = buildAffiliateLinksHtml();
    return `
      <div class="materials-box">
        <h3>Materials for this job</h3>
        <p class="materials-sub">Estimated materials cost: ${money(lastEstimateResponse?.pricing?.materialCostRetail || 0)}</p>
        ${
          affiliateLinksHtml ||
          `<p style="font-size:13px;color:var(--muted);margin:0;">Shoppable material links are coming soon.</p>`
        }
      </div>
      <div class="ad-slot" id="result-ad-slot" data-slot="result_ad_slot"></div>
    `;
  }

  function renderFindAProBox() {
    const angi = siteConfig?.angiPartner;
    if (!angi?.enabled || !angi?.urlTemplate) return "";
    const zip = els.zip?.value?.trim() || "";
    const url = angi.urlTemplate.replace("{ZIP}", encodeURIComponent(zip));
    return `
      <div class="materials-box" style="text-align:center;">
        <h3>Not doing this job yourself?</h3>
        <p class="materials-sub">Find a local pro to handle it for you.</p>
        <a href="${url}" target="_blank" rel="noopener sponsored" class="btn-primary btn-full" style="display:inline-block;text-decoration:none;margin-top:8px;">Find a Pro on Angi →</a>
      </div>
    `;
  }

  function buildAffiliateLinksHtml() {
    if (!siteConfig?.affiliatePartners) return "";

    // Prefer the AI's specific per-job product suggestions (e.g. "18v cordless
    // drill"). If none are available — fallback mode, or the AI returned
    // nothing usable — fall back to one generic link off the description.
    // Products can be plain strings (older/fallback format) or objects with
    // a real looked-up price: { name, price, pricedFromSearch }.
    const rawProducts = Array.isArray(lastEstimateResponse?.suggestedProducts) && lastEstimateResponse.suggestedProducts.length
      ? lastEstimateResponse.suggestedProducts
      : [els.description.value.slice(0, 80) || "handyman materials"];

    const products = rawProducts.map((p) =>
      typeof p === "string" ? { name: p, price: null, pricedFromSearch: false } : p
    );

    // Only one partner is expected to be enabled at a time (Amazon vs. Home
    // Depot vs. a curated list) — if more than one is on, we use all of them,
    // one row per product per enabled partner.
    const enabledPartners = Object.values(siteConfig.affiliatePartners).filter((p) => p.enabled && p.urlTemplate);
    if (!enabledPartners.length) return "";

    const rows = products.map((product) => {
      const query = encodeURIComponent(product.name);
      const partnerLinks = enabledPartners
        .map((p) => {
          const url = p.urlTemplate.replace("{QUERY}", query);
          return `<a href="${url}" target="_blank" rel="noopener sponsored" class="affiliate-link">${escapeHtml(p.label)} →</a>`;
        })
        .join("");
      const priceHtml =
        typeof product.price === "number"
          ? `<span class="affiliate-product-price">${money(product.price)}</span>`
          : "";
      return `<div class="affiliate-row"><span class="affiliate-product-name">${escapeHtml(product.name)}${priceHtml}</span>${partnerLinks}</div>`;
    });

    return `<div class="affiliate-links">${rows.join("")}</div>`;
  }

  // Your AdSense publisher ID (the "ca-pub-..." string) — same for every ad
  // unit on the site, so it only needs to live here, not in every admin field.
  const ADSENSE_CLIENT_ID = "ca-pub-7163057510687080";
  let adsenseLoaderInjected = false;

  function loadAdSenseScript() {
    if (adsenseLoaderInjected) return;
    adsenseLoaderInjected = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }

  function injectAdSlot(slotEl) {
    if (!slotEl || !siteConfig?.adsEnabled) return;
    const slotKey = slotEl.dataset.slot;
    const slotConfig = siteConfig.adSlots?.[slotKey];
    const raw = slotConfig?.html?.trim();
    if (!raw) return;

    loadAdSenseScript();

    // Admin field can hold either just the numeric AdSense ad-slot ID (the
    // simple, expected case) or a full custom embed snippet from another ad
    // network — either way it renders correctly.
    const isJustSlotId = /^\d+$/.test(raw);
    slotEl.innerHTML = isJustSlotId
      ? `<ins class="adsbygoogle" style="display:block" data-ad-client="${ADSENSE_CLIENT_ID}" data-ad-slot="${raw}" data-ad-format="auto" data-full-width-responsive="true"></ins>`
      : raw;
    slotEl.classList.add("enabled");

    // AdSense won't actually fill/render the <ins> block until this runs.
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {
      // Ad blockers or slow script load shouldn't break the page.
    }
  }

  function wireResultInteractions(data, pricing) {
    document.getElementById("new-estimate-btn").addEventListener("click", () => {
      els.resultSection.hidden = true;
      els.resultSection.innerHTML = "";
      els.form.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document.querySelectorAll(".feedback-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".feedback-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        const vote = btn.dataset.vote;
        track(vote === "up" ? "thumbs_up" : "thumbs_down");

        const followup = document.getElementById("feedback-followup");
        if (vote === "up") {
          followup.innerHTML = `<p class="feedback-thanks">Thanks — that helps!</p>`;
        } else {
          followup.innerHTML = `
            <div class="feedback-followup">
              <input type="text" inputmode="numeric" id="alt-price-input" placeholder="What would you charge?" style="flex:1;padding:10px 12px;border:1.5px solid var(--border);border-radius:9px;font-size:15px;" />
              <button type="button" class="btn-outline" id="alt-price-submit">Send</button>
            </div>
          `;
          document.getElementById("alt-price-submit").addEventListener("click", () => {
            const val = document.getElementById("alt-price-input").value;
            track("alternative_price_entered", { value: val });
            followup.innerHTML = `<p class="feedback-thanks">Thanks — noted for $${escapeHtml(val || "—")}.</p>`;
          });
        }
      });
    });

    document.getElementById("create-pro-quote-btn")?.addEventListener("click", () => {
      track("pro_quote_cta_clicked");
      try {
        sessionStorage.setItem("jpn_pending_estimate", JSON.stringify(data));
        window.location.href = "/quote-builder.html";
      } catch (err) {
        alert("Couldn't start the quote builder. Please try again.");
      }
    });
  }

  track("page_loaded");
})();
