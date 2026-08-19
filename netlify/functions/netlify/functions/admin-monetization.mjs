import { handleAdminMonetizationGet, handleAdminMonetizationPost } from "../../admin-logic.mjs";

export default async (req) => {
  const headers = Object.fromEntries(req.headers);
  let result;
  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    result = await handleAdminMonetizationPost(headers, body);
  } else {
    result = await handleAdminMonetizationGet(headers);
  }
  return new Response(JSON.stringify(result.data ?? { error: result.error }), {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
};
