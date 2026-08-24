// ============================================================
// JobPriceNow — Blog HTML Rendering
// Server-rendered (not client-JS-rendered) so search engines get
// real HTML with real meta tags on first load — that's the whole
// point of the blog existing. Shared by the Netlify function and
// the local Express dev server so they can never drift apart.
//
// Styled as its own navy/orange editorial layout, distinct from
// the calculator app's blue UI — matches the brand's real logo
// and tagline rather than the app's in-tool color scheme.
// ============================================================

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function excerpt(html, len = 160) {
  const text = String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > len ? text.slice(0, len - 1).trimEnd() + "…" : text;
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const SITE_NAME = "JobPriceNow";
const SITE_URL = process.env.SITE_URL || "https://jobpricenow.com";
const AUTHOR_NAME = "Dan Smith";

const BLOG_STYLES = `
:root {
  --b-navy: #0B2545;
  --b-navy-soft: #16335E;
  --b-orange: #F2994A;
  --b-ink: #16233D;
  --b-muted: #64748B;
  --b-border: #E2E8F0;
  --b-card: #F5F7FA;
  --b-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; color: var(--b-ink); font-family: var(--b-font); -webkit-font-smoothing: antialiased; }
a { color: inherit; }
.b-wrap { max-width: 980px; margin: 0 auto; padding: 0 24px; }

/* Header */
.b-header { background: var(--b-navy); }
.b-header-inner { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; flex-wrap: wrap; gap: 10px; }
.b-logo { text-decoration: none; display: block; }
.b-logo-word { font-size: 22px; font-weight: 800; letter-spacing: -0.01em; color: #fff; }
.b-logo-word .b-accent { color: var(--b-orange); }
.b-logo-tagline { display: block; font-size: 11px; letter-spacing: 0.04em; color: rgba(255,255,255,0.65); margin-top: 2px; }
.b-nav { display: flex; align-items: center; gap: 20px; }
.b-nav a { text-decoration: none; font-size: 13.5px; font-weight: 700; }
.b-nav .b-nav-blog { color: var(--b-orange); text-transform: uppercase; letter-spacing: 0.04em; }
.b-nav .b-nav-cta { color: #fff; }

/* Hero band */
.b-hero { background: var(--b-navy); border-radius: 14px; padding: 40px 36px; margin: 28px 0 36px; }
.b-hero-line { font-size: 26px; font-weight: 800; line-height: 1.25; color: #fff; margin: 0; }
.b-hero-line .b-accent { color: var(--b-orange); }
.b-hero-sub { margin: 12px 0 0; font-size: 14.5px; color: rgba(255,255,255,0.75); }

/* Hero band — photo variant (when a post has a cover photo) */
.b-hero-photo { position: relative; border-radius: 14px; margin: 28px 0 36px; overflow: hidden; background: var(--b-navy); }
.b-hero-photo img { display: block; width: 100%; height: 340px; object-fit: cover; }
.b-hero-photo .b-hero-overlay { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(11,37,69,0.88) 0%, rgba(11,37,69,0.35) 55%, rgba(11,37,69,0.05) 100%); }
.b-hero-photo .b-hero-text { position: absolute; left: 0; right: 0; bottom: 0; padding: 28px 32px; }
.b-hero-photo .b-hero-line { font-size: 22px; }
@media (max-width: 600px) { .b-hero-photo img { height: 220px; } }

/* Article */
.b-eyebrow { display: inline-block; font-size: 11.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--b-orange); margin-bottom: 10px; }
.b-title { font-size: 34px; line-height: 1.18; font-weight: 800; color: var(--b-navy); margin: 0 0 12px; letter-spacing: -0.01em; }
.b-byline { font-size: 13.5px; color: var(--b-muted); margin: 0 0 8px; }
.b-byline b { color: var(--b-ink); font-weight: 600; }
.b-back { display: inline-block; font-size: 13px; color: var(--b-muted); text-decoration: none; margin-bottom: 18px; }

.b-layout { display: grid; grid-template-columns: 1fr 300px; gap: 44px; align-items: start; }
@media (max-width: 760px) { .b-layout { grid-template-columns: 1fr; } }

.b-content { font-size: 16.5px; line-height: 1.75; color: var(--b-ink); }
.b-content h2 { font-size: 21px; color: var(--b-navy); margin: 30px 0 12px; font-weight: 800; }
.b-content h3 { font-size: 17.5px; color: var(--b-navy); margin: 24px 0 10px; font-weight: 700; }
.b-content p { margin: 0 0 16px; }
.b-content ul, .b-content ol { margin: 0 0 16px; padding-left: 22px; }
.b-content li { margin-bottom: 6px; }
.b-content a { color: var(--b-navy); text-decoration: underline; }

/* Sidebar CTA card */
.b-cta { position: sticky; top: 20px; background: var(--b-card); border: 1px solid var(--b-border); border-radius: 14px; padding: 26px 22px; text-align: center; }
.b-cta-icon { width: 44px; height: 44px; margin: 0 auto 14px; color: var(--b-navy); }
.b-cta h3 { font-size: 17px; color: var(--b-navy); margin: 0 0 10px; font-weight: 800; line-height: 1.3; }
.b-cta p { font-size: 13.5px; color: var(--b-muted); margin: 0 0 16px; line-height: 1.5; }
.b-cta-list { list-style: none; padding: 0; margin: 0 0 20px; text-align: left; display: flex; flex-direction: column; gap: 8px; }
.b-cta-list li { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--b-ink); font-weight: 600; }
.b-cta-list .b-check { color: var(--b-orange); font-weight: 800; }
.b-cta-btn { display: block; width: 100%; background: var(--b-orange); color: #fff; text-decoration: none; font-weight: 700; font-size: 14.5px; padding: 13px 18px; border-radius: 10px; margin-bottom: 12px; }
.b-cta-site { font-size: 12.5px; font-weight: 700; color: var(--b-navy); }

/* Index list */
.b-list-title { font-size: 30px; color: var(--b-navy); margin: 0 0 4px; font-weight: 800; }
.b-list-sub { color: var(--b-muted); margin: 0 0 28px; font-size: 15px; }
.b-post-card { display: block; text-decoration: none; color: inherit; background: #fff; border: 1px solid var(--b-border); border-radius: 14px; padding: 22px; margin-bottom: 16px; }
.b-post-card h2 { margin: 0 0 8px; font-size: 19px; color: var(--b-navy); font-weight: 800; }
.b-post-card p { margin: 0; color: var(--b-muted); font-size: 14px; line-height: 1.5; }

/* Footer */
.b-footer { background: var(--b-navy); margin-top: 50px; }
.b-footer-inner { display: flex; align-items: center; justify-content: space-between; padding: 26px 24px; flex-wrap: wrap; gap: 12px; }
.b-footer-logo { font-size: 15px; font-weight: 800; color: #fff; }
.b-footer-logo .b-accent { color: var(--b-orange); }
.b-footer-tagline { font-size: 13px; color: rgba(255,255,255,0.65); }
`;

const CALC_ICON = `<svg class="b-cta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="1.6"/><rect x="7" y="5" width="10" height="4" rx="0.5" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="13" r="1.1" fill="currentColor"/><circle cx="12" cy="13" r="1.1" fill="currentColor"/><circle cx="16" cy="13" r="1.1" fill="currentColor"/><circle cx="8" cy="17" r="1.1" fill="currentColor"/><circle cx="12" cy="17" r="1.1" fill="currentColor"/><circle cx="16" cy="17" r="1.1" fill="currentColor"/></svg>`;

function ctaCard() {
  return `
    <aside class="b-cta">
      ${CALC_ICON}
      <h3>Use JobPriceNow to Price Smarter</h3>
      <p>Get an accurate job estimate in seconds based on your project type and real material costs.</p>
      <ul class="b-cta-list">
        <li><span class="b-check">✓</span> Fast &amp; free</li>
        <li><span class="b-check">✓</span> No login required</li>
        <li><span class="b-check">✓</span> Built for handymen &amp; homeowners</li>
        <li><span class="b-check">✓</span> Win more jobs</li>
      </ul>
      <a class="b-cta-btn" href="/">Try It Now</a>
      <div class="b-cta-site">JobPriceNow.com</div>
    </aside>`;
}

function pageShell({ title, description, canonical, bodyHtml, jsonLd, adSlotHtml, gaId }) {
  const gaHtml = gaId
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(gaId)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${escapeHtml(gaId)}');</script>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta name="twitter:card" content="summary">
<style>${BLOG_STYLES}</style>
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}
${gaHtml}
</head>
<body>
<header class="b-header">
  <div class="b-wrap b-header-inner">
    <a href="/" class="b-logo">
      <span class="b-logo-word">JobPrice<span class="b-accent">Now</span></span>
      <span class="b-logo-tagline">KNOW YOUR PRICE. WIN THE JOB.</span>
    </a>
    <nav class="b-nav">
      <a href="/blog" class="b-nav-blog">Blog</a>
      <a href="/" class="b-nav-cta">Get a price →</a>
    </nav>
  </div>
</header>
<main class="b-wrap" style="padding-top:8px;padding-bottom:20px;">
${bodyHtml}
${adSlotHtml ? `<div class="ad-slot" data-slot="blog_ad_slot" style="margin-top:32px;">${adSlotHtml}</div>` : ""}
</main>
<footer class="b-footer">
  <div class="b-wrap b-footer-inner">
    <span class="b-footer-logo">JobPrice<span class="b-accent">Now</span></span>
    <span class="b-footer-tagline">Know Your Price. Win The Job.</span>
  </div>
</footer>
</body>
</html>`;
}

export function renderBlogIndex(posts, monetization) {
  const adHtml = monetization?.adsEnabled ? monetization?.adSlots?.blog_ad_slot?.html : "";
  const cards = posts.length
    ? posts
        .map(
          (p) => `
    <a href="/blog/${escapeHtml(p.slug)}" class="b-post-card">
      <h2>${escapeHtml(p.title)}</h2>
      <p>${escapeHtml(p.metaDescription || excerpt(p.content))}</p>
    </a>`
        )
        .join("\n")
    : `<p style="color:var(--b-muted);">No posts yet — check back soon.</p>`;

  const body = `
    <h1 class="b-list-title">JobPriceNow Blog</h1>
    <p class="b-list-sub">Pricing guides and how-tos for common handyman jobs.</p>
    ${cards}
  `;

  return pageShell({
    title: `Blog | ${SITE_NAME}`,
    description: "Pricing guides and how-to articles for common handyman jobs, from JobPriceNow.",
    canonical: `${SITE_URL}/blog`,
    bodyHtml: body,
    adSlotHtml: adHtml,
    gaId: monetization?.googleAnalyticsId,
  });
}

function heroBand(post) {
  if (post.featuredImage) {
    return `
      <div class="b-hero-photo">
        <img src="${escapeHtml(post.featuredImage)}" alt="${escapeHtml(post.title)}">
        <div class="b-hero-overlay"></div>
        <div class="b-hero-text">
          <p class="b-hero-line">Know Your Price. <span class="b-accent">Win The Job.</span></p>
        </div>
      </div>`;
  }
  return `
    <div class="b-hero">
      <p class="b-hero-line">Know Your Price. <span class="b-accent">Win The Job.</span></p>
      <p class="b-hero-sub">Know your worth. Charge with confidence.</p>
    </div>`;
}

export function renderBlogPost(post, monetization) {
  const adHtml = monetization?.adsEnabled ? monetization?.adSlots?.blog_ad_slot?.html : "";
  const description = post.metaDescription || excerpt(post.content);
  const dateLabel = formatDate(post.publishedAt || post.createdAt);

  const body = `
    <article>
      <a href="/blog" class="b-back">← All posts</a>
      <div class="b-eyebrow">Pricing Guide</div>
      <h1 class="b-title">${escapeHtml(post.title)}</h1>
      <p class="b-byline">By <b>${escapeHtml(AUTHOR_NAME)}</b>${dateLabel ? ` &nbsp;•&nbsp; ${escapeHtml(dateLabel)}` : ""} &nbsp;•&nbsp; Pricing Tips</p>

      ${heroBand(post)}

      <div class="b-layout">
        <div class="b-content">${post.content}</div>
        ${ctaCard()}
      </div>
    </article>
  `;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    author: { "@type": "Person", name: AUTHOR_NAME },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  return pageShell({
    title: `${post.title} | ${SITE_NAME}`,
    description,
    canonical: `${SITE_URL}/blog/${post.slug}`,
    bodyHtml: body,
    jsonLd,
    adSlotHtml: adHtml,
    gaId: monetization?.googleAnalyticsId,
  });
}

export function renderNotFound() {
  return pageShell({
    title: `Not found | ${SITE_NAME}`,
    description: "This post could not be found.",
    canonical: `${SITE_URL}/blog`,
    bodyHtml: `<h1 class="b-list-title">Post not found</h1><p><a href="/blog">Back to the blog</a></p>`,
  });
}
