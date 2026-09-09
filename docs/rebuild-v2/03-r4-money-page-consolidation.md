# R4 — Money Page Consolidation

Status: `PASS_WITH_VALIDATION_GAP / PRODUCTION_BLOCKED`

## Goal
Reduce overlapping commercial intent so each high-value query cluster has one canonical owner before any production migration.

## Final owners

| Intent cluster | V2 owner | Decision |
| --- | --- | --- |
| รับซื้อโน๊ตบุ๊ค / รับซื้อ Notebook | `/` | KEEP owner |
| รับซื้อโน๊ตบุ๊คมือสอง | `/รับซื้อโน๊ตบุ๊คมือสอง/` | KEEP protected historical owner |
| เช็คราคา / ตีราคา / ประเมินราคา | `/ประเมินราคา/` | Consolidated owner; staged `noindex` until migration |
| ขายโน๊ตบุ๊ค / ขายด่วน | `/ขายโน๊ตบุ๊ค/` | KEEP + rebuilt seller-flow owner |
| รับซื้อโน๊ตบุ๊คบริษัท / เหมา | `/รับซื้อโน๊ตบุ๊คบริษัท/` | KEEP; out of rewrite scope in R4 |

## Source consolidation completed
Legacy routes now exist only as `noindex` canonical migration stubs in the rebuild branch:

- `/รับซื้อ-notebook/` → `/`
- `/เช็คราคาโน๊ตบุ๊ค/` → `/ประเมินราคา/`
- `/เช็คราคาโน๊ตบุ๊คมือสอง/` → `/ประเมินราคา/`
- `/ตีราคาโน๊ตบุ๊ค/` → `/ประเมินราคา/`
- `/ขายโน๊ตบุ๊คด่วน/` → `/ขายโน๊ตบุ๊ค/`

## Owner upgrades
- `/ประเมินราคา/` now contains the combined valuation method, input requirements, condition/type factors, preliminary-vs-final price explanation, seller decision flow, FAQs and CTA.
- `/ขายโน๊ตบุ๊ค/` now owns the seller flow from submit-data through final inspection.
- Header navigation points directly to the new owners.
- `/รับซื้อโน๊ตบุ๊คมือสอง/` was deliberately not heavily rewritten because it has useful historical search signal.

## Redirect policy
Real HTTP 301 is **not implemented yet**. This repository is currently a static Astro project with no verified hosting adapter/redirect layer in source. Astro static redirects without an adapter may become client-side meta refresh redirects, which is not accepted as the migration release mechanism for this rebuild.

Production Migration Gate must provide real HTTP 301 responses for all R4 loser routes before V2 release.

## Automated guard
`npm run gate:rebuild-v2` verifies deterministic ownership, staging noindex state, loser canonical targets, navigation, combo noindex/sitemap exclusion, production 301 requirement and 410 backlink safety.

## Validation gap
GitHub reports PR #2 mergeable, but the current head has no attached GitHub status checks/workflow runs and the in-chat runtime has not produced a verified Astro build/check for this branch.

Therefore: **do not merge to production yet.**
