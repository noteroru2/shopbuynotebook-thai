/**
 * Build sitewide URL inventory + quality baseline from content + static routes.
 * Output: docs/content-quality-upgrade/01-url-inventory.csv
 *         docs/content-quality-upgrade/02-quality-baseline.csv
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const outDir = path.join(root, 'docs/content-quality-upgrade');

const BRAND_HUBS = new Set([
  'asus', 'acer', 'lenovo', 'hp', 'dell', 'msi', 'macbook', 'surface', 'gaming',
  'samsung', 'huawei', 'lg', 'honor', 'razer', 'gigabyte', 'office',
]);

function walk(dir, ext = '.md') {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) out.push(...walk(p, ext));
    else if (name.name.endsWith(ext) || name.name.endsWith('.mdx')) out.push(p);
  }
  return out;
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { data: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: raw };
  const fm = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\s+/, '');
  const data = {};
  let key = null;
  let buf = [];
  const flush = () => {
    if (!key) return;
    const v = buf.join('\n').trim();
    if (v.startsWith('- ')) {
      data[key] = v
        .split('\n')
        .map((l) => l.replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else {
      data[key] = v.replace(/^["']|["']$/g, '');
    }
    key = null;
    buf = [];
  };
  for (const line of fm.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (m && !line.startsWith('  ')) {
      flush();
      key = m[1];
      if (m[2] !== '') buf = [m[2]];
      else buf = [];
    } else if (key) {
      buf.push(line);
    }
  }
  flush();
  return { data, body };
}

function thaiWordCount(text) {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return 0;
  // Approximate: Thai has few spaces; count grapheme clusters / 1.6 as words + latin words
  const latin = (cleaned.match(/[A-Za-z0-9]+/g) || []).length;
  const thaiChars = (cleaned.match(/[\u0E00-\u0E7F]/g) || []).length;
  return latin + Math.round(thaiChars / 3.2);
}

function classifyBrand(slug) {
  if (BRAND_HUBS.has(slug)) return 'Brand';
  const parts = slug.split('-');
  if (parts.length >= 3 || /m\d|rtx|gen/i.test(slug)) return 'Model';
  return 'Series';
}

function scorePage({ pageType, wordCount, body, title, h1, hasFaqs }) {
  let intent = 12;
  let unique = 10;
  let depth = 8;
  let entity = 6;
  let linking = 5;
  let semantic = 5;
  let trust = 5;
  let conversion = 3;

  if (title && h1) intent += 4;
  if (/(ส่งรูป|ประเมิน|LINE|ไลน์|สเปก|สภาพ)/i.test(body)) intent += 4;

  const templateHits = [
    /หากคุณกำลังอาศัยอยู่ใน/,
    /คุณมาถูกที่แล้วครับ/,
    /⭐⭐⭐⭐⭐/,
    /ทำไมคนใน.+ถึงเลือกขาย/,
    /ยินดีต้อนรับสู่บริการ/,
  ].filter((re) => re.test(body)).length;
  unique += Math.max(0, 10 - templateHits * 3);
  if (wordCount >= 250) unique += 2;
  if (wordCount >= 450) depth += 4;
  if (wordCount >= 700) depth += 3;
  if (hasFaqs) {
    semantic += 3;
    depth += 2;
  }
  if (/อุบลราชธานี|ไม่ใช่สาขา|หน้าร้านจริง/.test(body)) trust += 3;
  if (/แอดไลน์|@webuy|0642579353|ส่งรูป/.test(body)) conversion += 2;
  if (/\[[^\]]+\]\(\//.test(body)) linking += 4;
  if (/^## /m.test(body)) semantic += 2;

  if (pageType === 'Province' || pageType === 'District/location') {
    if (templateHits >= 2) unique = Math.min(unique, 8);
    if (/⭐⭐⭐⭐⭐/.test(body)) unique = Math.min(unique, 6);
  }
  if (pageType === 'Homepage' || pageType.startsWith('Primary') || pageType.includes('service')) {
    intent = Math.min(20, intent + 2);
  }

  const total = Math.min(
    100,
    intent + unique + depth + entity + linking + semantic + trust + conversion,
  );
  let status = 'Critical thin/template';
  if (total >= 85) status = 'Strong';
  else if (total >= 70) status = 'Good';
  else if (total >= 55) status = 'Needs improvement';
  else if (total >= 40) status = 'Thin';
  return { total, status, templateHits };
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function row(cols) {
  return cols.map(csvEscape).join(',');
}

const staticRoutes = [
  { url: '/', pageType: 'Homepage', source: 'src/pages/index.astro', intent: 'Core transactional รับซื้อโน๊ตบุ๊ค', priority: 1 },
  { url: '/รับซื้อ-notebook/', pageType: 'Notebook-English', source: 'src/pages/รับซื้อ-notebook.astro', intent: 'English spelling notebook service', priority: 1 },
  { url: '/รับซื้อโน๊ตบุ๊คมือสอง/', pageType: 'Second-hand', source: 'src/pages/รับซื้อโน๊ตบุ๊คมือสอง.astro', intent: 'Used notebook resale', priority: 1 },
  { url: '/รับซื้อโน๊ตบุ๊คบริษัท/', pageType: 'Secondary service', source: 'src/pages/รับซื้อโน๊ตบุ๊คบริษัท.astro', intent: 'Corporate / bulk sell', priority: 1 },
  { url: '/เช็คราคาโน๊ตบุ๊ค/', pageType: 'Price/valuation', source: 'src/pages/เช็คราคาโน๊ตบุ๊ค.astro', intent: 'Check price before selling', priority: 1 },
  { url: '/เช็คราคาโน๊ตบุ๊คมือสอง/', pageType: 'Price/valuation', source: 'src/pages/เช็คราคาโน๊ตบุ๊คมือสอง.astro', intent: 'Used price check', priority: 1 },
  { url: '/ตีราคาโน๊ตบุ๊ค/', pageType: 'Price/valuation', source: 'src/pages/ตีราคาโน๊ตบุ๊ค.astro', intent: 'Valuation methodology', priority: 1 },
  { url: '/ขายโน๊ตบุ๊ค/', pageType: 'Secondary service', source: 'src/pages/ขายโน๊ตบุ๊ค.astro', intent: 'Seller preparation guide', priority: 1 },
  { url: '/ขายโน๊ตบุ๊คด่วน/', pageType: 'Secondary service', source: 'src/pages/ขายโน๊ตบุ๊คด่วน.astro', intent: 'Fast sell flow', priority: 2 },
  { url: '/วิธีขายโน๊ตบุ๊ค/', pageType: 'Guide', source: 'src/pages/วิธีขายโน๊ตบุ๊ค/index.astro', intent: 'How to sell guide', priority: 2 },
  { url: '/รับเหมาโน๊ตบุ๊ค/', pageType: 'Secondary service', source: 'src/pages/รับเหมาโน๊ตบุ๊ค.astro', intent: 'Bulk notebook buyout', priority: 2 },
  { url: '/รับเหมาคอมพิวเตอร์/', pageType: 'Secondary service', source: 'src/pages/รับเหมาคอมพิวเตอร์.astro', intent: 'Bulk computer buyout', priority: 2 },
  { url: '/รับประมูลคอม/', pageType: 'Secondary service', source: 'src/pages/รับประมูลคอม.astro', intent: 'Auction / tender', priority: 2 },
  { url: '/พื้นที่ให้บริการ/', pageType: 'Utility', source: 'src/pages/พื้นที่ให้บริการ/index.astro', intent: 'Service area hub', priority: 2 },
  { url: '/คำถามที่พบบ่อย/', pageType: 'FAQ', source: 'src/pages/คำถามที่พบบ่อย/index.astro', intent: 'Site FAQ', priority: 2 },
  { url: '/เกี่ยวกับเรา/', pageType: 'About', source: 'src/pages/เกี่ยวกับเรา.astro', intent: 'About business', priority: 2 },
  { url: '/ติดต่อเรา/', pageType: 'Contact', source: 'src/pages/ติดต่อเรา.astro', intent: 'Contact', priority: 2 },
  { url: '/นโยบายความเป็นส่วนตัว/', pageType: 'Legal', source: 'src/pages/นโยบายความเป็นส่วนตัว.astro', intent: 'Privacy', priority: 3 },
  { url: '/ขั้นตอนและเงื่อนไขการให้บริการ/', pageType: 'Legal', source: 'src/pages/ขั้นตอนและเงื่อนไขการให้บริการ.astro', intent: 'Terms', priority: 3 },
  { url: '/เว็บไซต์ในเครือ/', pageType: 'Utility', source: 'src/pages/เว็บไซต์ในเครือ/index.astro', intent: 'Partner sites', priority: 3 },
  { url: '/blog/', pageType: 'Blog', source: 'src/pages/blog/index.astro', intent: 'Blog hub', priority: 2 },
  { url: '/sitemap/', pageType: 'Utility', source: 'src/pages/sitemap.astro', intent: 'HTML sitemap', priority: 3 },
];

const rows = [];
const qualityRows = [];

for (const r of staticRoutes) {
  const abs = path.join(root, r.source);
  const raw = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
  const body = raw.replace(/---[\s\S]*?---/, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ');
  const title = (raw.match(/const title = ['`]([^'`]+)['`]/) || [])[1] || '';
  const h1 = (raw.match(/h1=["']([^"']+)["']/) || raw.match(/title=["']([^"']+)["']/) || [])[1] || title;
  const wc = thaiWordCount(body);
  const scored = scorePage({
    pageType: r.pageType,
    wordCount: wc,
    body,
    title,
    h1,
    hasFaqs: /faqs\s*=/.test(raw),
  });
  rows.push({
    URL: r.url,
    'Page type': r.pageType,
    'Source file/data source': r.source,
    'Current title': title,
    'Current H1': h1,
    'Word count': wc,
    Indexable: 'yes',
    Canonical: `https://ร้านรับซื้อโน๊ตบุ๊ค.com${r.url}`,
    'Internal inbound links': 'TBD',
    'Content template': r.pageType.includes('service') || r.pageType.includes('Price') ? 'ServicePageShell' : 'custom',
    'Similarity risk': scored.templateHits >= 2 ? 'High' : scored.templateHits === 1 ? 'Medium' : 'Low',
    'Search intent': r.intent,
    'Quality status': scored.status,
    Priority: r.priority,
    Score: scored.total,
  });
}

function addCollection(dirRel, urlFn, typeFn, priorityFn) {
  const dir = path.join(root, dirRel);
  for (const file of walk(dir)) {
    const raw = fs.readFileSync(file, 'utf8');
    const { data, body } = parseFrontmatter(raw);
    const slug = data.slug || path.basename(file).replace(/\.(md|mdx)$/i, '');
    const pageType = typeFn(slug, data);
    const title = data.seoTitle || data.title || '';
    const h1 = data.pageH1 || data.h1 || data.title || '';
    const wc = thaiWordCount(body);
    const scored = scorePage({
      pageType,
      wordCount: wc,
      body,
      title,
      h1,
      hasFaqs: Array.isArray(data.faqs) ? data.faqs.length > 0 : /faqs:/.test(raw),
    });
    const url = urlFn(slug);
    rows.push({
      URL: url,
      'Page type': pageType,
      'Source file/data source': path.relative(root, file).replace(/\\/g, '/'),
      'Current title': title,
      'Current H1': h1,
      'Word count': wc,
      Indexable: 'yes',
      Canonical: `https://ร้านรับซื้อโน๊ตบุ๊ค.com${url}`,
      'Internal inbound links': 'TBD',
      'Content template': pageType === 'Province' || pageType === 'District/location' ? 'location-md+LocationLayout' : `${pageType.toLowerCase()}-md`,
      'Similarity risk': scored.templateHits >= 2 ? 'High' : scored.templateHits === 1 ? 'Medium' : 'Low',
      'Search intent': pageType,
      'Quality status': scored.status,
      Priority: priorityFn(slug, pageType),
      Score: scored.total,
    });
  }
}

addCollection(
  'src/content/brands',
  (slug) => `/รับซื้อโน๊ตบุ๊ค/${slug}/`,
  (slug) => classifyBrand(slug),
  (_slug, type) => (type === 'Brand' ? 1 : 2),
);
addCollection(
  'src/content/conditions',
  (slug) => `/รับซื้อโน๊ตบุ๊ค/${slug}/`,
  () => 'Condition',
  () => 1,
);
addCollection(
  'src/content/locations',
  (slug) => `/รับซื้อโน๊ตบุ๊ค/${slug}/`,
  (slug, data) => {
    if (String(slug).startsWith('ภาค') || ['ใกล้ฉัน', 'ทั่วไทย'].includes(slug)) return 'District/location';
    if ((data.region || '').includes('ภาค') || data.kind === 'location') return 'Province';
    return 'Province';
  },
  (slug) => (slug === 'อุบลราชธานี' || slug === 'กรุงเทพ' ? 1 : 2),
);
addCollection(
  'src/content/blog',
  (slug) => `/blog/${slug}/`,
  () => 'Blog',
  () => 3,
);

// Combo pages summary row (not exploding 2088 rows with full content)
rows.push({
  URL: '/รับซื้อโน๊ตบุ๊ค/{location}/{brand|condition}/',
  'Page type': 'Noindex combo',
  'Source file/data source': 'src/pages/รับซื้อโน๊ตบุ๊ค/[location]/[slug].astro',
  'Current title': 'generated',
  'Current H1': 'generated',
  'Word count': 0,
  Indexable: 'no (Tier C / sitemap excluded)',
  Canonical: 'self or parent (see route)',
  'Internal inbound links': 'TBD',
  'Content template': 'combo-template',
  'Similarity risk': 'Critical',
  'Search intent': 'Long-tail geo×topic',
  'Quality status': 'Critical thin/template',
  Priority: 99,
  Score: 25,
});

fs.mkdirSync(outDir, { recursive: true });

const invHeader = [
  'URL', 'Page type', 'Source file/data source', 'Current title', 'Current H1', 'Word count',
  'Indexable', 'Canonical', 'Internal inbound links', 'Content template', 'Similarity risk',
  'Search intent', 'Quality status', 'Priority',
];
const invLines = [invHeader.join(',')];
for (const r of rows) {
  invLines.push(row(invHeader.map((h) => r[h])));
}
fs.writeFileSync(path.join(outDir, '01-url-inventory.csv'), invLines.join('\n'), 'utf8');

const qHeader = ['URL', 'Page type', 'Score', 'Quality status', 'Word count', 'Similarity risk', 'Priority'];
const qLines = [qHeader.join(',')];
for (const r of rows) {
  qLines.push(row(qHeader.map((h) => r[h])));
  qualityRows.push(r);
}
fs.writeFileSync(path.join(outDir, '02-quality-baseline.csv'), qLines.join('\n'), 'utf8');

const indexable = rows.filter((r) => String(r.Indexable).startsWith('yes'));
const avg = indexable.reduce((a, r) => a + r.Score, 0) / Math.max(1, indexable.length);
const byStatus = {};
for (const r of indexable) byStatus[r['Quality status']] = (byStatus[r['Quality status']] || 0) + 1;

console.log(JSON.stringify({
  totalRows: rows.length,
  indexable: indexable.length,
  averageScore: Math.round(avg * 10) / 10,
  byStatus,
  highSimilarity: indexable.filter((r) => r['Similarity risk'] === 'High' || r['Similarity risk'] === 'Critical').length,
}, null, 2));
