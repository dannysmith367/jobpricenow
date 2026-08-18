import { handleAdminBlogList, handleAdminBlogSave, handleAdminBlogDelete } from "../../admin-logic.mjs";

export default async (req) => {
  const headers = Object.fromEntries(req.headers);
  const url = new URL(req.url);
  let result;

  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    result = await handleAdminBlogSave(headers, body);
  } else if (req.method === "DELETE") {
    result = await handleAdminBlogDelete(headers, url.searchParams.get("id"));
  } else {
    result = await handleAdminBlogList(headers);
  }

  return new Response(JSON.stringify(result.data ?? { error: result.error }), {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
};
