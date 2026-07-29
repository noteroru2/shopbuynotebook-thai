# Technical SEO Audit

## สิ่งที่ทำได้ดี

- `BaseLayout.astro:33-46` มี canonical default และ noindex prop
- `BaseLayout.astro:58-113` มี charset, viewport, description, canonical, OG, Twitter และ title
- `BaseLayout.astro:116-123` รวม Organization, LocalBusiness, WebSite, WebPage และ page schemas
- exact duplicate titles/descriptions ใน build output: 0
- missing title: 0
- missing canonical: เฉพาะ `/admin/`
- broken internal href: 0
- sitemap กรอง location × topic pages ออก
- trailing slash และ site origin กำหนดใน `astro.config.mjs`

## Findings

1. CSS build warning ทำให้ baseline ไม่สะอาด
2. Astro check ใช้ไม่ได้เพราะ dependency ขาด
3. `noindex,nofollow` บน 2,090 หน้าอาจตัดเส้นทาง link graph; ปกติ `noindex,follow` หรือการไม่สร้าง route อาจเหมาะกว่า แต่ต้องทดสอบและไม่เปลี่ยนใน audit
4. LocalBusiness schema ถูก inject ทุกหน้าจาก BaseLayout แม้หน้า blog/noindex; ควรตรวจความเหมาะสมตาม page type
5. `/admin/` ไม่มี canonical/description/H1/schema แต่ควรถูกกันจาก index และ access ให้เหมาะสม
6. Redirect `/รับซื้อโน๊ตบุ๊ค/ → /` ถูกต้องตาม primary intent ที่เสนอ แต่ต้อง verify response status บน production
7. ยังไม่ยืนยัน HTTP headers, status codes, compression, cache, CSP หรือ live robots เพราะ audit หลักอิง build output

## Sitemap/robots

- sitemap output 372 URLs สอดคล้องกับจำนวน indexable โดยประมาณ
- `public/robots.txt` และ sitemap ควรตรวจซ้ำกับ production ทุก deployment
- ห้ามเปลี่ยน sitemap/canonical/redirect จนกว่าจะ reconcile กับ GSC

## Unicode/Punycode

Astro config ใช้ Unicode domain; build สร้าง absolute canonical ได้ ควรทดสอบ live ว่า HTTP header/redirect ใช้ host Unicode และ punycode สอดคล้องกันโดยไม่มี host split
