# Batch 0.2.2 Production Report

## Verdict

**READY FOR MANUAL DEPLOY**

The selective legacy redirect implementation is validated, merged, and pushed to `main`. The Codex process cannot access the authenticated production PowerShell environment (`wrangler whoami --json` returned `loggedIn: false`), so no deployment was attempted and no temporary account was used.

## Release identity

- Batch: `Batch 0.2.2 — Selective Legacy Redirect Worker`
- Implementation commit: `d05efb3ed37e17ed48f17457fe20ad5001d9db5c`
- Merge/production candidate SHA: `a0bbf70d0b7b69de11d3801bf17aee1e2ad11e04`
- Worker target: `shopbuynotebook-thai` (unchanged)
- Previous failed deployment ID: `54d2318f-da67-44f8-ab70-86cc66888f36`
- Previous failed Worker version / rollback version: `c01d9d3b-1a19-462e-b8fe-54587751b224`
- Previous version number: `51`
- Previous traffic: `100%`
- Previous deployment time: `2026-07-30T08:03:26.068167Z`
- New deployment ID/version: pending manual deploy

## Redirect ownership and selective scope

The production failure showed that Workers Static Assets `_redirects` did not match the legacy Thai URL. Batch 0.2.2 removes the single native rule and assigns only this legacy path to a selective Worker.

Worker-first patterns:

```toml
run_worker_first = [
  "/รับซื้อโน๊ตบุ๊ค",
  "/รับซื้อโน๊ตบุ๊ค/"
]
```

Wrangler rejected percent-encoded patterns because each exceeded the 100-character route-pattern limit. Local Wrangler QA proved that the two Unicode patterns also match percent-encoded requests after routing normalization.

The Worker:

- matches the production apex host only;
- matches the legacy path with or without a trailing slash;
- returns 301 to the HTTPS non-WWW homepage;
- preserves the complete query string;
- forwards all other requests unchanged to `env.ASSETS.fetch(request)`.

`run_worker_first = true`, `/*`, WWW paths, core paths, and asset-extension paths are not configured. Static Assets across the rest of the site remain asset-first.

## Validation

- `npm ci`: passed
- Astro check: 0 errors, 0 warnings, 85 hints
- Build: 2,460 generated pages
- HTML artifacts: 2,461
- Sitemap/indexable: 371/371
- Noindex: 2,089
- Broken internal links: 0
- Duplicate titles/descriptions: 0/0
- LocalBusiness pages: 4
- SEO validator: 0 errors, 1 known warning
- Worker unit/config validation: 8 request cases passed
- Homepage H1/process section/process cards: 1/1/4
- Legacy redirect HTML artifact: absent
- Legacy URL in sitemap: absent
- Native `_redirects` legacy owner: removed
- Known HOLD orphans: `/รับประมูลคอม/`, `/รับเหมาคอมพิวเตอร์/`

## Local Wrangler QA

Wrangler 4.115.0 accepted the Unicode-only route array and local runtime verified:

- Legacy encoded path with slash: 301
- Legacy encoded path without slash: 301
- Legacy encoded path with query: 301; query preserved
- Homepage: 200
- Core page: 200
- CSS: 200
- Image: 200
- Missing-page control: 404

Wrangler local rewrites the redirect scheme to the local request scheme; the handler unit tests independently verify the production destination is HTTPS.

## Manual deployment

Run from the authenticated production PowerShell session:

```powershell
npx wrangler deployments list --json
npx wrangler deployments status --json
npx wrangler deploy --message "batch 0.2.2 selective legacy redirect a0bbf70d0b7b69de11d3801bf17aee1e2ad11e04"
```

Expected deployment message:

```text
batch 0.2.2 selective legacy redirect a0bbf70d0b7b69de11d3801bf17aee1e2ad11e04
```

New deployment ID, Worker version, production timestamp, and production QA remain pending.

## Production state and safety

- Before Batch 0.2.2, the legacy URL returned 404.
- WWW returning 200 with a non-WWW canonical remains a known warning and is outside this batch.
- `seo-url-audit.csv` remains the user's modified file and was not staged or committed.
- User-owned Lighthouse, PageSpeed, and analysis files were not changed or committed.
- No URL, canonical, robots, sitemap, index/noindex, homepage content, DNS, custom domain, Zone Rule, or Worker name was changed.
- No token or `.env` file was written, logged, staged, or committed.
- No temporary Cloudflare account was used.
