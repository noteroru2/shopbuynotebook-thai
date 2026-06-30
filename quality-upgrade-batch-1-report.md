# Quality Upgrade Batch 1 — Report

**วันที่:** 30 มิ.ย. 2026  
**สถานะ:** แก้เสร็จแล้ว — **ยังไม่ commit / push / deploy** (รออนุมัติจากรายงานนี้)

---

## สรุปผล

| ตัวชี้วัด | ผล |
|-----------|-----|
| หน้าที่อัปเกรด | 30 หน้า Tier A |
| Sitemap URLs | **372** (ไม่เปลี่ยน) |
| Combo ใน sitemap | **0** |
| Combo noindex | ผ่าน (ตัวอย่าง `กระบี่/acer`) |
| Claim risk (build output) | **0** |
| Duplicate title | **0** |
| `npm run build` | ผ่าน |
| `scripts/seo-qa.py` | ALL PASSED |
| `scripts/seo-final-qa.py` | ผ่าน |

---

## รายชื่อ 30 URL ที่แก้

### A) Money pages (6)

| URL | ไฟล์ | ประเภท |
|-----|------|--------|
| `/` | `src/pages/index.astro` | Money |
| `/รับซื้อโน๊ตบุ๊คมือสอง/` | `src/pages/รับซื้อโน๊ตบุ๊คมือสอง.astro` | Money |
| `/รับซื้อ-notebook/` | `src/pages/รับซื้อ-notebook.astro` | Money |
| `/เช็คราคาโน๊ตบุ๊ค/` | `src/pages/เช็คราคาโน๊ตบุ๊ค.astro` | Money |
| `/ขายโน๊ตบุ๊ค/` | `src/pages/ขายโน๊ตบุ๊ค.astro` | Money |
| `/รับซื้อโน๊ตบุ๊ค/macbook/` | `src/content/brands/macbook.md` | Money / Brand hub |

### B) Brand hubs (8)

| URL | ไฟล์ |
|-----|------|
| `/รับซื้อโน๊ตบุ๊ค/asus/` | `src/content/brands/asus.md` |
| `/รับซื้อโน๊ตบุ๊ค/acer/` | `src/content/brands/acer.md` |
| `/รับซื้อโน๊ตบุ๊ค/lenovo/` | `src/content/brands/lenovo.md` |
| `/รับซื้อโน๊ตบุ๊ค/dell/` | `src/content/brands/dell.md` |
| `/รับซื้อโน๊ตบุ๊ค/hp/` | `src/content/brands/hp.md` |
| `/รับซื้อโน๊ตบุ๊ค/msi/` | `src/content/brands/msi.md` |
| `/รับซื้อโน๊ตบุ๊ค/macbook/` | `src/content/brands/macbook.md` |
| `/รับซื้อโน๊ตบุ๊ค/gaming/` | `src/content/brands/gaming.md` |

### C) Symptom / condition (8)

| URL | ไฟล์ | หมายเหตุ |
|-----|------|----------|
| `/รับซื้อโน๊ตบุ๊ค/เปิดไม่ติด/` | `src/content/conditions/เปิดไม่ติด.md` | |
| `/รับซื้อโน๊ตบุ๊ค/จอแตก/` | `src/content/conditions/จอแตก.md` | |
| `/รับซื้อโน๊ตบุ๊ค/แบตเสื่อม/` | `src/content/conditions/แบตเสื่อม.md` | |
| `/รับซื้อโน๊ตบุ๊ค/คีย์บอร์ดเสีย/` | `src/content/conditions/คีย์บอร์ดเสีย.md` | |
| `/รับซื้อโน๊ตบุ๊ค/บานพับแตก/` | `src/content/conditions/บานพับแตก.md` | |
| `/รับซื้อโน๊ตบุ๊ค/ค้างบ่อย/` | `src/content/conditions/ค้างบ่อย.md` | ใชแทน slug `เครื่องช้า` (ไม่มีใน repo) |
| `/รับซื้อโน๊ตบุ๊ค/โดนน้ำ/` | `src/content/conditions/โดนน้ำ.md` | |
| `/รับซื้อโน๊ตบุ๊ค/macbook-no-box-no-receipt/` | `src/content/conditions/macbook-no-box-no-receipt.md` | ไม่มีกล่อง/ใบเสร็จ |

### D) Blog support (5)

