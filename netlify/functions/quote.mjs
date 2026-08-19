import { handleQuoteGet } from "../../quote-logic.mjs";

export default async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const result = await handleQuoteGet(token);
  return new Response(JSON.stringify(result.status === 200 ? result.data : { error: result.error }), {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
};
