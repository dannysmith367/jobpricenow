import { handleQuotePdf } from "../../quote-logic.mjs";

export default async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const result = await handleQuotePdf(token);
  if (result.status !== 200) {
    return new Response(JSON.stringify({ error: result.error }), { status: result.status, headers: { "Content-Type": "application/json" } });
  }
  return new Response(result.pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${result.quoteNumber}.pdf"`,
    },
  });
};
