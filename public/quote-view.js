(function () {
  "use strict";

  const els = {
    loading: document.getElementById("qv-loading"),
    app: document.getElementById("qv-app"),
    missing: document.getElementById("qv-missing"),
    download: document.getElementById("qv-download"),
    print: document.getElementById("qv-print"),
    share: document.getElementById("qv-share"),
    emailToggle: document.getElementById("qv-email-toggle"),
    emailPanel: document.getElementById("qv-email-panel"),
    emailInput: document.getElementById("qv-email-input"),
    emailSend: document.getElementById("qv-email-send"),
    emailStatus: document.getElementById("qv-email-status"),
    frame: document.getElementById("qv-frame"),
  };

  const token = new URLSearchParams(window.location.search).get("token");
  if (!token) {
    showMissing();
    return;
  }

  const pdfUrl = `/api/quote-pdf?token=${encodeURIComponent(token)}`;

  fetch(`/api/quote?token=${encodeURIComponent(token)}`)
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) throw new Error(data.error || "Quote not found.");
      init(data);
    })
    .catch(() => showMissing());

  function showMissing() {
    els.loading.style.display = "none";
    els.missing.style.display = "block";
  }

  function init(data) {
    els.loading.style.display = "none";
    els.app.style.display = "block";

    els.download.href = pdfUrl;
    els.frame.src = pdfUrl;

    els.print.addEventListener("click", () => {
      const win = window.open(pdfUrl, "_blank");
      if (win) win.addEventListener("load", () => win.print());
    });

    if (navigator.share) {
      els.share.style.display = "block";
      els.share.addEventListener("click", async () => {
        try {
          await navigator.share({
            title: "Quote from JobPriceNow",
            text: `Here's your quote: ${data.quote?.content?.quoteTitle || ""}`,
            url: window.location.href,
          });
        } catch {
          /* user canceled share — no action needed */
        }
      });
    }

    els.emailToggle.addEventListener("click", () => {
      els.emailPanel.style.display = els.emailPanel.style.display === "none" ? "block" : "none";
    });

    if (data.quote?.customer?.email) {
      els.emailInput.value = data.quote.customer.email;
    }

    els.emailSend.addEventListener("click", async () => {
      const toEmail = els.emailInput.value.trim();
      if (!toEmail) {
        els.emailStatus.textContent = "Enter an email address first.";
        els.emailStatus.style.color = "#C0392B";
        return;
      }
      els.emailSend.disabled = true;
      els.emailStatus.textContent = "Sending…";
      els.emailStatus.style.color = "var(--muted)";
      try {
        const res = await fetch("/api/send-quote-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, toEmail }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Couldn't send the email.");
        els.emailStatus.textContent = "Sent! Your quote is still available above if you need it again.";
        els.emailStatus.style.color = "var(--green)";
      } catch (err) {
        els.emailStatus.textContent = err.message || "We couldn't send the email. Your quote is still available above.";
        els.emailStatus.style.color = "#C0392B";
      } finally {
        els.emailSend.disabled = false;
      }
    });
  }
})();
