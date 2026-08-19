import { runScheduledCheck } from "../../lib/blog-automation.mjs";

// Netlify's cron scheduler doesn't support "every 2 weeks" directly, so
// this runs weekly and runScheduledCheck() internally skips unless at
// least 14 days have passed since the last generated post.
export const config = {
  schedule: "0 14 * * 1", // every Monday at 14:00 UTC
};

export default async () => {
  try {
    const result = await runScheduledCheck();
    console.log("Blog automation scheduled check:", JSON.stringify(result));
  } catch (err) {
    console.error("Blog automation scheduled run failed:", err);
  }
};
