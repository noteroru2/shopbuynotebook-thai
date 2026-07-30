# Batch 2A.2 — Cross-template Duplicate Wording Remediation

## 1. Executive summary

**PASS — DUPLICATED WORDING REMOVED AND MERGED**

## 2. Root cause

All 75 source occurrences were literal frontmatter duplication in 40 files under `src/content/brands/`. The shared brand route template reads `pageH1` and `description`; it did not create the duplication by concatenation.

## 3. Source occurrences before/after

- Before: 75 exact source occurrences
- After: 0 exact source occurrences

## 4. Files affected and minimal-fix rationale

- Source occurrences before: 75
- Source occurrences after: 0
- Source files changed: 40
- Shared template files changed: 0
- Change method: exact literal replacement in the inventoried files
- Minimal-fix rationale: remove only the adjacent duplicate and preserve all other wording, formatting, frontmatter, search intent, and page structure.

## 5. Built pages affected and changed fields

- Mapped content pages: 40
- Built pages containing the phrase before: 28
- Generated occurrences before: 194
- Generated occurrences after: 0
- Title, meta description, H1, body, and JSON-LD schema checks: PASS

Detailed evidence is in `static-verification.csv`.

## 6. Global source and dist search

- Global exact source search: 0
- Global exact \`dist\` search: 0
- The intended single word \`ยอดนิยม\` remains in every remediated field.

## 7. Route and indexability regression

- Route inventory: 2461 before / 2461 after — PASS
- Canonical mapping unchanged — PASS
- Robots/indexability mapping unchanged — PASS
- Sitemap hash unchanged — PASS
- Redirect, Worker, and Wrangler configuration changed — NO

## 8. Validation

- \`npm run check\`: PASS (0 errors, 0 warnings; 85 existing hints)
- \`npm run build\`: PASS (2,460 pages)
- \`npm run validate:seo\`: PASS (0 errors; 1 known warning)
- Indexable/noindex: 371 / 2,089
- Broken links: 0
- Duplicate titles/descriptions: 0 / 0
- LocalBusiness page set unchanged
- Homepage H1/process/cards: 1 / 1 / 4

## 9. Browser QA

18 responsive cases passed: 9 representative pages at 390×844 and 1440×900. Coverage includes Huawei, Acer, ASUS, Dell, HP, Lenovo, MSI, the high-occurrence Acer Nitro 16 page, and MacBook.

Verified: one H1, no duplicate phrase in title/meta/H1/body/schema, breadcrumb present, CTA present, no horizontal overflow, no broken images, and no unsupported office/branch claim.

## 10. Known warning

`KNOWN HOLD ORPHANS: /รับประมูลคอม/, /รับเหมาคอมพิวเตอร์/`

## 11. Files intentionally untouched

`seo-url-audit.csv`, `lighthouse-home-baseline.json`, `pagespeed-mobile.json`, and `scripts/analyze-homepage-dist.py` were not modified by this batch and will not be staged or committed.

## 12. Evidence files

- `occurrence-inventory.csv`
- `affected-pages.csv`
- `root-cause-report.md`
- `changed-occurrences.csv`
- `static-verification.csv`
- `browser-qa.csv`

## 13. Source integrity and rollback notes

The word diff confirms each content edit removes one adjacent duplicate only. Routes, canonical URLs, robots directives, sitemap membership, source templates, and application behavior remain unchanged.

Rollback is the normal Git revert of the implementation commit or the no-ff merge commit. No Cloudflare rollback is applicable because this batch has no deployment.

## 14. Git workflow

Implementation branch: `codex/batch-2a-2-duplicate-wording-remediation`. Commit and merge SHAs are reported in the final handoff after Git operations complete.

## 15. Deployment recommendation

Do not deploy as part of Batch 2A.2. The merged static-content change is ready for a separately authorized production release.
