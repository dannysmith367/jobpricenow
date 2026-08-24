// ============================================================
// JobPriceNow — Blog Post Store
// Simple flat list of posts in KV storage. No CMS, no build step —
// Dan writes a post in /admin, it's live immediately at /blog/:slug.
// ============================================================

import { kvGet, kvSet } from "./kv-store.mjs";

const KEY = "blog-posts";

function slugify(title) {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function getAllPosts() {
  const posts = await kvGet(KEY);
  return Array.isArray(posts) ? posts : [];
}

export async function getPublishedPosts() {
  const posts = await getAllPosts();
  return posts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

export async function getPostBySlug(slug) {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}

export async function savePost(post) {
  const posts = await getAllPosts();
  const now = new Date().toISOString();

  if (post.id) {
    const idx = posts.findIndex((p) => p.id === post.id);
    if (idx === -1) throw new Error("Post not found");
    const existing = posts[idx];
    const slug = post.slug || existing.slug || slugify(post.title);
    posts[idx] = {
      ...existing,
      ...post,
      slug,
      updatedAt: now,
      publishedAt: post.published && !existing.publishedAt ? now : existing.publishedAt,
    };
    await kvSet(KEY, posts);
    return posts[idx];
  }

  let slug = post.slug || slugify(post.title);
  let unique = slug;
  let n = 2;
  while (posts.some((p) => p.slug === unique)) {
    unique = `${slug}-${n++}`;
  }

  const newPost = {
    id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: post.title || "Untitled post",
    slug: unique,
    metaDescription: post.metaDescription || "",
    content: post.content || "",
    featuredImage: post.featuredImage || null,
    published: Boolean(post.published),
    createdAt: now,
    updatedAt: now,
    publishedAt: post.published ? now : null,
  };
  posts.push(newPost);
  await kvSet(KEY, posts);
  return newPost;
}

export async function deletePost(id) {
  const posts = await getAllPosts();
  const next = posts.filter((p) => p.id !== id);
  await kvSet(KEY, next);
}
