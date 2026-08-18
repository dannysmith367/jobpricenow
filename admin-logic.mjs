// ============================================================
// JobPriceNow — Shared Admin/Blog/Config Request Handlers
// Pure request-in/result-out, reused by server.mjs (local dev)
// and the Netlify functions, same pattern as server-logic.mjs.
// ============================================================

import { isAuthorized } from "./lib/admin-auth.mjs";
import { getMonetizationConfig, saveMonetizationConfig, toPublicConfig } from "./lib/monetization-store.mjs";
import { getAllPosts, getPublishedPosts, getPostBySlug, savePost, deletePost } from "./lib/blog-store.mjs";
import { renderBlogIndex, renderBlogPost, renderNotFound } from "./lib/blog-render.mjs";

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
