/**
 * Selective blog enrichment for Priority A/B candidates only.
 * Appends unique informational sections; does not wipe existing prose.
 */
import fs from 'node:fs';
import path from 'node:path';

const blogDir = 'src/content/blog';

const targets = [
  {
    file: 'macbook-ไม่มีที่ชาร์จ-ขายได้ไหม.md',
    appendix: `
## ขายได้ไหม และมีผลอย่างไร

ขายได้ครับ การไม่มีที่ชาร์จไม่ทำให้เครื่องไร้มูลค่า แต่มีผลต่อ:
- ความครบของชุดขาย
- ความสะดวกในการทดสอบเปิดเครื่อง/ชาร์จ
- ต้นทุนหาอะแดปเตอร์ที่เข้ากันกับรุ่น (MagSafe / USB-C)

## ข้อมูลที่ควรส่งเมื่อไม่มีที่ชาร์จ

1. รูปตัวเครื่องรอบด้านและจุดตำหนิ
2. รูปหน้า About This Mac (ถ้าเปิดติด)
3. รูป Battery Health หรือ Cycle Count (ถ้าเปิดได้)
4. แจ้งชัดว่าไม่มีอะแดปเตอร์ / ไม่มีสาย / หรือมีแต่ไม่ใช่ของเดิม
5. แจ้งว่าเคยใช้หัวชาร์จแบบใด (ถ้ารู้)

## ลิงก์ที่เกี่ยวข้อง

- [ไม่มีที่ชาร์จ (หน้าเงื่อนไข)](/รับซื้อโน๊ตบุ๊ค/ไม่มีที่ชาร์จ/)
- [รับซื้อ MacBook Air 13](/รับซื้อโน๊ตบุ๊ค/macbook-air-13/)
- [รับซื้อ MacBook Pro 14](/รับซื้อโน๊ตบุ๊ค/macbook-pro-14/)
- [โน๊ตบุ๊คไม่มีที่ชาร์จขายได้ไหม](/blog/โน๊ตบุ๊คไม่มีที่ชาร์จขายได้ไหม/)
`,
  },
  {
    file: 'โน๊ตบุ๊คไม่มีที่ชาร์จขายได้ไหม.md',
    appendix: `
## ผลต่อการประเมินจริง (ไม่ใช่การตัดสิทธิ์ขาย)

ร้านยังรับประเมินได้ แต่จะดูว่า:
- เปิดเครื่องทดสอบได้หรือไม่
- รุ่น/สเปกยืนยันได้แค่ไหน
- ต้องเผื่อต้นทุนหาที่ชาร์จตรงรุ่นหรือไม่

## แยกเคสให้ชัด

### เปิดติดได้แม้ไม่มีที่ชาร์จเดิม
ส่งรูปสเปกและสภาพเครื่องให้ครบ มักประเมินได้เร็ว

### เปิดไม่ติดและไม่มีที่ชาร์จ
ประเมินยากขึ้น ควรแจ้งอาการ + รุ่นจากสติ๊กเกอร์ใต้เครื่อง/กล่อง และดูหน้า [เปิดไม่ติด](/รับซื้อโน๊ตบุ๊ค/เปิดไม่ติด/)

### เป็น MacBook
อ่านเพิ่มที่ [MacBook ไม่มีที่ชาร์จขายได้ไหม](/blog/macbook-ไม่มีที่ชาร์จ-ขายได้ไหม/)

## สิ่งที่ไม่ควรทำ

- อย่าใช้ที่ชาร์จวัตต์ต่ำผิดประเภทจนเสี่ยงพอร์ต/บอร์ด
- อย่าเดาสเปกถ้าเปิดเครื่องไม่ได้ ให้ส่งรูปป้ายรุ่นแทน
`,
  },
  {
    file: 'รับซื้อ-macbook-air-13-15-ราคาเท่าไหร่.md',
    appendix: `
## ปัจจัยที่ร้านใช้ประเมิน MacBook Air 13/15

- ชิปและปีรุ่นจาก About This Mac
- RAM / SSD ตามเครื่องจริง
- Battery Health และรอบชาร์จ
- สภาพจอ บอดี้ ขอบเครื่อง
- ความครบของที่ชาร์จ

หน้านี้เป็นคู่มือ informational ไม่ได้ประกาศช่วงราคาตายตัว เพราะราคาขึ้นกับสภาพจริงขณะประเมิน

## ควรเปิดหน้ารุ่นไหนต่อ

- [รับซื้อ MacBook Air 13](/รับซื้อโน๊ตบุ๊ค/macbook-air-13/)
- [รับซื้อ MacBook Air 15](/รับซื้อโน๊ตบุ๊ค/macbook-air-15/)
- [รับซื้อ MacBook Air M3](/รับซื้อโน๊ตบุ๊ค/macbook-air-m3/)
- [Battery Health มีผลไหม](/blog/macbook-battery-health-มีผลต่อราคาไหม/)

## ส่งรูปชุดไหนให้ไว

About This Mac + Battery + หน้าจอติด + ตัวเครื่อง 4 มุม + ที่ชาร์จ (ถ้ามี)
`,
  },
  {
    file: 'รับซื้อ-macbook-pro-14-16-ราคาเท่าไหร่.md',
    appendix: `
## ทำไม Pro 14/16 ต้องแยกดูจาก Air

MacBook Pro กลุ่มจอ 14/16 มักมีชิป Pro/Max และความจุที่หลากหลายกว่า การประเมินจึงต้องอิงหน้าจอระบบจริง ไม่ใช่ชื่อการตลาดอย่างเดียว

## ลิงก์หน้ารุ่นที่เกี่ยวข้อง

- [รับซื้อ MacBook Pro 14](/รับซื้อโน๊ตบุ๊ค/macbook-pro-14/)
- [รับซื้อ MacBook Pro 16](/รับซื้อโน๊ตบุ๊ค/macbook-pro-16/)
- [รับซื้อ MacBook](/รับซื้อโน๊ตบุ๊ค/macbook/)
- [ตีราคาโน๊ตบุ๊ค](/ตีราคาโน๊ตบุ๊ค/)

## สิ่งที่ควรแจ้งเพิ่ม

- ชิป (เช่น M-series ระดับใดตาม About This Mac)
- RAM/SSD
- สภาพพอร์ตและแทร็กแพด
- Find My / บัญชี
`,
  },
  {
    file: 'macbook-battery-health-มีผลต่อราคาไหม.md',
    appendix: `
## วิธีเช็ก Battery Health อย่างปลอดภัย

1. ไปที่ System Settings → Battery → Battery Health (ชื่อเมนูอาจต่างตาม macOS)
2. หรือดูผ่าน System Information → Power
3. ถ่ายรูปเปอร์เซ็นต์ Maximum Capacity และ Cycle Count ถ้ามี
4. ส่งพร้อมรูป About This Mac

บทความนี้ไม่แนะนำให้รีเซ็ต SMC/PRAM เป็นขั้นตอนบังคับก่อนขาย หากไม่จำเป็น และไม่รับประกันผลต่อราคา

## เชื่อมไปหน้ารับซื้อและรุ่น

- [รับซื้อ MacBook Battery Health](/รับซื้อโน๊ตบุ๊ค/macbook-battery-health/)
- [Cycle Count เท่าไหร่ถึงราคาตก](/blog/macbook-cycle-count-เท่าไหร่ถึงราคาตก/)
- [รับซื้อ MacBook Air 13](/รับซื้อโน๊ตบุ๊ค/macbook-air-13/)
`,
  },
  {
    file: 'macbook-cycle-count-เท่าไหร่ถึงราคาตก.md',
    appendix: `
## Cycle Count ใช้อย่างไรตอนประเมิน

Cycle Count ช่วยเล่าประวัติการใช้งาน แต่ไม่ได้ตัดสิทธิ์การขายโดยอัตโนมัติ ร้านดูร่วมกับ Battery Health, ปีรุ่น, ความจุ และสภาพภายนอก

## ส่งข้อมูลคู่กันเสมอ

- Cycle Count
- Maximum Capacity
- About This Mac
- รูปเครื่องรอบด้าน

## ลิงก์ต่อ

- [Battery Health มีผลไหม](/blog/macbook-battery-health-มีผลต่อราคาไหม/)
- [รับซื้อ MacBook Cycle Count](/รับซื้อโน๊ตบุ๊ค/macbook-cycle-count/)
- [ขาย MacBook ต้องเตรียมอะไร](/blog/ขาย-macbook-ต้องเตรียมอะไรบ้าง/)
`,
  },
  {
    file: 'macbook-จอร้าว-ขายได้ไหม.md',
    appendix: `
## จอร้าวขายได้ไหม

ขายได้ในหลายกรณี แต่ราคาจะอิงความรุนแรงของรอย/เส้น และการใช้งานจอต่อได้หรือไม่

## ส่งอะไรให้ประเมินตรง

- รูปจอติดปกติในห้องสว่างและมืด
- วิดีโอสั้นถ้ามีเส้นกระพริบ
- About This Mac
- แจ้งว่าเคยกระแทก/กดทับหรือไม่

## ลิงก์

- [รับซื้อโน๊ตบุ๊คจอแตก](/รับซื้อโน๊ตบุ๊ค/จอแตก/)
- [รับซื้อ MacBook](/รับซื้อโน๊ตบุ๊ค/macbook/)
`,
  },
  {
    file: 'macbook-ติด-mdm-ขายได้ไหม.md',
    appendix: `
## MDM คืออะไรในมุมขายเครื่อง

MDM คือการจัดการอุปกรณ์องค์กร หากเครื่องยังล็อกอยู่ การตรวจรับและโอนใช้งานอาจติดเงื่อนไข ควรแจ้งตั้งแต่ส่งประเมิน

## ควรตรวจอะไรก่อน

- หน้าจอ Setup/บัญชีองค์กร
- สถานะ Activation/MDM ถ้าเห็นข้อความชัด
- เอกสารปลดจากองค์กร (ถ้ามี)

## ลิงก์

- [รับซื้อ MacBook MDM](/รับซื้อโน๊ตบุ๊ค/macbook-mdm/)
- [ขาย MacBook ต้องเตรียมอะไร](/blog/ขาย-macbook-ต้องเตรียมอะไรบ้าง/)
`,
  },
  {
    file: 'วิธีดูสเปก-cpu-ram-ssd-ของโน๊ตบุ๊ค.md',
    appendix: `
## ถ้าเป็น MacBook เช็กอย่างไร

1. เปิด Apple menu → About This Mac
2. บันทึกชิป ความจุหน่วยความจำ และที่เก็บข้อมูล
3. เช็ก Battery Health แยกต่างหากถ้าจะขาย
4. ส่งรูปหน้าจอชุดนี้พร้อมรูปเครื่อง

อ่านต่อ: [Battery Health มีผลไหม](/blog/macbook-battery-health-มีผลต่อราคาไหม/) · [รับซื้อ MacBook](/รับซื้อโน๊ตบุ๊ค/macbook/)

## Device Manager ใช้เมื่อไหร่

ใช้เมื่อต้องการยืนยันอะแดปเตอร์แสดงผล/อุปกรณ์เพิ่ม แต่สำหรับประเมินราคารอบแรก หน้า About / Task Manager มักพอ
`,
  },
];

const changed = [];
for (const t of targets) {
  const abs = path.join(blogDir, t.file);
  if (!fs.existsSync(abs)) {
    console.warn('missing', t.file);
    continue;
  }
  const raw = fs.readFileSync(abs, 'utf8');
  if (raw.includes('<!-- authority-blog-append -->')) continue;
  const next = `${raw.trimEnd()}\n\n<!-- authority-blog-append -->\n${t.appendix.trim()}\n`;
  fs.writeFileSync(abs, next, 'utf8');
  changed.push(t.file);
}
console.log(JSON.stringify({ changed: changed.length, files: changed }, null, 2));
