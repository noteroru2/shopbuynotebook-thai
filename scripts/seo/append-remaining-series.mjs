import fs from 'node:fs';
import path from 'node:path';

const brandsDir = 'src/content/brands';
const BRAND_HUBS = new Set([
  'asus', 'acer', 'lenovo', 'hp', 'dell', 'msi', 'macbook', 'surface', 'gaming',
  'samsung', 'huawei', 'lg', 'honor', 'razer', 'gigabyte',
]);

function classify(slug) {
  if (BRAND_HUBS.has(slug)) return 'Brand';
  const parts = slug.split('-');
  if (parts.length >= 3 || /m\d|rtx|gen/i.test(slug)) return 'Model';
  return 'Series';
}

function brandOf(slug) {
  if (slug.startsWith('macbook')) return 'macbook';
  if (slug.startsWith('thinkpad')) return 'lenovo';
  if (slug.startsWith('alienware')) return 'dell';
  if (slug.startsWith('surface')) return 'surface';
  const first = slug.split('-')[0];
  return BRAND_HUBS.has(first) ? first : first;
}

function findSeries(slug) {
  const parts = slug.split('-');
  for (let i = parts.length - 1; i >= 2; i--) {
    const cand = parts.slice(0, i).join('-');
    if (fs.existsSync(path.join(brandsDir, `${cand}.md`)) && classify(cand) === 'Series') return cand;
  }
  return '';
}

const index = fs.readdirSync(brandsDir).filter((f) => f.endsWith('.md')).map((f) => {
  const raw = fs.readFileSync(path.join(brandsDir, f), 'utf8');
  const slug = (raw.match(/^slug:\s*(.+)$/m)?.[1] || f.replace(/\.md$/, '')).trim();
  const title = (raw.match(/^title:\s*(.+)$/m)?.[1] || slug).replace(/^["']|["']$/g, '');
  return { f, slug, title, type: classify(slug) };
});

const changed = [];
for (const item of index) {
  if (item.type !== 'Series') continue;
  const abs = path.join(brandsDir, item.f);
  const raw = fs.readFileSync(abs, 'utf8');
  if (/Series Authority Hub/.test(raw)) continue;
  const children = index.filter((x) => x.type === 'Model' && findSeries(x.slug) === item.slug);
  const brand = brandOf(item.slug);
  const appendix = `

## รุ่นในซีรีส์ที่เว็บมีหน้าแยก

${children.length ? children.map((c) => `- [${c.title}](/รับซื้อโน๊ตบุ๊ค/${c.slug}/)`).join('\n') : '- ยังไม่มีหน้ารุ่นย่อยแยก — ส่งชื่อรุ่นย่อยจากเครื่องจริงมาประเมินได้'}

## Series Authority Hub: สิ่งที่ต้องแจ้ง

- ชื่อรุ่นย่อยเต็มของ ${item.title}
- CPU / GPU (ถ้ามี) / RAM / SSD จากหน้าจอระบบ
- สภาพจอ บานพับ คีย์บอร์ด พอร์ต
- ที่ชาร์จและอาการที่พบ

> หน้านี้เป็น Series Authority Hub ของ ${item.title} ไม่ใช่หน้ารับซื้อทั่วไป และไม่ใช่หน้ารุ่นเดียวตายตัว

## ลิงก์แบรนด์และคู่มือ

- [หน้าแบรนด์](/รับซื้อโน๊ตบุ๊ค/${brand}/)
- [รับซื้อโน๊ตบุ๊คมือสอง](/รับซื้อโน๊ตบุ๊คมือสอง/)
- [วิธีดูสเปก CPU RAM SSD](/blog/วิธีดูสเปก-cpu-ram-ssd-ของโน๊ตบุ๊ค/)
`;
  fs.writeFileSync(abs, `${raw.trimEnd()}\n${appendix}\n`, 'utf8');
  changed.push(item.slug);
}
console.log(JSON.stringify({ changed: changed.length, slugs: changed }, null, 2));
