# Schema Diff

ก่อนแก้:

- Base layout และ Service schema ทำให้ LocalBusiness ปรากฏกว้างเกินประเภทหน้า

หลังแก้:

- Organization, WebSite และ WebPage ยังคงเป็น schema กลาง
- Service provider อ้างอิง Organization
- LocalBusiness เปิดใช้เฉพาะ `/`, `/เกี่ยวกับเรา/`, `/ติดต่อเรา/` และ `/รับซื้อโน๊ตบุ๊ค/อุบลราชธานี/`
- Breadcrumb, FAQ และ Service schema ยังคงตามบริบทหน้า

Validator พบ LocalBusiness 4 หน้าและ 0 schema-governance errors.
