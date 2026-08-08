# Content Strategy — Sitewide Quality Upgrade

**Goal:** ลด doorway / template sameness โดยไม่ทำลาย URL หรือ indexability ของหน้าหลัก

## Pillars

1. **Intent differentiation** — money pages แยกบทบาทชัด (รับซื้อ / มือสอง / notebook EN / เช็คราคา / ตีราคา / ขาย)
2. **Entity uniqueness** — brand / series / model / condition มีจุดตรวจและ FAQ เฉพาะอาการหรือรุ่น
3. **Geo honesty** — province/location บอกชัดว่าหน้าร้านอยู่อุบลฯ ไม่ใช่สาขา; district stuffing จำกัด
4. **Evidence-first conversion** — ส่งรูป สเปก อาการก่อนนัด; ไม่สัญญาเวลา/ราคาปลอม
5. **Tier discipline** — combo location×topic คง Tier C noindex; ไม่ merge/ลบโดยไม่มี GSC

## Inventory snapshot (หลัง regenerate)

| Bucket | Count (approx) | Indexable |
|--------|----------------|-----------|
| Static money/utility | 22 | yes |
| Brand / Series / Model | 96 | yes |
| Condition | 44 | yes |
| Province + district/location | 87 | yes |
| Blog | 122+ hub | yes |
| Combo Tier C | summary row only | **no** (unchanged) |

## Improved this round

- Location bodies ×87 (8 archetypes)
- Core money + homepage FAQ
- Thin condition / select brand-model / symptom blog deepen
- QA scripts: `inventory:content`, `gate:content`

## Deferred

- Combo content depth / potential merge
- Mass model MacBook thin-body polish beyond gate PASS
- Production crawl verification (see `20-production-verification.md`)
- GSC-driven URL deletion

## Quality bar

- No fake branches, fake reviews, fixed SLA minutes
- Gate: `scripts/seo/content-quality-gate.mjs` → local **349 PASS**
- Overall verdict expected: **PASS WITH WARNING** until post-deploy crawl
