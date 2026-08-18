(() => {
  const SESSION_KEY = "jpn_admin_password";

  const gate = document.getElementById("gate");
  const dashboard = document.getElementById("dashboard");
  const gateError = document.getElementById("gate-error");

  let monetization = null;
  let posts = [];
  let editingPostId = null;

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
      gate.hidden = true;
      dashboard.hidden = false;
      renderMonetization();
      renderPostList();
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
})();
