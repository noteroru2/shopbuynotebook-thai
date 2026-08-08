# Pre-merge release gate

**Branch:** `content/sitewide-quality-indexability-upgrade`  
**Date:** 2026-08-08  
**Commands run:**

```bash
node scripts/seo/pre-merge-content-qa.mjs
node scripts/seo/content-quality-gate.mjs
node scripts/seo/build-url-inventory.mjs
```

## Automated results (latest)

| Check | Result |
|-------|--------|
| Province similarity **critical** | **0** |
| Province similarity **high** | **0** |
| Province similarity **medium** | **1** (สุโขทัย\|\|แพร่, max 0.653 — acceptable band) |
| Unsupported marketing claims | **0** (claim hits = 68, all `Valid_negation`; no true unsupported marketing left) |
| Content quality gate | 349 files → **304 PASS** / **45 PASS_WITH_WARNING** / **0 FAIL** |
| Exact duplicate titles (problematic) | **0** |
| Inventory | 372 rows, 371 indexable, avg score **84.5**, `highSimilarity: 0` |

## URL preservation

From `17-url-preservation.csv` (and inventory regen this run):

| Metric | Delta |
|--------|-------|
| URLs removed | **0** |
| URLs renamed | **0** |
| Money-page redirects added | **0** |

**URL preservation summary: 0 / 0 / 0**

## Homepage score note

- Homepage `/` inventory score: **91** (`Strong`) in `02-quality-baseline.csv`
- Sitewide average: **~84.5** (Good/Strong dominant; 6 “Needs improvement”, mostly shorter model pages)

**Homepage metric:** PASS is allowed (score ≥85 Strong).  
`PASS_WITH_WARNING` for homepage is **not required** in this round — only needed if homepage fell into ~84–90 *and* had unresolved trust/intent issues. Current homepage copy has clear transactional intent, Ubon storefront note, and CTA; treat as **PASS**.

Sitewide average ~84–85 remains acceptable for merge because it is driven by shorter model/series pages, not homepage failure.

## Manual sample (`22-manual-content-sample.csv`)

- Sample size: **≥120** rows (generated from opened source files across homepage, all money pages, 15 brand hubs, 10+ series, 20+ models, 30+ provinces, 15+ conditions, 20+ blogs)
- **Manual FAIL: 0**
- Warnings only (e.g. `missing_storefront_clarity` from automated gate on some province bodies) — not release blockers
- Spot-check fix applied: Cyrillic typo `จоแตก` → `จอแตก` in `src/content/blog/โน๊ตบุ๊คเสียขายได้ไหม.md` description (real issue; not a FAIL after fix)

## Claims remediation

- True unsupported marketing claims after remediation: **0**
- Remaining claim-register rows are **Valid_negation** (and any idiom/context exceptions if present) — OK for release

## Intent matrix

See `24-money-page-intent-matrix.csv` for the 10 primary money/home URLs. Overlap risk is Low–Medium with intentional differentiation (quote vs method vs prep vs B2B vs EN spelling).

## Ready to merge

**YES**

Gates satisfied:

1. Province critical/high similarity = 0/0  
2. Unsupported claims = 0  
3. Manual FAIL = 0  
4. URL preservation 0/0/0  
5. Homepage Strong (91) — PASS without homepage warning exception  

Residual accepted (non-blocking): medium province pair สุโขทัย–แพร่; some province `PASS_WITH_WARNING` for storefront phrasing; shorter model pages; production crawl parity still post-deploy (`20-production-verification.md`).
