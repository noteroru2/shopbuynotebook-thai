# Batch 0.2.1 Production Report

## Verdict

**READY FOR MANUAL DEPLOY**

The Static Assets cleanup is validated, merged, and pushed to `main`. WWW returning 200 is now a non-blocking infrastructure warning because its HTML canonical points to non-`www`. The Codex process cannot access the authenticated PowerShell session environment (`wrangler whoami --json` returned `loggedIn: false`), so deployment is handed off to that session. No temporary account was used.

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

## Final release validation

- Final `npm ci`, Astro check, build, and SEO validation: passed
- Built HTML canonical host issues: 0
- Built Open Graph URL host issues: 0
- Sitemap host issues: 0
- Target WWW hostname occurrences in built HTML/sitemaps: 0
- Homepage H1/process section/process cards: 1/1/4
- Legacy native redirect mapping: present
- Legacy redirect HTML artifact: absent

## Production observations and known warning

Current pre-deploy checks observed:

- HTTPS `www` homepage: 200, no `Location`
- HTTPS `www` nested Thai path with query: 200, no `Location`
- Followed request: 200 without a redirect hop

**KNOWN WARNING: WWW RETURNS 200 WITH NON-WWW CANONICAL**

This warning is deferred to Batch 0.3 and does not block the legacy redirect/Homepage hotfix release. The legacy `/รับซื้อโน๊ตบุ๊ค/` redirect remains undeployed; the last production check returned 404.

Run from the already authenticated production PowerShell session:

```powershell
npx wrangler deployments list --json
npx wrangler deployments status --json
npx wrangler deploy --message "batch 0.2 native redirects 01b26a42529b09e3e0d79d13748addf0f917e555"
```

Post-deploy HTTP QA and the new deployment/version IDs remain pending.

## Safety

- `seo-url-audit.csv` remains the user's pre-existing modified file and was not staged or committed.
- User-owned Lighthouse, PageSpeed, and analysis files were not changed or committed.
- No other content URL changed.
- No canonical, robots, or noindex behavior changed.
- No token or `.env` file was written, logged, staged, or committed.
- No temporary Cloudflare account was used.
