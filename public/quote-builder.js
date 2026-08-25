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
    preview: document.getElementById("qb-preview"),
  };

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

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
  els.app.style.display = "grid";
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
        renderPreview();
      });
      els.priceOptions.appendChild(row);
    });
  }
  renderPriceOptions();

  let logoDataUrl = null;
  document.getElementById("logoFile")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      logoDataUrl = null;
      document.getElementById("logo-preview").style.display = "none";
      renderPreview();
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showError("Logo image is too large — please use one under 4MB.");
      e.target.value = "";
      return;
    }
    try {
      logoDataUrl = await resizeImageToDataUrl(file, 300);
      const img = document.getElementById("logo-preview-img");
      img.src = logoDataUrl;
      document.getElementById("logo-preview").style.display = "block";
      renderPreview();
    } catch {
      showError("Couldn't load that image — try a different file.");
    }
  });

  function resizeImageToDataUrl(file, maxDimension) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("read failed"));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("image load failed"));
        img.onload = () => {
          const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/png"));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

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
        logoDataUrl: logoDataUrl || undefined,
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

  // Builds a close approximation of the real PDF, live, with zero AI calls
  // or server round-trips — updates instantly as the contractor types.
  // Scope-of-work bullets mirror the same fallback logic the server uses
  // when AI content isn't available, so it's a fair (if slightly less
  // polished) preview of what they'll actually receive.
  function renderPreview() {
    const businessName = val("businessName");
    const contractorName = val("contractorName");
    const phone = val("phone");
    const email = val("email");
    const website = val("website");
    const address = val("address");
    const licenseNumber = val("licenseNumber");

    const customerName = val("customerName");
    const jobAddress = val("jobAddress");
    const customerPhone = val("customerPhone");
    const customerEmail = val("customerEmail");

    const additionalNotes = val("additionalNotes");
    const quoteValidDays = val("quoteValidDays") || "30";
    const paymentTerms = val("paymentTerms") || "Payment due upon completion unless otherwise specified.";

    const priceValue = selectedTier === "custom" ? Number(val("customPrice")) || 0 : prices[selectedTier];

    const taskNames = Array.isArray(estimate.tasks) ? estimate.tasks : [];
    const quoteTitle = taskNames.length ? taskNames.join(", ") : estimate.jobType || "Handyman Job Quote";
    const scopeItems = taskNames.length ? taskNames.map((n) => `Complete: ${n}`) : [];

    const contactLine = [phone, email, website].filter(Boolean).join("  •  ");
    const customerContact = [customerPhone, customerEmail].filter(Boolean).join("  •  ");

    let html = `<span class="qb-preview-badge">LIVE PREVIEW</span>`;

    if (logoDataUrl) html += `<img class="qb-preview-logo" src="${logoDataUrl}" alt="Logo" />`;
    html += `<p class="qb-preview-business">${escapeHtml(businessName || contractorName || "Your Business Name")}</p>`;
    if (contractorName && businessName) html += `<p class="qb-preview-sub">${escapeHtml(contractorName)}</p>`;
    if (contactLine) html += `<p class="qb-preview-sub">${escapeHtml(contactLine)}</p>`;
    if (address) html += `<p class="qb-preview-sub">${escapeHtml(address)}</p>`;
    if (licenseNumber) html += `<p class="qb-preview-sub">License #${escapeHtml(licenseNumber)}</p>`;

    html += `<p class="qb-preview-quotelabel">QUOTE</p>`;
    html += `<p class="qb-preview-meta">Preview  •  Valid for ${escapeHtml(String(quoteValidDays))} days</p>`;
    html += `<hr class="qb-preview-rule" />`;

    if (customerName || jobAddress) {
      html += `<p class="qb-preview-label">Customer</p>`;
      if (customerName) html += `<p class="qb-preview-text">${escapeHtml(customerName)}</p>`;
      if (jobAddress) html += `<p class="qb-preview-muted">${escapeHtml(jobAddress)}</p>`;
      if (customerContact) html += `<p class="qb-preview-muted">${escapeHtml(customerContact)}</p>`;
      html += `<hr class="qb-preview-rule" />`;
    }

    html += `<p class="qb-preview-text" style="font-weight:800;">${escapeHtml(quoteTitle)}</p>`;
    if (scopeItems.length) {
      html += `<ul class="qb-preview-list">${scopeItems.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>`;
    }
    html += `<hr class="qb-preview-rule" />`;

    html += `<p class="qb-preview-price-label">Total Estimate</p>`;
    html += `<p class="qb-preview-price">${money(priceValue)}</p>`;
    html += `<hr class="qb-preview-rule" />`;

    if (additionalNotes) {
      html += `<p class="qb-preview-label">Notes</p>`;
      html += `<p class="qb-preview-muted">${escapeHtml(additionalNotes)}</p>`;
      html += `<hr class="qb-preview-rule" />`;
    }

    html += `<p class="qb-preview-label">Terms</p>`;
    html += `<p class="qb-preview-muted">${escapeHtml(paymentTerms)}</p>`;
    html += `<p class="qb-preview-footer">Generated with JobPriceNow.com</p>`;

    els.preview.innerHTML = html;
  }

  els.form.addEventListener("input", renderPreview);
  renderPreview();

  async function finalize(requestId, sessionId) {
    try {
      const res = await fetch(`/api/finalize-quote?requestId=${encodeURIComponent(requestId)}&session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "We couldn't confirm your payment.");
      sessionStorage.removeItem("jpn_pending_estimate");
      window.location.href = data.quoteUrl;
    } catch (err) {
      els.loading.innerHTML = `<p style="color:#C0392B;">${err.message || "Something went wrong confirming your payment."}</p><p style="margin-top:10px;"><a href="javascript:location.reload()">Try again</a> — you will not be charged twice.</p>`;
    }
  }
})();
