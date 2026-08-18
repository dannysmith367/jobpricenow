import { handleBlogPostPage } from "../../admin-logic.mjs";

export default async (req) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const result = await handleBlogPostPage(slug);
  return new Response(result.html, {
    status: result.status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};
