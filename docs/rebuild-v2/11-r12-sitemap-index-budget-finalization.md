# R12 — Sitemap / Index Budget Finalization

Status: `SOURCE_IMPLEMENTED / EXECUTABLE_GATE_NOT_VERIFIED / BUILD_NOT_VERIFIED / PRODUCTION_BLOCKED`

## Objective
Turn the R4–R11 lifecycle decisions into a strict sitemap/index budget before production migration.

## Projected indexable surface
R12 uses an explicit allowlist plus lifecycle manifests rather than allowing every static route by default.

- Core / commercial / utility allowlist: 16
- Model / Series (`KEEP_CURRENT_URL` + `MIGRATE_LATER`): 45
- Conditions (`KEEP_CURRENT_URL` + `MIGRATE_LATER`): 13
- Locations (`KEEP_CURRENT_URL` + `MIGRATE_LATER`): 7
- Blog (`KEEP_INFORMATIONAL`): 22
- Projected total: **103 URLs**

Target range: **80–120 indexable URLs**.
Hard ceiling: **120 URLs**.

## Core allowlist
The 16 core paths are explicitly listed in `src/data/rebuild-v2-index-budget.json` and include homepage, protected notebook owner, used-notebook owner, seller flow, service-area hub, B2B/bulk pages, FAQ, service terms, About, Contact, Privacy, Blog hub and HTML sitemap.

## Sitemap behavior
`astro.config.mjs` now defaults static pages to EXCLUDE unless allowlisted.

Controlled rules:
- R6 model/series: only KEEP_CURRENT_URL and MIGRATE_LATER may enter sitemap.
- R7 conditions: only KEEP_CURRENT_URL and MIGRATE_LATER may enter sitemap.
- R8 locations: only KEEP_CURRENT_URL and MIGRATE_LATER may enter sitemap.
- R9 blogs: only KEEP_INFORMATIONAL may enter sitemap.
- R4 retired money URLs remain excluded.
- R5 legacy exact brand hubs remain excluded.
- V2 staged namespaces `/แบรนด์/`, `/รุ่น/`, `/อาการ/`, `/พื้นที่/`, `/ประเมินราคา/` remain excluded while noindex.
- Legacy location × slug combinations at depth 2+ remain excluded.
- URL parsing failure now fails closed (`return false`) instead of silently keeping a page.

## Why 103
The old site had a much larger crawl/index surface relative to current search demand. 103 provides enough coverage for proven and commercially useful owners without returning to programmatic expansion. It is deliberately inside the 80–120 V2 target rather than sitting at the ceiling.

## Release blocking conditions
Production migration remains blocked if any of these occur:
1. projected indexable surface > 120;
2. projected surface < 80 without an explicit architecture decision;
3. HOLD_NOINDEX / MERGE / MERGE_TO_OWNER URLs appear in sitemap;
4. staged V2 noindex namespaces appear in sitemap;
5. an unreviewed static route enters sitemap outside the core allowlist;
6. built sitemap count differs materially from the source projection and is not reconciled.

## Gate
Run:

`npm run gate:rebuild-v2:r12`

The gate recalculates counts directly from R6–R9 manifests, validates the 80–120 budget, checks protected core paths, rejects retired money URLs in the core allowlist, and verifies that Astro consumes all R12 sitemap controls.

## Validation gap
R12 is source-complete, but the connector environment has not executed Node/Astro. The following still require executable evidence before merge:
- `npm run gate:rebuild-v2:r12`
- `npm run check`
- `npm run build`
- inspect generated sitemap and count actual URLs
- confirm no generated noindex page appears in sitemap

## Production safety
- `main` unchanged.
- no HTTP 301/410 released.
- no V2 namespace activated.
- no new location/model/content expansion added.

## Next
R13 — Production Migration Gate: execute all rebuild gates, build the site, establish the hosting redirect layer, map each staged legacy loser to a real HTTP response, verify sitemap/canonicals/noindex, then decide GO / NO_GO for merge.
