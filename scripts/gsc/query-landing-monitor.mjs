/**
 * Import a GSC Search Appearance / Performance export and map queries to
 * intended landing pages. Does NOT mutate the website.
 *
 * Expected CSV columns (flexible):
 * Query|query, Page|page|Landing Page, Date|date (optional),
 * Clicks|clicks, Impressions|impressions, CTR|ctr, Position|position
 *
 * Usage:
 *   node scripts/gsc/query-landing-monitor.mjs --input path/to/export.csv --out docs/authority-phase/gsc-alignment.csv
 */
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const out = { input: '', out: 'docs/authority-phase/gsc-alignment.csv' };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--input') out.input = argv[++i];
    else if (argv[i] === '--out') out.out = argv[++i];
  }
  return out;
}

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

function csvEscape(v) {
  const t = String(v ?? '');
  return /[",\r\n]/.test(t) ? `"${t.replaceAll('"', '""')}"` : t;
}

function normKey(row, aliases) {
  for (const a of aliases) {
    for (const k of Object.keys(row)) {
      if (k.toLowerCase().replace(/\s+/g, '') === a.toLowerCase().replace(/\s+/g, '')) return row[k];
    }
  }
  return '';
}

function pathnameOf(page) {
  try {
    if (!page) return '';
    if (page.startsWith('/')) return page.endsWith('/') || page === '/' ? page : `${page}/`;
    return new URL(page).pathname.endsWith('/') ? new URL(page).pathname : `${new URL(page).pathname}/`;
  } catch {
    return page;
  }
}

function clusterOf(query) {
  const q = query.toLowerCase();
  if (/รับซื้อ\s*notebook|รับซื้อnotebook/.test(q)) return 'notebook_english';
  if (/มือสอง/.test(q) && /(รับซื้อ|ขาย)/.test(q)) return 'second_hand';
  if (/เช็คราคา|ราคาเท่าไหร่|ขายได้เท่าไหร่/.test(q)) return 'price_check';
  if (/ตีราคา|ประเมินราคา/.test(q)) return 'valuation';
  if (/จอแตก|เปิดไม่ติด|เครื่องเสีย|แบต|น้ำเข้า/.test(q)) return 'condition';
  if (/ใกล้ฉัน|อุบล|กรุงเทพ|เชียงใหม่|ขอนแก่น|นนทบุรี|ชลบุรี/.test(q)) return 'local';
  if (/asus|acer|lenovo|hp|dell|msi|macbook|surface/.test(q)) {
    if (/m[1-5]|g14|g16|katana|legion|victus|zephyrus|nitro|predator/.test(q)) return 'model';
    return 'brand';
  }
  if (/รับซื้อโน[๊็]ตบุ[๊็]ค|ร้านรับซื้อโน[๊็]ตบุ[๊็]ค|รับซื้อโน้ตบุ๊ก/.test(q)) return 'core';
  return 'other';
}

const INTENDED = {
  core: '/',
  notebook_english: '/รับซื้อ-notebook/',
  second_hand: '/รับซื้อโน๊ตบุ๊คมือสอง/',
  price_check: '/เช็คราคาโน๊ตบุ๊ค/',
  valuation: '/ตีราคาโน๊ตบุ๊ค/',
  condition: '/รับซื้อโน๊ตบุ๊ค/เครื่องเสีย/',
  brand: '/รับซื้อโน๊ตบุ๊ค/{brand}/',
  model: '/รับซื้อโน๊ตบุ๊ค/{model}/',
  local: '/รับซื้อโน๊ตบุ๊ค/{province}/',
  other: '',
};

function alignmentStatus({ clicks, impressions, actual, intended }) {
  if (!impressions || Number(impressions) < 10) return 'INSUFFICIENT_DATA';
  if (!actual || !intended) return 'INSUFFICIENT_DATA';
  if (actual === intended) return 'ALIGNED';
  // same type prefix soft match
  if (intended.includes('{') && actual.startsWith('/รับซื้อโน๊ตบุ๊ค/')) return 'PARTIAL';
  if (actual.split('/').filter(Boolean)[0] === intended.split('/').filter(Boolean)[0]) return 'PARTIAL';
  return 'MISALIGNED';
}

const args = parseArgs(process.argv);
if (!args.input || !fs.existsSync(args.input)) {
  // Write empty template + policy note when no export provided
  const headers = [
    'query', 'query-cluster', 'intended-page', 'actual-page', 'date',
    'clicks', 'impressions', 'ctr', 'weighted-position', 'alignment-status', 'notes',
  ];
  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, `${headers.join(',')}\r\n`, 'utf8');
  console.log(JSON.stringify({
    ok: true,
    mode: 'template_only',
    message: 'No GSC export provided. Wrote empty output headers. Pass --input export.csv when available.',
    out: args.out,
    clusters: INTENDED,
    consolidation_freeze_until: '2026-10-03', // T0 2026-08-08 + 56d
  }, null, 2));
  process.exit(0);
}

const rows = parseCsv(fs.readFileSync(args.input, 'utf8'));
const outRows = [];
for (const row of rows) {
  const query = normKey(row, ['Query', 'query', 'Search query']);
  const page = pathnameOf(normKey(row, ['Page', 'page', 'Landing Page', 'Landing page', 'URL']));
  const date = normKey(row, ['Date', 'date']);
  const clicks = normKey(row, ['Clicks', 'clicks']) || '0';
  const impressions = normKey(row, ['Impressions', 'impressions']) || '0';
  const ctr = normKey(row, ['CTR', 'ctr']) || '';
  const position = normKey(row, ['Position', 'position', 'Avg. position']) || '';
  if (!query) continue;
  const cluster = clusterOf(query);
  const intended = INTENDED[cluster] || '';
  const status = alignmentStatus({
    clicks: Number(clicks),
    impressions: Number(impressions),
    actual: page,
    intended: intended.includes('{') ? '' : intended,
  });
  outRows.push({
    query,
    'query-cluster': cluster,
    'intended-page': intended,
    'actual-page': page,
    date,
    clicks,
    impressions,
    ctr,
    'weighted-position': position,
    'alignment-status': status,
    notes: 'policy_map_not_gsc_confirmed',
  });
}

const headers = [
  'query', 'query-cluster', 'intended-page', 'actual-page', 'date',
  'clicks', 'impressions', 'ctr', 'weighted-position', 'alignment-status', 'notes',
];
fs.mkdirSync(path.dirname(args.out), { recursive: true });
fs.writeFileSync(
  args.out,
  [headers.join(','), ...outRows.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join('\r\n') + '\r\n',
  'utf8',
);
console.log(JSON.stringify({ ok: true, rows: outRows.length, out: args.out }, null, 2));
