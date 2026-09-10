# R6 — Model / Series Triage

Date: 2026-09-09
Branch: `rebuild/notebook-v2-r0-r3`

## Verdict

`SOURCE_TRIAGE_IMPLEMENTED / BUILD_GATE_NOT_EXECUTED / PRODUCTION_BLOCKED`

R6 reduces the legacy model/series index surface by replacing the old implicit rule (nearly every non-brand slug could remain indexable) with an explicit evidence-based manifest.

## Decision classes

- `KEEP_CURRENT_URL` — historical GSC click or meaningful near-page-one evidence. Preserve the current URL and do not migrate in R6.
- `MIGRATE_LATER` — strong business value and/or deep verified content, but not enough stable search evidence to justify changing URL now.
- `HOLD_NOINDEX` — no meaningful search evidence and not required in the initial authority surface. Page remains accessible but is noindex and excluded from sitemap in the rebuild branch.
- `MERGE` — overlapping intent with a stronger owner. Page is noindex and sitemap-excluded now; HTTP redirect is deferred until the production redirect layer is proven.

Unclassified model/series slugs default to `HOLD_NOINDEX`.

## Protected historical winners

The R6 gate requires these to remain `KEEP_CURRENT_URL`:

- `asus-rog-flow`
- `lenovo-legion-pro-7`
- `lenovo-legion-pro`
- `thinkpad-x1-carbon`
- `hp-omen-16`
- `acer-predator-triton`
- `lenovo-legion-slim`
- `macbook-pro-m3`
- `macbook-pro-m4`
- `surface-laptop`
- `surface-pro`

Additional evidence-backed current-URL keeps are recorded in `src/data/rebuild-v2-model-series-triage.json`.

## Enforcement

R6 is enforced in three places:

1. `src/data/rebuild-v2-model-series-triage.json` — machine-readable lifecycle manifest.
2. `src/layouts/BrandLayout.astro` — `HOLD_NOINDEX` and `MERGE` pages are forced noindex; MERGE pages point canonical at the recorded target during staging.
3. `astro.config.mjs` — HOLD/MERGE model-series URLs, legacy R5 brand hubs, and all V2 staging namespaces are excluded from generated sitemap until migration release.

## Guard

Run:

```bash
npm run gate:rebuild-v2:r6
```

The gate fails if:

- an authority inventory model/series row has no explicit R6 classification;
- a triage slug is not present in the authority inventory;
- a protected historical winner is moved away from `KEEP_CURRENT_URL`;
- a MERGE row lacks a target;
- BrandLayout enforcement disappears;
- sitemap enforcement disappears.

## Migration rule

R6 does **not** perform model/series HTTP redirects and does not move protected winner URLs. URL migration belongs to a later release only after build validation, backlink review where available, redirect-layer proof, and production migration QA.

## Production status

Do not merge to production yet. Required before merge:

- `npm run gate:rebuild-v2`
- `npm run gate:rebuild-v2:r5`
- `npm run gate:rebuild-v2:r6`
- `npm run check`
- `npm run build`
- generated sitemap audit
- preview crawl confirming KEEP pages remain indexable and HOLD/MERGE pages are noindex
- HTTP redirect-layer validation before any MERGE redirect is activated
