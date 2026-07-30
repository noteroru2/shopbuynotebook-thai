# Batch 0.2.1 Production Report

## Verdict

**BLOCKED: CLOUDFLARE AUTHENTICATION**

The Static Assets cleanup was validated, merged, and pushed to `main`, but it was not deployed. `wrangler whoami --json` returned `{"loggedIn":false}` in the production deploy session. No temporary account was used.

## Release identity

- Cleanup branch: `codex/batch-0-2-1-static-assets-redirect-cleanup`
- Cleanup commit: `71e801f5eeeaa5f9c7a404603837c07d08a836d1`
- Merge/production candidate SHA: `01b26a42529b09e3e0d79d13748addf0f917e555`
- Worker target: `shopbuynotebook-thai` (unchanged)
- Last known deployed implementation SHA: `2c351744adad1415854a5d47fd118e7a69db9e74`
- Previous/current deployment ID: `a3257653-c97b-4d37-8168-4eb095749668`
- Previous/current Worker version and rollback version: `9721267c-41a2-4392-99e3-6839cbbccf97`
- New deployment ID/version: not created
- Deployment timestamp/assets uploaded: not applicable

## Architecture and redirect ownership

- Cloudflare Zone Redirect Rule owns HTTPS `www` to HTTPS non-`www`.
- Native Static Assets `public/_redirects` owns `/รับซื้อโน๊ตบุ๊ค/` to `/`.
- Worker host redirect, Worker routing validator, Worker entrypoint, `main`, `ASSETS` binding, and `run_worker_first` were removed.
- Static Assets remains configured with `directory = "dist"`.

No DNS, routes, custom domains, Worker name, Zone Redirect Rule, canonical, robots, sitemap inclusion, or index/noindex policy was changed.

## Validation

- `npm ci`: passed
- Astro: 0 errors, 0 warnings, 85 hints
- Build: 2,460 generated pages
- HTML artifacts: 2,461
- Sitemap/indexable: 371/371
- Noindex: 2,089
- Broken links: 0
- Duplicate titles/descriptions: 0/0
- LocalBusiness pages: 4
- Validator: 0 errors, 1 known warning
- Homepage H1/process section/process cards: 1/1/4
- Native redirect mapping: present exactly once
- Legacy redirect HTML artifact: absent
- Legacy redirect source in sitemap: absent
- Worker entrypoint and `run_worker_first`: absent
- Known HOLD orphans: `/รับประมูลคอม/`, `/รับเหมาคอมพิวเตอร์/`

## Production observations

Before cleanup, production checks confirmed:

- HTTPS `www` homepage: 301 to HTTPS apex
- HTTPS `www` nested path: 301 with path preserved
- HTTPS `www` query request: 301 with path/query preserved
- Redirect chain: one redirect, final 200, no loop

These responses predate deployment of this candidate and confirm the Zone Rule owns the canonical-host redirect.

The legacy `/รับซื้อโน๊ตบุ๊ค/` redirect remains undeployed; the last production check returned 404. No post-deploy QA can be claimed until authentication succeeds and SHA `01b26a42529b09e3e0d79d13748addf0f917e555` is deployed.

## Safety

- `seo-url-audit.csv` remains the user's pre-existing modified file and was not staged or committed.
- User-owned Lighthouse, PageSpeed, and analysis files were not changed or committed.
- No other content URL changed.
- No canonical, robots, or noindex behavior changed.
- No token or `.env` file was written, logged, staged, or committed.
- No temporary Cloudflare account was used.
