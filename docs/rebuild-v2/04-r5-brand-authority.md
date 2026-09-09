# R5 — Brand Authority Rebuild

Date: 2026-09-09
Status: `SOURCE_IMPLEMENTED / PRE_MIGRATION_NOINDEX`

## Objective

Give each major notebook brand one clear parent owner under `/แบรนด์/{slug}/`, stop the legacy brand-hub URL from competing, and preserve existing series/model URLs that already have search history.

## R5 staged brands

Priority 1:
- MacBook
- ASUS
- Lenovo
- HP
- Acer

Priority 2:
- Dell
- Microsoft Surface

Priority 3:
- MSI

All R5 owner pages remain `noindex` until the production migration gate proves real HTTP redirects.

## GSC evidence used

Historical page-level Search Console data (2026-06-01 through 2026-09-06) shows useful signals including:

- ASUS ROG Flow: 2 clicks / 6 impressions
- Lenovo Legion Pro 7: 2 clicks / 2 impressions
- Lenovo Legion Pro: 1 click / 2 impressions
- ThinkPad X1 Carbon: 1 click / 2 impressions
- HP Omen 16: 1 click / 2 impressions
- HP brand hub: 5 impressions, average position about 11.6
- Acer brand hub: 12 impressions
- Acer Predator Triton: 2 impressions, average position about 7
- Dell brand hub: 1 impression, position 9
- MacBook brand hub: 2 impressions, average position about 8.5
- MacBook Pro M3 / M4: historical top-10 samples
- Surface brand hub: 17 impressions
- Surface Laptop: 2 impressions, average position about 2.5
- Surface Pro: 1 impression, position 1
- MSI Katana 15: historical impression signal

These samples are small and are not treated as stable ranking guarantees. They are used only to choose migration priority and to identify URLs that should not be deleted or mass-moved.

## Ownership rule

Legacy brand hubs become staging losers:

- `/รับซื้อโน๊ตบุ๊ค/asus/` → `/แบรนด์/asus/`
- `/รับซื้อโน๊ตบุ๊ค/acer/` → `/แบรนด์/acer/`
- `/รับซื้อโน๊ตบุ๊ค/lenovo/` → `/แบรนด์/lenovo/`
- `/รับซื้อโน๊ตบุ๊ค/hp/` → `/แบรนด์/hp/`
- `/รับซื้อโน๊ตบุ๊ค/dell/` → `/แบรนด์/dell/`
- `/รับซื้อโน๊ตบุ๊ค/msi/` → `/แบรนด์/msi/`
- `/รับซื้อโน๊ตบุ๊ค/macbook/` → `/แบรนด์/macbook/`
- `/รับซื้อโน๊ตบุ๊ค/surface/` → `/แบรนด์/surface/`

Before production migration, `BrandLayout` forces those exact legacy hubs to `noindex` and canonicalizes them to the new owners.

## What R5 intentionally does NOT migrate

Series and model URLs remain at their existing paths in this batch. Examples:

- `/รับซื้อโน๊ตบุ๊ค/asus-rog-flow/`
- `/รับซื้อโน๊ตบุ๊ค/lenovo-legion-pro-7/`
- `/รับซื้อโน๊ตบุ๊ค/thinkpad-x1-carbon/`
- `/รับซื้อโน๊ตบุ๊ค/hp-omen-16/`
- `/รับซื้อโน๊ตบุ๊ค/acer-predator-triton/`
- `/รับซื้อโน๊ตบุ๊ค/macbook-pro-m3/`
- `/รับซื้อโน๊ตบุ๊ค/macbook-pro-m4/`
- `/รับซื้อโน๊ตบุ๊ค/surface-laptop/`
- `/รับซื้อโน๊ตบุ๊ค/surface-pro/`

Moving brand hubs and model winners simultaneously would make attribution harder and increase migration risk. Model namespace decisions belong to R6.

## Internal-link rule

Each new Brand Owner links down to a small evidence-backed set of series/model pages. Brand pages should not try to own model queries themselves.

## Production migration requirement

No real HTTP 301 is claimed in R5. Before merge/release:

1. `npm run gate:rebuild-v2`
2. `npm run gate:rebuild-v2:r5`
3. `npm run check`
4. `npm run build`
5. verify every new Brand Owner returns 200 + self-canonical and remains noindex until migration switch
6. verify every legacy brand hub has a real HTTP 301 to its new owner at the hosting layer
7. verify model/series winners remain 200 and unchanged
8. crawl internal links and sitemap after redirect activation

## Verdict

`R5_SOURCE_PASS_PENDING_BUILD_AND_HTTP_REDIRECT_PROOF`
