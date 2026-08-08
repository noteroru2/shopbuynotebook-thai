/**
 * Content quality gate for indexable content files.
 * Does NOT auto-noindex. Reports PASS / PASS_WITH_WARNING / FAIL_*.
 *
 * Usage: node scripts/seo/content-quality-gate.mjs
 * Output: docs/content-quality-upgrade/16-content-quality-final.csv
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const outDir = path.join(root, 'docs/content-quality-upgrade');

const FAKE_CLAIM_RES = [
  /ราคาสูงที่สุด/,
  /สาขาในจังหวัด/,
  /มีสาขาประจำ/,
  /ทีมงานประจำจังหวัด/,
  /ถึงภายใน\s*\d+\s*นาที/,
  /นัดภายในวันเดียว/,
  /รีวิวจากลูกค้าจริง\s*\d+/,
  /ลูกค้ากว่า\s*\d+/,
  /ประสบการณ์\s*\d+\s*ปี/,
];

const TEMPLATE_RES = [
  /หากคุณกำลังอาศัยอยู่ใน\s*\*\*/,
  /คุณมาถูกที่แล้วครับ!/,
  /⭐⭐⭐⭐⭐/,
  /ทำไมคนใน.+ถึงเลือกขายโน๊ตบุ๊คกับเรา/,
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) out.push(...walk(p));
    else if (/\.(md|mdx)$/i.test(name.name)) out.push(p);
  }
  return out;
}

function splitFm(raw) {
  if (!raw.startsWith('---')) return { fm: '', body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { fm: '', body: raw };
  return { fm: raw.slice(0, end + 4), body: raw.slice(end + 4) };
}

function gateFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const { fm, body } = splitFm(raw);
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const issues = [];
  let verdict = 'PASS';

  const title = (fm.match(/^seoTitle:\s*(.+)$/m) || fm.match(/^title:\s*(.+)$/m) || [])[1];
  const h1 = (fm.match(/^pageH1:\s*(.+)$/m) || fm.match(/^h1:\s*(.+)$/m) || fm.match(/^title:\s*(.+)$/m) || [])[1];
  const desc = (fm.match(/^description:\s*(.+)$/m) || [])[1];
  if (!title) issues.push('missing_title');
  if (!h1) issues.push('missing_h1');
  if (!desc) issues.push('missing_description');

  const bodyLen = body.replace(/\s+/g, '').length;
  if (bodyLen < 200) issues.push('thin_body');

  if (/TODO|TBD|lorem ipsum|\[placeholder\]/i.test(raw)) issues.push('placeholder');

  for (const re of FAKE_CLAIM_RES) {
    if (re.test(raw)) issues.push(`fake_claim:${re}`);
  }
  let templateHits = 0;
  for (const re of TEMPLATE_RES) {
    if (re.test(body)) templateHits++;
  }
  if (templateHits >= 2) issues.push('duplicate_template');

  if (rel.includes('/locations/') && !/อุบลราชธานี|ไม่ใช่สาขา|หน้าร้านจริง/.test(body + fm)) {
    issues.push('missing_storefront_clarity');
  }

  if (issues.some((i) => i.startsWith('fake_claim') || i === 'placeholder')) verdict = 'FAIL_DATA';
  else if (issues.includes('duplicate_template')) verdict = 'FAIL_DUPLICATE';
  else if (issues.includes('thin_body') || issues.includes('missing_title')) verdict = 'FAIL_CONTENT';
  else if (issues.length) verdict = 'PASS_WITH_WARNING';

  return { rel, verdict, issues: issues.join('|') || '', templateHits, bodyLen };
}

const files = [
  ...walk(path.join(root, 'src/content/brands')),
  ...walk(path.join(root, 'src/content/conditions')),
  ...walk(path.join(root, 'src/content/locations')),
  ...walk(path.join(root, 'src/content/blog')),
];

const results = files.map(gateFile);
fs.mkdirSync(outDir, { recursive: true });
const lines = ['source,verdict,templateHits,bodyLen,issues'];
for (const r of results) {
  lines.push([r.rel, r.verdict, r.templateHits, r.bodyLen, JSON.stringify(r.issues)].join(','));
}
fs.writeFileSync(path.join(outDir, '16-content-quality-final.csv'), lines.join('\n'), 'utf8');

const summary = results.reduce((acc, r) => {
  acc[r.verdict] = (acc[r.verdict] || 0) + 1;
  return acc;
}, {});
console.log(JSON.stringify({ files: results.length, summary }, null, 2));
