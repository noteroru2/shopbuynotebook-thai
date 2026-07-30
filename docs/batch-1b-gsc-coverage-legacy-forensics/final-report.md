# Batch 1B — GSC Coverage and Legacy URL Forensics

## 1. Executive summary

Verdict: **PASS WITH WARNING — FORENSICS COMPLETE WITH MISSING GSC EXAMPLES**

This audit matched 967 URL examples from the 2026-06-21 Google Search Console exports against the current Astro build, sitemap, canonical output, noindex output, route templates and page-level Performance export. It made no redirect, routing, content, canonical, robots, sitemap, noindex, Worker or production changes.

The dominant finding is a retired dynamic-route family: none of the 886 URLs reported as 404 on 2026-06-21 has an exact route in the current build. Although many have a generic brand, model or condition page, that page is not an equivalent replacement because it discards location intent. All 886 therefore remain `KEEP_404`; no homepage fallback or mass redirect is proposed.

## 2. Data sources

- GSC Coverage Valid export: `xn--42cn4aobed0eb6hubj4es0m5dhvd.com-Coverage-Valid-2026-06-21.xlsx`
- GSC 404 drilldown: `xn--42cn4aobed0eb6hubj4es0m5dhvd.com-Coverage-Drilldown-2026-06-21.xlsx`
- GSC Page with redirect drilldown: `xn--42cn4aobed0eb6hubj4es0m5dhvd.com-Coverage-Drilldown-2026-06-21 (1).xlsx`
- GSC Alternate canonical drilldown: `xn--42cn4aobed0eb6hubj4es0m5dhvd.com-Coverage-Drilldown-2026-06-21 (2).xlsx`
- GSC Crawled-not-indexed drilldown: `xn--42cn4aobed0eb6hubj4es0m5dhvd.com-Coverage-Drilldown-2026-06-21 (3).xlsx`
- GSC Performance export: `xn--42cn4aobed0eb6hubj4es0m5dhvd.com-Performance-on-Search-2026-06-21.xlsx`
- Current repository at `569070d6491cc933f65b3ddb5ea0bc8aff014aa9`
- Current `dist`, `sitemap-0.xml`, source templates, `wrangler.toml`, Worker routing tests and SEO validator
- Existing `seo-url-audit.csv` was intentionally not read as an implementation input, modified or staged because it is a protected user file.

Missing evidence:

- No Excluded by noindex drilldown/export with URL examples was present.
- No Discovered – currently not indexed drilldown/export with URL examples was present.
- The supplied Coverage snapshot contains 512 valid URL examples, 886 404 examples, 25 redirect examples, 10 alternate-canonical examples and 46 crawled-not-indexed examples. It does not support the later approximate baseline counts in the request, so those approximate figures are not substituted for export data.
- Page-level Performance covers 47 URLs. The query sheet contains 11 rows totaling 1 clicks and 33 impressions; URLs outside that sheet have no row-level click/impression evidence.

## 3. Coverage baseline

| Export category | URL examples available | Audit treatment |
| --- | ---: | --- |
| Valid | 512 | Context only |
| Not found (404) | 886 | Fully mapped |
| Page with redirect | 25 | Fully mapped |
| Alternate page with proper canonical | 10 | Fully mapped |
| Crawled – currently not indexed | 46 | Fully mapped |
| Excluded by noindex | Missing | Current build inventory only; no GSC URL examples invented |
| Discovered – currently not indexed | Missing | No GSC URL examples invented |

## 4. Current route inventory

The baseline build produced 2,460 Astro pages and 2,461 HTML routes including the 404 artifact. The SEO validator reported 371 indexable routes, 2,089 noindex routes, 371 sitemap URLs, zero broken internal links, zero duplicate titles, zero duplicate descriptions and the two known HOLD orphans.

For every GSC URL example, the action map records build existence, expected HTTP behavior, sitemap inclusion, canonical, page type, source/template evidence and internal-link count. Build-derived HTTP values are explicitly labeled as expected values; this audit did not issue a 967-request production crawl.

Current inventory summary:

- `index.html` route artifacts inventoried: 2460; the validator's 2,461 total also includes `404.html`
- Non-noindex `index.html` artifacts: 372; one is the legacy redirect artifact excluded from the 371-URL sitemap
- Noindex `index.html` artifacts: 2088; `404.html` accounts for the validator's 2,089th noindex route
- Sitemap URLs: 371
- Dynamic templates: `src/pages/รับซื้อโน๊ตบุ๊ค/[slug].astro` and `src/pages/รับซื้อโน๊ตบุ๊ค/[location]/[slug].astro`
- Blog template: `src/pages/blog/[slug].astro`
- Selective Worker route: exact legacy `/รับซื้อโน๊ตบุ๊ค` forms only

## 5. 404 classification summary

886 GSC 404 examples were examined. 0 now exist in the current build and are `NO_ACTION`. 886 have no current exact route or defensible replacement and remain `KEEP_404`. 0 have a related generic route but require manual evidence because redirecting would discard location intent.

## 6. Crawled-not-indexed findings

All 46 exported examples were checked. 42 are currently intentional noindex routes and need no action. 4 remain `HOLD` for a fresh GSC sample and content-quality review; no indexability change is proposed from the stale snapshot alone.

