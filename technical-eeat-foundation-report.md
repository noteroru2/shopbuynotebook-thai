# Technical + E-E-A-T Foundation Report

**โปรเจกต์:** ร้านรับซื้อโน๊ตบุ๊ค.com  
**วันที่:** 30 มิ.ย. 2026  
**สถานะ:** แก้ไขใน repo แล้ว — **ยังไม่ commit / push / deploy** (รออนุมัติจากรายงานนี้)

---

## สรุปผล QA (local build)

| ตัวชี้วัด | เป้าหมาย | ผลลัพธ์ |
|-----------|----------|---------|
| Sitemap URLs | 372 | **372** ✓ |
| Combo ใน sitemap | 0 | **0** ✓ |
| Tier C noindex | true | **true** ✓ (ตัวอย่าง: `รับซื้อโน๊ตบุ๊ค/กระบี่/acer/`) |
| Duplicate title | 0 | **0** ✓ |
| Claim hits (RISKY) | 0 | **0** ✓ |
| Broken internal links | 0 | **0** ✓ (ตรวจ 78,842 ลิงก์ใน `dist/`) |
| `npm run build` | pass | **pass** ✓ |
| `python scripts/seo-qa.py` | pass | **pass** ✓ |
| `python scripts/seo-url-audit.py` | pass | export 2,460 URLs |
| `python scripts/seo-final-qa.py` | pass | ดู JSON ด้านล่าง |
| `python scripts/check-broken-links.py` | pass | **ใหม่ในรอบนี้** |
| `python scripts/live-seo-smoke.py` | pass | **ไม่สำเร็จจากสภาพแวดล้อมนี้** — sitemap ไม่ตอบ (ดูหมายเหตุ) |

### `seo-final-qa.py` snapshot

```json
{
  "sitemap_total": 372,
  "sitemap_combos": 0,
  "combo_noindex_ok": true,
  "claim_hits": 0,
  "duplicate_titles": 0
}
```

---

## 1. Homepage — แก้ข้อความซ้ำ / claim artifact

### ปัญหาที่พบ (live + source ก่อนแก้)

- ข้อความ **"ราคาประเมินอ้างอิง"** ซ้ำหลายบล็อก: `SeoIntroSection`, `HomeConditionPricingSection`, `PriceFactors`, และ section `home-models` ท้ายหน้า
- `TrustBadges`: ข้อความซ้ำ "แจ้งเงื่อนไขชัด แจ้งเงื่อนไขชัดเจน"
- บทความเด่นบนหน้าแรกดึง meta ที่มี **"ดีที่สุด"** จาก `รับซื้อโน๊ตบุ๊ค-ราคาเท่าไหร่.md`

### สิ่งที่แก้แล้ว

| ไฟล์ | การเปลี่ยนแปลง |
|------|----------------|
| `src/components/SeoIntroSection.astro` | เปลี่ยน "ราคาประเมินอ้างอิง" → **"สภาพจริง"** |
| `src/components/PriceFactors.astro` | ลดการซ้ำคำศัพท์ราคาประเมิน |
| `src/components/TrustBadges.astro` | แก้ข้อความซ้ำใน badge |
| `src/pages/index.astro` | **ลบ** `HomeConditionPricingSection` และ section **home-models** (~40 บรรทัด + ลิงก์ยี่ห้อซ้ำกับ `BrandGrid`/`HomeCaseStudies`) |
| `src/content/blog/รับซื้อโน๊ตบุ๊ค-ราคาเท่าไหร่.md` | ลบ "ดีที่สุด" จาก meta description |

**หมายเหตุ:** การเปลี่ยนแปลงยังอยู่ใน local build — **live ยังแสดงเวอร์ชันเก่าจนกว่าจะ deploy**

---

## 2. Homepage link cloud — ลดความหนาแน่น

### ก่อน (โดยประมาณ)

- Featured blogs: 12
- PopularServicesLinks: 15 (มี duplicate Gaming/MacBook)
- ServiceAreas chips: 10
- Section home-models: ~10 inline brand links + 3 case cards
- รวมกับ BrandGrid, ConditionGrid, FAQ, footer

### หลังแก้ (จาก `dist/index.html`)

| ตัวชี้วัด | ค่า |
|-----------|-----|
| Internal href ทั้งหมด | **112** |
| Unique internal paths | **64** |

