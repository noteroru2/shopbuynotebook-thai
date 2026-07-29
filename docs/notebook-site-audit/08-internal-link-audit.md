# Internal Link Audit

## ผล scan

- Broken internal href ใน built HTML: 0
- Core templates มี breadcrumbs/related links
- Sitemap และ navigation มี hub paths
- Cross-product 2,090 หน้าไม่มี inbound link ที่ scanner พบ และถูก noindex

## จุดที่ควรปรับ

- หน้า core keyword หลายหน้าลิงก์หากันด้วย anchor ใกล้กันมาก ทำให้ ownership ไม่ชัด
- blog price/condition posts ควรลิงก์ไป service owner เพียงหน้าเดียวอย่างเด่นชัด
- brand hubs ควรเป็น parent ของ series/model; ลด sibling mesh ที่ไม่จำเป็น
- location pages ควรลิงก์กลับ location hub และ process/conditions ไม่ผลัก cross-product noindex
- Breadcrumb ของ dynamic page ใช้ homepage เป็น breadcrumb “รับซื้อโน๊ตบุ๊ค” (`[slug].astro:40-43`) ซึ่งสอดคล้องกับข้อเสนอให้ `/` เป็น owner

## Target model

Homepage → main notebook hub intents → brand/condition/location hubs → selected high-value spokes → conversion/process pages

การวัดรอบ implementation: inbound count, orphan count เฉพาะ indexable URLs, anchor distribution, click depth และ broken links
