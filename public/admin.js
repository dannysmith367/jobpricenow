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
      gate.hidden = true;
      dashboard.hidden = false;
      renderMonetization();
      renderPostList();
      renderPromoCodes();
      renderBlogAutomation();
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

    const mode = monetization.materialsSectionMode || "products";
    document.getElementById("materials-mode-products").checked = mode === "products";
    document.getElementById("materials-mode-findapro").checked = mode === "findAPro";
    document.getElementById("angi-enabled").checked = Boolean(monetization.angiPartner?.enabled);
    document.getElementById("angi-url").value = monetization.angiPartner?.urlTemplate || "";
    document.getElementById("ga-id").value = monetization.googleAnalyticsId || "";

    const socialEl = document.getElementById("social-links-container");
    socialEl.innerHTML = "";
    Object.entries(monetization.socialLinks || {}).forEach(([key, info]) => {
      const row = document.createElement("div");
      row.style.marginBottom = "12px";
      row.innerHTML = `
        <label class="field-label">${info.label}</label>
        <input type="url" data-social-key="${key}" placeholder="https://..." value="${escapeHtml(info.url || "")}">
      `;
      socialEl.appendChild(row);
    });
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
    next.materialsSectionMode = document.querySelector('input[name="materials-mode"]:checked')?.value || "products";
    next.angiPartner = {
      ...next.angiPartner,
      enabled: document.getElementById("angi-enabled").checked,
      urlTemplate: document.getElementById("angi-url").value,
    };
    next.googleAnalyticsId = document.getElementById("ga-id").value.trim();
    document.querySelectorAll("[data-social-key]").forEach((el) => {
      const key = el.dataset.socialKey;
      if (next.socialLinks?.[key]) next.socialLinks[key].url = el.value.trim();
    });
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

  function openEditor(post) {
    editingPostId = post?.id || null;
    document.getElementById("editor-heading").textContent = post ? "Edit post" : "New post";
    document.getElementById("post-title").value = post?.title || "";
    document.getElementById("post-slug").value = post?.slug || "";
    document.getElementById("post-meta").value = post?.metaDescription || "";
    document.getElementById("post-content").value = post?.content || "";
    document.getElementById("post-published").checked = Boolean(post?.published);
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

  document.getElementById("save-post-btn").addEventListener("click", async () => {
    const body = {
      id: editingPostId || undefined,
      title: document.getElementById("post-title").value.trim(),
      slug: document.getElementById("post-slug").value.trim(),
      metaDescription: document.getElementById("post-meta").value.trim(),
      content: document.getElementById("post-content").value,
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

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---------- Promo codes ----------
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
    const status = document.getElementById("blog-auto-status");
    status.textContent = blogAutomation.lastRunAt
      ? `Last post generated: ${new Date(blogAutomation.lastRunAt).toLocaleDateString()}`
      : "No posts generated yet.";

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
    e.target.disabled = true;
    e.target.textContent = "Generating…";
    try {
      const post = await api("/api/admin-blog-automation", { method: "POST", body: JSON.stringify({ action: "generateNow" }) });
      posts = await api("/api/admin-blog");
      blogAutomation = await api("/api/admin-blog-automation");
      renderPostList();
      renderBlogAutomation();
      alert(`Draft created: "${post.title}" — find it in Posts below to review and publish.`);
    } catch (err) {
      alert("Error generating post: " + err.message);
    } finally {
      e.target.disabled = false;
      e.target.textContent = "Generate a post now";
    }
  });
})();
