import { getBlogImage } from "../../lib/blog-images.mjs";

export default async (req) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  const result = await getBlogImage(id);
  if (!result) return new Response("Not found", { status: 404 });

  return new Response(result.data, {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
