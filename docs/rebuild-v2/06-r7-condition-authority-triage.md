# R7 — Condition Authority Triage

Date: 2026-09-09

## Objective
Reduce the legacy condition/problem surface to a small evidence-backed commercial authority set without deleting useful content or moving the one condition owner with clear historical page-one evidence.

## Classification
- KEEP_CURRENT_URL: 1
- MIGRATE_LATER: 12
- HOLD_NOINDEX: 26
- MERGE: 5
- Total conditions classified: 44

## Protected historical owner
`/รับซื้อโน๊ตบุ๊ค/เปิดไม่ติด/` remains on its current URL. Historical GSC showed 5 impressions at approximately position 7.6. The sample is small, so it is treated as migration protection evidence, not as a stable ranking guarantee.

## Core commercial conditions retained for later migration
จอแตก, แบตเสื่อม, โดนน้ำ, เครื่องเสีย, เครื่องเก่า, ไฟไม่เข้า, คีย์บอร์ดเสีย, บานพับแตก, เมนบอร์ดเสีย, จอมีเส้น, ไม่มีที่ชาร์จ, ร้อนจัดดับเอง.

These remain on their current URLs during staging. R7 does not mass-migrate them into `/อาการ/` yet.

## Merge candidates
- macbook-screen-crack -> `/รับซื้อโน๊ตบุ๊ค/จอแตก/`
- macbook-battery-health -> `/รับซื้อโน๊ตบุ๊ค/แบตเสื่อม/`
- macbook-battery-swollen -> `/รับซื้อโน๊ตบุ๊ค/แบตเสื่อม/`
- macbook-keyboard-issue -> `/รับซื้อโน๊ตบุ๊ค/คีย์บอร์ดเสีย/`
- ฝาหลังบวม -> `/รับซื้อโน๊ตบุ๊ค/แบตเสื่อม/`

R7 only applies noindex + canonical staging behavior. HTTP 301 redirects remain blocked until the production migration gate proves targets and one-hop routing.

## Condition vs Blog ownership
Condition pages own commercial intent: sell, buy, valuation, and how a specific device condition affects an offer.

Blog pages own educational intent: diagnosis, causes, troubleshooting, repair guidance, comparisons, and explanatory material. A Blog article must not replace a stronger commercial condition owner for the same transactional query cluster.

## Safety
- Unclassified conditions default to HOLD_NOINDEX.
- HOLD/MERGE conditions are removed from sitemap.
- V2 `/อาการ/` remains staging-only and noindex.
- No 410 release.
- No production redirect claimed.
- Production `main` remains untouched.

## Verdict
`R7_SOURCE_PASS / EXECUTABLE_GATE_NOT_VERIFIED / BUILD_NOT_VERIFIED / PRODUCTION_BLOCKED`
