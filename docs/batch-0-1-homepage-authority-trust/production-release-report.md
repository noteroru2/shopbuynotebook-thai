# Batch 0.1 + Batch 1A Production Release Report

## Verdict

**PASS WITH WARNING — MERGED AND DEPLOYED**

The release is live and the production HTML matches the release candidate. Two pre-existing delivery-level warnings remain: the legacy hub redirect is an Astro static redirect document (`200` plus immediate meta refresh) rather than an HTTP `3xx`, and the `www` hostname serves the same document with a canonical to the non-`www` Unicode hostname rather than redirecting.

## Release identity

- Source branch: `codex/batch-0-1-homepage-authority-trust`
- Branch SHA: `2c351744adad1415854a5d47fd118e7a69db9e74`
- Merge method: fast-forward to `main`
- Merge SHA: `2c351744adad1415854a5d47fd118e7a69db9e74`
- Production SHA: `2c351744adad1415854a5d47fd118e7a69db9e74`
- Worker: `shopbuynotebook-thai`
- Previous deployment ID: `a64a3736-c955-4186-af4a-8c92317c1901`
- Previous version ID / rollback version: `fb8ea924-1391-4733-9cf9-58dc15484dd7`
- New deployment ID: `a3257653-c97b-4d37-8168-4eb095749668`
- New Worker version ID: `9721267c-41a2-4392-99e3-6839cbbccf97`
- Deployment message: `release 2c351744adad1415854a5d47fd118e7a69db9e74`
- Deployment time: `2026-07-30T04:39:38.242445Z`
- Workers.dev URL: `https://shopbuynotebook-thai.noteroru2.workers.dev`
- Production URL: `https://ร้านรับซื้อโน๊ตบุ๊ค.com/`
- Authentication: Wrangler OAuth authenticated as the existing production account; no temporary account or token was used or recorded.

Wrangler read 5,052 files from `dist`, uploaded 93 new or modified assets, reused 2,477 existing assets, and deployed version `9721267c-41a2-4392-99e3-6839cbbccf97` at 100%.

## Validation

Commands:

```text
npm ci
npm run check
npm run build
npm run validate:seo
```

Results:

- Clean install: passed (422 packages)
- Astro check: 0 errors, 0 warnings, 85 non-blocking hints
- Production build: passed
- Generated pages: 2,460
- HTML route artifacts: 2,462
- Indexable routes: 371
- Noindex routes: 2,090
- Sitemap URLs: 371
- Broken internal links: 0
- Duplicate titles: 0
- Duplicate descriptions: 0
- Noindex URLs in sitemap: 0
- LocalBusiness pages: 4 (`/`, `/ติดต่อเรา/`, `/รับซื้อโน๊ตบุ๊ค/อุบลราชธานี/`, `/เกี่ยวกับเรา/`)
- Validator errors: 0
- Validator warning: 1; indexable orphan pages `/รับประมูลคอม/` and `/รับเหมาคอมพิวเตอร์/`

The prior audit reported 372 sitemap URLs; the release build and production both consistently expose 371. This report does not infer the missing URL without a detached baseline build comparison.

## Production verification

Verification used cache-busting query strings and `Cache-Control: no-cache`. Browser-based visual QA was not available; verification used HTTP responses and HTML/XML parsing.

- Unicode/non-`www` production host: HTTP 200
- Punycode host `xn--42cn4aobed0eb6hubj4es0m5dhvd.com`: HTTP 200
- HTTP to HTTPS: 301, then HTTP 200
- `www` host: HTTP 200; document canonical points to the non-`www` Unicode host
- Workers.dev deployment URL: HTTP 200
- Homepage title: `รับซื้อโน๊ตบุ๊ค ประเมินตามรุ่น สเปก และสภาพจริง | ร้านรับซื้อโน๊ตบุ๊ค.com`
- Homepage canonical: `https://ร้านรับซื้อโน๊ตบุ๊ค.com/`
- Homepage: one H1; LocalBusiness JSON-LD, navigation, footer, LINE and telephone links present
- Core money, service, location, brand, condition, blog, About and Contact samples: HTTP 200
- `/robots.txt`: HTTP 200
- `/sitemap-index.xml`: HTTP 200
- Sitemap child: HTTP 200 with 371 URLs
- Static Astro CSS asset: HTTP 200
- Unknown release-check URL: HTTP 404
- Cross-product `/รับซื้อโน๊ตบุ๊ค/กรุงเทพ/acer/`: HTTP 200 with `noindex,nofollow`; absent from sitemap
- `/รับซื้อโน๊ตบุ๊ค/`: HTTP 200 static redirect document with `<meta http-equiv="refresh" content="0;url=/">` and root canonical; no HTTP `Location` header

No redirect loop, staging canonical, sitemap 404, or sampled noindex-in-sitemap defect was found. The deployed title and HTML confirm that the release candidate assets are live.

## Safety and remaining holds

- No source code was changed during the release.
- No URL, slug, canonical, redirect mapping, robots policy, noindex policy or sitemap inclusion rule was added or modified during the release.
- `seo-url-audit.csv` remains the user's pre-existing modified file and was not edited, staged or committed.
- No `.env`, secret, build output or temporary visualization file is included in the release/report commit.
- GSC-dependent actions remain on hold: sitemap submission/inspection, indexing requests, coverage validation and post-release search-performance monitoring.
- Follow-up candidates: replace the static meta-refresh redirect with an edge HTTP redirect if desired; choose and enforce one `www`/non-`www` host; investigate the two indexable orphan pages; reconcile the historical 372 sitemap baseline with a detached baseline build.
