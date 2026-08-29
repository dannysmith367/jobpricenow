// ============================================================
// JobPriceNow — SEO Pricing Guide Rendering
//
// Renders /pricing (index) and /pricing/:slug pages. Reuses the
// same header/footer/branding as the main app (styles.css) so
// these feel like part of the product, not a separate site — per
// the pricing-page-system brief. Price ranges shown on each page
// are computed from the exact same numbers the live estimator
// uses (job-data.mjs + pricing-config.mjs), not hand-typed, so
// they can't drift out of sync with reality.
// ============================================================

import { referenceJobs } from "./job-data.mjs";
import { pricingConfig } from "./pricing-config.mjs";
import { pricingPages } from "./pricing-pages-data.mjs";

const SITE_NAME = "JobPriceNow";
const SITE_URL = process.env.SITE_URL || "https://jobpricenow.com";

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/**
 * Computes an illustrative nationwide price range for one or more
 * reference jobs, using the exact same formula the live estimator
 * applies: labor hours × hourly rate, plus marked-up materials,
 * adjusted for difficulty and regional cost-of-living bounds, then
 * the competitive/high-margin price tiers, floored at the site's
 * minimum job price. Multiple jobIds widen the range to cover the
 * full spread of variants a page discusses.
 */
function computePriceRange(jobIds) {
  const { nationalHourlyRate, materialMarkup, minimumJobPrice, difficulty, priceTiers, regional } = pricingConfig;
  let overallLow = Infinity;
  let overallHigh = -Infinity;

  for (const jobId of jobIds) {
    const job = referenceJobs.find((j) => j.id === jobId);
    if (!job) continue;

    const laborLowCost = job.laborLow * nationalHourlyRate;
    const laborHighCost = job.laborHigh * nationalHourlyRate;
    const materialLowCost = job.materialLow * (1 + materialMarkup);
    const materialHighCost = job.materialHigh * (1 + materialMarkup);

    const diffMult = 1 + (difficulty[job.defaultDifficulty] ?? 0);

    const subtotalLow = (laborLowCost + materialLowCost) * diffMult;
    const subtotalHigh = (laborHighCost + materialHighCost) * diffMult;

    const low = Math.max(subtotalLow * regional.low * priceTiers.competitive, minimumJobPrice);
    const high = Math.max(subtotalHigh * regional.high * priceTiers.highMargin, minimumJobPrice);

    overallLow = Math.min(overallLow, low);
    overallHigh = Math.max(overallHigh, high);
  }

  if (!Number.isFinite(overallLow)) return null;
  return { low: overallLow, high: overallHigh };
}

