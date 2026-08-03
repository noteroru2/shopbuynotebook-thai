# Batch 3 — Condition metadata (18 pages)

## Scope
Fix weak titles from audit ISS-004; soften default condition H1.

## Files
- `src/pages/รับซื้อโน๊ตบุ๊ค/[slug].astro` — condition title/H1 fallbacks
- 18 files under `src/content/conditions/` with unique `seoTitle` + `pageH1`

## Samples after build
- จอแตก → `รับซื้อโน๊ตบุ๊คจอแตก ประเมินตามรุ่นและสภาพชิ้นส่วนที่เหลือ | …`
- เปิดไม่ติด → `ขายโน๊ตบุ๊คเปิดไม่ติดได้ไหม ส่งอาการให้ร้านประเมินก่อน | …`

## Rules followed
- Transactional buyback intent, unique per page, no “ราคาสูงที่สุด”, no root cannibalization

## Commit
`4419906`
