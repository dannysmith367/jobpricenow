# JobPriceNow

**What should I charge for this job?**

A free, no-signup pricing calculator for independent handymen. Describe a job, add up to 3 photos, enter a ZIP code, and get a realistic three-tier price recommendation in seconds.

---

## Business purpose

JobPriceNow is intentionally narrow: it answers one question — *"What should I charge for this job?"* — as fast and clearly as possible, mobile-first, with no account required. It is not CRM, scheduling, or invoicing software. See the original product spec for full rationale; the short version is section 92 of that doc:

> "Open it. Describe the job. Know what to charge." Not "Sign up for contractor management software."

## Architecture

```
jobpricenow/
├── public/                  Static frontend (vanilla HTML/CSS/JS, no framework)
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── privacy.html
│   └── terms.html
├── lib/
│   ├── pricing-config.mjs   ALL editable pricing constants live here
│   ├── job-data.mjs         Reference job database + keyword matcher
│   ├── location-service.mjs ZIP → regional multiplier (swappable later)
│   ├── ai-analysis.mjs      AI job understanding + deterministic fallback
│   └── price-calculator.mjs Pure, testable pricing math — the ONLY place
│                             a final dollar figure is computed
├── server-logic.mjs         Shared request handler (used by both targets below)
├── server.mjs               Local dev server (Express)
├── netlify/functions/
│   └── estimate.mjs         Production handler (Netlify Function)
├── netlify.toml              Netlify build + redirect config
├── tests/
│   └── pricing.test.mjs     18 tests covering the pricing engine
└── .env.example
```

### Core design rule: AI never invents a price

The AI layer (`lib/ai-analysis.mjs`) only returns structured data — tasks, labor-hour ranges, estimated material cost, difficulty, confidence. All dollar math happens in `lib/price-calculator.mjs`, a pure function with no I/O, fully unit tested. This separation is intentional and should not be broken by future changes.

### AI fallback

If `ANTHROPIC_API_KEY` is not set, or the Anthropic call fails/times out, `analyzeJob()` automatically falls back to a deterministic keyword matcher against the 26-job reference database in `lib/job-data.mjs`. The product never becomes fully unusable — it just becomes less flexible for unusual job descriptions. This is tested and works today with zero configuration.

## Local setup

```bash
npm install
cp .env.example .env   # optionally add your OPENAI_API_KEY
npm run dev             # starts on http://localhost:8787
```

Run the pricing engine tests:

```bash
npm test
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | No | Enables AI-powered job/photo analysis. Without it, the deterministic fallback is used automatically. |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-sonnet-4-5`. The exact request shape in `lib/ai-analysis.mjs` targets the Chat Completions JSON-mode endpoint and may need updating. |
| `PORT` | No | Local dev server port (default 8787). |
| `RATE_LIMIT_PER_HOUR` | No | Per-IP estimate request cap (default 20). |
| `ADMIN_PASSWORD` | **Yes, before using `/admin`** | Gates the admin dashboard (ads, affiliate links, blog posts). Required — without it, admin endpoints refuse all requests. |
| `SITE_URL` | No | Defaults to `https://jobpricenow.com`. Used in blog page canonical URLs / SEO tags. |

Never commit a real `.env` file or paste a real key into source code — `.env` is gitignored.

## Pricing configuration

Every dollar figure lives in `lib/pricing-config.mjs`:

- `nationalHourlyRate` — $85/hr baseline
- `materialMarkup` — 15%
- `minimumJobPrice` — $125
- `difficulty` — 0% / +10% / +20% / +30% for easy/moderate/difficult/high
- `priceTiers` — competitive (0.85×) / recommended (1.0×) / high-margin (1.15×) off the calculated base price
- `extraTaskLaborDiscountRate` — 15% labor-hour reduction per task beyond the first, so a multi-task visit doesn't apply the minimum charge multiple times

Change these numbers here — nothing else in the codebase hardcodes a pricing constant.

## Reference job database

