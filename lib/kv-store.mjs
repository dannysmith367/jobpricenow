// ============================================================
// JobPriceNow — Key/Value Store Abstraction
//
// Production (Netlify): uses Netlify Blobs, which is provisioned
// automatically per-site — nothing extra to sign up for or pay
// for separately. Data written from the admin page is readable
// instantly from any function, with no redeploy needed.
//
// Local dev (node server.mjs): falls back to a JSON file on disk
// at /data so Dan can test the admin page and blog locally before
// ever touching Netlify.
// ============================================================

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const kvStoreDir = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_DATA_DIR = path.join(kvStoreDir, "..", "data");

let blobsStorePromise = null;

async function getBlobsStore() {
  if (!blobsStorePromise) {
    blobsStorePromise = (async () => {
      try {
        const { getStore } = await import("@netlify/blobs");
        // Prefer a manually-configured, stable Personal Access Token over
        // Netlify's automatic per-deploy token. The automatic one has been
        // seen to fail in production with "BlobsInternalError: Failed to
        // decode token: Token expired" even right after a fresh deploy —
        // a known Netlify platform issue, not something in this codebase.
        // Set BLOBS_SITE_ID (Site configuration -> General -> Site details)
        // and BLOBS_TOKEN (a Personal Access Token from User settings ->
        // Applications -> New access token) as Netlify environment
        // variables to use this more reliable path. Falls back to the
        // automatic method if those aren't set.
        if (process.env.BLOBS_SITE_ID && process.env.BLOBS_TOKEN) {
          return getStore({
            name: "jobpricenow-config",
            siteID: process.env.BLOBS_SITE_ID,
            token: process.env.BLOBS_TOKEN,
          });
        }
        return getStore("jobpricenow-config");
      } catch (err) {
        return null; // not running on Netlify / package unavailable — use local fallback
      }
    })();
  }
  return blobsStorePromise;
}

// Wraps a Blobs read/write so a runtime token/network failure degrades
// gracefully (falls back to local/empty) instead of throwing a 502 that
// takes down the whole admin page, as happened with the token-expired bug.
async function safely(fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    console.error("Netlify Blobs operation failed, falling back:", err.message);
    return fallback();
  }
}

async function localGet(key) {
  try {
    const raw = await fs.readFile(path.join(LOCAL_DATA_DIR, `${key}.json`), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function localSet(key, value) {
  await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_DATA_DIR, `${key}.json`), JSON.stringify(value, null, 2), "utf-8");
}

export async function kvGet(key) {
  const store = await getBlobsStore();
  if (store) {
    return safely(
      async () => (await store.get(key, { type: "json" })) ?? null,
      () => null
    );
  }
  return localGet(key);
}

export async function kvSet(key, value) {
  const store = await getBlobsStore();
  if (store) {
    await store.setJSON(key, value);
    return;
  }
  return localSet(key, value);
}

// ------------------------------------------------------------
// Raw binary storage — for uploaded blog photos. Kept separate
// from kvGet/kvSet (which are JSON-only) so a growing library of
// photos never bloats the single "blog-posts" config blob.
// ------------------------------------------------------------

export async function kvSetBlob(key, buffer, contentType) {
  const store = await getBlobsStore();
  if (store) {
    await store.set(key, buffer, { metadata: { contentType } });
    return;
  }
  await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_DATA_DIR, `${key}.bin`), buffer);
  await fs.writeFile(path.join(LOCAL_DATA_DIR, `${key}.meta.json`), JSON.stringify({ contentType }), "utf-8");
}

export async function kvGetBlob(key) {
  const store = await getBlobsStore();
  if (store) {
    return safely(
      async () => {
        const result = await store.getWithMetadata(key, { type: "arrayBuffer" });
        if (!result) return null;
        return {
          data: Buffer.from(result.data),
          contentType: result.metadata?.contentType || "application/octet-stream",
        };
      },
      () => null
    );
  }
  try {
    const data = await fs.readFile(path.join(LOCAL_DATA_DIR, `${key}.bin`));
    const metaRaw = await fs.readFile(path.join(LOCAL_DATA_DIR, `${key}.meta.json`), "utf-8").catch(() => null);
    const meta = metaRaw ? JSON.parse(metaRaw) : {};
    return { data, contentType: meta.contentType || "application/octet-stream" };
  } catch {
    return null;
  }
}
