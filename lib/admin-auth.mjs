// ============================================================
// JobPriceNow — Admin Auth
//
// Deliberately simple for a solo-owner MVP: one shared password,
// set as the ADMIN_PASSWORD environment variable (Netlify: Site
// settings -> Environment variables). The admin page sends it on
// every request via the x-admin-password header; nothing is
// stored in a database.
//
// This is "keep strangers out," not bank-grade security — don't
// reuse a password you care about elsewhere. If this grows beyond
// a one-person tool, swap this for Netlify Identity or a proper
// login system.
// ============================================================

export function isAuthorized(headers) {
  const provided = headers?.["x-admin-password"] || headers?.["X-Admin-Password"];
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false; // fail closed if no password has been configured
  return provided === expected;
}
