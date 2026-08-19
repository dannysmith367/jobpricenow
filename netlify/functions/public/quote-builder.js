(function () {
  "use strict";

  const els = {
    loading: document.getElementById("qb-loading"),
    app: document.getElementById("qb-app"),
    missing: document.getElementById("qb-missing"),
    jobType: document.getElementById("qb-job-type"),
    priceOptions: document.getElementById("price-options"),
    customPriceField: document.getElementById("custom-price-field"),
    customPrice: document.getElementById("customPrice"),
    form: document.getElementById("qb-form"),
    submit: document.getElementById("qb-submit"),
    error: document.getElementById("qb-error"),
  };

  function money(n) {
    return `$${Math.round(Number(n) || 0).toLocaleString("en-US")}`;
  }

  function showError(msg) {
    els.error.textContent = msg;
    els.error.style.display = "block";
  }
  function clearError() {
    els.error.style.display = "none";
  }

  const params = new URLSearchParams(window.location.search);
  const returningRequestId = params.get("requestId");
  const returningSessionId = params.get("session_id");

  // ---- If we're returning from Stripe, finalize immediately instead of showing the form again ----
  if (returningRequestId && returningSessionId) {
    els.loading.textContent = "Confirming your payment…";
    finalize(returningRequestId, returningSessionId);
    return;
  }

  const stored = sessionStorage.getItem("jpn_pending_estimate");
  if (!stored) {
    els.loading.style.display = "none";
    els.missing.style.display = "block";
    return;
  }

  let estimate;
  try {
    estimate = JSON.parse(stored);
  } catch {
    els.loading.style.display = "none";
    els.missing.style.display = "block";
    return;
  }

  els.loading.style.display = "none";
  els.app.style.display = "block";
  els.jobType.textContent = estimate.jobType || "Handyman job";

  const prices = estimate.pricing?.prices || {};
  let selectedTier = "recommended";

  function renderPriceOptions() {
    const options = [
      { key: "competitive", label: "Competitive", value: prices.competitive },
      { key: "recommended", label: "Recommended", value: prices.recommended },
      { key: "highMargin", label: "High-Margin", value: prices.highMargin },
      { key: "custom", label: "Custom price", value: null },
    ];
    els.priceOptions.innerHTML = "";
    options.forEach((opt) => {
      const row = document.createElement("div");
      row.className = "price-option" + (opt.key === selectedTier ? " selected" : "");
      row.innerHTML = `<span>${opt.label}</span><span class="amount">${opt.value != null ? money(opt.value) : "—"}</span>`;
      row.addEventListener("click", () => {
        selectedTier = opt.key;
        renderPriceOptions();
        els.customPriceField.style.display = opt.key === "custom" ? "block" : "none";
      });
      els.priceOptions.appendChild(row);
    });
  }
  renderPriceOptions();

  els.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();
    els.submit.disabled = true;
    els.submit.textContent = "Working…";

    const payload = {
      estimate,
      contractor: {
        businessName: val("businessName"),
        contractorName: val("contractorName"),
        phone: val("phone"),
        email: val("email"),
        website: val("website"),
        address: val("address"),
        licenseNumber: val("licenseNumber"),
      },
      customer: {
        name: val("customerName"),
        jobAddress: val("jobAddress"),
        phone: val("customerPhone"),
        email: val("customerEmail"),
      },
      options: {
        additionalNotes: val("additionalNotes"),
        quoteValidDays: Number(val("quoteValidDays")) || 30,
        paymentTerms: val("paymentTerms"),
      },
      selectedPriceTier: selectedTier,
      customPrice: selectedTier === "custom" ? Number(val("customPrice")) : undefined,
      promoCode: val("promoCode") || undefined,
    };

    try {
      const res = await fetch("/api/create-quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      if (data.quoteUrl) {
        // Promo code path — quote is already generated, go straight there.
        sessionStorage.removeItem("jpn_pending_estimate");
        window.location.href = data.quoteUrl;
        return;
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      throw new Error("Unexpected response from server.");
    } catch (err) {
      showError(err.message || "Something went wrong. Please try again.");
      els.submit.disabled = false;
      els.submit.textContent = "Create Professional Quote — $2.99";
    }
  });

  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  async function finalize(requestId, sessionId) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const res = await fetch(`/api/finalize-quote?requestId=${encodeURIComponent(requestId)}&session_id=${encodeURIComponent(sessionId)}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "We couldn't confirm your payment.");
      sessionStorage.removeItem("jpn_pending_estimate");
      window.location.href = data.quoteUrl;
    } catch (err) {
      const message = err.name === "AbortError" ? "This is taking longer than expected." : err.message || "Something went wrong confirming your payment.";
      els.loading.innerHTML = `<p style="color:#C0392B;">${message}</p><p style="margin-top:10px;"><a href="javascript:location.reload()">Try again</a> — you will not be charged twice.</p>`;
    } finally {
      clearTimeout(timeout);
    }
  }
})();
