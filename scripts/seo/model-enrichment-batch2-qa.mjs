/**
 * QA + reports for Verified Model Enrichment Batch 2
 * Usage: node scripts/seo/model-enrichment-batch2-qa.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const outDir = path.join(root, 'docs/model-enrichment-batch-2');
fs.mkdirSync(outDir, { recursive: true });

const GROUP_A = ['macbook-air-m1', 'macbook-air-m2', 'macbook-pro-m1', 'macbook-pro-m2'];
const GROUP_B = ['acer-nitro-17', 'acer-nitro-v', 'asus-zephyrus-g16', 'hp-victus-16'];
const BATCH = [...GROUP_A, ...GROUP_B];

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
  if (!raw.startsWith('---')) return { fm: '', body: raw, data: {} };
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return { fm: '', body: raw, data: {} };
  const fm = raw.slice(3, end);
  const body = raw.slice(end + 4);
  const strip = (s) => (s || '').replace(/^["']|["']$/g, '');
  return {
    fm,
    body,
    data: {
      title: strip(fm.match(/^title:\s*(.*)$/m)?.[1]),
      pageH1: strip(fm.match(/^pageH1:\s*(.*)$/m)?.[1]),
      description: strip(fm.match(/^description:\s*(.*)$/m)?.[1]),
      hasFaqs: /^faqs:/m.test(fm),
    },
  };
}
function thaiWordCount(text) {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
  const union = ta.size + tb.size - inter || 1;
  return inter / union;
}
function scorePage({ wordCount, body, title, h1, hasFaqs }) {
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
  entity += 4;
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
  if (rec.knownModelFamilies?.length) out.push('knownModelFamilies');
  return out;
}

const models = JSON.parse(fs.readFileSync(path.join(root, 'data/notebook-specs/models.json'), 'utf8')).models;
const provenance = JSON.parse(fs.readFileSync(path.join(root, 'data/notebook-specs/provenance.json'), 'utf8')).records;
const errors = [];

// Exact-SKU false exactness guard for FAMILY/SERIES pages
const EXACT_SKU_PATTERNS = [
  /รุ่นนี้ใช้\s*CPU\s+.+\+\s*GPU/i,
  /เครื่องนี้ใช้\s*(CPU|ชิป).+และ\s*(GPU|การ์ดจอ)/i,
  /สเปกเดียวทุกเครื่อง/,
];

const researchMeta = {
  'acer-nitro-17': {
    repository_label: 'Acer Nitro 17',
    official_identity: 'AN17-51 Intel + AN17-42 AMD marketing/PDP family',
    official_source: 'https://www.acer.com/us-en/laptops/nitro/nitro-17-intel/pdp/NH.QK6AA.001',
    reason: 'Official Acer PDPs cover Intel/AMD Nitro 17 samples with RTX 4050/4060 and 17.3 QHD; treat as MODEL_FAMILY',
  },
  'acer-nitro-v': {
    repository_label: 'Acer Nitro V',
    official_identity: 'ANV15 + ANV16 series umbrella on site slug',
    official_source: 'https://www.acer.com/us-en/laptops/nitro/nitro-v-15/pdp/NH.QN8AA.004',
    reason: 'Site slug spans V15 and V16; official samples support SERIES-level READY with multi-config disclaimer',
  },
  'asus-zephyrus-g16': {
    repository_label: 'Asus ROG Zephyrus G16',
    official_identity: 'GA605 / GU605 2024 multi-year MODEL_FAMILY',
    official_source: 'https://rog.asus.com/us/laptops/rog-zephyrus/rog-zephyrus-g16-2024-ga605/spec/',
    reason: 'Official ROG spec pages provide CPU/GPU/RAM/display/battery/charger options for 2024 family',
  },
  'hp-victus-16': {
    repository_label: 'HP Victus 16',
    official_identity: 'Victus 16-s0xxx MSG family sample',
    official_source: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7911438_en-US-1.pdf',
    reason: 'Official HP MSG PDF verifies AMD 16-s0xxx options; other letter families noted as confirm-on-device',
  },
};

const conflictNotes = {
  'macbook-pro-m1': {
    status: 'CONFIRMED_CONFLICT',
    detail: 'Old page assumed only 13-inch Touch Bar M1; dataset+content now MODEL_FAMILY spanning 13 M1 and 14/16 M1 Pro/Max with official sources',
  },
  'macbook-pro-m2': {
    status: 'CONFIRMED_CONFLICT',
    detail: 'Old page assumed only 13-inch M2 Touch Bar; dataset+content now MODEL_FAMILY spanning 13 M2 and 14/16 M2 Pro/Max',
  },
  'acer-nitro-17': {
    status: 'CONFIRMED_CONFLICT',
    detail: 'Old content listed RTX 4070 without official sample evidence in this batch; removed unsupported 4070 claim',
  },
  'acer-nitro-v': {
    status: 'CONFIRMED_CONFLICT',
    detail: 'Old content claimed RTX 2050/4060; verified official samples support 3050/4050/5060 — updated to verified options',
  },
  'asus-zephyrus-g16': {
    status: 'NO_CONFLICT',
    detail: 'Existing RTX 4060/4070/4080 family claims align with official 2024 GU605/GA605 options when scoped as family',
  },
  'hp-victus-16': {
    status: 'CONFIRMED_CONFLICT',
    detail: 'Old content claimed broad Intel + RTX 3060 without MSG evidence used here; narrowed to verified 16-s0xxx AMD MSG options',
  },
  'macbook-air-m1': { status: 'NO_CONFLICT', detail: 'Claims align with Apple Support family options' },
  'macbook-air-m2': { status: 'POSSIBLE_VARIANT', detail: 'Page previously emphasized 13.6-only; dataset includes 13.6 and 15.3 — content updated to dual-size family scope' },
};

// 01 candidate manifest (Group A)
const manifest = GROUP_A.map((slug) => {
  const rec = models.find((m) => m.slug === slug);
  const file = path.join(root, `src/content/brands/${slug}.md`);
  const raw = fs.readFileSync(file, 'utf8');
  const { body, data } = parseFmBody(raw);
  const prov = provenance.filter((p) => p.model === slug);
  const approved = ['READY_HIGH_CONFIDENCE', 'READY_FAMILY_LEVEL'].includes(rec?.eligibility);
  if (!approved) errors.push(`FAIL_CANDIDATE_STATUS: ${slug} not READY_*`);
  const score = scorePage({
    wordCount: thaiWordCount(body + data.title),
    body,
    title: data.title,
    h1: data.pageH1,
    hasFaqs: data.hasFaqs,
  });
  return {
    slug,
    URL: `/รับซื้อโน๊ตบุ๊ค/${slug}/`,
    brand: rec.brand,
    series: rec.series,
    'dataset status': rec.eligibility,
    'configuration scope': rec.configurationScope,
    'verified fields': verifiedFields(rec).join('|'),
    'provenance count': prov.length,
    'current quality score': score,
    'current content length': thaiWordCount(body),
    'enrichment approved': approved ? 'true' : 'false',
    notes: conflictNotes[slug]?.detail || '',
  };
});
writeCsv(path.join(outDir, '01-candidate-manifest.csv'), Object.keys(manifest[0]), manifest);

// 02 research candidates
const researchRows = GROUP_B.map((slug) => {
  const rec = models.find((m) => m.slug === slug);
  const meta = researchMeta[slug];
  const cov = (arr) => (arr?.length ? 'YES' : 'NO');
  return {
    slug,
    'repository label': meta.repository_label,
    'official identity': meta.official_identity,
    'configuration scope': rec.configurationScope,
    'official source': meta.official_source,
    'CPU coverage': cov(rec.cpuOptions),
    'GPU coverage': cov(rec.gpuOptions),
    'RAM coverage': cov(rec.memory?.ramConfigurations),
    'storage coverage': cov(rec.storage?.storageOptions),
    'display coverage': cov(rec.display?.displaySizes),
    'battery coverage': rec.batteryCapacity ? 'YES' : 'NO',
    'charger coverage': cov(rec.chargerWattageOptions),
    confidence: rec.eligibility === 'READY_FAMILY_LEVEL' ? 'HIGH_FAMILY' : rec.eligibility,
    'final status': rec.eligibility,
    reason: meta.reason,
  };
});
writeCsv(path.join(outDir, '02-research-candidates.csv'), Object.keys(researchRows[0]), researchRows);

// 03 fields used
const fieldsUsed = [];
for (const slug of BATCH) {
  const rec = models.find((m) => m.slug === slug);
  const checks = [
    ['cpuOptions', rec.cpuOptions],
    ['gpuOptions', rec.gpuOptions],
    ['memory.ramConfigurations', rec.memory?.ramConfigurations],
    ['storage.storageOptions', rec.storage?.storageOptions],
    ['display.displaySizes', rec.display?.displaySizes],
    ['display.refreshRates', rec.display?.refreshRates],
    ['batteryCapacity', rec.batteryCapacity],
    ['chargerWattageOptions', rec.chargerWattageOptions],
    ['knownModelFamilies', rec.knownModelFamilies],
  ];
  for (const [field, val] of checks) {
    const nonempty = Array.isArray(val) ? val.length > 0 : Boolean(val);
    if (!nonempty) continue;
    const sample = Array.isArray(val) ? val.join(' · ') : String(val);
    const p = provenance.find((x) => x.model === slug && x.field === field);
    const validation = p ? 'PASS' : 'FAIL_DATA';
    if (!p) errors.push(`FAIL_DATA: ${slug}.${field} missing provenance`);
    fieldsUsed.push({
      'model slug': slug,
      field,
      'rendered value': sample,
      'configuration scope': rec.configurationScope,
      'provenance record': p ? `${p.model}:${p.field}` : 'MISSING',
      'official source': p?.source_url || '',
      'validation result': validation,
    });
  }
}
writeCsv(path.join(outDir, '03-fields-used.csv'), Object.keys(fieldsUsed[0]), fieldsUsed);

// 04 conflict scan
const conflictRows = BATCH.map((slug) => ({
  slug,
  classification: conflictNotes[slug]?.status || 'INSUFFICIENT_EVIDENCE',
  notes: conflictNotes[slug]?.detail || '',
  action: conflictNotes[slug]?.status === 'CONFIRMED_CONFLICT' ? 'FIXED_IN_BATCH_2' : 'NONE',
}));
writeCsv(path.join(outDir, '04-conflict-scan.csv'), Object.keys(conflictRows[0]), conflictRows);

// 05 freeze check via git diff
let changedFrozen = [];
try {
  const diffNames = execSync('git diff --name-only HEAD', { cwd: root, encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean);
  changedFrozen = diffNames.filter((f) =>
    FROZEN_PATHS.some((p) => f === p || f.startsWith(p + '/') || f.startsWith(p.replaceAll('\\', '/') + '/')),
  );
} catch {
  changedFrozen = ['DIFF_UNAVAILABLE'];
}
const freezeRows = FROZEN_PATHS.map((p) => ({
  path: p,
  changed: changedFrozen.includes(p) || changedFrozen.some((c) => c.startsWith(p + '/')) ? 'YES' : 'NO',
  result: changedFrozen.length === 0 ? 'PASS' : changedFrozen.some((c) => c === p || c.startsWith(p + '/')) ? 'FAIL' : 'PASS',
}));
writeCsv(path.join(outDir, '05-content-freeze-check.csv'), Object.keys(freezeRows[0]), freezeRows);
if (changedFrozen.length) errors.push(`FROZEN_CHANGED: ${changedFrozen.join('|')}`);

// 06 before/after quality
const qualityRows = [];
for (const slug of BATCH) {
  const afterRaw = fs.readFileSync(path.join(root, `src/content/brands/${slug}.md`), 'utf8');
  const after = parseFmBody(afterRaw);
  let beforeRaw = afterRaw;
  try {
    beforeRaw = execSync(`git show HEAD:src/content/brands/${slug}.md`, { cwd: root, encoding: 'utf8' });
  } catch {
    /* keep after */
  }
  const before = parseFmBody(beforeRaw);
  const wb = thaiWordCount(before.body + before.data.title);
  const wa = thaiWordCount(after.body + after.data.title);
  const sb = scorePage({ wordCount: wb, body: before.body, title: before.data.title, h1: before.data.pageH1, hasFaqs: before.data.hasFaqs });
  const sa = scorePage({ wordCount: wa, body: after.body, title: after.data.title, h1: after.data.pageH1, hasFaqs: after.data.hasFaqs });
  qualityRows.push({
    slug,
    score_before: sb,
    score_after: sa,
    words_before: wb,
    words_after: wa,
    delta: sa - sb,
  });
  if (sa < 88) errors.push(`SCORE_BELOW_STRONG: ${slug}=${sa}`);
}
writeCsv(path.join(outDir, '06-before-after-quality.csv'), Object.keys(qualityRows[0]), qualityRows);

