/**
 * QA + reports for Verified Model Enrichment Batch 4
 * Usage: node scripts/seo/model-enrichment-batch4-qa.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const outDir = path.join(root, 'docs/model-enrichment-batch-4');
fs.mkdirSync(outDir, { recursive: true });

const RESEARCHED = ['asus-rog-strix', 'hp-omen-17', 'dell-g15-g16', 'lenovo-legion-pro'];
const ENRICHED = ['asus-rog-strix', 'hp-omen-17', 'dell-g15-g16', 'lenovo-legion-pro'];
const DEFERRED = [];

const FROZEN_PATHS = [
  'src/pages/index.astro',
  'src/pages/รับซื้อโน๊ตบุ๊ค.astro',
  'src/pages/รับซื้อโน๊ตบุ๊คมือสอง.astro',
  'src/pages/เช็คราคาโน๊ตบุ๊ค.astro',
  'src/pages/ตีราคาโน๊ตบุ๊ค.astro',
  'src/pages/ขายโน๊ตบุ๊ค.astro',
  'src/content/blog',
  'src/content/conditions',
  'src/content/locations',
];

function csvEscape(v) {
  const t = String(v ?? '');
  return /[",\r\n]/.test(t) ? `"${t.replaceAll('"', '""')}"` : t;
}
function writeCsv(file, headers, rows) {
  fs.writeFileSync(file, [headers.join(','), ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join('\r\n') + '\r\n');
}
function parseFmBody(raw) {
  if (!raw.startsWith('---')) return { body: raw, data: {} };
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return { body: raw, data: {} };
  const fm = raw.slice(3, end);
  const body = raw.slice(end + 4);
  const strip = (s) => (s || '').replace(/^["']|["']$/g, '');
  return {
    body,
    data: {
      title: strip(fm.match(/^title:\s*(.*)$/m)?.[1]),
      pageH1: strip(fm.match(/^pageH1:\s*(.*)$/m)?.[1]),
      hasFaqs: /^faqs:/m.test(fm),
    },
  };
}
function thaiWordCount(text) {
  const cleaned = text.replace(/```[\s\S]*?```/g, ' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[#>*_`|]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return 0;
  const latin = (cleaned.match(/[A-Za-z0-9]+/g) || []).length;
  const thaiChars = (cleaned.match(/[\u0E00-\u0E7F]/g) || []).length;
  return latin + Math.round(thaiChars / 3.2);
}
function jaccard(a, b) {
  const ta = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  const tb = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  return inter / (ta.size + tb.size - inter || 1);
}
function scorePage({ wordCount, body, title, h1, hasFaqs }) {
  let intent = 12, unique = 10, depth = 8, entity = 10, linking = 5, semantic = 5, trust = 5, conversion = 3;
  if (title && h1) intent += 4;
  if (/(ส่งรูป|ประเมิน|LINE|ไลน์|สเปก|สภาพ)/i.test(body)) intent += 4;
  const templateHits = [/หากคุณกำลังอาศัยอยู่ใน/, /คุณมาถูกที่แล้วครับ/, /⭐⭐⭐⭐⭐/, /ทำไมคนใน.+ถึงเลือกขาย/, /ยินดีต้อนรับสู่บริการ/].filter((re) => re.test(body)).length;
  unique += Math.max(0, 10 - templateHits * 3);
  if (wordCount >= 250) unique += 2;
  if (wordCount >= 450) depth += 4;
  if (wordCount >= 700) depth += 3;
  if (hasFaqs) { semantic += 3; depth += 2; }
  if (/อุบลราชธานี|ไม่ใช่สาขา|หน้าร้านจริง/.test(body)) trust += 3;
  if (/แอดไลน์|@webuy|0642579353|ส่งรูป/.test(body)) conversion += 2;
  if (/\[[^\]]+\]\(\//.test(body)) linking += 4;
  if (/^## /m.test(body)) semantic += 2;
  if (/(CPU|GPU|RAM|SSD|แบต|ที่ชาร์จ)/i.test(body)) entity += 2;
  return Math.min(100, intent + unique + depth + entity + linking + semantic + trust + conversion);
}
const models = JSON.parse(fs.readFileSync(path.join(root, 'data/notebook-specs/models.json'), 'utf8')).models;
const provenance = JSON.parse(fs.readFileSync(path.join(root, 'data/notebook-specs/provenance.json'), 'utf8')).records;
const errors = [];

const researchMeta = {
  'asus-rog-strix': {
    label: 'ASUS ROG Strix',
    identity: 'SERIES — Strix G sample G16 2024 G614; Scar excluded from verified matrix',
    source: 'https://rog.asus.com/us/laptops/rog-strix/rog-strix-g16-2024/spec/',
    reason: 'Official ROG G16 2024 pages support SERIES-level READY with multi-size/Scar warnings',
  },
  'hp-omen-17': {
    label: 'HP OMEN 17',
    identity: 'SERIES — 17-ck0xxx MSG + 17-db/ck2/cm2 GPU matrix',
    source: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_3798373_en-US-1.pdf',
    reason: 'Official HP MSG + NVIDIA GPU performance PDF verify multi-family OMEN 17 options',
  },
  'dell-g15-g16': {
    label: 'Dell G15 / G16',
    identity: 'MERGED_FAMILY SERIES — G15 5530 + G16 7620 separate manuals',
    source: 'https://dl.dell.com/content/manual6783340-dell-g16-7620-setup-and-specifications.pdf?language=en-us',
    reason: 'Official Dell manuals for both subfamilies allow SERIES enrichment without Exact SKU collapse',
  },
  'lenovo-legion-pro': {
    label: 'Lenovo Legion Pro',
    identity: 'SERIES — Pro 5 16IRX10 + Pro 7 16IRX8H PSREF samples',
    source: 'https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_Pro_7_16IRX8H/Legion_Pro_7_16IRX8H_Spec.pdf',
    reason: 'Official Lenovo PSREF PDFs support SERIES-level READY with Pro 5 vs Pro 7 split',
  },
};

writeCsv(path.join(outDir, '02-research-candidates.csv'), ['slug', 'repository label', 'official identity', 'configuration scope', 'official source', 'CPU coverage', 'GPU coverage', 'RAM coverage', 'storage coverage', 'display coverage', 'battery coverage', 'charger coverage', 'confidence', 'final status', 'reason'], RESEARCHED.map((slug) => {
  const rec = models.find((m) => m.slug === slug);
  const cov = (arr) => (arr?.length ? 'YES' : 'NO');
  if (!['READY_HIGH_CONFIDENCE', 'READY_FAMILY_LEVEL'].includes(rec?.eligibility) && ENRICHED.includes(slug)) {
    errors.push(`FAIL_CANDIDATE_STATUS: ${slug}`);
  }
  return {
    slug,
    'repository label': researchMeta[slug].label,
    'official identity': researchMeta[slug].identity,
    'configuration scope': rec.configurationScope,
    'official source': researchMeta[slug].source,
    'CPU coverage': cov(rec.cpuOptions),
    'GPU coverage': cov(rec.gpuOptions),
    'RAM coverage': cov(rec.memory?.ramConfigurations),
    'storage coverage': cov(rec.storage?.storageOptions),
    'display coverage': cov(rec.display?.displaySizes),
    'battery coverage': rec.batteryCapacity ? 'YES' : 'NO',
    'charger coverage': cov(rec.chargerWattageOptions),
    confidence: String(rec.eligibility).startsWith('READY') ? 'HIGH_FAMILY' : 'INSUFFICIENT',
    'final status': rec.eligibility,
    reason: researchMeta[slug].reason,
  };
}));

const fieldsUsed = [];
for (const slug of ENRICHED) {
  const rec = models.find((m) => m.slug === slug);
  const checks = [
    ['cpuOptions', rec.cpuOptions],
    ['gpuOptions', rec.gpuOptions],
    ['memory.ramConfigurations', rec.memory?.ramConfigurations],
    ['storage.storageOptions', rec.storage?.storageOptions],
    ['display.displaySizes', rec.display?.displaySizes],
    ['batteryCapacity', rec.batteryCapacity],
    ['chargerWattageOptions', rec.chargerWattageOptions],
  ];
  for (const [field, val] of checks) {
    const nonempty = Array.isArray(val) ? val.length > 0 : Boolean(val);
    if (!nonempty) continue;
    const p = provenance.find((x) => x.model === slug && x.field === field);
    if (!p) errors.push(`FAIL_DATA: ${slug}.${field}`);
    fieldsUsed.push({
      'model slug': slug,
      field,
      'rendered value': Array.isArray(val) ? val.join(' · ') : String(val),
      'configuration scope': rec.configurationScope,
      'provenance record': p ? `${p.model}:${p.field}` : 'MISSING',
      'official source': p?.source_url || '',
      'validation result': p ? 'PASS' : 'FAIL_DATA',
    });
  }
}
writeCsv(path.join(outDir, '03-fields-used.csv'), Object.keys(fieldsUsed[0]), fieldsUsed);

writeCsv(path.join(outDir, '04-conflict-scan.csv'), ['slug', 'classification', 'notes', 'action'], [
  { slug: 'asus-rog-strix', classification: 'CONFIRMED_CONFLICT', notes: 'Old content listed Scar + RTX 3070/3080/4090 as if family-wide without G614-scoped official evidence', action: 'UPDATED_TO_SERIES_G16_SAMPLE_AND_SCAR_WARNING' },
  { slug: 'hp-omen-17', classification: 'POSSIBLE_VARIANT', notes: 'Old content listed RTX 3070/3080/4070/4080 together; verified split by letter family/generation', action: 'UPDATED_TO_MULTI_FAMILY_SCOPED_OPTIONS' },
  { slug: 'dell-g15-g16', classification: 'NO_CONFLICT', notes: 'Existing page already treated G15 and G16 as separate lines (5510/5520/5530 vs 7620/7630)', action: 'STRENGTHENED_WITH_OFFICIAL_SPLIT_SOURCES' },
  { slug: 'lenovo-legion-pro', classification: 'CONFIRMED_CONFLICT', notes: 'Old content mixed RTX 3070–4090 as if all Legion Pro share one GPU ladder', action: 'SPLIT_PRO5_AND_PRO7_PSREF_SAMPLES' },
]);

let changedFrozen = [];
try {
  changedFrozen = execSync('git diff --name-only HEAD', { cwd: root, encoding: 'utf8' }).split(/\r?\n/).filter(Boolean)
    .filter((f) => FROZEN_PATHS.some((p) => f === p || f.startsWith(`${p}/`)));
} catch { changedFrozen = ['DIFF_UNAVAILABLE']; }
writeCsv(path.join(outDir, '05-content-freeze-check.csv'), ['path', 'changed', 'result'], FROZEN_PATHS.map((p) => ({
  path: p,
  changed: changedFrozen.some((c) => c === p || c.startsWith(`${p}/`)) ? 'YES' : 'NO',
  result: changedFrozen.some((c) => c === p || c.startsWith(`${p}/`)) ? 'FAIL' : 'PASS',
})));
if (changedFrozen.length) errors.push(`FROZEN_CHANGED: ${changedFrozen.join('|')}`);

const qualityRows = [];
for (const slug of ENRICHED) {
  const afterRaw = fs.readFileSync(path.join(root, `src/content/brands/${slug}.md`), 'utf8');
  const after = parseFmBody(afterRaw);
  let beforeRaw = afterRaw;
  try { beforeRaw = execSync(`git show HEAD:src/content/brands/${slug}.md`, { cwd: root, encoding: 'utf8' }); } catch { /* keep */ }
  const before = parseFmBody(beforeRaw);
  const wb = thaiWordCount(before.body + before.data.title);
  const wa = thaiWordCount(after.body + after.data.title);
  const sb = scorePage({ wordCount: wb, body: before.body, title: before.data.title, h1: before.data.pageH1, hasFaqs: before.data.hasFaqs });
  const sa = scorePage({ wordCount: wa, body: after.body, title: after.data.title, h1: after.data.pageH1, hasFaqs: after.data.hasFaqs });
  qualityRows.push({ slug, score_before: sb, score_after: sa, words_before: wb, words_after: wa, delta: sa - sb });
  if (sa < 88) errors.push(`SCORE_BELOW_STRONG: ${slug}=${sa}`);
}
writeCsv(path.join(outDir, '06-before-after-quality.csv'), Object.keys(qualityRows[0]), qualityRows);

