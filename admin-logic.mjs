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
import { listPromoCodes, createPromoCode, setPromoCodeActive } from "./lib/promo-codes.mjs";
import { getAutomationState, setAutomationEnabled, setAutomationInterval, generateNow } from "./lib/blog-automation.mjs";
import { getTopics, addTopic, removeTopic, refillSeoTopics } from "./lib/blog-topics.mjs";

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
  if (!post) {
    const allPosts = await getAllPosts();
    console.log("BLOG DEBUG — requested slug:", JSON.stringify(slug));
    console.log("BLOG DEBUG — stored posts:", JSON.stringify(allPosts.map((p) => ({ slug: p.slug, published: p.published }))));
  }
  if (!post || !post.published) return { status: 404, html: renderNotFound() };
  return { status: 200, html: renderBlogPost(post, monetization) };
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

export async function handleAdminBlogGenerateNow(headers) {
  if (!isAuthorized(headers)) return { status: 401, error: "Incorrect admin password." };
  const result = await generateNow();
  if (!result.generated) return { status: 400, error: result.reason || "Couldn't generate a post." };
  return { status: 200, data: result.post };
}