// 07 similarity + section-aware rough check
const bodies = Object.fromEntries(
  BATCH.map((slug) => {
    const raw = fs.readFileSync(path.join(root, `src/content/brands/${slug}.md`), 'utf8');
    return [slug, parseFmBody(raw).body];
  }),
);
const simRows = [];
let critical = 0;
let high = 0;
for (let i = 0; i < BATCH.length; i++) {
  for (let j = i + 1; j < BATCH.length; j++) {
    const a = BATCH[i];
    const b = BATCH[j];
    const score = jaccard(bodies[a], bodies[b]);
    let level = 'LOW';
    if (score >= 0.72) {
      level = 'CRITICAL';
      critical += 1;
    } else if (score >= 0.55) {
      level = 'HIGH';
      high += 1;
    } else if (score >= 0.4) level = 'MODERATE';
    simRows.push({ page_a: a, page_b: b, jaccard: score.toFixed(3), level });
  }
}
writeCsv(path.join(outDir, '07-similarity-check.csv'), Object.keys(simRows[0]), simRows);
if (critical || high) errors.push(`SIMILARITY_FAIL: critical=${critical} high=${high}`);

// Exact SKU guard
const exactRows = [];
for (const slug of BATCH) {
  const rec = models.find((m) => m.slug === slug);
  const raw = fs.readFileSync(path.join(root, `src/content/brands/${slug}.md`), 'utf8');
  if (!['MODEL_FAMILY', 'SERIES'].includes(rec.configurationScope)) {
    exactRows.push({ slug, scope: rec.configurationScope, violation: 'N/A', detail: '' });
    continue;
  }
  const hits = EXACT_SKU_PATTERNS.filter((re) => re.test(raw)).map((re) => re.source);
  if (hits.length) errors.push(`FAMILY_EXACT_SKU: ${slug}`);
  exactRows.push({
    slug,
    scope: rec.configurationScope,
    violation: hits.length ? 'YES' : 'NO',
    detail: hits.join(' | '),
  });
}
writeCsv(path.join(outDir, '07b-exact-sku-guard.csv'), Object.keys(exactRows[0]), exactRows);

