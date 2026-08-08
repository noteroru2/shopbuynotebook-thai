import fs from 'node:fs';
import path from 'node:path';

const blogDir = 'src/content/blog';
const targets = [
  'รับซื้อ-dell-inspiron-latitude-xps-ราคาเท่าไหร่.md',
  'รับซื้อ-surface-laptop-go-book-pro-ราคาเท่าไหร่.md',
  'รับซื้อ-lenovo-ideapad-yoga-ราคาเท่าไหร่.md',
  'รับซื้อ-hp-pavilion-envy-elitebook-probook-ราคาเท่าไหร่.md',
  'รับซื้อ-samsung-galaxy-book-ราคาเท่าไหร่.md',
  'รับซื้อ-msi-modern-ราคาเท่าไหร่.md',
  'รับซื้อ-hp-spectre-x360-ราคาเท่าไหร่.md',
  'รับซื้อ-gigabyte-aorus-ราคาเท่าไหร่.md',
  'รับซื้อ-razer-blade-ราคาเท่าไหร่.md',
  'รับซื้อ-lenovo-thinkbook-ราคาเท่าไหร่.md',
  'รับซื้อ-lg-gram-ราคาเท่าไหร่.md',
  'รับซื้อ-dell-vostro-ราคาเท่าไหร่.md',
];

const changed = [];
for (const file of targets) {
  const abs = path.join(blogDir, file);
  if (!fs.existsSync(abs)) continue;
  const raw = fs.readFileSync(abs, 'utf8');
  if (raw.includes('<!-- authority-blog-append -->')) continue;
  const title = raw.match(/^title:\s*(.+)$/m)?.[1]?.replace(/^["']|["']$/g, '') || file;
  const appendix = `

<!-- authority-blog-append -->
## วิธีใช้บทความนี้ก่อนส่งประเมิน

บทความ **${title}** เป็นคู่มือ informational ช่วยให้รู้ว่าต้องส่งข้อมูลอะไร ไม่ได้ประกาศช่วงราคาตายตัว

### ส่งอย่างน้อย
- รูปเครื่องรอบด้าน
- รูปสเปก CPU/RAM/SSD/GPU (ถ้ามี)
- รูปที่ชาร์จและจุดตำหนิ
- อาการที่พบ (ถ้ามี)

### ลิงก์บริการที่เกี่ยวข้อง
- [เช็คราคาโน๊ตบุ๊ค](/เช็คราคาโน๊ตบุ๊ค/)
- [ตีราคาโน๊ตบุ๊ค](/ตีราคาโน๊ตบุ๊ค/)
- [รับซื้อโน๊ตบุ๊คมือสอง](/รับซื้อโน๊ตบุ๊คมือสอง/)
- [วิธีดูสเปก CPU RAM SSD](/blog/วิธีดูสเปก-cpu-ram-ssd-ของโน๊ตบุ๊ค/)
`;
  fs.writeFileSync(abs, `${raw.trimEnd()}\n${appendix}\n`, 'utf8');
  changed.push(file);
}
console.log(JSON.stringify({ changed: changed.length, files: changed }, null, 2));
