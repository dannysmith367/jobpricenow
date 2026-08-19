import { handleBlogIndexPage } from "../../admin-logic.mjs";

export default async () => {
  const result = await handleBlogIndexPage();
  return new Response(result.html, {
    status: result.status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};