function pageShell({ title, description, canonical, bodyHtml, jsonLdList }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/styles.css">
${(jsonLdList || []).map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`).join("\n")}
</head>
<body>
<header class="site-header">
  <div class="wrap" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 16px;padding:12px 0;">
    <a href="/" class="brand" aria-label="JobPriceNow home">
      <span class="brand-word">JobPrice<span class="accent">Now</span></span>
    </a>
    <nav style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
      <a href="/pricing" style="font-size:13.5px;color:var(--muted);text-decoration:none;white-space:nowrap;">Pricing Guides</a>
      <a href="/blog" style="font-size:13.5px;color:var(--muted);text-decoration:none;white-space:nowrap;">Blog</a>
      <a href="/" style="font-size:13.5px;color:var(--blue);text-decoration:none;font-weight:600;white-space:nowrap;">Get a price →</a>
      <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </nav>
  </div>
</header>

<div class="site-nav-backdrop" id="site-nav-backdrop"></div>
<nav class="site-nav" id="site-nav" aria-label="Site menu">
  <div class="site-nav-header">
    <span class="brand-word" style="font-size:16px;">JobPrice<span class="accent">Now</span></span>
    <button type="button" class="site-nav-close" id="site-nav-close" aria-label="Close menu">&times;</button>
  </div>
  <a href="/">Home</a>
  <a href="/pricing">Pricing Guides</a>
  <a href="/blog">Blog</a>
  <div class="site-nav-section-label">Trades</div>
  <a href="/painters">Painters</a>
  <a href="/plumbers">Plumbers</a>
  <a href="/electricians">Electricians</a>
  <a href="/flooring">Flooring Installers</a>
  <a href="/landscaping">Landscapers &amp; Fencing</a>
  <hr class="site-nav-divider">
  <a href="/about.html">About</a>
  <a href="/contact.html">Contact</a>
  <a href="/privacy.html">Privacy</a>
  <a href="/terms.html">Terms</a>
</nav>
<script>
(function(){
  var btn = document.getElementById('nav-toggle');
  var panel = document.getElementById('site-nav');
  var backdrop = document.getElementById('site-nav-backdrop');
  var closeBtn = document.getElementById('site-nav-close');
  function openNav(){ panel.classList.add('open'); backdrop.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
  function closeNav(){ panel.classList.remove('open'); backdrop.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }
  if (btn) btn.addEventListener('click', openNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (backdrop) backdrop.addEventListener('click', closeNav);
})();
</script>
<main class="wrap" style="padding-top:28px;padding-bottom:60px;max-width:760px;">
${bodyHtml}
</main>
<footer class="site-footer-simple">
  <div class="wrap site-footer-simple-inner">
    <span>&copy; 2026 JobPriceNow</span>
    <div>
      <a href="/about.html">About</a>
      <a href="/contact.html">Contact</a>
      <a href="/privacy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
    </div>
  </div>
</footer>
</body>
</html>`;
}

function breadcrumbHtml(items) {
  return `<nav class="pg-breadcrumbs" aria-label="Breadcrumb">${items
    .map((item, i) =>
      i === items.length - 1
        ? `<span aria-current="page">${escapeHtml(item.label)}</span>`
        : `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a><span class="pg-crumb-sep">/</span>`
    )
    .join("")}</nav>`;
}

function estimatorCta(label = "Get Your Free Estimate") {
  return `
    <div class="pg-cta">
      <p class="pg-cta-head">Want a price specific to your job?</p>
      <p class="pg-cta-sub">Describe the job, add your ZIP code, and get a real estimate in seconds — free, no signup.</p>
      <a href="/" class="btn-primary btn-full" style="display:inline-flex;max-width:340px;">${escapeHtml(label)}</a>
    </div>`;
}

export function renderPricingIndex() {
  const grouped = {};
  pricingPages.forEach((p) => {
    grouped[p.category] = grouped[p.category] || [];
    grouped[p.category].push(p);
  });

  const sectionsHtml = Object.entries(grouped)
    .map(
      ([category, pages]) => `
      <section style="margin-bottom:32px;">
        <h2 style="font-size:16px;color:var(--navy);margin-bottom:12px;">${escapeHtml(category)}</h2>
        <div style="display:grid;gap:10px;">
          ${pages
            .map(
              (p) => `
            <a href="/pricing/${escapeHtml(p.slug)}" class="pg-index-card">
              <span>${escapeHtml(p.heading)}</span>
              <span class="pg-index-arrow">→</span>
            </a>`
            )
            .join("")}
        </div>
      </section>`
    )
    .join("");

  const body = `
    ${breadcrumbHtml([{ label: "Home", href: "/" }, { label: "Pricing Guides" }])}
    <h1 style="font-size:28px;color:var(--navy);margin:14px 0 6px;">Handyman Pricing Guides</h1>
    <p style="color:var(--muted);margin-bottom:28px;max-width:640px;">Straightforward pricing guides for common handyman jobs — what drives the cost up or down, and what to expect. For a number specific to your exact job and ZIP code, use the free estimator below.</p>
    ${estimatorCta()}
    <div style="margin-top:32px;">${sectionsHtml}</div>
  `;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Handyman Pricing Guides",
    description: "Pricing guides for common handyman jobs, from JobPriceNow.",
    url: `${SITE_URL}/pricing`,
  };

  return pageShell({
    title: `Handyman Pricing Guides | ${SITE_NAME}`,
    description: "Pricing guides for common handyman jobs — drywall, painting, plumbing, electrical, and more. See what drives cost, then get a free estimate for your exact job.",
    canonical: `${SITE_URL}/pricing`,
    bodyHtml: body,
    jsonLdList: [jsonLd],
  });
}

