import { handleSiteConfigRequest } from "../../admin-logic.mjs";

export default async () => {
  const result = await handleSiteConfigRequest();
  return new Response(JSON.stringify(result.data), {
    status: result.status,
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=30" },
  });
};