const bodies = Object.fromEntries(ENRICHED.map((slug) => [slug, parseFmBody(fs.readFileSync(path.join(root, `src/content/brands/${slug}.md`), 'utf8')).body]));
const simRows = [];
let critical = 0, high = 0;
for (let i = 0; i < ENRICHED.length; i++) {
  for (let j = i + 1; j < ENRICHED.length; j++) {
    const score = jaccard(bodies[ENRICHED[i]], bodies[ENRICHED[j]]);
    let level = 'LOW';
    if (score >= 0.72) { level = 'CRITICAL'; critical += 1; }
    else if (score >= 0.55) { level = 'HIGH'; high += 1; }
    else if (score >= 0.4) level = 'MODERATE';
    simRows.push({ page_a: ENRICHED[i], page_b: ENRICHED[j], jaccard: score.toFixed(3), level });
  }
}
writeCsv(path.join(outDir, '07-similarity-check.csv'), Object.keys(simRows[0] || { page_a: '', page_b: '', jaccard: '', level: '' }), simRows);
if (critical || high) errors.push(`SIMILARITY_FAIL: critical=${critical} high=${high}`);

const EXACT = [/รุ่นนี้ใช้\s*RTX\s*\d{4}(?!\s*Laptop)/i, /สเปกเดียวทุกเครื่อง/];
for (const slug of ENRICHED) {
  const raw = fs.readFileSync(path.join(root, `src/content/brands/${slug}.md`), 'utf8');
  if (EXACT.some((re) => re.test(raw))) errors.push(`FAMILY_EXACT_SKU: ${slug}`);
  if (slug === 'asus-rog-strix' && /RTX\s*4090/.test(raw) && !/Scar|ไม่ได้นำ/.test(raw)) {
    errors.push('UNSUPPORTED_STRIX_4090_WITHOUT_SCAR_DISCLAIMER');
  }
  if (slug === 'lenovo-legion-pro' && /RTX\s*3070/.test(raw)) {
    errors.push('UNSUPPORTED_LEGION_PRO_LEGACY_GPU');
  }
}

