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
        // "strong" consistency: without this, a value written by one function
        // call may not be visible to a read that happens milliseconds later
        // from a different function invocation (default is "eventual"). This
        // matters here because payment -> save quote -> immediate redirect ->
        // read quote all happen within a second of each other.
        return getStore("jobpricenow-config", { consistency: "strong" });
      } catch (err) {
        return null; // not running on Netlify / package unavailable — use local fallback
      }
    })();
  }
  return blobsStorePromise;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    let value = await store.get(key, { type: "json" });
    // Safety net: if it's not there yet, wait briefly and try a couple more
    // times before giving up. Guards against any residual propagation delay
    // right after a write (e.g. right after payment finalizes a quote).
    for (let attempt = 0; value == null && attempt < 2; attempt++) {
      await sleep(400);
      value = await store.get(key, { type: "json" });
    }
    return value ?? null;
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
