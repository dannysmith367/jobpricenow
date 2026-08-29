// ============================================================
// JobPriceNow — Shared Admin/Blog/Config Request Handlers
// Pure request-in/result-out, reused by server.mjs (local dev)
// and the Netlify functions, same pattern as server-logic.mjs.
// ============================================================

import { isAuthorized } from "./lib/admin-auth.mjs";
import { getMonetizationConfig, saveMonetizationConfig, toPublicConfig } from "./lib/monetization-store.mjs";
import { getAllPosts, getPublishedPosts, getPostBySlug, savePost, deletePost } from "./lib/blog-store.mjs";
import { saveBlogImage } from "./lib/blog-images.mjs";
import { renderBlogIndex, renderBlogPost, renderNotFound } from "./lib/blog-render.mjs";
import { renderPricingIndex, renderPricingPage, renderPricingNotFound } from "./lib/pricing-render.mjs";
import { pricingPages } from "./lib/pricing-pages-data.mjs";
import { listPromoCodes, createPromoCode, setPromoCodeActive } from "./lib/promo-codes.mjs";
import { getAutomationState, setAutomationEnabled, setAutomationInterval } from "./lib/blog-automation.mjs";
import { getTopics, addTopic, removeTopic, refillSeoTopics } from "./lib/blog-topics.mjs";
import { getStatsSummary, getTopJobTypes } from "./lib/stats-store.mjs";

// ---------- Public site config (no auth) ----------
export async function handleSiteConfigRequest() {
  const config = await getMonetizationConfig();
  return { status: 200, data: toPublicConfig(config) };
}

// ---------- Admin: monetization ----------
export async function handleAdminMonetizationGet(headers) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  const config = await getMonetizationConfig();
  return { status: 200, data: config };
}

export async function handleAdminMonetizationPost(headers, body) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  const saved = await saveMonetizationConfig(body || {});
  return { status: 200, data: saved };
}

// ---------- Admin: blog CRUD ----------
export async function handleAdminBlogList(headers) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  const posts = await getAllPosts();
  return { status: 200, data: posts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) };
}

export async function handleAdminBlogSave(headers, body) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  if (!body?.title || !body?.content) return { status: 400, error: "A title and content are required." };
  const saved = await savePost(body);
  return { status: 200, data: saved };
}

export async function handleAdminBlogDelete(headers, id) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  if (!id) return { status: 400, error: "Missing post id." };
  await deletePost(id);
  return { status: 200, data: { deleted: true } };
}

export async function handleAdminBlogImageUpload(headers, body) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  if (!body?.image) return { status: 400, error: "No image was provided." };
  try {
    const id = await saveBlogImage(body.image);
    return { status: 200, data: { id, url: `/api/blog-image?id=${id}` } };
  } catch (err) {
    return { status: 400, error: err.message };
  }
}

// ---------- Public blog pages (server-rendered HTML) ----------
export async function handleBlogIndexPage() {
  const [posts, monetization] = await Promise.all([getPublishedPosts(), getMonetizationConfig()]);
  return { status: 200, html: renderBlogIndex(posts, monetization) };
}

export async function handleBlogPostPage(slug) {
  const [post, monetization] = await Promise.all([getPostBySlug(slug), getMonetizationConfig()]);
  if (!post || !post.published) return { status: 404, html: renderNotFound() };
  return { status: 200, html: renderBlogPost(post, monetization) };
}

// ---------- Pricing guides (/pricing) ----------
export async function handlePricingIndexPage() {
  return { status: 200, html: renderPricingIndex() };
}

export async function handlePricingPage(slug) {
  const page = pricingPages.find((p) => p.slug === slug);
  if (!page) return { status: 404, html: renderPricingNotFound() };
  return { status: 200, html: renderPricingPage(page) };
}

