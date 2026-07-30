# Batch 0.2.1 — Static Assets Redirect Cleanup

## Verdict

**READY FOR MANUAL DEPLOY**

## Why the Worker host redirect was removed

Production `www` requests already receive a correct Cloudflare Zone Rule 301 to the HTTPS apex host, including nested paths and query strings. The repository Worker duplicated that responsibility and `run_worker_first = true` unnecessarily routed every Static Assets request through Worker code.

The cleanup restores the original Static Assets-first architecture:

- WWW redirect owner: Cloudflare Zone Redirect Rule
- Legacy homepage alias owner: Native Static Assets `_redirects`
- Static content owner: Workers Static Assets

## Files changed

Removed:

- `worker/index.js`
- `scripts/validate-worker-routing.mjs`

Updated:

- `package.json`: removed `validate:worker-routing`
- `wrangler.toml`: removed Worker `main`, `ASSETS` binding, and `run_worker_first`
- `scripts/validate-seo.mjs`: added Static Assets architecture regression checks

`public/_redirects` was preserved unchanged with:

```text
/รับซื้อโน๊ตบุ๊ค/ / 301
```

## Wrangler before and after

Before:

```toml
name = "shopbuynotebook-thai"
compatibility_date = "2024-03-20"
main = "./worker/index.js"

[assets]
directory = "dist"
binding = "ASSETS"
run_worker_first = true
```

After:

```toml
name = "shopbuynotebook-thai"
compatibility_date = "2024-03-20"

[assets]
directory = "dist"
```

Worker name, compatibility date, assets directory, and deployment target remain unchanged.

## Validation

- `npm ci`: passed
- Astro check: 0 errors, 0 warnings, 85 hints
- Build: passed, 2,460 generated pages
- HTML artifacts: 2,461
- Sitemap/indexable: 371/371
- Noindex: 2,089
- Broken links: 0
- Duplicate titles/descriptions: 0/0
- LocalBusiness pages: 4
- SEO validator: 0 errors, 1 known warning
- Homepage H1/process section/process cards: 1/1/4
- Native legacy redirect: exactly one mapping
- Redirect HTML artifact: absent
- Redirect source in sitemap: absent
- Worker host redirect and `run_worker_first`: absent
- Known HOLD orphans: `/รับประมูลคอม/`, `/รับเหมาคอมพิวเตอร์/`

## Release and production status

- Cleanup commit: `71e801f5eeeaa5f9c7a404603837c07d08a836d1`
- Merge/production candidate SHA: `01b26a42529b09e3e0d79d13748addf0f917e555`
- Previous/current deployment ID: `a3257653-c97b-4d37-8168-4eb095749668`
- Previous/current Worker version and rollback version: `9721267c-41a2-4392-99e3-6839cbbccf97`
- New deployment ID/version: not created
- Assets uploaded: none

Production WWW currently returns 200 for the homepage and nested path/query. This is recorded as:

**KNOWN WARNING: WWW RETURNS 200 WITH NON-WWW CANONICAL**

The warning is non-blocking under the revised release policy. Final validation passed, built canonical/Open Graph/sitemap hosts are consistently non-`www`, and the target WWW hostname has zero occurrences in built output.

The Codex process cannot access the authenticated PowerShell session environment, so no upload was attempted. Deploy manually from that authenticated session:

```powershell
npx wrangler deployments list --json
npx wrangler deployments status --json
npx wrangler deploy --message "batch 0.2 native redirects 01b26a42529b09e3e0d79d13748addf0f917e555"
```

The legacy native redirect and full production QA remain pending. WWW redirect infrastructure work moves to Batch 0.3.

## Scope and safety confirmations

- `seo-url-audit.csv` was not edited further, staged, or committed.
- User-owned untracked files were not changed or committed.
- No other URL was changed.
- Canonical, robots, sitemap inclusion, and noindex policies were not changed.
- No temporary account was used.
- No Cloudflare token was printed, written to a file, or committed.
