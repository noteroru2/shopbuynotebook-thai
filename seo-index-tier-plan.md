# SEO Index Tier Plan — ร้านรับซื้อโน๊ตบุ๊ค.com

> อัปเดต: 2026-06-30 | รวม URL ~2,462 หน้า | เป้าหมาย: โฟกัส crawl budget ไปหน้าที่มี intent ชัด

## สรุป Tier

| Tier | จำนวน (โดยประมาณ) | Index | Sitemap | หมายเหตุ |
|------|-------------------|-------|---------|----------|
| **A** | ~180 | ✅ | ✅ | หน้าเงิน, brand hub, symptom/area หลัก, case study |
| **B** | ~1,194 | ✅ | ✅ | series/model, symptom/area รอง, blog ทั้งหมด |
| **C** | 2,088 | ❌ noindex | ❌ | location×topic combo (thin/near-duplicate) |
| **MERGE** | 1 | redirect | ❌ | `/รับซื้อโน๊ตบุ๊ค/` → `/` |
| **REDIRECT** | 0 | — | — | ไม่เพิ่ม redirect ใหม่ในรอบนี้ (รักษา slug เดิม) |

---

## Tier A — Index + Sitemap (ลำดับความสำคัญสูง)

### Homepage & Money Pages (6 หน้า)
| URL | Intent |
|-----|--------|
| `/` | รับซื้อโน๊ตบุ๊ค (บริการหลัก) |
| `/รับซื้อโน๊ตบุ๊คมือสอง/` | เครื่องมือสอง / มีประวัติใช้งาน |
| `/รับซื้อ-notebook/` | คำค้นภาษาอังกฤษ |
| `/เช็คราคาโน๊ตบุ๊ค/` | อยากรู้ราคาก่อนขาย |
| `/ขายโน๊ตบุ๊ค/` | คู่มือผู้ขาย |
| `/รับซื้อโน๊ตบุ๊ค/macbook/` | MacBook hub |

### Brand Hubs (16 หน้า)
`asus`, `acer`, `lenovo`, `hp`, `dell`, `msi`, `macbook`, `surface`, `gaming`, `samsung`, `huawei`, `lg`, `honor`, `razer`, `gigabyte`, `office`

### Symptom หลัก (8 หน้า)
`จอแตก`, `เปิดไม่ติด`, `เครื่องเสีย`, `แบตเสื่อม`, `ไม่มีที่ชาร์จ`, `macbook-mdm`, `macbook-battery-health`, `ร้อนจัดดับเอง`

### Area หลัก (10 หน้า)
`กรุงเทพ`, `เชียงใหม่`, `ภาคอีสาน`, `ภาคเหนือ`, `ภาคใต้`, `ภาคตะวันออก`, `นนทบุรี`, `ปทุมธานี`, `สมุทรปราการ`, `ชลบุรี`

### Case Studies (3 หน้า)
บทความ `category: กรณีศึกษา` ใน `/blog/`

### Utility
`/พื้นที่ให้บริการ/`, `/วิธีขายโน๊ตบุ๊ค/`, `/คำถามที่พบบ่อย/`, `/เกี่ยวกับเรา/`, `/ติดต่อเรา/`

---

## Tier B — Index + Sitemap (ปรับปรุงเนื้อหาต่อเนื่อง)

- **Series pages** (~40): เช่น `asus-zenbook`, `lenovo-legion-5`
- **Model pages** (~40): เช่น `macbook-air-m5`, `hp-victus-15`
- **Symptom รอง** (36): อาการเฉพาะที่เหลือ
- **Area รอง** (77): จังหวัด/เขตที่เหลือ
- **Blog** (122): บทความทั้งหมด
- **Money pages รอง**: `/ตีราคาโน๊ตบุ๊ค/`, `/เช็คราคาโน๊ตบุ๊คมือสอง/`, `/รับซื้อโน๊ตบุ๊คบริษัท/`, ฯลฯ

**แผนปรับปรุง Tier B:**
1. เพิ่มเนื้อหา unique ต่อรุ่น (สเปก, ปี, อาการเฉพาะ)
2. ลด duplicate title/meta จาก template เดิม
3. Internal link จาก Tier A → Tier B ที่เกี่ยวข้อง

---

## Tier C — Noindex + ไม่อยู่ใน Sitemap

**รูปแบบ:** `/รับซื้อโน๊ตบุ๊ค/{location}/{brand|symptom}/`

- จำนวน: **87 locations × 24 topics = 2,088 หน้า**
- เหตุผล: near-duplicate template, cannibalize กับหน้า area/brand/symptom หลัก
- Implementation:
  - `noindex={true}` ใน `[location]/[slug].astro`
  - Sitemap filter ใน `astro.config.mjs` (decode punycode path + นับ segment)
  - Canonical ยังชี้ตัวเอง (ไม่ conflict กับ noindex)

**ทางเลือกในอนาคต (ยังไม่ทำ):**
- REDIRECT combo → หน้า area หลัก หรือ brand หลัก (ต้องวิเคราะห์ GSC ก่อน)
- MERGE เป็น query param หรือ fragment (ไม่แนะนำ)

---

## MERGE

| จาก | ไป | สถานะ |
|-----|-----|-------|
| `/รับซื้อโน๊ตบุ๊ค/` | `/` | ✅ redirect + noindex อยู่แล้ว |

---

## REDIRECT (แผน — ยังไม่ implement)

ไม่มี redirect ใหม่ในรอบนี้ เพื่อรักษา slug และหลีกเลี่ยง chain redirect

**พิจารณาในอนาคต:**
- `/รับซื้อโน๊ตบุ๊ค/{location}/{slug}/` → `/รับซื้อโน๊ตบุ๊ค/{location}/` (ถ้า GSC แสดง impression สูงแต่ CTR ต่ำ)

---

## Sitemap Strategy

- **รวม:** Tier A + Tier B เท่านั้น (~374 URLs หลังกรอง)
- **ตัดออก:** Tier C (2,088), MERGE hub
- **Priority:** หน้าแรก 1.0 → money 0.9 → hub pages 0.8 → blog 0.7

---

## Internal Link Architecture (หน้าแรก)

หน้าแรกลิงก์ออกเฉพาะ:
- ✅ Money pages หลัก (PopularServicesLinks)
- ✅ Brand หลัก (BrandGrid — 10 brands)
- ✅ Symptom หลัก (ConditionGrid — 8 อาการ)
- ✅ Article หลัก (HomeFeaturedArticles)
- ✅ Case จริง (HomeCaseStudies)
- ✅ Area หลัก (ServiceAreasSection)
- ❌ ตัด PopularModelChips (~60 model links) ออกจากหน้าแรก

---

## ไฟล์อ้างอิง

- `seo-url-audit.csv` — audit ทุก URL
- `src/data/seo-index-tier.ts` — tier constants
- `astro.config.mjs` — sitemap filter
- `scripts/seo-url-audit.py` — regenerate audit