export function renderPricingPage(page) {
  const range = computePriceRange(page.jobIds);
  const canonical = `${SITE_URL}/pricing/${page.slug}`;

  const priceBoxHtml = range
    ? `
      <div class="pg-price-box">
        <div class="pg-price-box-label">Typical price range</div>
        <div class="pg-price-box-value">${money(range.low)} – ${money(range.high)}</div>
        <p class="pg-price-box-note">Based on typical labor and material ranges for this job nationwide. Your actual price depends on your location, the specific scope, and materials chosen — get an exact estimate below.</p>
      </div>`
    : "";

  const relatedPages = page.relatedSlugs.map((slug) => pricingPages.find((p) => p.slug === slug)).filter(Boolean);

  const faqHtml = page.faqs
    .map(
      (f, i) => `
      <details class="pg-faq-item"${i === 0 ? " open" : ""}>
        <summary>${escapeHtml(f.q)}</summary>
        <p>${escapeHtml(f.a)}</p>
      </details>`
    )
    .join("");

  const body = `
    ${breadcrumbHtml([{ label: "Home", href: "/" }, { label: "Pricing Guides", href: "/pricing" }, { label: page.heading }])}
    <h1 style="font-size:28px;color:var(--navy);margin:14px 0 10px;">${escapeHtml(page.heading)}</h1>
    <p style="font-size:16px;color:var(--text);line-height:1.6;margin-bottom:20px;">${escapeHtml(page.intro)}</p>

    ${priceBoxHtml}

    <section class="pg-section">
      <h2>Labor</h2>
      <p>${escapeHtml(page.laborNote)}</p>
    </section>

    <section class="pg-section">
      <h2>Materials</h2>
      <p>${escapeHtml(page.materialsNote)}</p>
    </section>

    <section class="pg-section">
      <h2>What Affects the Price</h2>
      <ul class="pg-list">${page.factors.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>
    </section>

    <section class="pg-section">
      <h2>Difficulty</h2>
      <p>${escapeHtml(page.difficultyNote)}</p>
    </section>

    <section class="pg-section">
      <h2>Things to Consider</h2>
      <ul class="pg-list">${page.typicalConsiderations.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>
    </section>

    <p style="font-size:13.5px;color:var(--muted);background:var(--bg,#F7F9FC);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px 14px;margin:20px 0;">
      Actual pricing varies by location, job complexity, materials chosen, and the individual contractor. The range above is a general guide, not a quote — for a number based on your specific job and ZIP code, use the free estimator below.
    </p>

    ${estimatorCta("Get Your Free Estimate")}

    <section class="pg-section" style="margin-top:32px;">
      <h2>Frequently Asked Questions</h2>
      <div class="pg-faq">${faqHtml}</div>
    </section>

    ${
      relatedPages.length
        ? `<section class="pg-section">
            <h2>Related Pricing Guides</h2>
            <div style="display:grid;gap:10px;">
              ${relatedPages.map((p) => `<a href="/pricing/${escapeHtml(p.slug)}" class="pg-index-card"><span>${escapeHtml(p.heading)}</span><span class="pg-index-arrow">→</span></a>`).join("")}
            </div>
          </section>`
        : ""
    }
  `;

  const jsonLdList = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.title,
      description: page.metaDescription,
      url: canonical,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Pricing Guides", item: `${SITE_URL}/pricing` },
        { "@type": "ListItem", position: 3, name: page.heading, item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return pageShell({
    title: page.title,
    description: page.metaDescription,
    canonical,
    bodyHtml: body,
    jsonLdList,
  });
}

export function renderPricingNotFound() {
  return pageShell({
    title: `Not found | ${SITE_NAME}`,
    description: "This pricing guide could not be found.",
    canonical: `${SITE_URL}/pricing`,
    bodyHtml: `<h1 style="font-size:24px;color:var(--navy);">Guide not found</h1><p><a href="/pricing">Back to Pricing Guides</a></p>`,
  });
}
