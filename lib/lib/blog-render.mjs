// ============================================================
// JobPriceNow — Blog HTML Rendering
// Server-rendered (not client-JS-rendered) so search engines get
// real HTML with real meta tags on first load — that's the whole
// point of the blog existing. Shared by the Netlify function and
// the local Express dev server so they can never drift apart.
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

const SITE_NAME = "JobPriceNow";
const SITE_URL = process.env.SITE_URL || "https://jobpricenow.com";

function pageShell({ title, description, canonical, bodyHtml, jsonLd, adSlotHtml }) {
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
<link rel="stylesheet" href="/styles.css">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}
</head>
<body>
<header class="site-header">
  <div class="wrap header-inner">
    <a href="/" class="brand" style="text-decoration:none;">
      <span class="brand-text-wrap">
        <span class="brand-text">JobPrice<span class="accent">Now</span></span>
      </span>
    </a>
    <nav style="margin-left:auto;">
      <a href="/blog" style="margin-right:16px;font-size:14px;color:var(--muted);text-decoration:none;">Blog</a>
      <a href="/" style="font-size:14px;color:var(--blue);text-decoration:none;font-weight:600;">Get a price →</a>
    </nav>
  </div>
</header>
<main class="wrap" style="padding-top:28px;padding-bottom:60px;">
${bodyHtml}
${adSlotHtml ? `<div class="ad-slot" data-slot="blog_ad_slot">${adSlotHtml}</div>` : ""}
</main>
<footer class="site-footer">
  <div class="wrap footer-inner">
    <span>JobPrice<span class="accent">Now</span></span>
    <nav class="footer-nav">
      <a href="/blog">Blog</a>
      <a href="/privacy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
    </nav>
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
    <a href="/blog/${escapeHtml(p.slug)}" style="display:block;text-decoration:none;color:inherit;background:var(--white);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:16px;box-shadow:var(--shadow);">
      <h2 style="margin:0 0 8px;font-size:19px;color:var(--navy);">${escapeHtml(p.title)}</h2>
      <p style="margin:0;color:var(--muted);font-size:14px;line-height:1.5;">${escapeHtml(p.metaDescription || excerpt(p.content))}</p>
    </a>`
        )
        .join("\n")
    : `<p style="color:var(--muted);">No posts yet — check back soon.</p>`;

  const body = `
    <h1 style="font-size:26px;color:var(--navy);margin-bottom:4px;">JobPriceNow Blog</h1>
    <p style="color:var(--muted);margin-top:0;margin-bottom:24px;">Pricing guides and how-tos for common handyman jobs.</p>
    ${cards}
  `;

  return pageShell({
    title: `Blog | ${SITE_NAME}`,
    description: "Pricing guides and how-to articles for common handyman jobs, from JobPriceNow.",
    canonical: `${SITE_URL}/blog`,
    bodyHtml: body,
    adSlotHtml: adHtml,
  });
}

export function renderBlogPost(post, monetization) {
  const adHtml = monetization?.adsEnabled ? monetization?.adSlots?.blog_ad_slot?.html : "";
  const description = post.metaDescription || excerpt(post.content);

  const body = `
    <article>
      <a href="/blog" style="font-size:13px;color:var(--muted);text-decoration:none;">← All posts</a>
      <h1 style="font-size:28px;color:var(--navy);margin:12px 0 20px;">${escapeHtml(post.title)}</h1>
      <div style="font-size:16px;line-height:1.7;color:var(--text);">
        ${post.content}
      </div>
    </article>
  `;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
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
  });
}

export function renderNotFound() {
  return pageShell({
    title: `Not found | ${SITE_NAME}`,
    description: "This post could not be found.",
    canonical: `${SITE_URL}/blog`,
    bodyHtml: `<h1 style="font-size:24px;color:var(--navy);">Post not found</h1><p><a href="/blog">Back to the blog</a></p>`,
  });
}
