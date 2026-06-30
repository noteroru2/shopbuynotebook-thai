# Final SEO Fix Report — ร้านรับซื้อโน๊ตบุ๊ค.com

> วันที่: 2026-06-30 | สถานะ: **พร้อม review — ยังไม่ commit/push**

## สรุปผล

| รายการ | ก่อน | หลัง |
|--------|------|------|
| URL ทั้งหมดใน repo | ~2,462 | ~2,462 (ไม่ลบหน้า) |
| Sitemap URLs | 2,460 | **372** |
| Tier C (combo) ใน sitemap | 2,088 | **0** |
| Tier C noindex | ไม่มี | **2,088 หน้า** |
| Claim เสี่ยงใน location template | ~87 จังหวัด | แก้แล้ว (~130 ไฟล์) |
| Model links บนหน้าแรก | ~60 chips | **ตัดออก** |

---

## 1. URL Audit

**ไฟล์:** `seo-url-audit.csv` (2,455 แถว)

| ประเภท | จำนวน |
|--------|-------|
| homepage | 1 |
| money | 6 |
| brand | 16 |
| series | ~40 |
| model | ~40 |
| symptom | 44 |
| area | 87 |
| area_combo | 2,088 |
| blog | 119 |
| case | 3 |
| utility | 11 |

**Flags ที่พบ:**
- `near_duplicate_template` — 2,088 combo + หลาย location ที่ใช้ template เดิม
- `risky_claim` — ลดลงหลัง claim cleanup (location files)
- `duplicate_title` / `duplicate_meta` — ลดลงหลังแยก intent money pages

---

## 2. Index Tier Plan

**ไฟล์:** `seo-index-tier-plan.md`

- **Tier A (~180):** money, brand hub, symptom/area หลัก, case study
- **Tier B (~1,194):** series/model, blog, symptom/area รอง
- **Tier C (2,088):** noindex + ตัดจาก sitemap
- **MERGE:** `/รับซื้อโน๊ตบุ๊ค/` → `/` (เดิม)

---

## 3. Money Pages — Intent Map

| หน้า | Title (unique) | H1 Focus |
|------|----------------|----------|
| `/` | รับซื้อโน๊ตบุ๊ค ประเมินฟรี จ่ายเงินสด | บริการหลักร้าน |
| `/รับซื้อโน๊ตบุ๊คมือสอง/` | ...มือสอง ประเมินตามสภาพจริง | เครื่องที่ผ่านการใช้งาน |
| `/รับซื้อ-notebook/` | ...Notebook ประเมินตามสภาพจริง | คำค้นภาษาอังกฤษ |
| `/เช็คราคาโน๊ตบุ๊ค/` | ...ประเมินราคาฟรีก่อนขาย | รู้ราคาก่อนตัดสินใจ |
| `/ขายโน๊ตบุ๊ค/` | ...คู่มือเตรียมเครื่องก่อนส่งมอบ | คู่มือผู้ขาย |
| `/รับซื้อโน๊ตบุ๊ค/macbook/` | ...MacBook ประเมินตามชิปและแบต | MacBook hub |

แต่ละหน้ามี FAQ และ internal links ที่ไม่ชนกันแล้ว

---

## 4. Template Improvements

**ไฟล์:** `src/pages/รับซื้อโน๊ตบุ๊ค/[slug].astro`

- **Brand hub:** intro เน้นซีรีส์หลักของแบรนด์
- **Series:** intro เน้น CPU/GPU รุ่นย่อย อาการที่พบบ่อย
- **Model:** intro เน้นปี สเปก อาการเฉพาะ
- **Symptom:** บล็อก "ประเมินจากอะไร" + "ควรซ่อมก่อนขายไหม"
- ตัดคำ `ราคาดี` จาก enhanced SEO titles

---

## 5. Claim Cleanup

**สคริปต์:** `scripts/claim-cleanup.py` — แก้ **130 ไฟล์**

