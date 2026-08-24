// ============================================================
// JobPriceNow — Blog Image Storage
// Uploaded blog photos are stored as their own binary blobs (not
// crammed into the single "blog-posts" JSON key that holds every
// post), and served back out through /api/blog-image?id=...
// ============================================================

import { kvSetBlob, kvGetBlob } from "./kv-store.mjs";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB safety cap per photo

function makeImageId() {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// dataUrl looks like: "data:image/jpeg;base64,AAAA..."
export async function saveBlogImage(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(String(dataUrl || ""));
  if (!match) throw new Error("That doesn't look like a valid image upload.");

  const contentType = match[1];
  if (!contentType.startsWith("image/")) throw new Error("Only image files can be uploaded here.");

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error("That image is too large — please use one under 4MB.");

  const id = makeImageId();
  await kvSetBlob(`blog-image:${id}`, buffer, contentType);
  return id;
}

export async function getBlogImage(id) {
  if (!id) return null;
  return kvGetBlob(`blog-image:${id}`);
}
