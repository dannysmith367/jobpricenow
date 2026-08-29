// ============================================================
// Background Function: actually generates the blog post.
//
// Background Functions (filename must end in "-background") get up
// to 15 minutes to run, instead of the ~30 second limit on regular
// synchronous functions. Writing a full AI blog post can easily take
// 30-90+ seconds, which is what was silently killing the old
// synchronous "Generate Now" flow — Netlify's platform was cutting
// the function off mid-request and returning a non-JSON error page,
// which the browser could only report as a generic "request failed."
//
// Netlify ignores whatever this function returns and does not wait
// for it — the caller gets an immediate 202 the moment this function
// is invoked, regardless of how long the code below actually takes.
//
// Security: background functions run on invocation regardless of
// who calls them, so this re-checks the admin password itself
// rather than trusting that only the admin panel can reach this URL.
// ============================================================

import { isAuthorized } from "../../lib/admin-auth.mjs";
import { generateNow } from "../../lib/blog-automation.mjs";

export default async (req) => {
  const headers = Object.fromEntries(req.headers);
  if (!isAuthorized(headers)) {
    console.warn("generate-blog-post-background: rejected, bad/missing admin password");
    return;
  }
  try {
    const result = await generateNow();
    console.log("Background blog generation finished:", JSON.stringify(result));
  } catch (err) {
    console.error("Background blog generation failed:", err);
  }
};