// Unsupported claim spot-checks
const unsupportedChecks = [
  { slug: 'acer-nitro-17', re: /RTX\s*4070/i, label: 'nitro17_rtx4070' },
  { slug: 'acer-nitro-v', re: /RTX\s*2050/i, label: 'nitrov_rtx2050' },
];
for (const c of unsupportedChecks) {
  const raw = fs.readFileSync(path.join(root, `src/content/brands/${c.slug}.md`), 'utf8');
  if (c.re.test(raw)) errors.push(`UNSUPPORTED_CLAIM: ${c.label}`);
}

// 11 deferred
writeCsv(path.join(outDir, '11-deferred-models.csv'), ['slug', 'reason'], [
  { slug: '(none-in-batch-2-group-b)', reason: 'All four Group B candidates reached READY_FAMILY_LEVEL with official evidence' },
]);

const avgAfter = qualityRows.reduce((s, r) => s + r.score_after, 0) / qualityRows.length;
const avgBefore = qualityRows.reduce((s, r) => s + r.score_before, 0) / qualityRows.length;

const qaMd = `# Batch 2 Final QA

## Scope
- Group A enriched: ${GROUP_A.join(', ')}
- Group B researched + enriched: ${GROUP_B.join(', ')}

## Validation
- Fields used rows: ${fieldsUsed.length}
- Provenance PASS: ${fieldsUsed.filter((r) => r['validation result'] === 'PASS').length}
- Fields without source: ${fieldsUsed.filter((r) => r['validation result'] !== 'PASS').length}
- Exact-SKU family violations: ${exactRows.filter((r) => r.violation === 'YES').length}
- Critical similarity: ${critical}
- High similarity: ${high}
- Frozen path changes: ${changedFrozen.length}
- Average score before: ${avgBefore.toFixed(1)}
- Average score after: ${avgAfter.toFixed(1)}

## Errors
${errors.length ? errors.map((e) => `- ${e}`).join('\n') : '- none'}

## Manual review checklist
- [ ] Model names correct
- [ ] Scope MODEL_FAMILY/SERIES wording
- [ ] Specs match dataset
- [ ] Natural Thai
- [ ] No filler / no overclaim
- [ ] Internal links useful
- [ ] CTA appropriate
`;
fs.writeFileSync(path.join(outDir, '08-final-qa.md'), qaMd);

const summary = {
  batch: BATCH,
  group_a: GROUP_A,
  group_b: GROUP_B,
  avg_before: Number(avgBefore.toFixed(1)),
  avg_after: Number(avgAfter.toFixed(1)),
  fields_used: fieldsUsed.length,
  provenance_fail: fieldsUsed.filter((r) => r['validation result'] !== 'PASS').length,
  critical_similarity: critical,
  high_similarity: high,
  frozen_changed: changedFrozen,
  exact_sku_violations: exactRows.filter((r) => r.violation === 'YES').length,
  errors,
};
fs.writeFileSync(path.join(outDir, 'qa-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (errors.length) {
  console.error('BATCH2 QA FAILED');
  process.exit(1);
}
console.log('BATCH2 QA PASSED');
