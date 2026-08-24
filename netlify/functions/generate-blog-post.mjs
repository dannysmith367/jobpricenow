import { runScheduledCheck } from "../../lib/blog-automation.mjs";

// Runs daily; runScheduledCheck() internally only generates a post once
// the admin-configured interval (1–30 days, default 14) has actually
// passed since the last one. Checking daily (rather than weekly) is what
// makes a 1-day setting possible.
export const config = {
  schedule: "0 14 * * *", // every day at 14:00 UTC
};

export default async () => {
  try {
    const result = await runScheduledCheck();
    console.log("Blog automation scheduled check:", JSON.stringify(result));
  } catch (err) {
    console.error("Blog automation scheduled run failed:", err);
  }
};
