# Batch 1B.1 — Fresh GSC Evidence Reconciliation and HOLD Resolution

## Verdict

**PASS — NO REDIRECT IMPLEMENTATION REQUIRED**

Fresh 2026-07-30 GSC evidence was reconciled against Batch 1B and the current build. No redirect candidate satisfies the exact-target gate: every fresh 404 example has two-dimensional location × entity intent, while each available hub preserves at most one dimension. No source, redirect, Worker, Wrangler, canonical, robots, noindex, sitemap, internal-link, content or production change was made.

## Release and Git identity

- Batch 1B commit: `29597f628026a5845edbbe1473b20ff2f288a7c0`
- Batch 1B was not merged into `main` at audit start; this branch was created directly from the Batch 1B commit to preserve its required outputs without merging.
- No `.tmp-batch1b/` content exists in Batch 1B Git history.

## Fresh coverage baseline

- Latest chart date: 2026-07-24
- Indexed: 523
- Non-indexed: 2058
- 404: 1788; export contains 1000 examples and omits 788 because of the GSC 1,000-row cap.
- Crawled-not-indexed: 62/62
- Excluded by noindex: 140/140
- Page with redirect: 27/27
- Alternate canonical: 20/20
- Discovered-not-indexed: 21/21
- Valid examples: 523

The Batch 1B missing evidence is resolved: all 140 noindex examples and all 21 discovered-not-indexed examples are present. Every discovered crawl value is Excel serial 25569 and is treated as missing/never crawled, not a real 1970 crawl.

## Reconciliation against Batch 1B

- Same status: 301
- Status changed: 43
- New fresh examples: 1426
- Missing from fresh examples: 623

Absence from the fresh 404 sample is not interpreted as removal from GSC because 788 issue URLs are outside the capped export.

## HOLD resolution

- Original HOLD rows reviewed: 4
- Resolved valid: 3
- Resolved other/not in fresh issue examples: 0
- Remaining HOLD: 1

Each row and its fresh evidence is recorded in `hold-resolution.csv`.

## Fresh 404 target ambiguity

- Fresh examples reviewed: 1000
- Unique areas: 87
- Unique entity/model/condition slugs: 116
- Entity targets that are current indexable pages: 1000
- Rows with two valid but semantically partial targets: 1000
- High-confidence exact redirects: 0
- Confirmed `KEEP_404`: 1000

The observed entity-target count is 1000, compared with the preliminary expectation of 902. This audit uses the actual current build, sitemap and self-canonical evidence. No 404 is redirected automatically merely because its third-level slug exists as a top-level page.

## Noindex review

140/140 fresh noindex examples passed the combined production/build gate: HTTP 200, meta noindex, absent from sitemap, self-canonical and no redirect. Recommended action is `KEEP_NOINDEX`; the audit does not recommend indexing all 140 pages.

## Redirect and canonical review

- Redirect examples passing the strict permanent 301/308 → 200, no-loop and query-preservation gate: 2/27
- Initial permanent redirects: 2; initial temporary 307 redirects: 24; no longer redirects: 1
- Final response 200: 27/27; query preserved: 27/27; loops: 0
- The 24 temporary redirects are trailing-slash normalization behavior. The remaining example no longer redirects. This audit records both outcomes for a separate infrastructure-policy decision and does not change routing.
- Alternate canonical examples returning 200 with non-WWW canonical: 20/20
- Known warning retained: `WWW RETURNS 200 WITH NON-WWW CANONICAL`
- WWW infrastructure was not changed.

## Discovered-not-indexed priority audit

- P0: 1
- P1: 8
- P2: 4
- P3: 8

All 21 URLs are assessed individually for source/build existence, production HTTP, indexability, sitemap, canonical, title, H1, inbound links, orphan state, content size and robots accessibility. Recommendations are monitoring/prioritization only; no internal links were changed.

## Crawled-not-indexed review

- URLs reviewed: 62
- Current intentional noindex: 15
- Indexable pages held for monitoring/quality review: 47
- Canonical mismatches: 0

The audit does not assume every crawled-not-indexed URL should be indexed.

## Scope anomaly

`/รับซื้อโน๊ตบุ๊ค/กล้องเสีย/` decision: **KEEP** (high confidence).

The route describes a notebook with a defective built-in webcam/camera. Its title, H1, canonical and placement in the notebook-condition taxonomy are in scope; it is not a camera-product buying page. The fresh 404 sample contains 13 location × `กล้องเสีย` examples, which remain `KEEP_404` because neither a location hub nor the generic condition page preserves both intent dimensions.

## Decision gate for Batch 1C

High-confidence exact-match redirects: **0**.

No candidate meets all ten gates. Therefore no redirect implementation batch is required from this evidence. A future Batch 1C should exist only if stronger historical, backlink or query evidence identifies a single exact target.

## Validation baseline

Validation passed after output generation:

- `npm run check`: PASS — 0 errors, 0 warnings, 85 hints
- `npm run build`: PASS — 2,460 pages
- `npm run validate:seo`: PASS — 371 indexable, 2,089 noindex, 0 broken links, 0 errors and 1 known orphan-page warning
- Homepage process/cards baseline: 1/1/4

## Guardrails

- Audit-only; no source behavior changes.
- Raw GSC Excel exports were read from Downloads and not copied or committed.
- Temporary scripts/build output are excluded from commit.
- Protected user files remain untouched and unstaged.
- No merge and no deploy.
