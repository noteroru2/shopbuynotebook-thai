# R9 — Blog Cleanup / Informational Authority Triage

Status: `R9_SOURCE_IMPLEMENTED / EXECUTABLE_GATE_NOT_VERIFIED / BUILD_NOT_VERIFIED / PRODUCTION_BLOCKED`

## Goal

Turn `/blog/` into a deliberately small informational authority layer instead of a second commercial SEO surface that competes with homepage, money, brand, model and condition owners.

R9 is a staging/source batch. It does not release HTTP redirects or 410 responses and does not modify production `main`.

## Evidence window

Search Console account: `sc-domain:xn--42cn4aobed0eb6hubj4es0m5dhvd.com`

Window: `2026-03-01..2026-09-06`

Important observed signals include:

| Blog URL / topic | Clicks | Impressions | Avg position | R9 treatment |
| --- | ---: | ---: | ---: | --- |
| โน๊ตบุ๊คติดรหัส Windows ขายได้ไหม | 1 | 6 | 8.83 | KEEP_INFORMATIONAL |
| case: board short / repair not worthwhile | 0 | 6 | 5.5 | KEEP_INFORMATIONAL |
| case: corporate 20 units / asset tag | 0 | 4 | 5.25 | KEEP_INFORMATIONAL |
| โน๊ตบุ๊คจอแตกยังมีราคาไหม | 0 | 2 | 1.5 | KEEP_INFORMATIONAL |
| โน๊ตบุ๊คเสียขายได้ไหม | 0 | 2 | 1.5 | KEEP_INFORMATIONAL |
| HDD vs SSD effect on valuation | 0 | 1 | 2.0 | KEEP_INFORMATIONAL |
| RAM 8GB vs 16GB effect on valuation | 0 | 1 | 5.0 | KEEP_INFORMATIONAL |
| รับซื้อโน๊ตบุ๊ค คู่มือครบวงจรสำหรับผู้ขาย | 0 | 3 | 4.67 | MERGE_TO_OWNER → `/` |
| รับซื้อโน๊ตบุ๊ค ราคาเท่าไหร่ | 0 | 8 | 4.25 | HOLD_NOINDEX pending `/ประเมินราคา/` release |
| Surface Laptop/Pro ราคาเท่าไหร่ | 0 | 2 | 2.0 | HOLD_NOINDEX pending model/brand owner |
| Dell Alienware G-series ราคาเท่าไหร่ | 0 | 1 | 3.0 | HOLD_NOINDEX pending model owner |
| ขายโน๊ตบุ๊คที่ไหนดี | 0 | 9 | 34.0 | MERGE_TO_OWNER → `/ขายโน๊ตบุ๊ค/` |

The query-level export also showed `ขายโน๊ตบุ๊คที่ไหนดี` against the matching blog, confirming direct commercial sell intent rather than a neutral information-only query.

## Lifecycle policy

R9 actions:

- `KEEP_INFORMATIONAL` — unique informational, diagnostic, preparation, data-safety or evidence/case-study content that can remain an independent blog owner.
- `MERGE_TO_OWNER` — commercial overlap whose ownership already has a stable destination. R9 stages `noindex + canonical` only; HTTP 301 is deferred to migration QA.
- `HOLD_NOINDEX` — valuable/uncertain URLs or commercial overlaps whose intended V2 destination is not release-ready. These are protected from premature redirect/deletion.
- `RETIRE_CANDIDATE` — reserved for genuinely obsolete/no-value URLs; R9 does not release 410.
- every unclassified legacy blog defaults to `HOLD_NOINDEX`.

## Why page-one blogs are not blindly deleted

Several blogs have low-volume but strong positions. A low-impression page at position 1–5 still proves Google can understand and test that URL for a specific intent. R9 therefore separates intent quality from raw traffic volume.

Examples such as screen-damage questions, broken-notebook questions, data preparation and real case studies remain informational owners. Commercial pages such as `รับซื้อโน๊ตบุ๊ค ราคาเท่าไหร่` are not allowed to remain permanent competing owners, but strong signals are held until the correct target is migration-ready.

## Source enforcement

R9 adds:

- `src/data/rebuild-v2-blog-triage.json`
- lifecycle enforcement in `src/pages/blog/[slug].astro`
- reviewed-owner filtering in `src/pages/blog/index.astro`
- sitemap enforcement in `astro.config.mjs`
- executable guard `scripts/seo/rebuild-v2-r9-gate.mjs`
- package script `npm run gate:rebuild-v2:r9`

### Blog route behavior

- `KEEP_INFORMATIONAL` → indexable, self-canonical.
- `MERGE_TO_OWNER` → noindex, canonical to the stable owner.
- `HOLD_NOINDEX` → noindex, self-canonical.
- `RETIRE_CANDIDATE` → noindex, self-canonical until migration release.
- unclassified → default `HOLD_NOINDEX`.

No HTTP redirect/410 logic is implemented in the blog route.

### Blog hub behavior

`/blog/` lists only `KEEP_INFORMATIONAL` posts. This prevents the blog hub from continuing to distribute internal authority to held or commercially overlapping posts.

### Sitemap behavior

Only explicit `KEEP_INFORMATIONAL` blog posts remain blog-detail sitemap candidates. `/blog/` itself remains available as the informational hub.

## Protected migration signals

These commercial-overlap URLs must be revisited in R13 rather than deleted:

- `/blog/รับซื้อโน๊ตบุ๊ค-ราคาเท่าไหร่/` — page-one signal, future price owner is still staged.
- `/blog/รับซื้อ-surface-laptop-pro-ราคาเท่าไหร่/` — avg position 2.0.
- `/blog/รับซื้อ-dell-alienware-g-series-ราคาเท่าไหร่/` — avg position 3.0.
- MacBook Air M1/M2/M4 price articles — map to released model owners only after one-hop redirect QA.
- Gaming RTX 3050/4050/4060 price article — map to the released Gaming/model owner after architecture validation.

## Safety constraints

- Production `main` untouched.
- No HTTP 301 released.
- No HTTP 410 released.
- No mass deletion of blog source files.
- No redirect to an unreleased/noindex V2 owner.
- Strong GSC URLs are protected explicitly.
- Page count is not a KPI.

## Required validation before release

1. `npm run gate:rebuild-v2:r9`
2. `npm run check`
3. `npm run build`
4. inspect generated sitemap blog membership
5. inspect robots/canonical output for KEEP, HOLD and MERGE examples
6. verify `/blog/` exposes only KEEP informational owners
7. R13 validates any eventual one-hop 301 map and prevents redirect chains/loops

## R9 verdict

`R9_SOURCE_IMPLEMENTED / EXECUTABLE_GATE_NOT_VERIFIED / BUILD_NOT_VERIFIED / PRODUCTION_BLOCKED`

Next logical batch: `R10 — Internal Link Authority Rebuild`.
