# รายงานตรวจความพร้อม Production — ร้านรับซื้อโน๊ตบุ๊ค.com

วันที่อ้างอิง: audit รอบล่าสุดในโปรเจกต์ (ก่อน deploy Coolify)

## 1. Build status

- **ผ่าน** — หลังแก้ในรอบนี้ให้รัน `npm run build` จนสำเร็จ (static ~60 หน้า)
- **Node**: `.nvmrc` = **20** (สอดคล้อง `package.json` `engines`: `>=20`)
- **คำเตือน `[glob-loader] … services`**: แก้โดย **ลบ collection `services`** ออกจาก `src/content.config.ts` เพราะไม่มีการใช้ `getCollection('services')` และโฟลเดอร์ว่าง — build ไม่ควรขึ้น WARN นี้อีก

## 2. ไฟล์ที่ตรวจ (สรุป)

- `package.json`, `.nvmrc`, `astro.config.mjs`
- `src/config/site.ts`, `src/data/service-areas.ts`, `src/content.config.ts`
- `src/layouts/BaseLayout.astro`, `src/lib/seo.ts`, `src/lib/schema.ts`, `src/components/JsonLd.astro`, `CTAButtons.astro`
- `src/pages/index.astro`, `404.astro`, hub `/รับซื้อโน๊ตบุ๊ค/`
- `public/robots.txt`, `llms.txt`, `humans.txt`, `manifest.webmanifest`
- `public/admin/config.yml`, `KEYWORD-MAP.md`, `DEPLOY-CHECKLIST.md`
- `dist/` หลัง build: robots, sitemap, 404, llms, humans, manifest

## 3. ไฟล์ที่เพิ่ม / คงอยู่

- `DEPLOY-CHECKLIST.md` — checklist ก่อน deploy (โครงตาม brief)
- `AUDIT-REPORT.md` — รายงานฉบับนี้
- `KEYWORD-MAP.md`, `SEO-CHECKLIST.md`, `README.md` — มีอยู่แล้ว

## 4. ไฟล์ที่แก้ (รอบ audit ล่าสุด)

| ไฟล์ | การเปลี่ยนแปลง |
|------|------------------|
| `src/content.config.ts` | ลบ collection `services` (ไม่มี content และไม่มีการเรียกใช้) — ตัด WARN ตอน sync content |
| `public/robots.txt` | เหลือ `Sitemap` เดียวชี้ `sitemap-index.xml` (ให้ search engine ดึง sitemap ย่อยจาก index) |
| `src/components/PopularServicesLinks.astro` | ใส่ **trailing slash** ทุกลิงก์ + เพิ่มลิงก์ hub (`/รับซื้อโน๊ตบุ๊ค/`, `/รับซื้อ-notebook/`, `/พื้นที่ให้บริการ/`, `/blog/`) เพื่อ internal linking หน้าแรก |
| `DEPLOY-CHECKLIST.md` | จัดโครงตาม checklist brief (Build, SEO, Schema, AEO/GEO, Local, Content เจ้าของเว็บ, Backlink, Decap, PWA, dist, location follow-up) |

### การเปลี่ยนแปลงจาก audit ก่อนหน้า (ยังมีผล)

- `astro.config.mjs`: `trailingSlash: 'always'`
- `manifest.webmanifest`: icons เฉพาะ `/favicon.svg`
- `src/lib/seo.ts`: `localBusinessSchema` default description จาก `SITE.description`
- `404.astro`: `noindex`, canonical `404.html`, `CTAButtons`, `RelatedLinks` ไปมือสอง + เช็คราคา
- `llms.txt` / `humans.txt`: keyword, พื้นที่, LINE, Maps หน้าร้าน

## 5. SEO status

- **Canonical / trailing slash**: สอดคล้องกับ Astro config
- **หน้าแรก**: H1 เดียวใน `Hero` มีคำว่า “รับซื้อโน๊ตบุ๊ค”; CTA แอดไลน์ @webuy + โทรผ่าน `SITE`
- **Title แยก intent**: `/` vs `/รับซื้อโน๊ตบุ๊ค/` ไม่ซ้ำกัน
- **ไม่ redesign** — ไม่เปลี่ยน layout ใหญ่

## 6. AEO / GEO status

- `llms.txt` ครอบคลุม keyword หลัก/รอง, บริการ, พื้นที่, หน้าสำคัญ, วิธีประเมิน, ความปลอดภัยข้อมูล
- `service-areas.ts` ครอบคลุม brief (กทม.+ปริมณฑล, อีสานครบจังหวัดในรายการ, ตะวันออก, ใต้ตามที่ระบุ)

## 7. Schema status

- `BaseLayout`: Organization, LocalBusiness, WebSite, WebPage (+ schemas เพิ่มจากหน้า เช่น FAQ, Breadcrumb, Service)
- **ไม่มี** `aggregateRating` ปลอมในโค้ดที่ตรวจ
- LocalBusiness **ไม่มี** address ถนนที่เป็นข้อมูลปลอม — มี `hasMap` / `sameAs` รวม Maps URL
- `organizationSchema` / `localBusinessSchema`: `telephone` และ `sameAs` (Facebook, LINE, TikTok, Maps)

## 8. Sitemap / robots status

- Build แล้วได้ `sitemap-index.xml` และไฟล์ sitemap รายการ URL
- `robots.txt` ชี้เฉพาะ index

## 9. Internal links / Hub status

- หน้าแรกมี section “บริการยอดนิยม” ลิงก์ไป money pages + hub + พื้นที่ + blog พร้อม trailing slash
- Hub และคอนเทนต์อื่นมีลิงก์ข้ามอยู่แล้ว — ควรทดสอบบนโดเมนจริงหลัง deploy

## 10. ปัญหาที่แก้แล้ว (สะสม)

- WARN glob `src/content/services` → ลบ collection ที่ไม่ใช้
- robots ซ้ำสองบรรทัด sitemap → เหลือ index เดียว
- PopularServicesLinks ไม่มี trailing slash และขาดลิงก์ hub สำคัญ → แก้แล้ว

## 11. สิ่งที่เจ้าของเว็บต้องตัดสินใจ / ทำต่อ

- ยืนยัน **เวลาให้บริการ** และถ้าต้องการใส่ใน schema ให้ตรงของจริง
- **รีวิว / รูป** — ใช้เฉพาะที่มีสิทธิ์และเป็นจริง
- **Decap production backend + OAuth** — ตั้งใน Coolify ตาม checklist
- **ขยายหน้า location รายจังหวัด** — ถ้าต้องการครบทุกจังหวัดใน brief ให้ทำทีละหน้าพร้อมเนื้อหาไม่ซ้ำ

## 12. หลัง deploy แนะนำ

- ทดสอบ URL สำคัญบนโดเมนจริง + mobile
- Search Console: ส่ง sitemap + coverage
- LCP: hero มี `loading="eager"` และ `fetchpriority="high"` ใน `Hero.astro`

## Coolify (สรุปคำสั่ง)

- **Build command**: `npm run build`
- **Output directory**: `dist`
