import { handlePricingPage } from "../../admin-logic.mjs";

export default async (req) => {
  const url = new URL(req.url);
  let slug = url.searchParams.get("slug");
  if (!slug) {
    // Same fallback used for blog posts — some redirect/runtime
    // combinations don't reliably forward the query param.
    const match = url.pathname.match(/\/pricing\/([^/?#]+)/);
    if (match) slug = decodeURIComponent(match[1]);
  }
  const result = await handlePricingPage(slug);
  return new Response(result.html, {
    status: result.status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};