## 7. Noindex findings

The current build contains 2088 noindex routes, primarily generated location × attribute combinations. The GSC Excluded-by-noindex URL example export is missing, so this audit does not claim row-level reconciliation for that GSC category. Current build validation confirms noindex routes are excluded from the sitemap.

## 8. Redirect findings

All 25 exported examples are `NO_ACTION`. They are expected path, trailing-slash, HTTP or legacy redirect variants. No new redirect is proposed. The already deployed selective legacy redirect remains scoped to the exact Unicode path forms.

## 9. Alternate canonical findings

All 10 examples are `KEEP_CANONICAL`. Most are WWW or slash variants already consolidated by canonical behavior. Known warning remains: **WWW RETURNS 200 WITH NON-WWW CANONICAL**.

## 10. Discovered-not-indexed findings

No Discovered-not-indexed drilldown with URL examples was found. This category is missing evidence and no sample URLs were invented. Obtain a fresh GSC export before any Batch 1C action.

## 11. Pattern groups

- **P01_HOST_PROTOCOL_VARIANT — HTTP or WWW host variant:** 12 URLs; action mix NO_ACTION | KEEP_CANONICAL; risk medium.
- **P02_LOCATION_X_BRAND — Legacy location × brand combination:** 17 URLs; action mix NO_ACTION; risk high: mass redirects can erase location intent and create soft-404 signals.
- **P03_LOCATION_X_CONDITION — Legacy location × condition combination:** 132 URLs; action mix KEEP_404 | NO_ACTION; risk high: mass redirects can erase location intent and create soft-404 signals.
- **P04_LOCATION_X_MODEL — Legacy location × model/series combination:** 779 URLs; action mix KEEP_404; risk high: mass redirects can erase location intent and create soft-404 signals.
- **P05_FLAT_SERVICE_LOCATION_OR_MODEL — Flat service, location, brand, model or condition route:** 20 URLs; action mix NO_ACTION | KEEP_CANONICAL | HOLD; risk medium.
- **P06_BLOG_ROUTE — Blog route:** 3 URLs; action mix NO_ACTION | HOLD; risk medium.
- **P07_TRAILING_SLASH_VARIANT — Trailing-slash variant:** 4 URLs; action mix NO_ACTION; risk medium.

## 12. High-confidence 301 candidates

0 row-level 301 candidates were identified. Candidates are limited to exact host/protocol equivalents with an existing canonical route; there is no homepage fallback and no pattern-wide approval.

## 13. Restore candidates

0 `RESTORE` candidates were identified. No exported URL was found where current source/data should generate a route but the current build omitted it.

## 14. True 404/410 candidates

- `KEEP_404`: 886
- `410`: 0

No 410 is recommended without stronger historical lifecycle evidence. URLs with no exact route and no direct equivalent remain 404.

## 15. Junk URL groups

No broad junk pattern is asserted from the available exports. Malformed, random or parameter-junk examples were not present in sufficient quantity to support a mass rule. Any such URLs found in a future export should default to `KEEP_404`.

## 16. HOLD items

- Row-level HOLD items: 4
- Missing Excluded-by-noindex URL examples
- Missing Discovered-not-indexed URL examples
- Known orphan pages: `/รับประมูลคอม/` and `/รับเหมาคอมพิวเตอร์/`
- Known WWW warning: `WWW RETURNS 200 WITH NON-WWW CANONICAL`

## 17. Risk analysis

The highest risk is mass-redirecting location × brand/model/condition URLs to generic pages or the homepage. That would erase location intent and can be interpreted as a soft 404. A second risk is treating the 2026-06-21 snapshot as current: the current build has materially different route coverage. Batch 1C must re-export GSC and validate any candidate individually before implementation.

## 18. Proposed Batch 1C implementation order

1. Export fresh GSC Coverage drilldowns for all six required categories, especially noindex and discovered-not-indexed.
2. Recheck the 0 exact 301 candidates against live HTTP, current canonical, impressions/clicks and backlink evidence.
3. Manually review 4 HOLD rows, prioritizing P1 rows and preserving location intent.
4. Confirm current 404 rows with live HTTP sampling; keep true junk/never-valid paths at 404 and consider 410 only with deletion evidence.
5. Monitor crawled-not-indexed indexable pages before content changes.
6. Implement in small pattern-specific batches with redirect-chain, sitemap, canonical, noindex and static-asset regression tests.

## 19. Validation baseline

- `npm run check`: PASS — 0 errors, 0 warnings, 85 hints.
- `npm run build`: PASS — 2,460 pages built.
- `npm run validate:seo`: PASS — 2,461 routes, 371 indexable, 2,089 noindex, 371 sitemap, 0 broken links, 0 duplicate titles, 0 duplicate descriptions, 0 errors, 1 known warning.
- Known warning: `KNOWN HOLD ORPHANS: /รับประมูลคอม/, /รับเหมาคอมพิวเตอร์/`.

## 20. Files intentionally untouched

- `seo-url-audit.csv`
- `lighthouse-home-baseline.json`
- `pagespeed-mobile.json`
- `scripts/analyze-homepage-dist.py`
- All source routes, content, canonical, robots, noindex, sitemap and Wrangler configuration
- Production deployment state

No merge and no production deploy were performed.
