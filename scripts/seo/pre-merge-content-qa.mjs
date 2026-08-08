/**
 * Pre-merge content QA: province similarity, claims, titles, sample checklist CSV.
 * Usage: node scripts/seo/pre-merge-content-qa.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const outDir = path.join(root, 'docs/content-quality-upgrade');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) out.push(...walk(p));
    else if (/\.(md|mdx|astro)$/i.test(name.name)) out.push(p);
  }
  return out;
}

function splitFm(raw) {
  if (!raw.startsWith('---')) return { fm: '', body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { fm: '', body: raw };
  return { fm: raw.slice(0, end + 4), body: raw.slice(end + 4).trim() };
}

function normalize(text) {
  return text
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_`|*\-]/g, ' ')
    .replace(/\d+/g, '#')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function shingles(text, n = 3) {
  const t = normalize(text).replace(/\s/g, '');
  const set = new Set();
  if (t.length < n) {
    if (t) set.add(t);
    return set;
  }
  for (let i = 0; i <= t.length - n; i++) set.add(t.slice(i, i + n));
  return set;
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

function getField(fm, key) {
  const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return m ? m[1].replace(/^["']|["']$/g, '').trim() : '';
}

function headings(body) {
  return (body.match(/^#{2,3}\s+.+$/gm) || []).map((h) => h.replace(/^#+\s+/, '').replace(/ใน[^ ]+$/, 'ใน{PROV}'));
}

function faqBlock(fm) {
  const m = fm.match(/^faqs:\n([\s\S]*?)(?=^[a-zA-Z_]+:|\n---)/m);
  return m ? m[1] : '';
}

// --- Province similarity ---
const locDir = path.join(root, 'src/content/locations');
const provinces = walk(locDir)
  .filter((f) => f.endsWith('.md'))
  .map((file) => {
    const raw = fs.readFileSync(file, 'utf8');
    const { fm, body } = splitFm(raw);
    const title = getField(fm, 'title') || path.basename(file, '.md');
    const slug = getField(fm, 'slug') || title;
    return {
      file: path.relative(root, file).replace(/\\/g, '/'),
      title,
      slug,
      body,
      opening: body.slice(0, 450),
      headings: headings(body).join(' | '),
      faqs: faqBlock(fm),
      bodySh: shingles(body),
      openSh: shingles(body.slice(0, 450)),
      headSh: shingles(headings(body).join(' ')),
      faqSh: shingles(faqBlock(fm)),
    };
  });

const pairRows = [['pair', 'body', 'opening', 'headings', 'faq', 'max', 'band']];
let critical = 0;
let high = 0;
let medium = 0;
const highPairs = [];

for (let i = 0; i < provinces.length; i++) {
  for (let j = i + 1; j < provinces.length; j++) {
    const a = provinces[i];
    const b = provinces[j];
    const body = jaccard(a.bodySh, b.bodySh);
    const opening = jaccard(a.openSh, b.openSh);
    const head = jaccard(a.headSh, b.headSh);
    const faq = jaccard(a.faqSh, b.faqSh);
    const max = Math.max(body, opening);
    let band = 'Acceptable';
    if (max > 0.9) {
      band = 'Critical';
      critical++;
    } else if (max >= 0.8) {
      band = 'High';
      high++;
      highPairs.push({ a: a.slug, b: b.slug, body, opening, head, faq });
    } else if (max >= 0.65) {
      band = 'Medium';
      medium++;
    }
    if (max >= 0.65) {
      pairRows.push([
        `${a.slug}||${b.slug}`,
        body.toFixed(3),
        opening.toFixed(3),
        head.toFixed(3),
        faq.toFixed(3),
        max.toFixed(3),
        band,
      ]);
    }
  }
}

fs.writeFileSync(path.join(outDir, '23-province-deep-qa.csv'), pairRows.map((r) => r.join(',')).join('\n'), 'utf8');

// --- Claims ---
const CLAIM_RES = [
  [/ราคาสูงที่สุด/, 'highest_price'],
  [/ให้ราคาดีที่สุด/, 'best_price'],
  [/อันดับ\s*1/, 'rank_one'],
  [/ดีที่สุด/, 'best_generic'],
  [/มีสาขา/, 'has_branch'],
  [/สาขาประจำ/, 'branch_office'],
  [/ทีมประจำจังหวัด/, 'resident_team'],
  [/รับถึงบ้านทุก/, 'door_to_door_all'],
  [/ถึงภายใน\s*\d+\s*นาที/, 'eta_minutes'],
  [/ภายใน\s*30\s*นาที/, 'eta_30'],
  [/ภายใน\s*1\s*ชั่วโมง/, 'eta_1h'],
  [/ลูกค้ากว่า/, 'customer_count'],
  [/หลายพันราย/, 'thousands_customers'],
  [/\d+\s*ปีประสบการณ์/, 'years_exp'],
  [/ประสบการณ์\s*\d+\s*ปี/, 'years_exp2'],
];

const claimRows = [['claim', 'url_or_file', 'snippet', 'status']];
let unsupported = 0;
const contentRoots = [
  path.join(root, 'src/content'),
  path.join(root, 'src/pages'),
  path.join(root, 'src/components'),
];
for (const base of contentRoots) {
  for (const file of walk(base)) {
    const raw = fs.readFileSync(file, 'utf8');
    const rel = path.relative(root, file).replace(/\\/g, '/');
    for (const [re, label] of CLAIM_RES) {
      const m = raw.match(re);
      if (!m) continue;
      // Context exceptions: "ไม่ใช่สาขา", "ไม่มีสาขา", FAQ denying branches
      const idx = raw.indexOf(m[0]);
      const ctx = raw.slice(Math.max(0, idx - 40), idx + m[0].length + 40);
      const denied =
        /ไม่มีสาขา|ไม่ใช่สาขา|อย่าเข้าใจว่ามีสาขา|ไม่ได้หมายความว่ามีสาขา|ไม่ได้แปลว่า.+มีสาขา|ไม่ใช่การมีสาขา|ห้าม.*สาขา|ไม่.*ดีที่สุด|ไม่.*ราคาสูง/.test(
          ctx,
        );
      const status = denied
        ? 'Valid_negation'
        : label === 'best_generic' && /(อะไหล่|เกณฑ์|หน้าจอ|วิธีที่|ทางที่|แนวทางที่|จะดีที่สุด|ป้องกันดีที่สุด|ส่งวิดีโอ)/.test(ctx)
          ? 'Valid_idiom_or_context'
          : 'Unsupported';
      if (status === 'Unsupported') unsupported++;
      claimRows.push([label, rel, JSON.stringify(ctx.replace(/\s+/g, ' ').slice(0, 120)), status]);
    }
  }
}
fs.writeFileSync(path.join(outDir, '26-claim-register.csv'), claimRows.map((r) => r.join(',')).join('\n'), 'utf8');

// --- Titles from inventory ---
const invPath = path.join(outDir, '01-url-inventory.csv');
const inv = fs.readFileSync(invPath, 'utf8').trim().split(/\n/).slice(1);
const titleMap = new Map();
for (const line of inv) {
  // naive CSV split respecting quotes poorly; use inventory Score file instead for titles
  const cols = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') q = !q;
    else if (c === ',' && !q) {
      cols.push(cur);
      cur = '';
    } else cur += c;
  }
  cols.push(cur);
  const url = cols[0];
  const type = cols[1];
  const title = cols[3];
  const indexable = cols[6];
  if (!String(indexable).startsWith('yes')) continue;
  if (!title) continue;
  if (!titleMap.has(title)) titleMap.set(title, []);
  titleMap.get(title).push({ url, type });
}
const titleRows = [['title', 'count', 'urls', 'classification']];
let exactDup = 0;
for (const [title, list] of titleMap) {
  if (list.length < 2) continue;
  exactDup++;
  const types = new Set(list.map((x) => x.type));
  const classification =
    types.size === 1 && (types.has('Model') || types.has('Series') || types.has('Province'))
      ? 'Valid_repeated_pattern'
      : 'Problematic_exact_duplicate';
  titleRows.push([JSON.stringify(title), list.length, list.map((x) => x.url).join(' | '), classification]);
}
fs.writeFileSync(path.join(outDir, '25-title-duplicate-audit.csv'), titleRows.map((r) => r.join(',')).join('\n'), 'utf8');

console.log(
  JSON.stringify(
    {
      provinces: provinces.length,
      similarity: { critical, high, medium, highPairs: highPairs.slice(0, 15) },
      unsupportedClaims: unsupported,
      claimHits: claimRows.length - 1,
      exactDuplicateTitles: exactDup,
      problematicTitles: titleRows.filter((r) => r[3] === 'Problematic_exact_duplicate').length,
    },
    null,
    2,
  ),
);