// ---------- Sitemap ----------
export async function handleSitemapXml() {
  const siteUrl = process.env.SITE_URL || "https://jobpricenow.com";
  const posts = await getPublishedPosts();

  const urls = [
    { loc: `${siteUrl}/`, changefreq: "weekly", priority: "1.0" },
    { loc: `${siteUrl}/blog`, changefreq: "daily", priority: "0.8" },
    { loc: `${siteUrl}/pricing`, changefreq: "weekly", priority: "0.9" },
    ...pricingPages.map((p) => ({ loc: `${siteUrl}/pricing/${p.slug}`, changefreq: "monthly", priority: "0.8" })),
    ...posts.map((p) => ({ loc: `${siteUrl}/blog/${p.slug}`, changefreq: "monthly", priority: "0.6", lastmod: (p.updatedAt || p.publishedAt || "").slice(0, 10) })),
  ];

  const body = urls
    .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ""}    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

// ---------- Admin: promo codes (bypass the $2.99 quote paywall) ----------
export async function handleAdminPromoList(headers) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  const codes = await listPromoCodes();
  return { status: 200, data: codes };
}

export async function handleAdminPromoCreate(headers, body) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  if (!body?.code) return { status: 400, error: "A code is required." };
  try {
    const created = await createPromoCode(body);
    return { status: 200, data: created };
  } catch (err) {
    return { status: 400, error: err.message };
  }
}

export async function handleAdminPromoToggle(headers, body) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  if (!body?.code) return { status: 400, error: "A code is required." };
  try {
    const updated = await setPromoCodeActive(body.code, body.active);
    return { status: 200, data: updated };
  } catch (err) {
    return { status: 400, error: err.message };
  }
}

// ---------- Admin: blog automation ----------
export async function handleAdminBlogAutomationGet(headers) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  const [state, topics] = await Promise.all([getAutomationState(), getTopics()]);
  return { status: 200, data: { ...state, topics } };
}

export async function handleAdminBlogAutomationToggle(headers, body) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  const state = await setAutomationEnabled(body?.enabled);
  return { status: 200, data: state };
}

export async function handleAdminBlogAutomationSetInterval(headers, body) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  try {
    const state = await setAutomationInterval(body?.intervalDays);
    return { status: 200, data: state };
  } catch (err) {
    return { status: 400, error: err.message };
  }
}

export async function handleAdminBlogTopicAdd(headers, body) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  try {
    const topics = await addTopic(body?.topic);
    return { status: 200, data: topics };
  } catch (err) {
    return { status: 400, error: err.message };
  }
}

export async function handleAdminBlogTopicRemove(headers, body) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  try {
    const topics = await removeTopic(Number(body?.index));
    return { status: 200, data: topics };
  } catch (err) {
    return { status: 400, error: err.message };
  }
}

export async function handleAdminBlogTopicsRefillSeo(headers) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  const result = await refillSeoTopics();
  return { status: 200, data: result };
}

export async function handleAdminBlogGenerateNowTrigger(headers, siteUrl) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  const password = headers?.["x-admin-password"] || headers?.["X-Admin-Password"];
  try {
    // Fire the background function and return as soon as Netlify accepts
    // the invocation (fast) — NOT once generation actually finishes.
    // Background Functions get up to 15 minutes to run, well past the
    // ~30 second limit that was killing this as a normal synchronous call.
    await fetch(`${siteUrl}/.netlify/functions/generate-blog-post-background`, {
      method: "POST",
      headers: { "x-admin-password": password || "" },
    });
    return {
      status: 202,
      data: {
        triggered: true,
        message: "Generating a new post now — this can take up to a couple minutes. Check the Blog Posts tab shortly; it'll appear there as a draft.",
      },
    };
  } catch (err) {
    console.error("Failed to trigger background blog generation:", err);
    return { status: 500, error: "Couldn't start generation. Try again in a moment." };
  }
}

// ---------- Admin: usage stats ----------
export async function handleAdminStatsGet(headers) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  const [summary, topJobTypes] = await Promise.all([getStatsSummary({ dailyDays: 30 }), getTopJobTypes({ limit: 8 })]);
  return { status: 200, data: { ...summary, topJobTypes } };
}
