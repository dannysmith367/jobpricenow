import {
  handleAdminBlogAutomationGet,
  handleAdminBlogAutomationToggle,
  handleAdminBlogAutomationSetInterval,
  handleAdminBlogTopicAdd,
  handleAdminBlogTopicRemove,
  handleAdminBlogTopicsRefillSeo,
  handleAdminBlogGenerateNowTrigger,
} from "../../admin-logic.mjs";

export default async (req) => {
  const headers = Object.fromEntries(req.headers);
  const siteUrl = process.env.SITE_URL || new URL(req.url).origin;
  let result;
  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (body.action === "toggle") result = await handleAdminBlogAutomationToggle(headers, body);
      else if (body.action === "setInterval") result = await handleAdminBlogAutomationSetInterval(headers, body);
      else if (body.action === "addTopic") result = await handleAdminBlogTopicAdd(headers, body);
      else if (body.action === "removeTopic") result = await handleAdminBlogTopicRemove(headers, body);
      else if (body.action === "refillSeoTopics") result = await handleAdminBlogTopicsRefillSeo(headers);
      else if (body.action === "generateNow") result = await handleAdminBlogGenerateNowTrigger(headers, siteUrl);
      else result = { status: 400, error: "Unknown action." };
    } else {
      result = await handleAdminBlogAutomationGet(headers);
    }
  } catch (err) {
    console.error("admin-blog-automation function error:", err);
    result = { status: 500, error: "Something went wrong." };
  }
  return new Response(JSON.stringify(result.data ?? { error: result.error }), {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
};
