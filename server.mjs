// ============================================================
// JobPriceNow — Local Dev / Express Server
// Serves /public and exposes /api/estimate, delegating the actual
// request handling to server-logic.mjs (shared with Netlify).
// ============================================================

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pricingConfig } from "./lib/pricing-config.mjs";
import { handleEstimateRequest } from "./server-logic.mjs";
import {
  handleSiteConfigRequest,
  handleAdminMonetizationGet,
  handleAdminMonetizationPost,
  handleAdminBlogList,
  handleAdminBlogSave,
  handleAdminBlogDelete,
  handleBlogIndexPage,
  handleBlogPostPage,
} from "./admin-logic.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: "12mb" })); // accommodates up to 3 compressed photos as base64
app.use(express.static(path.join(__dirname, "public")));

// ---- Simple in-memory per-IP rate limiter (resets hourly) ----
const requestLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const timestamps = (requestLog.get(ip) || []).filter((t) => t > oneHourAgo);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > pricingConfig.rateLimitPerHour;
}

app.post("/api/estimate", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please try again in a bit." });
  }

  try {
    const result = await handleEstimateRequest(req.body);
    if (result.status !== 200) {
      return res.status(result.status).json({ error: result.error });
    }
    res.json(result.data);
  } catch (err) {
    console.error("Estimate error:", err);
    res.status(500).json({
      error: "Something went wrong analyzing the job. Your photos are safe. Try again or continue with a description-only estimate.",
    });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

// ---- Public site config (ads/affiliate settings, feature flags) ----
app.get("/api/site-config", async (req, res) => {
  const result = await handleSiteConfigRequest();
  res.status(result.status).json(result.data);
});

// ---- Admin: monetization (ads + affiliate + pro flag) ----
app.get("/api/admin-monetization", async (req, res) => {
  const result = await handleAdminMonetizationGet(req.headers);
  res.status(result.status).json(result.data ?? { error: result.error });
});
app.post("/api/admin-monetization", async (req, res) => {
  const result = await handleAdminMonetizationPost(req.headers, req.body);
  res.status(result.status).json(result.data ?? { error: result.error });
});

// ---- Admin: blog CRUD ----
app.get("/api/admin-blog", async (req, res) => {
  const result = await handleAdminBlogList(req.headers);
  res.status(result.status).json(result.data ?? { error: result.error });
});
app.post("/api/admin-blog", async (req, res) => {
  const result = await handleAdminBlogSave(req.headers, req.body);
  res.status(result.status).json(result.data ?? { error: result.error });
});
app.delete("/api/admin-blog", async (req, res) => {
  const result = await handleAdminBlogDelete(req.headers, req.query.id);
  res.status(result.status).json(result.data ?? { error: result.error });
});

// ---- Public blog pages (server-rendered HTML, same as production) ----
app.get("/blog", async (req, res) => {
  const result = await handleBlogIndexPage();
  res.status(result.status).type("html").send(result.html);
});
app.get("/blog/:slug", async (req, res) => {
  const result = await handleBlogPostPage(req.params.slug);
  res.status(result.status).type("html").send(result.html);
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`JobPriceNow running at http://localhost:${PORT}`);
});
