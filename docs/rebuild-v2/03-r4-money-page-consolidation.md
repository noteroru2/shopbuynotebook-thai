# R4 — Money Page Consolidation

Status: `IMPLEMENTED_ON_REBUILD_BRANCH / PRODUCTION_BLOCKED`

## Goal
Reduce overlapping commercial intent so each high-value query cluster has one canonical owner before any production migration.

## Owners

| Intent cluster | V2 owner | Decision |
| --- | --- | --- |
| รับซื้อโน๊ตบุ๊ค / รับซื้อ Notebook | `/` | KEEP owner |
| รับซื้อโน๊ตบุ๊คมือสอง | `/รับซื้อโน๊ตบุ๊คมือสอง/` | KEEP protected historical owner |
| เช็คราคา / ตีราคา / ประเมินราคา | `/ประเมินราคา/` | NEW consolidated owner, staged noindex |
| ขายโน๊ตบุ๊ค / ขายด่วน | `/ขายโน๊ตบุ๊ค/` | KEEP + rebuild as seller-flow owner |
| รับซื้อโน๊ตบุ๊คบริษัท / เหมา | `/รับซื้อโน๊ตบุ๊คบริษัท/` | KEEP; out of rewrite scope in R4 |

## Loser routes in branch
The following routes remain present only as migration stubs. They are `noindex` and canonicalize to the selected owner so preview builds do not preserve duplicate money-page content:

- `/รับซื้อ-notebook/` → `/`
- `/เช็คราคาโน๊ตบุ๊ค/` → `/ประเมินราคา/`
- `/เช็คราคาโน๊ตบุ๊คมือสอง/` → `/ประเมินราคา/`
- `/ตีราคาโน๊ตบุ๊ค/` → `/ประเมินราคา/`
- `/ขายโน๊ตบุ๊คด่วน/` → `/ขายโน๊ตบุ๊ค/`

## Redirect policy
Do **not** claim HTTP 301 is implemented yet. Current project is Astro static with no verified adapter/hosting redirect layer in repo. Astro static redirect configuration can fall back to client-side meta refresh when no adapter is installed. Real HTTP 301 rules are a Production Migration Gate requirement.

## Safety
- Production `main` unchanged.
- `/รับซื้อโน๊ตบุ๊คมือสอง/` is protected from heavy rewrite because historical GSC showed useful ranking signal.
- No new V2 route is indexable yet.
- No GONE/410 action is released in R4.
