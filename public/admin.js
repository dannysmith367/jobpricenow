(() => {
  const SESSION_KEY = "jpn_admin_password";

  const gate = document.getElementById("gate");
  const dashboard = document.getElementById("dashboard");
  const gateError = document.getElementById("gate-error");

  let monetization = null;
  let posts = [];
  let editingPostId = null;
  let promoCodes = [];
  let blogAutomation = null;
  let stats = null;

  function getPassword() {
    return sessionStorage.getItem(SESSION_KEY) || "";
  }

  async function api(path, options = {}) {
    const res = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": getPassword(),
        ...(options.headers || {}),
      },
    });
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  // ---------- Auth gate ----------
  async function tryUnlock(password) {
    sessionStorage.setItem(SESSION_KEY, password);
    try {
      monetization = await api("/api/admin-monetization");
      posts = await api("/api/admin-blog");
      promoCodes = await api("/api/admin-promo");
      blogAutomation = await api("/api/admin-blog-automation");
      stats = await api("/api/admin-stats");
      gate.hidden = true;
      dashboard.hidden = false;
      renderMonetization();
      renderPostList();
      renderPromoCodes();
      renderBlogAutomation();
      renderStats();
    } catch (err) {
      sessionStorage.removeItem(SESSION_KEY);
      gateError.textContent = "Incorrect password. Try again.";
    }
  }

  document.getElementById("unlock-btn").addEventListener("click", () => {
    const pw = document.getElementById("password-input").value;
    if (!pw) return;
    tryUnlock(pw);
  });
  document.getElementById("password-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("unlock-btn").click();
  });
  document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });

  // Auto-unlock if a password is already saved for this browser tab session
  if (getPassword()) tryUnlock(getPassword());

  // ---------- Tabs ----------
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
  });

  // ---------- Ads & Affiliate ----------
  function renderMonetization() {
    document.getElementById("ads-enabled").checked = monetization.adsEnabled;

    const slotsEl = document.getElementById("ad-slots-container");
    slotsEl.innerHTML = "";
    Object.entries(monetization.adSlots).forEach(([key, slot]) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${slot.label}</h3>
        <p class="sub">Paste your ad network's embed code (e.g. AdSense unit). Leave blank to skip this spot.</p>
        <textarea data-slot-key="${key}" placeholder="&lt;script&gt;...&lt;/script&gt;">${escapeHtml(slot.html)}</textarea>
      `;
      slotsEl.appendChild(card);
    });

    const affEl = document.getElementById("affiliate-container");
    affEl.innerHTML = "";
    Object.entries(monetization.affiliatePartners).forEach(([key, partner]) => {
      const row = document.createElement("div");
      row.style.marginBottom = "14px";
      row.innerHTML = `
        <div class="row" style="margin-bottom:6px;">
          <strong style="font-size:13.5px;">${partner.label}</strong>
          <label class="switch"><input type="checkbox" data-partner-key="${key}" data-field="enabled" ${partner.enabled ? "checked" : ""}><span class="slider"></span></label>
        </div>
        <input type="url" data-partner-key="${key}" data-field="urlTemplate" placeholder="https://partner.example.com/search?q={QUERY}&tag=your-affiliate-id" value="${escapeHtml(partner.urlTemplate)}">
      `;
      affEl.appendChild(row);
    });

    const mode = monetization.homeownerMaterialsMode || "products";
    document.getElementById("materials-mode-products").checked = mode === "products";
    document.getElementById("materials-mode-findapro").checked = mode === "findAPro";

    const leadGenPartners = monetization.leadGenPartners || {};
    const activeSelect = document.getElementById("leadgen-active-partner");
    activeSelect.innerHTML = Object.entries(leadGenPartners)
      .map(([key, p]) => `<option value="${key}">${escapeHtml(p.label)}</option>`)
      .join("");
    activeSelect.value = monetization.activeLeadGenPartner || "angi";

    const leadGenEl = document.getElementById("leadgen-partners-container");
    leadGenEl.innerHTML = "";
    Object.entries(leadGenPartners).forEach(([key, partner]) => {
      const row = document.createElement("div");
      row.style.marginBottom = "14px";
      row.innerHTML = `
        <div class="row" style="margin-bottom:6px;">
          <strong style="font-size:13.5px;">${escapeHtml(partner.label)}</strong>
          <label class="switch"><input type="checkbox" data-leadgen-key="${key}" data-leadgen-field="enabled" ${partner.enabled ? "checked" : ""}><span class="slider"></span></label>
        </div>
        <input type="url" data-leadgen-key="${key}" data-leadgen-field="urlTemplate" placeholder="https://partner.example.com/your-affiliate-link?zip={ZIP}" value="${escapeHtml(partner.urlTemplate)}">
      `;
      leadGenEl.appendChild(row);
    });

    document.getElementById("ga-id").value = monetization.googleAnalyticsId || "";
  }

  function collectMonetizationFromForm() {
    const next = structuredClone(monetization);
    next.adsEnabled = document.getElementById("ads-enabled").checked;
    document.querySelectorAll("[data-slot-key]").forEach((el) => {
      next.adSlots[el.dataset.slotKey].html = el.value;
    });
    document.querySelectorAll("[data-partner-key]").forEach((el) => {
      const key = el.dataset.partnerKey;
      const field = el.dataset.field;
      next.affiliatePartners[key][field] = field === "enabled" ? el.checked : el.value;
    });
    next.homeownerMaterialsMode = document.querySelector('input[name="materials-mode"]:checked')?.value || "products";
    document.querySelectorAll("[data-leadgen-key]").forEach((el) => {
      const key = el.dataset.leadgenKey;
      const field = el.dataset.leadgenField;
      next.leadGenPartners[key][field] = field === "enabled" ? el.checked : el.value;
    });
    next.activeLeadGenPartner = document.getElementById("leadgen-active-partner").value;
    next.googleAnalyticsId = document.getElementById("ga-id").value.trim();
    return next;
  }

  document.getElementById("save-monetization-btn").addEventListener("click", async () => {
    const status = document.getElementById("save-status");
    status.textContent = "Saving...";
    try {
      const next = collectMonetizationFromForm();
      monetization = await api("/api/admin-monetization", { method: "POST", body: JSON.stringify(next) });
      status.textContent = "Saved ✓ — live on the site now.";
      setTimeout(() => (status.textContent = ""), 3000);
    } catch (err) {
      status.textContent = "Error saving. " + err.message;
      status.style.color = "#C0392B";
    }
  });

  // ---------- Blog ----------
  function renderPostList() {
    const el = document.getElementById("post-list");
    if (!posts.length) {
      el.innerHTML = `<p style="color:var(--muted);font-size:13.5px;">No posts yet — click "New post" to write your first one.</p>`;
      return;
    }
    el.innerHTML = posts
      .map(
        (p) => `
      <div class="post-row">
        <div>
          <div class="post-title">${escapeHtml(p.title)}</div>
          <div class="post-meta">/blog/${escapeHtml(p.slug)} · <span class="badge ${p.published ? "live" : "draft"}">${p.published ? "Live" : "Draft"}</span></div>
        </div>
        <div style="display:flex;gap:12px;">
          <button class="link-btn" data-edit="${p.id}">Edit</button>
          <button class="link-btn danger" data-delete="${p.id}">Delete</button>
        </div>
      </div>`
      )
      .join("");

    el.querySelectorAll("[data-edit]").forEach((btn) =>
      btn.addEventListener("click", () => openEditor(posts.find((p) => p.id === btn.dataset.edit)))
    );
    el.querySelectorAll("[data-delete]").forEach((btn) =>
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this post? This can't be undone.")) return;
        await api(`/api/admin-blog?id=${encodeURIComponent(btn.dataset.delete)}`, { method: "DELETE" });
        posts = await api("/api/admin-blog");
        renderPostList();
      })
    );
  }

  let currentCoverImage = null;

  function setCoverPreview(url) {
    currentCoverImage = url || null;
    const preview = document.getElementById("post-cover-preview");
    const img = document.getElementById("post-cover-preview-img");
    const removeBtn = document.getElementById("remove-cover-photo-btn");
    if (currentCoverImage) {
      img.src = currentCoverImage;
      preview.style.display = "block";
      removeBtn.style.display = "inline";
    } else {
      preview.style.display = "none";
      removeBtn.style.display = "none";
    }
  }

  function openEditor(post) {
    editingPostId = post?.id || null;
    document.getElementById("editor-heading").textContent = post ? "Edit post" : "New post";
    document.getElementById("post-title").value = post?.title || "";
    document.getElementById("post-slug").value = post?.slug || "";
    document.getElementById("post-meta").value = post?.metaDescription || "";
    document.getElementById("post-content").value = post?.content || "";
    document.getElementById("post-published").checked = Boolean(post?.published);
    setCoverPreview(post?.featuredImage || null);
    document.getElementById("post-editor").hidden = false;
    document.getElementById("post-editor").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.getElementById("new-post-btn").addEventListener("click", () => openEditor(null));
  document.getElementById("cancel-post-btn").addEventListener("click", () => {
    document.getElementById("post-editor").hidden = true;
  });

  let slugManuallyEdited = false;
  document.getElementById("post-slug").addEventListener("input", () => (slugManuallyEdited = true));
  document.getElementById("post-title").addEventListener("input", (e) => {
    if (slugManuallyEdited || editingPostId) return;
    document.getElementById("post-slug").value = e.target.value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  });

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Plain-text paste (no HTML on the clipboard) — split on blank lines
  // into separate paragraphs, since a browser textarea otherwise loses
  // all paragraph breaks and the whole thing lands as one wall of text.
  function plainTextToParagraphs(text) {
    const blocks = String(text || "")
      .replace(/\r\n/g, "\n")
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean);
    if (!blocks.length) return "";
    return blocks.map((b) => `<p>${escapeHtml(b.replace(/\n/g, " "))}</p>`).join("\n");
  }

  // Rich paste from Google Docs/Word — the clipboard also carries a
  // formatted HTML version. Keep only the tags the blog actually
  // supports/styles (paragraphs, headers, bold/italic, links, lists) and
  // unwrap everything else (the divs/spans/inline styles Docs and Word
  // pile on), so real formatting carries over without the markup mess.
  const PASTE_TAG_MAP = { P: "p", H1: "h2", H2: "h2", H3: "h3", H4: "h3", UL: "ul", OL: "ol", LI: "li", STRONG: "strong", B: "strong", EM: "em", I: "em", A: "a", BR: "br" };

  function sanitizePastedHtml(html) {
    const container = document.createElement("div");
    container.innerHTML = html;

    function clean(node) {
      if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
      if (node.nodeType !== Node.ELEMENT_NODE) return null;

      const tag = PASTE_TAG_MAP[node.tagName];
      const children = Array.from(node.childNodes).map(clean).filter(Boolean);

      if (tag) {
        const el = document.createElement(tag);
        if (tag === "a") {
          const href = node.getAttribute("href");
          if (href) el.setAttribute("href", href);
        }
        children.forEach((c) => el.appendChild(c));
        return el;
      }
      // Not a supported tag (div, span, font, etc.) — unwrap and keep its
      // contents rather than dropping the text entirely.
      const frag = document.createDocumentFragment();
      children.forEach((c) => frag.appendChild(c));
      return frag;
    }

    const out = document.createElement("div");
    Array.from(container.childNodes).map(clean).filter(Boolean).forEach((c) => out.appendChild(c));
    return out.innerHTML.trim();
  }

  document.getElementById("post-content")?.addEventListener("paste", (e) => {
    const html = e.clipboardData?.getData("text/html");
    const plain = e.clipboardData?.getData("text/plain") || "";
    if (!html && !plain) return; // let the browser handle anything unusual (e.g. an image paste) normally
    e.preventDefault();
    const insertHtml = html && html.trim() ? sanitizePastedHtml(html) : plainTextToParagraphs(plain);
    if (insertHtml) insertAtCursor(e.target, insertHtml + "\n");
  });

  document.getElementById("save-post-btn").addEventListener("click", async () => {
    const body = {
      id: editingPostId || undefined,
      title: document.getElementById("post-title").value.trim(),
      slug: document.getElementById("post-slug").value.trim(),
      metaDescription: document.getElementById("post-meta").value.trim(),
      content: document.getElementById("post-content").value,
      featuredImage: currentCoverImage,
      published: document.getElementById("post-published").checked,
    };
    if (!body.title || !body.content) {
      alert("A title and content are required.");
      return;
    }
    try {
      await api("/api/admin-blog", { method: "POST", body: JSON.stringify(body) });
      posts = await api("/api/admin-blog");
      renderPostList();
      document.getElementById("post-editor").hidden = true;
      slugManuallyEdited = false;
    } catch (err) {
      alert("Error saving post: " + err.message);
    }
  });

  // ---------- Blog cover photo ----------
  document.getElementById("add-cover-photo-btn")?.addEventListener("click", () => {
    document.getElementById("post-cover-input").click();
  });

  document.getElementById("remove-cover-photo-btn")?.addEventListener("click", () => {
    setCoverPreview(null);
  });

  document.getElementById("post-cover-input")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;

    const status = document.getElementById("post-cover-status");
    status.style.color = "";
    status.textContent = "Uploading…";

    try {
      const dataUrl = await compressBlogImage(file);
      const result = await api("/api/admin-blog-image", { method: "POST", body: JSON.stringify({ image: dataUrl }) });
      setCoverPreview(result.url);
      status.textContent = "Cover photo set ✓";
      setTimeout(() => (status.textContent = ""), 2500);
    } catch (err) {
      status.textContent = "Error uploading photo: " + err.message;
      status.style.color = "#C0392B";
    }
  });

  // ---------- Blog photo upload (inline, in content) ----------
  document.getElementById("add-photo-to-post-btn")?.addEventListener("click", () => {
    document.getElementById("post-image-input").click();
  });

  document.getElementById("post-image-input")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file || !file.type.startsWith("image/")) return;

    const status = document.getElementById("post-image-status");
    status.style.color = "";
    status.textContent = "Uploading…";

    try {
      const dataUrl = await compressBlogImage(file);
      const result = await api("/api/admin-blog-image", { method: "POST", body: JSON.stringify({ image: dataUrl }) });
      const imgTag = `\n<img src="${result.url}" alt="" style="max-width:100%;border-radius:10px;margin:16px 0;">\n`;
      insertAtCursor(document.getElementById("post-content"), imgTag);
      status.textContent = "Photo added ✓";
      setTimeout(() => (status.textContent = ""), 2500);
    } catch (err) {
      status.textContent = "Error uploading photo: " + err.message;
      status.style.color = "#C0392B";
    }
  });

  function compressBlogImage(file) {
    const MAX_DIMENSION = 1400;
    const JPEG_QUALITY = 0.82;
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

  function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    textarea.value = textarea.value.slice(0, start) + text + textarea.value.slice(end);
    const newPos = start + text.length;
    textarea.focus();
    textarea.setSelectionRange(newPos, newPos);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---------- Promo codes ----------
  function renderStats() {
    const container = document.getElementById("stats-content");
    if (!container || !stats) return;

    const dollars = (cents) => `$${(cents / 100).toFixed(2)}`;

    const cardsHtml = `
      <div class="stats-cards">
        <div class="stats-card">
          <div class="stats-card-value">${stats.totalEstimates}</div>
          <div class="stats-card-label">Total Estimates</div>
        </div>
        <div class="stats-card">
          <div class="stats-card-value">${stats.totalQuotesPaid}</div>
          <div class="stats-card-label">Quotes Paid</div>
        </div>
        <div class="stats-card">
          <div class="stats-card-value">${stats.totalQuotesComped}</div>
          <div class="stats-card-label">Quotes Comp'd</div>
        </div>
        <div class="stats-card">
          <div class="stats-card-value">${dollars(stats.totalRevenueCents)}</div>
          <div class="stats-card-label">Total Revenue</div>
        </div>
        <div class="stats-card">
          <div class="stats-card-value">${stats.conversionRatePercent}%</div>
          <div class="stats-card-label">Estimate &rarr; Paid Quote</div>
        </div>
        <div class="stats-card">
          <div class="stats-card-value">${stats.totalPwaInstalls}</div>
          <div class="stats-card-label">App Installs</div>
        </div>
        <div class="stats-card">
          <div class="stats-card-value">${stats.totalPwaLaunches}</div>
          <div class="stats-card-label">App Opens (Home Screen)</div>
        </div>
      </div>
    `;

    const pwaNoteHtml = `
      <p class="sub" style="margin:8px 0 0;">"App Installs" only counts Android/Chrome — iOS Safari doesn't report installs at all. "App Opens" counts anyone launching from a home screen icon on either platform, so it's the number to watch for iPhone usage.</p>
    `;

    const topJobsHtml = stats.topJobTypes && stats.topJobTypes.length
      ? `
        <h4 style="margin:20px 0 8px;font-size:14px;color:var(--navy);">Most Estimated Job Types</h4>
        <div class="stats-top-jobs">
          ${stats.topJobTypes.map((j) => `
            <div class="stats-top-job-row">
              <span>${escapeHtml(j.jobType)}</span>
              <span class="sub">${j.count}</span>
            </div>
          `).join("")}
        </div>
      `
      : "";

    const dailyRowsHtml = stats.daily && stats.daily.length
      ? stats.daily.map((d) => `
          <tr>
            <td>${escapeHtml(d.date)}</td>
            <td>${d.estimates}</td>
            <td>${d.quotesPaid}</td>
            <td>${d.quotesComped}</td>
            <td>${dollars(d.revenueCents)}</td>
            <td>${d.pwaInstalls ?? 0}</td>
            <td>${d.pwaLaunches ?? 0}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="7" class="sub">No activity yet.</td></tr>`;

    const dailyTableHtml = `
      <h4 style="margin:20px 0 8px;font-size:14px;color:var(--navy);">Last 30 Days</h4>
      <div style="overflow-x:auto;">
        <table class="stats-daily-table">
          <thead>
            <tr><th>Date</th><th>Estimates</th><th>Paid</th><th>Comp'd</th><th>Revenue</th><th>Installs</th><th>App Opens</th></tr>
          </thead>
          <tbody>${dailyRowsHtml}</tbody>
        </table>
      </div>
    `;

    container.innerHTML = cardsHtml + pwaNoteHtml + topJobsHtml + dailyTableHtml;
  }

  function renderPromoCodes() {
    const container = document.getElementById("promo-list");
    if (!container) return;
    if (!promoCodes.length) {
      container.innerHTML = `<p class="sub">No promo codes yet.</p>`;
      return;
    }
    container.innerHTML = promoCodes
      .map((c) => {
        const usage = c.maxUses ? `${c.usedCount}/${c.maxUses} used` : `${c.usedCount} used (unlimited)`;
        return `
          <div class="row" style="padding:10px 0;border-bottom:1px solid var(--border);">
            <div>
              <strong>${escapeHtml(c.code)}</strong>
              <span class="sub" style="margin-left:8px;">${usage}</span>
              ${c.note ? `<div class="sub">${escapeHtml(c.note)}</div>` : ""}
            </div>
            <label class="switch"><input type="checkbox" class="promo-toggle" data-code="${escapeHtml(c.code)}" ${c.active ? "checked" : ""}><span class="slider"></span></label>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".promo-toggle").forEach((el) => {
      el.addEventListener("change", async () => {
        try {
          await api("/api/admin-promo", {
            method: "POST",
            body: JSON.stringify({ action: "toggle", code: el.dataset.code, active: el.checked }),
          });
          promoCodes = await api("/api/admin-promo");
          renderPromoCodes();
        } catch (err) {
          alert("Error updating promo code: " + err.message);
          el.checked = !el.checked;
        }
      });
    });
  }

  document.getElementById("create-promo-btn")?.addEventListener("click", async () => {
    const code = document.getElementById("promo-code-input").value.trim();
    const note = document.getElementById("promo-note-input").value.trim();
    const maxUses = document.getElementById("promo-maxuses-input").value.trim();
    if (!code) {
      alert("Enter a code first.");
      return;
    }
    try {
      await api("/api/admin-promo", { method: "POST", body: JSON.stringify({ code, note, maxUses }) });
      promoCodes = await api("/api/admin-promo");
      renderPromoCodes();
      document.getElementById("promo-code-input").value = "";
      document.getElementById("promo-note-input").value = "";
      document.getElementById("promo-maxuses-input").value = "";
    } catch (err) {
      alert("Error creating promo code: " + err.message);
    }
  });

  // ---------- Blog automation ----------
  function renderBlogAutomation() {
    if (!blogAutomation) return;
    document.getElementById("blog-auto-enabled").checked = Boolean(blogAutomation.enabled);
    const intervalSelect = document.getElementById("blog-auto-interval");
    if (intervalSelect) intervalSelect.value = String(blogAutomation.intervalDays || 14);
    const status = document.getElementById("blog-auto-status");
    const intervalLabel = intervalSelect ? intervalSelect.options[intervalSelect.selectedIndex]?.text.toLowerCase() : `every ${blogAutomation.intervalDays || 14} days`;
    status.textContent = blogAutomation.lastRunAt
      ? `Posting ${intervalLabel}. Last post generated: ${new Date(blogAutomation.lastRunAt).toLocaleDateString()}`
      : `Posting ${intervalLabel}. No posts generated yet.`;

    const listEl = document.getElementById("blog-topic-list");
    const topics = blogAutomation.topics || [];
    if (!topics.length) {
      listEl.innerHTML = `<p class="sub">No topics yet — add one below.</p>`;
    } else {
      listEl.innerHTML = topics
        .map(
          (t, i) => `
        <div class="row" style="padding:8px 0;border-bottom:1px solid var(--border);">
          <span style="font-size:13.5px;${t.used ? "color:var(--muted);" : ""}">${escapeHtml(t.topic)}${t.used ? " <em>(used)</em>" : ""}</span>
          <button type="button" class="icon-btn remove-topic-btn" data-index="${i}" title="Remove">✕</button>
        </div>
      `
        )
        .join("");
      listEl.querySelectorAll(".remove-topic-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          try {
            await api("/api/admin-blog-automation", { method: "POST", body: JSON.stringify({ action: "removeTopic", index: Number(btn.dataset.index) }) });
            blogAutomation = await api("/api/admin-blog-automation");
            renderBlogAutomation();
          } catch (err) {
            alert("Error removing topic: " + err.message);
          }
        });
      });
    }
  }

  document.getElementById("blog-auto-enabled")?.addEventListener("change", async (e) => {
    try {
      await api("/api/admin-blog-automation", { method: "POST", body: JSON.stringify({ action: "toggle", enabled: e.target.checked }) });
      blogAutomation = await api("/api/admin-blog-automation");
      renderBlogAutomation();
    } catch (err) {
      alert("Error updating automation: " + err.message);
      e.target.checked = !e.target.checked;
    }
  });

  document.getElementById("blog-auto-interval")?.addEventListener("change", async (e) => {
    const previous = blogAutomation?.intervalDays || 14;
    try {
      await api("/api/admin-blog-automation", { method: "POST", body: JSON.stringify({ action: "setInterval", intervalDays: Number(e.target.value) }) });
      blogAutomation = await api("/api/admin-blog-automation");
      renderBlogAutomation();
    } catch (err) {
      alert("Error updating frequency: " + err.message);
      e.target.value = String(previous);
    }
  });

  document.getElementById("blog-add-topic-btn")?.addEventListener("click", async () => {
    const input = document.getElementById("blog-new-topic");
    const topic = input.value.trim();
    if (!topic) return;
    try {
      await api("/api/admin-blog-automation", { method: "POST", body: JSON.stringify({ action: "addTopic", topic }) });
      blogAutomation = await api("/api/admin-blog-automation");
      renderBlogAutomation();
      input.value = "";
    } catch (err) {
      alert("Error adding topic: " + err.message);
    }
  });

  document.getElementById("blog-generate-now-btn")?.addEventListener("click", async (e) => {
    const status = document.getElementById("blog-generate-status");
    e.target.disabled = true;
    e.target.textContent = "Starting…";
    try {
      const result = await api("/api/admin-blog-automation", { method: "POST", body: JSON.stringify({ action: "generateNow" }) });
      status.textContent = result.message || "Generating — check back in a couple minutes.";
      blogAutomation = await api("/api/admin-blog-automation");
      renderBlogAutomation();
    } catch (err) {
      status.textContent = "";
      alert("Error starting generation: " + err.message);
    } finally {
      e.target.disabled = false;
      e.target.textContent = "Generate a post now";
    }
  });

  document.getElementById("blog-check-drafts-btn")?.addEventListener("click", async (e) => {
    const status = document.getElementById("blog-generate-status");
    e.target.disabled = true;
    try {
      posts = await api("/api/admin-blog");
      renderPostList();
      status.textContent = "Post list refreshed — look for a new draft below.";
    } catch (err) {
      status.textContent = "Couldn't refresh: " + err.message;
    } finally {
      e.target.disabled = false;
    }
  });

  document.getElementById("blog-refill-seo-btn")?.addEventListener("click", async (e) => {
    const status = document.getElementById("blog-refill-status");
    e.target.disabled = true;
    status.textContent = "Refilling…";
    try {
      const result = await api("/api/admin-blog-automation", { method: "POST", body: JSON.stringify({ action: "refillSeoTopics" }) });
      blogAutomation = await api("/api/admin-blog-automation");
      renderBlogAutomation();
      status.textContent = result.added > 0 ? `Added ${result.added} new topic(s).` : "Already up to date — nothing new to add.";
      setTimeout(() => (status.textContent = ""), 4000);
    } catch (err) {
      status.textContent = "Error: " + err.message;
    } finally {
      e.target.disabled = false;
    }
  });
})();