### การปรับ component

| Component | ก่อน → หลัง |
|-----------|------------|
| `home-featured-blog.ts` | 12 → **6** slugs (intent สูง) |
| `PopularServicesLinks.astro` | 15 → **8** (ตัด duplicate) |
| `ServiceAreasSection.astro` | 10 → **6** chips |
| `index.astro` | ลบ section home-models ทั้งก้อน |

BrandGrid และ ConditionGrid ยังอยู่ (เป็น hub หลักตามโครงสร้างเดิม) แต่ลดการซ้ำเนื้อหาและลิงก์ย่อยที่ overlap

---

## 3. Schema audit — ข้อมูลจริงเท่านั้น

### Global (ทุกหน้าผ่าน `BaseLayout`)

| Type | สถานะ | แหล่งข้อมูล |
|------|--------|-------------|
| `Organization` | ✓ | `site.ts` — บริษัท อำพล เทรดดิ้ง จำกัด |
| `LocalBusiness` | ✓ | ที่อยู่จดทะเบียน อุบลราชธานี, โทร 0642579353, Maps/LINE |
| `WebSite` | ✓ | domain จริง |
| `WebPage` | ✓ | title/description ต่อหน้า |
| `aggregateRating` | **ไม่มี** | ตามนโยบาย — ไม่มีรีวิว Google แสดงบนเว็บ |

### Homepage (`dist/index.html`)

```
FAQPage, ItemList, LocalBusiness, Organization, WebPage, WebSite
```

- `FAQPage`: 8 คำถามจาก FAQ component จริง
- `ItemList`: 6 บทความเด่น (หลังลดจาก 12)

### BreadcrumbList

| ประเภทหน้า | สถานะ |
|------------|--------|
| Brand / Service / Location layouts | ✓ `breadcrumbListSchema` |
| Blog `[slug].astro` | ✓ |
| คำถามที่พบบ่อย, พื้นที่ให้บริการ, ติดต่อเรา, วิธีขายโน๊ตบุ๊ค | ✓ |
| Homepage | ไม่ใส่ (ไม่จำเป็น — depth 0) |
| 404 | ไม่ใส่ + `noindex` |

### Article / BlogPosting

| ประเภท | Schema |
|--------|--------|
| Blog posts | `BlogPosting` + `article:*` meta + BreadcrumbList |
| FAQ ในบทความ | `FAQPage` เมื่อ frontmatter มี `faqs` |
| หน้า static ทั่วไป | ไม่ใส่ Article (ถูกต้อง) |

### TODO_OWNER

| รายการ | สถานะ |
|--------|--------|
| `openingHoursSpecification` ใน LocalBusiness | **TODO_OWNER** — ยังไม่ยืนยันเวลาเปิดจาก GBP; ใส่ comment ใน `site.ts` แล้ว |
| พิกัด geo (lat/lng) | **ไม่ใส่** — ไม่มีค่าที่ยืนยันใน repo |

---

## 4. Custom 404

ไฟล์: `src/pages/404.astro` (มีอยู่แล้ว — ปรับเล็กน้อย)

| รายการ | สถานะ |
|--------|--------|
| `noindex,nofollow` | ✓ |
| ข้อความภาษาไทย + CTA กลับหน้าแรก/LINE | ✓ |
| `RelatedLinks` 4 หน้าหลัก | ✓ |
| Canonical แยก `/404.html` | **ลบแล้ว** — ใช้ default noindex โดยไม่ canonicalize URL ผิด |

---

## 5. Broken internal links

สคริปต์ใหม่: `scripts/check-broken-links.py`

- สแกน `href` และ `src` ภายใน `dist/`
- ข้าม external, mailto, tel, asset รูป/font
- รองรับ path แบบมี/ไม่มี trailing slash และ `index.html`

**ผลลัพธ์:** `broken_count: 0` (78,842 ลิงก์ตรวจ)

---

## 6. PageSpeed / CWV baseline

### Lighthouse (live homepage — mobile, ก่อน deploy รอบนี้)

ไฟล์อ้างอิง: `lighthouse-home-baseline.json`

| Category | Score |
|----------|-------|
| Performance | **96** |
| Accessibility | **96** |
| Best Practices | **100** |
| SEO | **100** |

| Metric | ค่า |
|--------|-----|
| LCP | **2.6 s** |
| FCP | **1.4 s** |
| CLS | **0** |
| TBT | **0 ms** |
| Speed Index | **2.8 s** |

