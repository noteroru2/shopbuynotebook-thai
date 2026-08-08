/**
 * QA + reports for Verified Model Enrichment Batch 3
 * Usage: node scripts/seo/model-enrichment-batch3-qa.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const outDir = path.join(root, 'docs/model-enrichment-batch-3');
fs.mkdirSync(outDir, { recursive: true });

const RESEARCHED = ['hp-omen-16', 'hp-victus-17', 'asus-tuf-a15-f15', 'lenovo-loq-15-16'];
const ENRICHED = ['hp-omen-16', 'asus-tuf-a15-f15', 'lenovo-loq-15-16'];
const DEFERRED = [{ slug: 'hp-victus-17', reason: 'AMBIGUOUS_MODEL — no official Victus 17 MSG/product matrix; HP Victus docs cover 15/16; 17-inch gaming docs are OMEN 17' }];

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
function verifiedFields(rec) {
  const out = [];
  if (rec.cpuOptions?.length) out.push('cpuOptions');
  if (rec.gpuOptions?.length) out.push('gpuOptions');
  if (rec.memory?.ramConfigurations?.length) out.push('memory');
  if (rec.storage?.storageOptions?.length) out.push('storage');
  if (rec.display?.displaySizes?.length) out.push('display');
  if (rec.batteryCapacity) out.push('battery');
  if (rec.chargerWattageOptions?.length) out.push('charger');
  return out;
}

const models = JSON.parse(fs.readFileSync(path.join(root, 'data/notebook-specs/models.json'), 'utf8')).models;
const provenance = JSON.parse(fs.readFileSync(path.join(root, 'data/notebook-specs/provenance.json'), 'utf8')).records;
const errors = [];

const researchMeta = {
  'hp-omen-16': { label: 'HP OMEN 16', identity: '16-wf/wd MSG family sample', source: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7768944_en-US-1.pdf', reason: 'Official HP MSG verifies CPU/GPU/display/battery options' },
  'hp-victus-17': { label: 'HP Victus 17', identity: 'No official Victus 17 laptop family found', source: 'https://support.hp.com/us-en/document/ish_11270215-11270239-16', reason: 'Official HP Victus docs cover 15/16; defer enrichment' },
  'asus-tuf-a15-f15': { label: 'ASUS TUF A15/F15', identity: 'FA507 A15 2024 + FX507 F15 2023', source: 'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2024/techspec/', reason: 'Official ASUS techspec pages support SERIES-level READY' },
  'lenovo-loq-15-16': { label: 'Lenovo LOQ 15/16', identity: '15APH8 / 15IRH8 / 16APH8 PSREF', source: 'https://psref.lenovo.com/syspool/Sys/PDF/LOQ/LOQ_16APH8/LOQ_16APH8_Spec.pdf', reason: 'Official Lenovo PSREF PDFs support SERIES-level READY' },
};

writeCsv(path.join(outDir, '01-candidate-manifest.csv'), ['slug', 'URL', 'brand', 'series', 'dataset status', 'configuration scope', 'verified fields', 'provenance count', 'enrichment approved', 'notes'], RESEARCHED.map((slug) => {
  const rec = models.find((m) => m.slug === slug);
  const approved = ['READY_HIGH_CONFIDENCE', 'READY_FAMILY_LEVEL'].includes(rec?.eligibility);
  if (ENRICHED.includes(slug) && !approved) errors.push(`FAIL_CANDIDATE_STATUS: ${slug}`);
  return {
    slug,
    URL: `/รับซื้อโน๊ตบุ๊ค/${slug}/`,
    brand: rec.brand,
    series: rec.series,
    'dataset status': rec.eligibility,
    'configuration scope': rec.configurationScope,
    'verified fields': verifiedFields(rec).join('|'),
    'provenance count': provenance.filter((p) => p.model === slug).length,
    'enrichment approved': approved ? 'true' : 'false',
    notes: researchMeta[slug].reason,
  };
}));

writeCsv(path.join(outDir, '02-research-candidates.csv'), ['slug', 'repository label', 'official identity', 'configuration scope', 'official source', 'CPU coverage', 'GPU coverage', 'RAM coverage', 'storage coverage', 'display coverage', 'battery coverage', 'charger coverage', 'confidence', 'final status', 'reason'], RESEARCHED.map((slug) => {
  const rec = models.find((m) => m.slug === slug);
  const cov = (arr) => (arr?.length ? 'YES' : 'NO');
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
  { slug: 'hp-omen-16', classification: 'POSSIBLE_VARIANT', notes: 'Old content omitted RTX 4070/4080; MSG sample includes them as family options', action: 'UPDATED_TO_VERIFIED_OPTIONS' },
  { slug: 'asus-tuf-a15-f15', classification: 'CONFIRMED_CONFLICT', notes: 'Old content claimed GTX 1650 / RTX 2060 without official sample evidence used here', action: 'REMOVED_UNSUPPORTED_CLAIMS' },
  { slug: 'lenovo-loq-15-16', classification: 'NO_CONFLICT', notes: 'Existing RTX 3050/4050/4060 family claims align with PSREF samples when scoped as series', action: 'NONE' },
  { slug: 'hp-victus-17', classification: 'INSUFFICIENT_EVIDENCE', notes: 'No official Victus 17 matrix; deferred', action: 'DEFER_NO_CONTENT_CHANGE' },
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
writeCsv(path.join(outDir, '07-similarity-check.csv'), Object.keys(simRows[0]), simRows);
if (critical || high) errors.push(`SIMILARITY_FAIL: critical=${critical} high=${high}`);

const EXACT = [/รุ่นนี้ใช้\s*CPU\s+.+\+\s*GPU/i, /สเปกเดียวทุกเครื่อง/];
for (const slug of ENRICHED) {
  const raw = fs.readFileSync(path.join(root, `src/content/brands/${slug}.md`), 'utf8');
  if (EXACT.some((re) => re.test(raw))) errors.push(`FAMILY_EXACT_SKU: ${slug}`);
  if (slug === 'asus-tuf-a15-f15' && /GTX\s*1650|RTX\s*2060/i.test(raw)) errors.push('UNSUPPORTED_TUF_LEGACY_GPU');
}

writeCsv(path.join(outDir, '11-deferred-models.csv'), ['slug', 'reason'], DEFERRED);

const avgAfter = qualityRows.reduce((s, r) => s + r.score_after, 0) / qualityRows.length;
const avgBefore = qualityRows.reduce((s, r) => s + r.score_before, 0) / qualityRows.length;
fs.writeFileSync(path.join(outDir, '08-final-qa.md'), `# Batch 3 Final QA

## Scope
- Researched: ${RESEARCHED.join(', ')}
- Enriched: ${ENRICHED.join(', ')}
- Deferred: hp-victus-17 (AMBIGUOUS_MODEL)

## Local gates
- Fields used provenance: ${fieldsUsed.filter((r) => r['validation result'] === 'PASS').length}/${fieldsUsed.length}
- Critical/High similarity: ${critical}/${high}
- Frozen changes: ${changedFrozen.length}
- Average score before/after: ${avgBefore.toFixed(1)} / ${avgAfter.toFixed(1)}

## Errors
${errors.length ? errors.map((e) => `- ${e}`).join('\n') : '- none'}
`);

const summary = { researched: RESEARCHED, enriched: ENRICHED, deferred: DEFERRED, avg_before: Number(avgBefore.toFixed(1)), avg_after: Number(avgAfter.toFixed(1)), fields_used: fieldsUsed.length, provenance_fail: fieldsUsed.filter((r) => r['validation result'] !== 'PASS').length, critical_similarity: critical, high_similarity: high, frozen_changed: changedFrozen, errors };
fs.writeFileSync(path.join(outDir, 'qa-summary.json'), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(outDir, '00-executive-summary.md'), `# Verified Model Enrichment — Batch 3 Executive Summary

## Verdict (local)
**PASS WITH WARNING** if Victus 17 deferred; else PASS when all READY enriched.

## Outcomes
| Slug | Status | Action |
| --- | --- | --- |
| hp-omen-16 | READY_FAMILY_LEVEL | Enriched |
| asus-tuf-a15-f15 | READY_FAMILY_LEVEL | Enriched |
| lenovo-loq-15-16 | READY_FAMILY_LEVEL | Enriched |
| hp-victus-17 | AMBIGUOUS_MODEL | Deferred |

Total enriched: **3**
Batch average score: **${avgAfter.toFixed(1)}**
`);
fs.writeFileSync(path.join(outDir, '09-production-crawl.csv'), 'url,http_status,pass,notes\r\nPENDING,PENDING,PENDING,Filled after production deploy\r\n');
fs.writeFileSync(path.join(outDir, '10-production-verification.md'), '# Production Verification — Batch 3\n\nStatus: **PENDING** until merge + deploy.\n');
console.log(JSON.stringify(summary, null, 2));
if (errors.length) { console.error('BATCH3 QA FAILED'); process.exit(1); }
console.log('BATCH3 QA PASSED');
