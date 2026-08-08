import fs from 'node:fs';
import path from 'node:path';

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  const headers = rows.shift().map((v, i) => (i === 0 ? v.replace(/^\uFEFF/, '') : v));
  return rows.filter((v) => v.some(Boolean)).map((values) => Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ''])));
}

const base = parseCsv(fs.readFileSync('docs/content-quality-upgrade/02-quality-baseline.csv', 'utf8'))
  .filter((r) => r['Page type'] === 'Blog' && r.URL !== '/blog/')
  .sort((a, b) => Number(a.Score) - Number(b.Score) || Number(a['Word count']) - Number(b['Word count']));

const gscPaths = new Set();
for (const file of [
  'docs/batch-1b-1-fresh-gsc-reconciliation/crawled-not-indexed-audit.csv',
  'docs/batch-1b-1-fresh-gsc-reconciliation/discovered-priority-audit.csv',
]) {
  if (!fs.existsSync(file)) continue;
  const t = fs.readFileSync(file, 'utf8');
  for (const m of t.matchAll(/https?:\/\/[^,\s"]+\/blog\/[^,\s"]+/g)) {
    try {
      const u = new URL(m[0].replace(/\/$/, '') + '/');
      gscPaths.add(u.pathname.endsWith('/') ? u.pathname : `${u.pathname}/`);
    } catch { /* ignore */ }
  }
}

const strategic = [
  '/blog/วิธีดูสเปก-cpu-ram-ssd-ของโน๊ตบุ๊ค/',
  '/blog/วิธีดูรุ่นโน๊ตบุ๊ค-windows-ก่อนส่งประเมินราคา/',
  '/blog/โน๊ตบุ๊คไม่มีที่ชาร์จขายได้ไหม/',
  '/blog/โน๊ตบุ๊คเปิดไม่ติดขายได้ไหม/',
  '/blog/macbook-battery-health-มีผลต่อราคาไหม/',
  '/blog/macbook-cycle-count-เท่าไหร่ถึงราคาตก/',
  '/blog/ก่อนขายโน๊ตบุ๊คต้องล้างข้อมูลอย่างไร/',
  '/blog/macbook-ไม่มีที่ชาร์จ-ขายได้ไหม/',
  '/blog/รับซื้อโน๊ตบุ๊ค-core-i5-i7-ryzen-5-7-ราคาเท่าไหร่/',
];

const rows = [];
for (const r of base) {
  const inGsc = gscPaths.has(r.URL);
  const isStrategic = strategic.includes(r.URL);
  const score = Number(r.Score);
  const words = Number(r['Word count']);
  let priority = 'C';
  let action = 'defer';
  if ((inGsc || isStrategic) && (score < 85 || words < 450)) {
    priority = inGsc && words < 400 ? 'A' : 'B';
    action = 'enrich';
  } else if (score < 75 || words < 120) {
    priority = 'B';
    action = words < 120 ? 'enrich' : 'defer_unless_capacity';
  }
  rows.push({
    URL: r.URL,
    'Current score': score,
    Clicks: '',
    Impressions: inGsc ? 'gsc_export_signal' : '',
    Position: '',
    'GSC date range': inGsc ? 'batch-1b-1 fresh reconciliation 2026-07' : '',
    Intent: 'informational',
    'Supporting money page': '/เช็คราคาโน๊ตบุ๊ค/|/ตีราคาโน๊ตบุ๊ค/',
    'Content gap': words < 300 ? 'thin_body' : score < 85 ? 'depth_or_faq' : 'ok',
    'Enrichment priority': priority,
    Action: action,
    'Word count': words,
  });
}

function csvEscape(v) {
  const t = String(v ?? '');
  return /[",\r\n]/.test(t) ? `"${t.replaceAll('"', '""')}"` : t;
}
const headers = Object.keys(rows[0]);
const enrich = rows.filter((r) => r.Action === 'enrich');
fs.mkdirSync('docs/authority-phase', { recursive: true });
fs.writeFileSync(
  'docs/authority-phase/03-blog-opportunity.csv',
  [headers.join(','), ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join('\r\n') + '\r\n',
);
console.log(JSON.stringify({
  blogs: rows.length,
  enrich: enrich.length,
  enrichUrls: enrich.slice(0, 25).map((r) => `${r['Enrichment priority']} ${r['Word count']} ${r.URL}`),
}, null, 2));
