# Batch 0.2 Production Report

## Verdict

**BLOCKED: DEPLOYMENT FAILED**

The repository implementation, automated validation, merge, and push to `main` completed. The production deployment did not run because this non-interactive environment has no `CLOUDFLARE_API_TOKEN`. Wrangler offered a temporary account, which was not used.

Production HTTPS `www` currently returns 301, but the failed deployment means that response cannot be attributed to this version-controlled Worker implementation. This report therefore does not claim that the Worker host redirect is deployed.

## Release identity

- Worker target: `shopbuynotebook-thai` (unchanged)
- Branch implementation commit: `9100bcb`
- Merge SHA on `main`: `d5feab46610ec9c3f97ed43107bc8711405e4480`
- Repository production SHA: `d5feab46610ec9c3f97ed43107bc8711405e4480`
- Last known deployed implementation SHA: `2c351744adad1415854a5d47fd118e7a69db9e74`
- Previous/current deployment ID: `a3257653-c97b-4d37-8168-4eb095749668`
- Previous/current Worker version and rollback version: `9721267c-41a2-4392-99e3-6839cbbccf97`
- New deployment ID/version: not created

## Redirect ownership

The intended `www` to non-`www` redirect owner changed from a Cloudflare Zone Redirect Rule to the version-controlled Worker entrypoint:

- Worker script: `worker/index.js`
- Exact matched host: `www.xn--42cn4aobed0eb6hubj4es0m5dhvd.com`
- Response: HTTP 301 to HTTPS non-`www`
- Path and query string: preserved
- Non-`www` and unrelated hosts: forwarded unchanged to `env.ASSETS.fetch(request)`

No Zone write permission was requested or used. No Cloudflare Zone Redirect Rule, DNS record, custom domain, Worker name, or temporary account was used or changed.

## Wrangler configuration

The existing `wrangler.toml` values were preserved:

- `name = "shopbuynotebook-thai"`
- `compatibility_date = "2024-03-20"`
- `[assets].directory = "dist"`

The following Worker routing settings were added:

```toml
main = "./worker/index.js"

[assets]
binding = "ASSETS"
run_worker_first = true
```

No existing `not_found_handling`, `html_handling`, observability, or custom-domain setting existed to preserve.

## Automated and local validation

- `npm ci`: passed
- Astro check: 0 errors, 0 warnings, 85 hints
- Build: passed; 2,460 generated pages
- HTML artifacts: 2,461
- Indexable/sitemap: 371/371
- Noindex: 2,089
- Broken links: 0
- Duplicate titles/descriptions: 0/0
- LocalBusiness pages: 4
- SEO validator: 0 errors, 1 known warning
- Worker unit routing: 6/6 passed
- Homepage H1/process section/process cards: 1/1/4

Wrangler 4.115.0 local runtime loaded the `ASSETS` binding and parsed one native redirect rule. Local HTTP checks returned:

- `www` homepage: 301
- `www` nested Thai path with query: 301, original path/query preserved
- Apex homepage: 200 from static assets
- Legacy `/รับซื้อโน๊ตบุ๊ค/`: 301 to `/`
- Missing-page sample: 404

The legacy source has no generated HTML artifact and is absent from the sitemap.

## Production deployment and HTTP QA

Deployment command:

```text
wrangler deploy --message "Batch 0.2 merge d5feab46610ec9c3f97ed43107bc8711405e4480"
```

Wrangler stopped before upload because `CLOUDFLARE_API_TOKEN` is not present in the process, user, or machine environment. Consequently:

- no new deployment ID or Worker version exists;
- production HTTP checks cannot serve as post-deploy evidence for this implementation;
- the existing deployment/version remains the rollback target.

Read-only production checks after the failed deploy attempt observed:

- HTTPS `www` homepage: 301 to HTTPS apex
- HTTPS `www` nested Thai path with query: 301 with path and query preserved
- Apex homepage: 200
- Legacy `/รับซื้อโน๊ตบุ๊ค/`: 404

Because no upload occurred and the legacy native `_redirects` behavior is absent, the current `www` 301 must not be represented as proof that the repository Worker is live.

To finish the release, provide the existing production account's deployment credential, rerun the deploy with the merge SHA message, then execute the complete production HTTP QA matrix. A temporary Cloudflare account must not be used.

## Static assets, SEO, and scope confirmations

- Homepage, core money pages, CSS, images, sitemap, robots, Thai URLs, trailing-slash handling, 404 behavior, and native `_redirects` were exercised by build/validators or local Wrangler checks.
- The native `/รับซื้อโน๊ตบุ๊ค/` mapping remains in `public/_redirects` and no redirect HTML artifact was created.
- Known HOLD orphans remain `/รับประมูลคอม/` and `/รับเหมาคอมพิวเตอร์/`.
- `seo-url-audit.csv` remains the user's pre-existing modified file and was not staged or committed.
- No content URL was added, removed, or otherwise changed by the Worker-host redirect implementation.
- No canonical, robots, sitemap inclusion, or index/noindex policy was changed by the Worker-host redirect implementation.