`lib/job-data.mjs` contains ~26 seed jobs across drywall, mounting, doors, plumbing, electrical, painting, and exterior categories, each with labor-hour range, material cost range, default difficulty, and an explicit `keywords` list used by the fallback matcher. Add more jobs by appending objects to the `referenceJobs` array — no other file needs to change.

**Note on the keyword matcher:** each job's `keywords` are deliberately specific nouns (e.g. `"faucet"`, `"drywall"`, `"ceiling fan"`) rather than generic words from the job name (e.g. NOT `"repair"` or `"replacement"`) — several job names share those generic words, and matching on them would falsely pull in unrelated jobs. When adding new reference jobs, follow this pattern.

## Regulated / high-risk work detection

`lib/job-data.mjs` also exports `regulatedWorkTriggers` — a keyword list (new circuits, gas lines, structural work, roofing, HVAC refrigerant, etc.) checked against the description. When triggered, the UI shows a non-alarming "Professional trade may be required" notice. This is guidance only — see the disclaimer in the UI and Terms page.

## Testing

`tests/pricing.test.mjs` covers: minimum job price, one-task pricing, material markup (applied once, not per-task), all four difficulty tiers, non-compounding difficulty across multi-task jobs, regional pricing up/down, the multi-task efficiency discount (verified against the spec's exact worked example), zero-material jobs, large-material jobs, and ZIP validation edge cases. Run with `npm test`.

Pricing logic has significantly more test coverage than the UI, deliberately — it's the part of the product that must never silently misbehave.

## Deployment — Netlify

Planned hosting is **Netlify**, domain **JobPriceNow.com** registered via **Porkbun**.

1. Push this repository to GitHub (or connect Netlify directly to your Git provider).
2. In Netlify: **New site from Git** → select the repo. `netlify.toml` already configures `publish = "public"` and `functions = "netlify/functions"`.
3. In **Site settings → Environment variables**, add:
   - `OPENAI_API_KEY` (your real key — never in source)
   - `OPENAI_MODEL` (optional override)
   - `RATE_LIMIT_PER_HOUR` (optional override)
   - `ADMIN_PASSWORD` (required to use `/admin` — see "Admin page" section below)
4. Deploy. Netlify will build and serve `/public` as static, and `/api/estimate` will redirect to the Netlify Function per `netlify.toml`.
5. Test the deployed function: `curl -X POST https://<your-site>.netlify.app/api/estimate -H "Content-Type: application/json" -d '{"description":"Replace a bathroom faucet","zip":"95945","photos":[]}'`
6. In **Domain settings**, add `jobpricenow.com` as a custom domain.
7. In Porkbun's DNS settings, point the domain at Netlify per Netlify's provided DNS instructions (typically an ALIAS/ANAME or Netlify's nameservers). Do **not** transfer the domain registrar — just update DNS.
8. Confirm HTTPS is issued (Netlify auto-provisions via Let's Encrypt once DNS resolves).
9. Test on an actual phone: description entry, ZIP entry, photo upload (camera + library), estimate generation, quote copy.
10. Confirm the AI fallback path works by temporarily testing without `OPENAI_API_KEY` set, or by simulating a timeout.

## Where to add the Anthropic API key

**Never** in `index.html`, `app.js`, or any client-side file, and never committed to Git. Only as a Netlify environment variable (`OPENAI_API_KEY`) or in your local `.env` file (gitignored). The key is only ever read server-side in `lib/ai-analysis.mjs`.

## Admin page — ads, affiliate links, and the blog

Everything below is controlled live at **`/admin`**, no code changes or redeploys required.

**Setup (one-time):**
1. In Netlify: **Site settings → Environment variables**, add `ADMIN_PASSWORD` (pick a password you don't use anywhere else — this is basic "keep strangers out" protection, not bank-grade security; see `lib/admin-auth.mjs`).
2. Netlify Blobs (the storage behind all of this) is provisioned automatically per-site — nothing else to sign up for.
3. Visit `https://jobpricenow.com/admin`, enter the password.

**Ads & Affiliate tab:**
- A master "Ads enabled" switch — off means no ad code renders anywhere, even if slots are filled in.
- Three ad slots you can paste any ad network's embed code into: below the price breakdown, the page footer, and inside blog posts.
- Four affiliate partners (Lowe's, Ace, Amazon, Harbor Freight) — toggle one on and paste your affiliate link template using `{QUERY}` as a placeholder for the search term. Once enabled, a "Shop materials at [Partner] →" link appears under the price breakdown automatically.
- Hit "Save ads & affiliate settings" — changes are live within seconds.

**Blog tab:**
- Click "New post," write a title (the URL slug auto-fills), a meta description (what shows up in Google search results), and content — paste formatted text from Google Docs/Word, or write plain `<p>` paragraphs.
- Check "Published" and save — it's immediately live at `/blog/your-slug`, server-rendered with real meta tags and article schema for SEO, not a JS-only page.
- Leave "Published" unchecked to save a draft you're not ready to publish.

**Pro tab:** placeholder for now — the `proEnabled` flag already exists in the config, so turning it on later is a small change, not a rebuild.

## Adding Supabase later

No database is used at launch. To add Supabase for saved estimates, feedback persistence, or Pro accounts without restructuring:
1. The feedback UI in `app.js` already calls `track()` on every vote — replace the body of `track()` (or add a dedicated `submitFeedback()` call) to `POST` to a new Supabase-backed endpoint instead of just logging.
2. Add a new Netlify Function (e.g. `netlify/functions/feedback.mjs`) that writes to Supabase using the service role key (server-side only, as an env var — never client-side).
3. For saved estimates / accounts, add Supabase Auth on the frontend and gate `FEATURES.savedEstimates` (see `featureFlags` in `lib/pricing-config.mjs`) once the UI exists.
4. Keep the free estimator's core flow (description → ZIP → photos → price) working with zero Supabase dependency at every step — Supabase should only ever add optional persistence on top.

## Known limitations / remaining work

- The regional ZIP multiplier (`lib/location-service.mjs`) uses a coarse first-digit-of-ZIP heuristic, clearly labeled as an estimate. Replace with real market data when available — the function signature (`getLocationMultiplier(zip)`) is stable so callers won't need to change.
- The Anthropic request shape in `lib/ai-analysis.mjs` should be re-verified against current AnenAI API docs before relying on it in production; it was written against the Chat Completions JSON-mode pattern and model availability/naming may have changed.
- Rate limiting is in-memory per server instance. On Netlify Functions (stateless/ephemeral), this is a soft best-effort limiter, not a hard guarantee — fine for launch, but consider a shared store (e.g. Netlify's own rate limiting, or a small Supabase/Redis-backed counter) if abuse becomes a problem.
- No automated frontend/UI tests yet — only the pricing engine and location service are unit tested. Manual mobile QA is recommended before launch.
- Feedback (👍/👎 and "what would you charge") is currently logged to the console only (`track()` in `app.js`) — see "Adding Supabase later" above to persist it.

## Recommended next 5 actions

1. **Get a real Anthropic API key and verify the model/endpoint syntax** against current docs, then test AI-powered analysis end-to-end (including photo understanding) before launch.
2. **Deploy to Netlify and connect JobPriceNow.com** via Porkbun DNS; do a full mobile QA pass (camera upload, ZIP entry, slow connections).
3. **Soft-launch to a small group of real handymen** (e.g. through a Facebook handyman group) and watch for repeat usage — the spec's stated #1 success metric.
4. **Turn on the feedback-to-Supabase pipeline** early, even before Pro features exist, since accumulated real pricing feedback is the long-term data moat described in the spec.
5. **Produce 2–3 short-form videos** using the ad concepts already drafted (Magic 8-Ball / underbid reveal) to drive the first wave of organic traffic, pointing directly at the free estimator.
