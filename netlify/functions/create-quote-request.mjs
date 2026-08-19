import { handleQuoteRequestCreate } from "../../quote-logic.mjs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }
  const siteUrl = process.env.SITE_URL || new URL(req.url).origin;
  const body = await req.json().catch(() => ({}));
  const result = await handleQuoteRequestCreate(body, siteUrl);
  return new Response(JSON.stringify(result.status === 200 ? result.data : { error: result.error }), {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
};
