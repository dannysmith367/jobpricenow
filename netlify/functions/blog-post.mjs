import { handleBlogPostPage } from "../../admin-logic.mjs";

export default async (req) => {
  const url = new URL(req.url);

  // The netlify.toml rewrite is supposed to forward the slug as a query
  // param (?slug=...), but that isn't reliably arriving. As a fallback,
  // pull it directly from the URL path itself (/blog/some-slug) — this
  // works regardless of how Netlify is handling the rewrite internally.
  let slug = url.searchParams.get("slug");
  if (!slug) {
    const match = url.pathname.match(/\/blog\/([^/?#]+)/);
    if (match) slug = decodeURIComponent(match[1]);
  }

  console.log("BLOG DEBUG — url.href:", url.href, "| pathname:", url.pathname, "| resolved slug:", JSON.stringify(slug));

  const result = await handleBlogPostPage(slug);
  return new Response(result.html, {
    status: result.status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};
