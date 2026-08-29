import { handleAdminStatsGet } from "../../admin-logic.mjs";

export default async (req) => {
  const headers = Object.fromEntries(req.headers);
  let result;
  try {
    result = await handleAdminStatsGet(headers);
  } catch (err) {
    console.error("admin-stats function error:", err);
    result = { status: 500, error: "Something went wrong." };
  }
  return new Response(JSON.stringify(result.status === 200 ? result.data : { error: result.error }), {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
};
