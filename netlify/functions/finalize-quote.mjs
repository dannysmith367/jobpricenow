import { handleQuoteFinalize } from "../../quote-logic.mjs";

export default async (req) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }
  const url = new URL(req.url);
  const requestId = url.searchParams.get("requestId");
  const sessionId = url.searchParams.get("session_id");
  const result = await handleQuoteFinalize({ requestId, sessionId });
  return new Response(JSON.stringify(result.status === 200 ? result.data : { error: result.error }), {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
};
