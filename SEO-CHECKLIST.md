# SEO / AEO / GEO Checklist — ร้านรับซื้อโน๊ตบุ๊ค.com

## Technical SEO
- [ ] `public/robots.txt` อนุญาตหน้าสำคัญ (ไม่ block money pages / blog)
- [ ] Sitemap ถูกสร้างหลัง build (`dist/sitemap-index.xml`, `dist/sitemap-0.xml`)
- [ ] ทุกหน้ามี `title`, `meta description`, `canonical` (absolute + trailing slash)
- [ ] ทุกหน้ามี H1 เดียว และลำดับ H2/H3 ถูกต้อง
- [ ] ไม่มีคำต้องห้ามใน production: `placeholder`, `mock`, `REPLACE_ME`, `lorem`, `dummy`, `TODO`
- [ ] Internal links ไม่เสีย (ไม่มีลิงก์ไปหน้าที่ไม่ได้ generate)
- [ ] Mobile ไม่ล้น (ตรวจ header/footer/CTA และ section ใหม่ ๆ)
- [ ] รูปภาพสำคัญมี `alt` ภาษาไทย และใช้ lazy loading ตามเหมาะสม

## Structured Data (SEO/AEO/GEO)
- [ ] Organization schema (ทุกหน้า)
- [ ] LocalBusiness schema (ทุกหน้า) + `areaServed` ตรงกับเนื้อหาเว็บ
- [ ] WebSite + WebPage schema (ทุกหน้า)
- [ ] BreadcrumbList schema (ทุกหน้าที่ไม่ใช่หน้าแรก)
- [ ] Service schema (หน้า service/brand/condition/location ผ่าน `ServiceLayout`/template)
- [ ] FAQPage schema เฉพาะหน้าที่มี FAQ จริงใน HTML
- [ ] BlogPosting schema (ทุกบทความ)
- [ ] ItemList schema (หน้า `/blog/`)

## Content SEO
- [ ] mapping keyword → URL ชัดเจน (ดู `KEYWORD-MAP.md`)
- [ ] เนื้อหาไม่ซ้ำกันตรง ๆ ระหว่างหน้า money pages (ลด cannibalization)
- [ ] ใส่ internal links แบบธรรมชาติ (ไม่ยัด anchor ซ้ำ ๆ)
- [ ] มี “answer blocks” (คำตอบสั้น/ขั้นตอน/เช็กลิสต์/FAQ) ในหน้าหลักและบทความ

## AEO / GEO
- [ ] `public/llms.txt` มี facts + หน้าสำคัญ + วิธีประเมินราคา
- [ ] มี hub pages: `/รับซื้อโน๊ตบุ๊ค/`, `/คำถามที่พบบ่อย/`, `/วิธีขายโน๊ตบุ๊ค/`, `/พื้นที่ให้บริการ/`
- [ ] entity consistency: ชื่อร้าน, LINE, เบอร์โทร, พื้นที่ให้บริการตรงกันทุกหน้า

## Local SEO (แนะนำให้ทำเพิ่ม)
- [ ] สร้าง/ปรับ Google Business Profile (ถ้ามีหน้าร้าน/จุดนัดเจอจริง)
- [ ] ใส่รูปจริง/เคสจริง/รีวิวจริง เพื่อเพิ่ม trust

