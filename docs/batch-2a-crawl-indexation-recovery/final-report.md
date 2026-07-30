# Batch 2A — Crawl Discovery and Indexation Recovery

## 1. Executive summary

**PASS — AUDIT COMPLETE, NO SOURCE CHANGES REQUIRED**

Fresh GSC evidence, current source, the 2,460-page build, production HTTP evidence and responsive browser checks were reconciled. The 9 P0/P1 discovered-not-indexed pages already pass the technical and discovery gates that source changes can safely affect. No content or internal-link edit was made solely to provoke crawling.

## 2. Evidence sources

- Batch 1B forensic outputs and Batch 1B.1 fresh reconciliation outputs
- 21 fresh Discovered — currently not indexed examples
- 62 fresh Crawled — currently not indexed examples
- Remaining HOLD row and the current source/dist build
- Production HTTP/canonical/indexability evidence captured on 2026-07-30
- Mobile 390×844 and desktop 1440×900 local production-build browser QA

## 3. 21 Discovered root causes

- CRAWL_DELAY: 9
- LOW_PRIORITY: 12
- ORPHAN / TECHNICAL_BLOCK / THIN_CONTENT: 0

All 21 have source and dist output, return 200 in the production evidence, are indexable, sitemap-listed, self-canonical, robots-allowed and non-orphan. P0/P1 have 4–18 inbound links and direct parent-hub coverage.

## 4. 62 Crawled-not-indexed decisions

- KEEP_UNINDEXED: 15
- CONSOLIDATE_LATER: 33
- IMPROVE: 5
- NO_ACTION: 9
- HOLD: 0

No redirect, deletion or noindex change is recommended in this batch. The 15 location-child URLs retain their intentional noindex state. Location pages with high template overlap remain a cohort-level future review, not a mass action.

## 5. HOLD resolution

The remaining URL, `/blog/รับซื้อโน๊ตบุ๊คมือสอง-คู่มือผู้ขายฉบับลึก/`, resolves from HOLD to **IMPROVE**. It is current, 200, indexable, sitemap-listed and self-canonical; its next action is a page-specific quality/internal-link pass after longer observation, not routing.

## 6. P0/P1 selected pages

Nine URLs were fully reviewed: one P0 core page and eight P1 model/condition pages. Selected source changes: **0**. Their root cause is CRAWL_DELAY, not a source defect.

## 7. Source changes

None. No URL, redirect, noindex, canonical, robots, sitemap, Worker, Wrangler, template, component or content file changed.

## 8. Internal-link changes

None. Existing P0/P1 inbound counts are 4–18 and every page is linked from a relevant parent. Adding further links without a user-navigation gap would risk link inflation.

## 9. Content differentiation

All P0/P1 titles and H1s are unique. Each page has intent-specific evaluation factors, defects/conditions, service process, CTA and supporting content. The existing Huawei H1 contains a repeated word (`ยอดนิยมยอดนิยม`); it is documented as a low-risk editorial issue and was not changed because no crawl/indexation causality is established.

## 10. Technical validation

- `npm run check`: PASS — 0 errors, 0 warnings, 85 hints
- `npm run build`: PASS — 2,460 pages
- `npm run validate:seo`: PASS — 371 indexable, 2,089 noindex, 371 sitemap URLs, 0 broken links, 0 duplicate titles, 0 duplicate descriptions, 0 errors
- Known orphan warning only: `/รับประมูลคอม/`, `/รับเหมาคอมพิวเตอร์/`
- LocalBusiness page set unchanged at 4
- Homepage H1/process section/process cards unchanged at 1/1/4
- Canonical, robots, sitemap, redirect and Worker configuration unchanged

## 11. Browser QA

All 9 P0/P1 pages passed at mobile 390×844 and desktop 1440×900: one H1, no horizontal overflow, no broken images, working visible links/CTAs, no obvious layout shift and no false branch/office claims. The P0 page exposes BreadcrumbList structured data but not a visible breadcrumb; this is recorded, not treated as a crawl blocker.

## 12. Risks

- GSC crawl scheduling is external and cannot be guaranteed by source edits.
- The 404 export remains capped at 1,000 of 1,788 issue URLs; it is unrelated to this batch’s no-redirect decision.
- Broad rewriting or sitewide links could increase duplication or link noise without evidence of benefit.
- Known warning remains: `WWW RETURNS 200 WITH NON-WWW CANONICAL`.

## 13. GSC monitoring plan

1. Request indexing for the P0 URL first, then the eight P1 URLs in small batches.
2. Confirm sitemap fetch and inspect crawl status after 7–14 days.
3. Compare Discovered/Crawled status after 14–28 days.
4. Escalate to page-specific changes only if a URL remains uncrawled and newer evidence identifies a concrete deficiency.

## 14. Rollback notes

No source rollback is required. Reverting the Batch 2A commit removes documentation only.

## 15. Files intentionally untouched

- `seo-url-audit.csv`
- `lighthouse-home-baseline.json`
- `pagespeed-mobile.json`
- `scripts/analyze-homepage-dist.py`
- All source/content/components, redirect, Worker, Wrangler, canonical, robots and sitemap configuration

## 16. Deployment recommendation

Do not deploy: this branch is audit/report-only. Merge only after review; then perform the GSC monitoring plan. No production deployment was performed.
