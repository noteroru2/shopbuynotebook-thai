# NOTEBOOK REBUILD V2 — R0 Baseline

Date: 2026-09-09 (Asia/Bangkok)
Branch: rebuild/notebook-v2-r0-r3
Production baseline SHA: 7ffe148a6ceed8b9a6cb8d393f7d45adf6505259

## Verdict

FULL_ARCHITECTURE_REBUILD_RECOMMENDED

Keep the domain and preserve URLs with search or link equity. Rebuild information architecture, query ownership, index policy, and legacy lifecycle before opening new V2 routes to indexing.

## Frozen evidence

### Search Console

- 2026-07-13..2026-08-09: 3 clicks / 84 impressions / CTR 3.57% / avg position 21.21
- 2026-08-10..2026-09-06: 3 clicks / 76 impressions / CTR 3.95% / avg position 50.09
- 2026-08-01..2026-08-09: avg position 13.88
- 2026-08-10..2026-08-17: avg position 46.50
- Homepage accumulated substantial irrelevant review-intent visibility (notebook review queries) instead of clean ownership for core buy intent.

### Repository history

- Site previously generated roughly 2,400+ programmatic URLs.
- June 30 cleanup documented ~2,462 repo URLs and 2,088 location x topic near-duplicate combo routes.
- Combo URLs were later removed from sitemap and set noindex.
- August 8 authority/content phase retained a 371-indexable sitemap baseline.

## Root-cause model

1. Historic index/crawl bloat from location x topic combinations.
2. Too many indexable URLs for the demand and authority currently demonstrated in GSC.
3. Commercial intent split across homepage, buy, price-check, valuation, sell, model and blog URLs.
4. Brand / model / condition / location entities flattened into one `/รับซื้อโน๊ตบุ๊ค/[slug]/` namespace.
5. Model-level expansion happened before core hubs had stable authority.
6. Portfolio overlap means this domain needs a distinct Notebook Specialist identity.

## R0 freeze rules

Until the V2 migration gate passes:

- Do not deploy new indexable programmatic pages.
- Do not mass-edit titles/H1s on existing winners.
- Do not delete or redirect a URL with historical clicks/impressions without a lifecycle row.
- Do not redirect unrelated legacy URLs to homepage.
- New V2 hub routes remain noindex until migration release.
- Existing source-of-truth production remains main; rebuild work stays on the rebuild branch.

## Protected historical signals sampled from GSC

These are not an exhaustive export; they are explicit protection seeds for migration review:

- `/รับซื้อโน๊ตบุ๊ค/macbook-pro-m3/`
- `/รับซื้อโน๊ตบุ๊ค/macbook-pro-m4/`
- `/รับซื้อโน๊ตบุ๊ค/hp-omen-16/`
- `/รับซื้อโน๊ตบุ๊ค/lenovo-legion-pro-7/`
- `/รับซื้อโน๊ตบุ๊ค/lenovo-legion-pro/`
- `/รับซื้อโน๊ตบุ๊ค/thinkpad-x1-carbon/`
- `/รับซื้อโน๊ตบุ๊ค/asus-rog-flow/`
- `/รับซื้อโน๊ตบุ๊ค/เปิดไม่ติด/`
- `/รับซื้อโน๊ตบุ๊ค/กรุงเทพ/`
- `/รับซื้อโน๊ตบุ๊ค/อุบลราชธานี/`
- `/รับซื้อโน๊ตบุ๊ค/ภาคอีสาน/`
- `/รับซื้อโน๊ตบุ๊ค/กาฬสินธุ์/คีย์บอร์ดเสีย/`
- `/รับซื้อโน๊ตบุ๊ค/ฉะเชิงเทรา/เครื่องเก่า/`
- `/ขายโน๊ตบุ๊ค/`
- `/ตีราคาโน๊ตบุ๊ค/`
- `/รับซื้อโน๊ตบุ๊คมือสอง/`
- `/blog/โน๊ตบุ๊คติดรหัส-windows-ขายได้ไหม/`

## External-link gate

Ahrefs batch analysis could not be executed in-chat because the connected Ahrefs plan returned `Insufficient plan`. Therefore no URL may move to GONE_410 solely from this document. Before production migration, backlink evidence must be checked via another available source or a supplied export.

## R0 gate

Status: PASS_WITH_BACKLINK_DATA_GAP

R1 Query Ownership, R2 target architecture and R3 lifecycle policy may proceed on the rebuild branch. Production migration remains blocked until lifecycle + backlink protection + build/crawl gates pass.
