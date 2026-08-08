/**
 * Light-touch append for mid-tier model pages (200–360 words):
 * keep unique prose, add evaluation/photo/link sections only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const brandsDir = path.join(root, 'src/content/brands');
const BRAND_HUBS = new Set([
  'asus', 'acer', 'lenovo', 'hp', 'dell', 'msi', 'macbook', 'surface', 'gaming',
  'samsung', 'huawei', 'lg', 'honor', 'razer', 'gigabyte',
]);

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { head: '', data: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { head: '', data: {}, body: raw };
  const head = raw.slice(0, end + 4);
  const fm = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\s+/, '');
  const data = {};
  let key = null; let buf = [];
  const flush = () => {
    if (!key) return;
    const v = buf.join('\n').trim();
    if (v.startsWith('- ') || buf.some((l) => /^\s*-\s+/.test(l))) {
      data[key] = v.split('\n').map((l) => l.replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, '')).filter(Boolean);
    } else data[key] = v.replace(/^["']|["']$/g, '');
    key = null; buf = [];
  };
  for (const line of fm.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (m && !line.startsWith('  ') && !line.startsWith('- ')) {
      flush(); key = m[1]; buf = m[2] !== '' ? [m[2]] : [];
    } else if (key) buf.push(line);
  }
  flush();
  return { head, data, body };
}

function thaiWordCount(text) {
  const cleaned = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[#>*_`|]/g, ' ').replace(/\s+/g, ' ').trim();
  return (cleaned.match(/[A-Za-z0-9]+/g) || []).length + Math.round((cleaned.match(/[\u0E00-\u0E7F]/g) || []).length / 3.2);
}

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

const changed = [];
for (const file of fs.readdirSync(brandsDir).filter((f) => f.endsWith('.md'))) {
  const abs = path.join(brandsDir, file);
  const raw = fs.readFileSync(abs, 'utf8');
  const { head, data, body } = parseFrontmatter(raw);
  const slug = data.slug || file.replace(/\.md$/, '');
  if (classify(slug) !== 'Model') continue;
  const words = thaiWordCount(`${data.description || ''}\n${body}`);
  if (words < 200 || words > 380) continue;
  if (/Authority append|จุดที่ควรถ่ายรูปส่งประเมิน/.test(body)) continue;

  const title = data.title || slug;
  const brand = brandOf(slug);
  const series = findSeries(slug);
  const popular = Array.isArray(data.popularModels) ? data.popularModels : [];
  const appendix = [
    '',
    '## สเปกที่ต้องแจ้งสำหรับรุ่นนี้',
    popular.length
      ? `คลังเนื้อหาอ้างอิงกลุ่มเช่น ${popular.slice(0, 3).join(', ')} — แต่เครื่องจริงอาจต่างสเปกย่อย จึงควรแจ้ง CPU, GPU (ถ้ามี), RAM และ SSD จากหน้าจอระบบ`
      : 'รุ่นนี้มีหลายสเปกย่อยได้ จึงควรแจ้ง CPU, GPU (ถ้ามี), RAM และ SSD ของเครื่องจริงก่อนประเมินราคา',
    '',
    '## จุดที่ควรถ่ายรูปส่งประเมิน',
    '- ฝาบน / หน้าจอ / คีย์บอร์ด',
    '- ก้นเครื่องหรือป้ายรุ่น',
    '- หน้าจอสเปกระบบ',
    '- ที่ชาร์จและจุดตำหนิ',
    '',
    '<!-- Authority append -->',
    '## ลิงก์แบรนด์ / ซีรีส์',
    `- [หน้าแบรนด์](/รับซื้อโน๊ตบุ๊ค/${brand}/)`,
    series ? `- [หน้าซีรีส์](/รับซื้อโน๊ตบุ๊ค/${series}/)` : null,
    '- [เช็คราคาโน๊ตบุ๊ค](/เช็คราคาโน๊ตบุ๊ค/)',
    '- [วิธีดูสเปก CPU RAM SSD](/blog/วิธีดูสเปก-cpu-ram-ssd-ของโน๊ตบุ๊ค/)',
  ].filter((l) => l !== null).join('\n');

  // Add faqs if missing
  let newHead = head;
  if (!/^faqs:/m.test(head)) {
    const faqs = [
      `faqs:`,
      `  - question: ${JSON.stringify(`${title} ต้องแจ้งสเปกย่อยก่อนประเมินไหม?`)}`,
      `    answer: ${JSON.stringify('ควรแจ้งหรือส่งรูปหน้าจอระบบ เพราะรุ่นการตลาดเดียวกันอาจต่าง CPU/GPU/RAM/SSD')}`,
      `  - question: ${JSON.stringify(`${title} ไม่มีที่ชาร์จประเมินได้ไหม?`)}`,
      `    answer: ${JSON.stringify('ประเมินได้ โดยแจ้งให้ชัดว่าไม่มีที่ชาร์จ และส่งรูปเครื่องกับสเปกให้ครบ')}`,
    ].join('\n');
    newHead = head.replace(/\n---\s*$/, `\n${faqs}\n---\n`);
  }

  const next = `${newHead}\n${body.trim()}\n${appendix}\n`;
  fs.writeFileSync(abs, next, 'utf8');
  changed.push({ slug, beforeWords: words, afterWords: thaiWordCount(body + appendix) });
}

console.log(JSON.stringify({ changed: changed.length, items: changed }, null, 2));