| คำเสี่ยง | แทนที่ด้วย |
|----------|------------|
| รับทุกยี่ห้อ / ทุกยี่ห้อ | หลายยี่ห้อ |
| รับทุกสภาพ | หลายสภาพตามเงื่อนไข |
| จ่ายเงินทันที | จ่ายเงินหลังตรวจรับและตกลงราคา |
| ราคาดีที่สุด / ให้ราคาสูง | ประเมินตามรุ่น สเปก และสภาพจริง |
| 5-10 นาที | เร็วขึ้นเมื่อข้อมูลครบ |
| ทุกรุ่น (H1 default) | หลายรุ่นยอดนิยม |

**หมายเหตุ:** คำว่า `100%` ใน context เทคนิค (Battery Health, CSS, data wipe standard) ยังคงอยู่ — ไม่ใช่ marketing claim

---

## 6. Sitemap Strategy

**ไฟล์:** `astro.config.mjs`

- Filter decode punycode path แล้วนับ segment หลัง `/รับซื้อโน๊ตบุ๊ค/`
- ถ้า ≥2 segments (location/topic) → ตัดออกจาก sitemap
- **ผลลัพธ์:** sitemap 372 URLs (จาก 2,460)

---

## 7. Internal Links — หน้าแรก

- ตัด `PopularModelChips` (~60 model links) ออกจาก `index.astro`
- คงไว้: BrandGrid, ConditionGrid, HomeFeaturedArticles, HomeCaseStudies, ServiceAreasSection, PopularServicesLinks

---

## 8. QA Results

### Build
```
npm run build — ✅ PASS
```

### Smoke Tests (`scripts/seo-qa.py`)
```
✅ Sitemap ไม่มี hub /รับซื้อโน๊ตบุ๊ค/
✅ Hub child routes: 227 (combo ตัดออกแล้ว)
✅ Internal link "รับซื้อโน๊ตบุ๊ค" → /
✅ Homepage canonical ถูกต้อง
✅ Redirect + child routes ปกติ
✅ Money pages ไม่มี banned phrase
```

### Sitemap Count
- **372 URLs** ใน sitemap (Tier A + B)
- **0 combo URLs** ใน sitemap
- depth distribution: `{1: 227}` ภายใต้ hub (ไม่มี depth 2)

### Noindex (Tier C)
- `[location]/[slug].astro` ตั้ง `noindex={true}`
- Canonical ชี้ตัวเอง — ไม่ conflict

### Claim Words (built HTML)
- คำเสี่ยงหลัก (รับทุกยี่ห้อ, จ่ายเงินทันที, ราคาดีที่สุด) — ตัดออกจากหน้า money และ location combo แล้ว
- คงเหลือบางจุดใน blog/review ที่เป็น context เฉพาะ (เช่น Battery 100%)

---

## ไฟล์ที่สร้าง/แก้

| ไฟล์ | การเปลี่ยนแปลง |
|------|----------------|
| `seo-url-audit.csv` | สร้างใหม่ |
| `seo-index-tier-plan.md` | สร้างใหม่ |
| `final-seo-fix-report.md` | รายงานนี้ |
| `src/data/seo-index-tier.ts` | tier constants |
| `astro.config.mjs` | sitemap filter |
| `src/pages/index.astro` | ตัด model chips, แก้ meta |
| `src/pages/รับซื้อโน๊ตบุ๊ค/[slug].astro` | template + claim |
| `src/pages/รับซื้อโน๊ตบุ๊ค/[location]/[slug].astro` | noindex + claim |
| 6 money pages + macbook.md | intent differentiation |
| ~87 location .md | claim cleanup |
| `scripts/seo-url-audit.py` | audit tool |
| `scripts/claim-cleanup.py` | claim tool |

---

## ขั้นตอนถัดไป (หลัง approve)

1. Review diff ทั้งหมด
2. Commit เมื่อพร้อม
3. Deploy แล้ว submit sitemap ใหม่ใน GSC
4. Monitor index coverage 2-4 สัปดาห์
5. พิจารณา REDIRECT combo → area page ถ้า GSC แสดง soft 404

---

## ยังไม่ได้ทำ (out of scope รอบนี้)

- Redirect 2,088 combo pages (ต้องดู GSC data ก่อน)
- ลบไฟล์ combo (ตาม constraint: ห้ามลบโดยไม่มี redirect plan)
- ปรับเนื้อหา Tier B ทีละรุ่น (series/model unique content เพิ่มเติม)
- Submit re-index request ใน GSC