PageSpeed Insights API: **quota exceeded** ในสภาพแวดล้อมนี้ — ใช้ Lighthouse CLI แทน

### จุดแข็งที่มีอยู่แล้ว

- Hero LCP: `preload` + `srcset` 640w/1024w + `fetchpriority="high"`
- รูปหลักเป็น WebP (hero ~144 KB, trust ~111–150 KB)
- ไม่มี lazy-load บน LCP image

### คำแนะนำ image / CWV (ลำดับความสำคัญ)

1. **Blog cover PNG ~852 KB** (หลาย slug ใช้ไฟล์ขนาดเดียวกัน) → แปลงเป็น WebP/AVIF เป้า **<120 KB** ต่อปก; ใช้ `astro:assets` หรือ build-time sharp
2. **LCP 2.6 s** — พอใช้ได้ แต่ถ้าต้องการ <2.5 s: ลด hero 640w อีก ~10–15% หรือใช้ AVIF fallback
3. **SoftImageStrip / TrustGallery** — ตรวจว่าใช้ `loading="lazy"` + ขนาดตรง slot จริง
4. **CDN cache** — live ใช้ Cloudflare (CF-Cache-Status: HIT); หลัง deploy ตรวจ cache รูป `/images/blog/**`
5. **รัน Lighthouse ซ้ำหลัง deploy** บน mobile + desktop; บันทึก CrUX ใน GSC หลัง 28 วัน

---

## 7. E-E-A-T signals (ไม่แต่งข้อมูล)

| สัญญาณ | แหล่ง |
|--------|-------|
| นิติบุคคล + ที่อยู่จดทะเบียน | `site.ts`, footer, ติดต่อเรา |
| หน้าร้านจริง (Google Maps) | `googleMapsUrl`, ReviewCards ลิงก์ Maps |
| โทร / LINE | 0642579353, @webuy |
| Social | Facebook Amphontrading, TikTok @amphontrading |
| รีวิวบนเว็บ | `reviews` collection — **ระบุชัดว่าไม่ใช่ Google reviews** |
| ไม่ใส่ rating ปลอมใน schema | ✓ |

---

## 8. ไฟล์ที่เปลี่ยนในรอบนี้

```
src/pages/index.astro
src/pages/404.astro
src/components/SeoIntroSection.astro
src/components/PriceFactors.astro
src/components/TrustBadges.astro
src/components/PopularServicesLinks.astro
src/components/ServiceAreasSection.astro
src/data/home-featured-blog.ts
src/config/site.ts
src/content/blog/รับซื้อโน๊ตบุ๊ค-ราคาเท่าไหร่.md
scripts/check-broken-links.py          (ใหม่)
scripts/analyze-homepage-dist.py       (ใหม่, helper)
```

---

## 9. สิ่งที่ยังไม่ทำ (ตามขอบเขต)

- ไม่ merge/redirect หน้า Phase 3 (ไม่มี GSC evidence)
- ไม่สร้างหน้าใหม่ (ยกเว้น tooling + report)
- ไม่เพิ่ม claim terms กลับ
- ไม่ commit/push/deploy จนกว่าจะอนุมัติ

---

## 10. ขั้นตอนถัดไป (แนะนำ)

1. **Review รายงานนี้** — อนุมัติ wording / การลด link cloud
2. **Commit + push + deploy**
3. รัน `python scripts/live-seo-smoke.py` บน production หลัง deploy (ตรวจ homepage ไม่มี "ดีที่สุด" / ข้อความซ้ำ)
4. รัน Lighthouse / GSC Page Experience หลัง deploy
5. **TODO_OWNER:** ยืนยันเวลาเปิด-ปิดจาก Google Business Profile แล้วเพิ่ม `openingHoursSpecification`
6. Batch ถัดไป: บีบอัด blog cover PNG (852 KB) เป็น quick win CWV

---

## คำสั่ง QA สำหรับ re-run

```bash
npm run build
python scripts/seo-qa.py
python scripts/seo-url-audit.py
python scripts/seo-final-qa.py
python scripts/check-broken-links.py
python scripts/live-seo-smoke.py   # หลัง deploy + เมื่อ network ถึง sitemap
python scripts/analyze-homepage-dist.py   # optional stats
```
