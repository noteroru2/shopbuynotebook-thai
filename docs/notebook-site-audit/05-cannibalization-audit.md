# Cannibalization Audit

การจัดกลุ่มนี้เป็นความเสี่ยงจาก intent/title/content ไม่ใช่ข้อพิสูจน์ว่า Google cannibalize จริง ต้องยืนยันด้วย GSC query × page

| Cluster | Competing URLs | Owner ที่เสนอ | Risk |
|---|---|---|---|
| รับซื้อโน๊ตบุ๊ค | `/`, `/รับซื้อโน๊ตบุ๊คมือสอง/`, `/รับซื้อ-notebook/` | `/` | High |
| เช็คราคา/ตีราคา | `/เช็คราคาโน๊ตบุ๊ค/`, `/เช็คราคาโน๊ตบุ๊คมือสอง/`, `/ตีราคาโน๊ตบุ๊ค/`, blog comparison | แยก estimate vs valuation method | High |
| ขายโน๊ตบุ๊ค | `/ขายโน๊ตบุ๊ค/`, `/ขายโน๊ตบุ๊คด่วน/`, blog คู่มือขาย | service/guide ownership | Medium |
| เครื่องเสีย | `/รับซื้อโน๊ตบุ๊ค/เครื่องเสีย/`, condition เฉพาะ, blog “ขายได้ไหม” | condition pages | High |
| เปิดไม่ติด/ไฟไม่เข้า | condition pages + blog ทั้งสองอาการ | อาการเฉพาะ | High |
| Brand/model price | brand/model pages + blog “ราคาเท่าไหร่” | brand/service page | High |
| MacBook | `/รับซื้อโน๊ตบุ๊ค/macbook/`, model pages, MacBook blogs | MacBook hub | High |
| Organization | `/รับซื้อโน๊ตบุ๊คบริษัท/`, `/รับเหมาโน๊ตบุ๊ค/`, `/รับเหมาคอมพิวเตอร์/`, `/รับประมูลคอม/` | notebook-company | High |

## วิธีตัดสินใจภายหลัง

1. Export GSC 16 เดือน: query, page, clicks, impressions, position
2. ดู query overlap และ conversion quality
3. Keep หน้าที่มี intent ต่างจริง
4. Consolidate เฉพาะเมื่อ overlap สูงและหน้าใดหน้าหนึ่งไม่มี unique demand/backlink/conversion
5. ห้าม redirect จากรายงานนี้โดยไม่มีข้อมูลดังกล่าว
