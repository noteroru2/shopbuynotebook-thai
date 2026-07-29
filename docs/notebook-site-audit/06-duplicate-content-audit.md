# Duplicate Content and Template Footprint Audit

## ผล exact scan

- Exact duplicate title: 0 clusters
- Exact duplicate meta description: 0 clusters
- Exact normalized full-body text: 0 clusters

ผลนี้ไม่แปลว่าไม่มี near-duplicate เพราะ template มี dynamic substitutions จำนวนมาก

## Template footprint

`[location]/[slug].astro` สร้าง 87 × (selected brands + conditions) = 2,090 หน้า และ noindex ทั้งหมด จึงเป็น template footprint ใหญ่ที่สุด หน้าเหล่านี้ไม่ orphan ในความหมาย crawlability เสมอไป แต่ scanner จาก href ใน output พบ inbound 0 ซึ่งสอดคล้องกับการไม่ผลักเข้าดัชนี

Location content หลายไฟล์มีรูปแบบซ้ำ: intro จังหวัด, จุดนัด, ปัจจัยราคา, ขั้นตอนเตรียม, CTA และ FAQ โดยเปลี่ยนชื่อพื้นที่ ตัวอย่าง `src/content/locations/กระบี่.md:41-84`

Brand/model pages ใช้ default H1/intro logic จาก `src/pages/รับซื้อโน๊ตบุ๊ค/[slug].astro:137-148` จึงมี semantic similarity แม้ข้อความไม่ exact

## การจัดการ

- Keep noindex cross-product ระหว่าง audit
- ทำ sample review อย่างน้อย 10% ต่อ template family
- สร้าง quality gate: unique evidence, spec nuance, real customer question, internal role และ minimum useful content
- ไม่ใช้ word count เป็นเกณฑ์เดียว
- พิจารณา index เฉพาะหน้าที่มี demand/evidence; พิจารณา consolidate หลัง GSC