| URL | ไฟล์ |
|-----|------|
| `/blog/วิธีดูรุ่นโน๊ตบุ๊ค-windows-ก่อนส่งประเมินราคา/` | `src/content/blog/วิธีดูรุ่นโน๊ตบุ๊ค-windows-ก่อนส่งประเมินราคา.md` |
| `/blog/วิธีดูสเปก-cpu-ram-ssd-ของโน๊ตบุ๊ค/` | `src/content/blog/วิธีดูสเปก-cpu-ram-ssd-ของโน๊ตบุ๊ค.md` |
| `/blog/โน๊ตบุ๊คเสียขายได้ไหม/` | `src/content/blog/โน๊ตบุ๊คเสียขายได้ไหม.md` |
| `/blog/macbook-ไม่มีกล่อง-ไม่มีใบเสร็จ-ขายได้ไหม/` | `src/content/blog/macbook-ไม่มีกล่อง-ไม่มีใบเสร็จ-ขายได้ไหม.md` |
| `/blog/ก่อนขายโน๊ตบุ๊คต้องล้างข้อมูลอย่างไร/` | `src/content/blog/ก่อนขายโน๊ตบุ๊คต้องล้างข้อมูลอย่างไร.md` |

### E) Case studies (3)

| URL | ไฟล์ |
|-----|------|
| `/blog/กรณีศึกษา-รับซื้อโน๊ตบุ๊คองค์กร-20-เครื่อง-ปลด-asset-tag/` | `src/content/blog/กรณีศึกษา-รับซื้อโน๊ตบุ๊คองค์กร-20-เครื่อง-ปลด-asset-tag.md` |
| `/blog/กรณีศึกษา-รับซื้อโน๊ตบุ๊คบอร์ดเสียช็อต-ค่าซ่อมไม่คุ้ม/` | `src/content/blog/กรณีศึกษา-รับซื้อโน๊ตบุ๊คบอร์ดเสียช็อต-ค่าซ่อมไม่คุ้ม.md` |
| `/blog/กรณีศึกษา-รับซื้อโน๊ตบุ๊คโดนน้ำหก-บอร์ดช็อตเปิดไม่ติด/` | `src/content/blog/กรณีศึกษา-รับซื้อโน๊ตบุ๊คโดนน้ำหก-บอร์ดช็อตเปิดไม่ติด.md` |

---

## สิ่งที่เพิ่มในแต่ละกลุ่ม

### Money pages
- รุ่น/กลุ่มที่ประเมินบ่อย (สายงาน, Gaming, MacBook)
- ข้อมูลที่ควรส่ง / ปัจจัยราคาขึ้น-ลง
- ตัวอย่างเคสประเมิน (ThinkPad, Nitro, MacBook ไม่มีกล่อง)
- Internal links ไป brand / symptom / blog / case ที่ตรง intent

### Brand hubs
- **วิธีดูรุ่น** เฉพาะแบรนด์ (สติ๊กเกอร์, Service Tag, MyASUS, About This Mac ฯลฯ)
- **จุดเสีย/จุดตรวจ** เฉพาะแบรนด์ (บานพับ, ความร้อน, แบต)
- ลิงก์ไป symptom + money page + series ที่เกี่ยวข้อง
- Gaming hub: บล็อกอาการ + ลิงก์ TUF/Nitro/Legion

### Symptom pages
ทุกหน้าที่บางเดิมได้โครงสร้างเดียวกัน:
- อาการนี้ขายได้ไหม
- ประเมินจากอะไร
- ควรซ่อมก่อนขายไหม
- ข้อมูล/รูปที่ควรส่ง
- รุ่นที่ยังมีโอกาสขายได้
- ลิงก์ blog / money / brand ที่เกี่ยวข้อง

### Blog
- เน้น informational intent (ไม่ขายตรงเกิน)
- เพิ่ม internal links ตามกฎ: money 1, brand/symptom/article ที่เกี่ยวข้อง

### Case studies
- บริบทเคส / รุ่น-สเปก-อาการ / วิธีตรวจ / ปัจจัยราคา
- **Claim cleanup:** ลบ `100%`, `10 นาที`, `15 นาที`, `ราคาดี`, `ดีที่สุด`, `ทันที` (ชำระเงิน)
- CTA แบบส่งรูปประเมินเบื้องต้น ไม่ claim เกินจริง

---

## Internal links ที่เพิ่ม/ปรับ (สรุป)

| จาก | ไปหลัก |
|-----|--------|
| Homepage | Asus, Lenovo, Dell, MacBook, Gaming, แบตเสื่อม, จอแตก, เปิดไม่ติด, เช็คราคา, เคสองค์กร |
| มือสอง / Notebook / เช็คราคา / ขาย | brand hubs, symptom, blog วิธีดูรุ่น/สเปก/ล้างข้อมูล, case องค์กร |
| Brand hubs | series (TUF, Nitro, Legion…), symptom (แบต, ร้อน, บานพับ), เช็คราคา |
| Symptom | เช็คราคา, ขาย, blog ที่ตรงอาการ, brand (MacBook/Gaming) |
| Blog | เช็คราคา, มือสอง, symptom, brand (Gaming/MacBook/Asus) |
| Case | Gaming hub, เปิดไม่ติด, โดนน้ำ, องค์กร, MacBook |

