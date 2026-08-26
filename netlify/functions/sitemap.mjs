import { handleSitemapXml } from "../../admin-logic.mjs";

export default async () => {
  const xml = await handleSitemapXml();
  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
