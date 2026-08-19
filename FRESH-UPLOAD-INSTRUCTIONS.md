# JobPriceNow — Fresh Full Upload Instructions

This is your ENTIRE site — every file, old and new, verified working
together (all 18 tests pass, every file syntax-checked). No partial
uploads, no guessing what's missing.

**Important: don't delete your GitHub repo.** Deleting it risks breaking
the Netlify connection again (like when the whole site went down before).
Instead, we're just overwriting everything in the SAME repo in one clean
pass — same result, none of the risk.

---

## Steps

1. Unzip `jobpricenow-complete-fresh-upload.zip` on your computer. You'll
   see these folders/files: `lib/`, `netlify/`, `public/`, `tests/`, plus
   some files at the top level like `server.mjs` and `package.json`.

2. Go to your repo on github.com → click into the **`lib`** folder →
   **Add file → Upload files** → drag in ALL the files from the unzipped
   `lib` folder → scroll down → click **Commit changes**.

3. Go back to the repo root → click into **`netlify/functions`** →
   **Add file → Upload files** → drag in ALL the files from the unzipped
   `netlify/functions` folder → **Commit changes**.

4. Go back to the repo root → click into **`public`** → **Add file →
   Upload files** → drag in ALL the files from the unzipped `public`
   folder → **Commit changes**.

5. Go back to the repo root → **Add file → Upload files** → drag in the
   remaining top-level files: `quote-logic.mjs`, `admin-logic.mjs`,
   `server-logic.mjs`, `server.mjs`, `package.json`, `package-lock.json`,
   `netlify.toml`, `README.md` → **Commit changes**.

   (Skip the `tests` folder — it's identical to what's already there, no
   need to re-upload it.)

Four uploads total. GitHub will say "this will replace X files" each
time — that's correct, click through it.

---

## After uploading

1. Check the Netlify **Deploys** tab — wait for "Published" with no
   errors.
2. Test a free estimate on the live site.
3. Go to `/admin` → you should see a new **Promo Codes** tab.

Once that's confirmed working, come back and we'll move on to adding
your Stripe and Resend keys.
