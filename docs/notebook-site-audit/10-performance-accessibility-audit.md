# Performance and Accessibility Audit

## Performance

- Static build เป็นจุดแข็งด้าน TTFB/CDN
- BaseLayout รองรับ LCP preload (`BaseLayout.astro:71-84`)
- ใช้ `sharp` และ local images
- build 2,460 pages ใน 20.71 วินาที ยังรับได้ แต่ page explosion จะเพิ่ม CI/storage/crawl cost
- CSS minify warning แสดงว่า generated utility/keyframes ต้องแก้
- ไม่มี field CWV หรือ Lighthouse จึงไม่ให้ข้อสรุป LCP/CLS/INP

## Images

ควรตรวจทุก template ว่า image มี width/height, responsive srcset, modern format, meaningful alt และไม่ preload หลายภาพพร้อมกัน รูป storefront ควรรักษาความคมชัดเพราะเป็น trust evidence

## Accessibility

พบ semantic shell (`lang="th"`, viewport, header/main/footer) และ mobile CTA แต่ยังต้องทดสอบ:

- keyboard navigation/focus visibility
- menu expanded state
- contrast
- accessible names ของ icon links
- heading order
- reduced motion สำหรับ shimmer
- form/error messaging
- screen-reader announcement

ยังไม่ได้รัน axe/Lighthouse หรือทดสอบด้วย browser assistive tech ดังนั้นคะแนน accessibility มีความมั่นใจระดับกลางต่ำ