ไม่ยัดลิงก์เกินจำเป็น — เน้น 3–6 ลิงก์ต่อหน้าที่ตรง intent

---

## รูป / alt

| หน้า | รูป | หมายเหตุ |
|------|-----|----------|
| เปิดไม่ติด | `/images/conditions/no-power.webp` | ใช้ featuredImage เดิม |
| จอแตก | `/images/conditions/broken-screen.webp` | เดิม |
| แบตเสื่อม | `/images/conditions/battery.webp` | เดิม |
| คีย์บอร์ดเสีย | `/images/conditions/keyboard.webp` | เดิม |
| เคสองค์กร | `/images/blog/corporate-laptop-bulk-buy.webp` | เดิม |
| เคส Gaming บอร์ดช็อต | `/images/blog/acer-nitro-v15-black-screen.webp` | เดิม |
| เคสโดนน้ำ | `/images/blog/meetup-laptop-buy-transaction.webp` | เดิม |
| Blog วิธีดูรุ่น | รูปในเนื้อหาเดิม | ไม่แก้ alt (ไม่มี claim ใหม่) |

ไม่เพิ่ม alt ที่ keyword stuffing หรือ claim แรง

---

## Claim cleanup result

สแกน build output (`dist/`) ผ่าน `scripts/seo-final-qa.py`:

```
claim_hits: 0
```

คำที่สแกน: ราคาสูงสุด, ราคาดีที่สุด, อันดับ 1, รับทุกสภาพ, รับทุกยี่ห้อ, จ่ายเงินทันที, ไม่กดราคา, รับประกันราคา, 100%, 24 ชม., 5-10 นาที

**แก้ใน Batch 1 โดยตรง:**
- เคสองค์กร: ลบ `100%` จาก meta/body, แก้ relatedLinks
- เคส Gaming: ลบ `ราคาดี`, `10 นาที`
- เคสโดนน้ำ: ลบ `15 นาที`, `ดีที่สุด`
- Lenovo hub: แก้ `โอนทันที` → `เมื่อตกลงราคาหลังตรวจรับ`

---

## QA result

```
npm run build          → exit 0
scripts/seo-qa.py      → ALL SMOKE TESTS PASSED
scripts/seo-final-qa.py:
  sitemap_total: 372
  sitemap_combos: 0
  combo_noindex_ok: true
  claim_hits: 0
  duplicate_titles: 0
  money_pages: 6/6 มี title/H1/canonical แยกกัน
```

- **Slug:** ไม่เปลี่ยน
- **Tier C noindex:** ไม่ถูกเปลี่ยนกลับ
- **Sitemap:** ยัง ~372, combo = 0
- **Broken internal links:** ไม่พบจาก build (ลิงก์ชี้ไป path ที่มีใน repo)

---

## สิ่งที่ควรทำ Batch 2

1. **Series/model Tier A/B** — อัปเกรด ROG/TUF, Nitro, Legion, Latitude ด้วย CPU/GPU/ปี/รุ่นย่อยและจุดตรวจเฉพาะรุ่น
2. **Symptom รอง** — ร้อนจัดดับเอง, จอมีเส้น, ไม่มีที่ชาร์จ, MacBook-specific (battery health, MDM)
3. **Location Tier A** — กรุงเทพ/ใหญ่ ๆ แยกเนื้อหาจาก template (ถ้ายังบาง)
4. **Blog cluster** — บทความราคาเท่าไหร่ (transactional) แยก intent จาก money page ชัดขึ้น
5. **Image manifest** — ทบทวน alt ใน `public/images/image-manifest.json` ที่ยังมีคำเสี่ยง (ไม่ได้แตะใน Batch 1)
6. **E-E-A-T** — เพิ่มเคสจริงอีก 3–5 เคส (ThinkPad องค์กร, MacBook แบตบวม, Legion ความร้อน)
7. **Internal link graph** — วาด cluster map ว่า brand → series → symptom ครบหรือยัง

---

## ไฟล์ที่แก้ (สรุป)

- `src/pages/index.astro`
- `src/pages/รับซื้อโน๊ตบุ๊คมือสอง.astro`
- `src/pages/รับซื้อ-notebook.astro`
- `src/pages/เช็คราคาโน๊ตบุ๊ค.astro`
- `src/pages/ขายโน๊ตบุ๊ค.astro`
- `src/content/brands/*.md` (8 ไฟล์)
- `src/content/conditions/*.md` (8 ไฟล์)
- `src/content/blog/*.md` (8 ไฟล์: 5 blog + 3 case)

**รอคำสั่ง:** commit / push / deploy หลังอนุมัติรายงานนี้
