# Internal Linking

## Pattern (หลัง upgrade)

```
Home / Money hubs
  → Brand hubs → Series → Model
  → Conditions ↔ Blog (symptom)
  → Province/Location → Money CTA (LINE)
  ✗ Combo Tier C ไม่ดันเข้า sitemap / ไม่ใช้เป็น hub หลัก
```

## Improved

- Money pages ลิงก์ตาม intent (ไม่ยัดทุก keyword ไปหน้าเดียว)
- Condition ↔ blog bidirectional สำหรับอาการหลัก
- Location bodies ลิงก์ condition ตัวอย่าง + เช็คราคา โดยไม่ยัดรายการจังหวัดยาว
- Hub links ชี้ root paths ที่ถูกต้อง (Worker redirect-aware จากรอบก่อน)

## Deferred / TBD

- Inventory column `Internal inbound links` ยัง **TBD** (ยังไม่ crawl นับ inbound จริง)
- Automated link-graph report post-deploy

## Rules kept

- ไม่ orphan money/brand/condition หลัก
- ไม่สร้างลิงก์จำนวนมากไป combo noindex เพื่อ “ปลอม” equity
