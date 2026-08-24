import { handleAdminBlogImageUpload } from "../../admin-logic.mjs";

export default async (req) => {
  const headers = Object.fromEntries(req.headers);
  const body = await req.json().catch(() => ({}));
  const result = await handleAdminBlogImageUpload(headers, body);

  return new Response(JSON.stringify(result.data ?? { error: result.error }), {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
};
