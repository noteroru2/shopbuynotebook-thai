# Content Architecture Audit

## โครงสร้างปัจจุบัน

- Core money: homepage, รับซื้อโน๊ตบุ๊คมือสอง, รับซื้อ-notebook, เช็คราคา, ตีราคา, ขายด่วน, บริษัท
- Brand hierarchy: brand → series/model
- Condition hierarchy: เครื่องเสีย → อาการเฉพาะ
- Location hierarchy: พื้นที่ hub → จังหวัด/ย่าน
- Editorial: blog guides, price factors, condition explainers, case studies
- Trust: เกี่ยวกับเรา, ติดต่อ, ขั้นตอนและเงื่อนไข, privacy, FAQ

## จุดแข็ง

- topical depth ด้าน notebook สูง
- brand/condition data แยกเป็น collections
- มี supporting informational content และ case studies
- money pages มี CTA และเส้นทางประเมินราคา

## ปัญหา

- namespace เดียวรวม brand, condition, location ทำให้ taxonomy เข้าใจยาก
- core pages หลายหน้าใช้ภาษาคำหลักใกล้กันมาก
- มี money pages desktop/ประมูลที่ออกนอก specialist scope
- blog บางบทความ target คำเดียวกับ service pages
- model pages จำนวนมากต้องอาศัย template logic; unique value ต่างกันไม่สม่ำเสมอ
- location pages มี 87 หน้าก่อนพิสูจน์ local differentiation

## Recommended ownership

| Intent | Primary URL |
|---|---|
| รับซื้อโน๊ตบุ๊ค | `/` |
| รับซื้อโน๊ตบุ๊คมือสอง | `/รับซื้อโน๊ตบุ๊คมือสอง/` |
| English “Notebook” variant | `/รับซื้อ-notebook/` เป็น supporting/variant เท่านั้น |
| เช็คราคาเบื้องต้น | `/เช็คราคาโน๊ตบุ๊ค/` |
| หลักเกณฑ์ตีราคา | `/ตีราคาโน๊ตบุ๊ค/` |
| วิธีเตรียมขาย | `/ขายโน๊ตบุ๊ค/` |
| งานองค์กร | `/รับซื้อโน๊ตบุ๊คบริษัท/` |
| อาการเสีย | condition hub/page |
| ความรู้ก่อนขาย | blog โดย link เข้าหน้า service ที่เป็นเจ้าของ conversion intent |

ไม่ควรเพิ่มหมวดสินค้าไอทีทั่วไป