writeCsv(path.join(outDir, '11-deferred-models.csv'), ['slug', 'reason'], DEFERRED.length ? DEFERRED : [{ slug: '(none)', reason: 'All four Batch 4 candidates reached READY_FAMILY_LEVEL' }]);

const avgAfter = qualityRows.reduce((s, r) => s + r.score_after, 0) / (qualityRows.length || 1);
const avgBefore = qualityRows.reduce((s, r) => s + r.score_before, 0) / (qualityRows.length || 1);
fs.writeFileSync(path.join(outDir, '08-final-qa.md'), `# Batch 4 Final QA

## Scope
- Researched: ${RESEARCHED.join(', ')}
- Enriched: ${ENRICHED.join(', ')}
- Deferred: none

## Local gates
- Fields used provenance: ${fieldsUsed.filter((r) => r['validation result'] === 'PASS').length}/${fieldsUsed.length}
- Critical/High similarity: ${critical}/${high}
- Frozen changes: ${changedFrozen.length}
- Average score before/after: ${avgBefore.toFixed(1)} / ${avgAfter.toFixed(1)}

## Errors
${errors.length ? errors.map((e) => `- ${e}`).join('\n') : '- none'}
`);

const summary = {
  researched: RESEARCHED,
  enriched: ENRICHED,
  deferred: DEFERRED,
  avg_before: Number(avgBefore.toFixed(1)),
  avg_after: Number(avgAfter.toFixed(1)),
  fields_used: fieldsUsed.length,
  provenance_fail: fieldsUsed.filter((r) => r['validation result'] !== 'PASS').length,
  critical_similarity: critical,
  high_similarity: high,
  frozen_changed: changedFrozen,
  errors,
};
fs.writeFileSync(path.join(outDir, 'qa-summary.json'), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(outDir, '00-executive-summary.md'), `# Verified Model Enrichment — Batch 4 Executive Summary

## Verdict (local)
**PASS** when all four READY families are enriched with SERIES scope and provenance 100%.

## Outcomes
| Slug | Status | Action |
| --- | --- | --- |
| asus-rog-strix | READY_FAMILY_LEVEL | Enriched (SERIES; Scar excluded from verified matrix) |
| hp-omen-17 | READY_FAMILY_LEVEL | Enriched (multi-family MSG + GPU matrix) |
| dell-g15-g16 | READY_FAMILY_LEVEL | Enriched (merged URL; split G15/G16 sources) |
| lenovo-legion-pro | READY_FAMILY_LEVEL | Enriched (Pro 5 + Pro 7 PSREF samples) |

Total enriched: **${ENRICHED.length}**
Deferred: **0**
Batch average score: **${avgAfter.toFixed(1)}**

## Production baseline
Runtime Production SHA (pre-batch): \`a575189719cef66f408296f71d6a5867dcef43ec\`
Branch base Main: \`f5277b4\`
`);
fs.writeFileSync(path.join(outDir, '09-production-crawl.csv'), 'url,http_status,pass,notes\r\nPENDING,PENDING,PENDING,Filled after production deploy\r\n');
fs.writeFileSync(path.join(outDir, '10-production-verification.md'), '# Production Verification — Batch 4\n\nStatus: **PENDING** until merge + deploy.\n');
console.log(JSON.stringify(summary, null, 2));
if (errors.length) { console.error('BATCH4 QA FAILED'); process.exit(1); }
console.log('BATCH4 QA PASSED');
