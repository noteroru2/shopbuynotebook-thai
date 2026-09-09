# R8 — Area / Location Authority Triage

Status: `R8_SOURCE_PASS / EXECUTABLE_GATE_NOT_VERIFIED / BUILD_NOT_VERIFIED / PRODUCTION_BLOCKED`

## Goal

Reduce the legacy location surface to a small set of evidence-backed local owners before any V2 migration. R8 does not create a nationwide province footprint and does not release HTTP redirects or 410 responses.

## Evidence window

Search Console account: `sc-domain:xn--42cn4aobed0eb6hubj4es0m5dhvd.com`

Window: `2026-03-01..2026-09-06`

Observed legacy location signals:

| Legacy owner | Clicks | Impressions | Avg position | R8 decision |
| --- | ---: | ---: | ---: | --- |
| `/รับซื้อโน๊ตบุ๊ค/อุบลราชธานี/` | 1 | 4 | 5.0 | `KEEP_CURRENT_URL` |
| `/รับซื้อโน๊ตบุ๊ค/นครนายก/` | 1 | 1 | 16.0 | `KEEP_CURRENT_URL` |
| `/รับซื้อโน๊ตบุ๊ค/รังสิต/` | 1 | 2 | 54.0 | `KEEP_CURRENT_URL` |
| `/รับซื้อโน๊ตบุ๊ค/กรุงเทพ/` | 0 | 2 | 8.0 | `MIGRATE_LATER` |
| `/รับซื้อโน๊ตบุ๊ค/ภาคอีสาน/` | 0 | 3 | 3.33 | `MIGRATE_LATER` |
| `/รับซื้อโน๊ตบุ๊ค/เลย/` | 0 | 1 | 9.0 | `MIGRATE_LATER` |
| `/รับซื้อโน๊ตบุ๊ค/สกลนคร/` | 0 | 2 | 19.0 | `MIGRATE_LATER` |
| `/รับซื้อโน๊ตบุ๊ค/พระราม2/` | 0 | 2 | 6.5 | merge to Bangkok owner |
| `/รับซื้อโน๊ตบุ๊ค/ห้วยขวาง/` | 0 | 1 | 3.0 | merge to Bangkok owner |
| `/รับซื้อโน๊ตบุ๊ค/รามคำแหง/` | 0 | 1 | 13.0 | merge to Bangkok owner |
| `/รับซื้อโน๊ตบุ๊ค/ลาดพร้าว/` | 0 | 1 | 16.0 | merge to Bangkok owner |

The historical corpus also exposed synthetic `ใกล้ฉัน` combinations. `ใกล้ฉัน` is not treated as a geographic entity owner in V2.

## Lifecycle policy

Explicit actions:

- `KEEP_CURRENT_URL`: 3 — อุบลราชธานี, นครนายก, รังสิต
- `MIGRATE_LATER`: 4 — กรุงเทพ, ภาคอีสาน, เลย, สกลนคร
- `MERGE`: 5 — พระราม2, ห้วยขวาง, รามคำแหง, ลาดพร้าว → กรุงเทพ; ใกล้ฉัน → `/พื้นที่ให้บริการ/`
- `HOLD_NOINDEX`: default for every other unclassified location collection entry

Only seven explicit location owners remain sitemap-eligible at this stage. The exact number of default-held collection rows is intentionally calculated by the executable R8 gate and is not claimed until that gate runs.

## Ownership rules

### Ubon Ratchathani

Ubon is the strongest local owner because it combines real operating relevance with the clearest useful GSC signal. The legacy URL is protected during rebuild. The staged V2 owner `/พื้นที่/อุบลราชธานี/` remains noindex until controlled migration.

### Bangkok

Bangkok owns metro commercial location intent. Neighborhood-level pages are not independent authority nodes unless future durable Search Console demand and operational value justify them.

Current consolidation candidates:

- พระราม2 → กรุงเทพ
- ห้วยขวาง → กรุงเทพ
- รามคำแหง → กรุงเทพ
- ลาดพร้าว → กรุงเทพ

R8 implements only staging `noindex + canonical` for these MERGE candidates. No HTTP 301 is released here.

### Near me

`ใกล้ฉัน` is a query modifier, not a durable geographic entity. Its ownership belongs to `/พื้นที่ให้บริการ/`, where coverage, shipping, appointment and service-area explanations can be handled without generating synthetic local pages.

## Source enforcement

R8 adds:

- `src/data/rebuild-v2-location-triage.json`
- lifecycle enforcement in `src/layouts/LocationLayout.astro`
- sitemap enforcement in `astro.config.mjs`
- executable guard `scripts/seo/rebuild-v2-r8-gate.mjs`
- package script `npm run gate:rebuild-v2:r8`

The sitemap includes a legacy location slug only when R8 explicitly classifies it as `KEEP_CURRENT_URL` or `MIGRATE_LATER`. All other location collection slugs are excluded by default.

## Safety constraints

- Production `main` remains untouched.
- V2 `/พื้นที่/` namespace remains staging-only.
- Only `อุบลราชธานี` is allowed in staged `/พื้นที่/[slug].astro` during R8.
- Staged `/พื้นที่/อุบลราชธานี/` remains `noindex`.
- No HTTP 301 is claimed.
- No HTTP 410 is claimed.
- No new province × brand × condition pages are allowed.
- Page count is not a success metric.

## Required release validation

Before any migration release:

1. `npm run gate:rebuild-v2:r8`
2. `npm run check`
3. `npm run build`
4. inspect generated sitemap membership
5. inspect legacy HOLD/MERGE robots meta and canonical output
6. validate one-hop HTTP redirect map separately before releasing 301s
7. verify no redirect loops/chains and no accidental winner loss

## R8 verdict

`R8_SOURCE_PASS / EXECUTABLE_GATE_NOT_VERIFIED / BUILD_NOT_VERIFIED / PRODUCTION_BLOCKED`

Next logical batch: `R9 — Blog Cleanup / Informational Authority Triage`.
