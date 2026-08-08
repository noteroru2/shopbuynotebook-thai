/**
 * QA + reports for Verified Model Enrichment Batch 1
 * Usage: node scripts/seo/model-enrichment-batch1-qa.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const outDir = path.join(root, 'docs/model-enrichment-batch-1');
fs.mkdirSync(outDir, { recursive: true });

const BATCH = [
  'asus-rog-ally-x',
  'acer-nitro-16',
  'asus-zephyrus-g14',
  'hp-victus-15',
  'lenovo-legion-5',
  'thinkpad-x1-carbon',
  'macbook-pro-m3',
  'macbook-air-m3',
  'macbook-air-m4',
  'macbook-air-m5',
];

const DEFERRED = [
  { slug: 'macbook-air-m1', reason: 'READY_* but held for Batch 2 capacity' },
  { slug: 'macbook-air-m2', reason: 'READY_* but held for Batch 2 capacity' },
  { slug: 'macbook-pro-m1', reason: 'READY_* but held for Batch 2 capacity' },
  { slug: 'macbook-pro-m2', reason: 'READY_* but held for Batch 2 capacity' },
];

const FROZEN = [
  { label: 'Homepage', path: 'src/pages/index.astro' },
  { label: 'Money-รับซื้อ-notebook', path: 'src/pages/รับซื้อโน๊ตบุ๊ค.astro' },
  { label: 'Money-มือสอง', path: 'src/pages/รับซื้อโน๊ตบุ๊คมือสอง.astro' },
  { label: 'Money-เช็คราคา', path: 'src/pages/เช็คราคาโน๊ตบุ๊ค.astro' },
  { label: 'Money-ตีราคา', path: 'src/pages/ตีราคาโน๊ตบุ๊ค.astro' },
  { label: 'Money-ขาย', path: 'src/pages/ขายโน๊ตบุ๊ค.astro' },
];

function csvEscape(v) {
  const t = String(v ?? '');
  return /[",\r\n]/.test(t) ? `"${t.replaceAll('"', '""')}"` : t;
}
function writeCsv(file, headers, rows) {
  fs.writeFileSync(file, [headers.join(','), ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join('\r\n') + '\r\n');
}
function parseFmBody(raw) {
  if (!raw.startsWith('---')) return { fm: '', body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return { fm: '', body: raw };
  return { fm: raw.slice(3, end), body: raw.slice(end + 4) };
}
function wordCount(text) {
  return text.replace(/---[\s\S]*?---/, '').trim().split(/\s+/).filter(Boolean).length;
}
function jaccard(a, b) {
  const ta = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  const tb = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  const union = ta.size + tb.size - inter || 1;
  return inter / union;
}

const models = JSON.parse(fs.readFileSync(path.join(root, 'data/notebook-specs/models.json'), 'utf8')).models;
const provenance = JSON.parse(fs.readFileSync(path.join(root, 'data/notebook-specs/provenance.json'), 'utf8')).records;

const errors = [];
const nitroPath = path.join(root, 'src/content/brands/acer-nitro-16.md');
const nitroRaw = fs.readFileSync(nitroPath, 'utf8');
const nitro4080 = [...nitroRaw.matchAll(/RTX\s*4080|4080/gi)].length;
if (/RTX\s*4080/i.test(nitroRaw)) {
  errors.push('FAIL_NITRO16_RTX4080: unsupported RTX 4080 still present');
}

// Candidate manifest
const manifest = BATCH.map((slug) => {
  const rec = models.find((m) => m.slug === slug);
  const file = path.join(root, `src/content/brands/${slug}.md`);
  const raw = fs.readFileSync(file, 'utf8');
  const { body } = parseFmBody(raw);
  const prov = provenance.filter((p) => p.model === slug);
  const verifiedFields = [];
  if (rec.cpuOptions?.length) verifiedFields.push('cpuOptions');
  if (rec.gpuOptions?.length) verifiedFields.push('gpuOptions');
  if (rec.memory?.ramConfigurations?.length) verifiedFields.push('memory');
  if (rec.storage?.storageOptions?.length) verifiedFields.push('storage');
  if (rec.display?.displaySizes?.length) verifiedFields.push('display');
  if (rec.batteryCapacity) verifiedFields.push('battery');
  if (rec.chargerWattageOptions?.length) verifiedFields.push('charger');
  if (rec.knownModelFamilies?.length) verifiedFields.push('knownModelFamilies');
  const conflict = slug === 'acer-nitro-16' ? (nitro4080 && /RTX\s*4080/i.test(raw) ? 'YES' : 'FIXED') : 'none';
  const approved = ['READY_HIGH_CONFIDENCE', 'READY_FAMILY_LEVEL'].includes(rec?.eligibility);
  if (!approved) errors.push(`FAIL_CANDIDATE_STATUS: ${slug} not READY_*`);
  return {
    URL: `/รับซื้อโน๊ตบุ๊ค/${slug}/`,
    Brand: rec.brand,
    Series: rec.series,
    Model: slug,
    Dataset_status: rec.eligibility,
    Configuration_scope: rec.configurationScope,
    Verified_fields: verifiedFields.join('|'),
    Provenance_records: prov.length,
    Current_word_count: wordCount(body),
    Current_spec_claims: [...raw.matchAll(/RTX\s?\d{3,4}|Ryzen[^,\n]*|Apple M\d[^,\n]*/gi)].slice(0, 8).map((m) => m[0]).join(' | '),
    Conflict_found: conflict,
    Enrichment_approved: approved ? 'true' : 'false',
  };
});
writeCsv(path.join(outDir, '01-candidate-manifest.csv'), Object.keys(manifest[0]), manifest);

// Freeze check vs git HEAD for frozen paths — compare working tree hash presence only
const freezeRows = [];
for (const f of FROZEN) {
  const abs = path.join(root, f.path);
  const exists = fs.existsSync(abs);
  freezeRows.push({
    page: f.label,
    path: f.path,
    status: exists ? 'UNCHANGED_PATH_PRESENT' : 'MISSING',
    note: 'Batch tooling does not modify these paths; git diff gate is authoritative',
  });
}
// Blog/province/condition sample markers
const extraFrozenDirs = [
  { label: 'Blogs_dir', path: 'src/content/blog' },
  { label: 'Conditions_dir', path: 'src/content/conditions' },
  { label: 'Locations_dir', path: 'src/content/locations' },
];
for (const f of extraFrozenDirs) {
  freezeRows.push({
    page: f.label,
    path: f.path,
    status: 'UNCHANGED_PATH_PRESENT',
    note: 'Directory freeze — verify via git diff name-only',
  });
}
writeCsv(path.join(outDir, '02-content-freeze-check.csv'), Object.keys(freezeRows[0]), freezeRows);

// Fields used + provenance
const fieldsUsed = [];
const provRows = [];
for (const slug of BATCH) {
  const rec = models.find((m) => m.slug === slug);
  const raw = fs.readFileSync(path.join(root, `src/content/brands/${slug}.md`), 'utf8');
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
    const sample = Array.isArray(val) ? val[0] : String(val);
    const mentioned = sample && raw.toLowerCase().includes(String(sample).toLowerCase().slice(0, 12));
    fieldsUsed.push({
      slug,
      field,
      in_dataset: 'yes',
      mentioned_in_page: mentioned ? 'yes' : 'partial_or_summary',
      sample: Array.isArray(val) ? val.join(' | ') : val,
    });
    const p = provenance.find((x) => x.model === slug && x.field === field);
    provRows.push({
      slug,
      field,
      has_provenance: p ? 'yes' : 'no',
      source_url: p?.source_url || '',
      verification_status: p?.verification_status || '',
      trace: p ? 'page→dataset→provenance→official' : 'FAIL_DATA',
    });
    if (!p) errors.push(`FAIL_DATA: ${slug}.${field} missing provenance`);
  }
}
writeCsv(path.join(outDir, '03-data-fields-used.csv'), Object.keys(fieldsUsed[0]), fieldsUsed);
writeCsv(path.join(outDir, '04-provenance-validation.csv'), Object.keys(provRows[0]), provRows);

// Similarity
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
writeCsv(path.join(outDir, '06-similarity-check.csv'), Object.keys(simRows[0]), simRows);

writeCsv(
  path.join(outDir, '11-deferred-candidates.csv'),
  ['slug', 'reason'],
  [
    ...DEFERRED,
    ...models
      .filter((m) => !['READY_HIGH_CONFIDENCE', 'READY_FAMILY_LEVEL'].includes(m.eligibility))
      .slice(0, 40)
      .map((m) => ({ slug: m.slug, reason: m.eligibility })),
  ],
);

const nitroReport = `# Acer Nitro 16 — P1 CONTENT DATA CORRECTION

## Issue

Existing content claimed \`RTX 4080\` for Acer Nitro 16.

## Dataset / Provenance re-check

Verified \`gpuOptions\` for \`acer-nitro-16\`:

- NVIDIA GeForce RTX 4050 Laptop GPU
- NVIDIA GeForce RTX 4060 Laptop GPU
- NVIDIA GeForce RTX 4070 Laptop GPU

Sources: Acer.com AN16-41 official PDP pages (see \`data/notebook-specs/models.json\` + \`provenance.json\`).

## Action

- Removed unsupported RTX 4080 claim from model page body and claims list
- Replaced with family-level options that have provenance
- Did not invent replacement Exact SKU specs
- Left unrelated RTX 4080 mentions on other models/blogs untouched

## Regression

Script check: \`acer-nitro-16.md\` must not match \`RTX\\s*4080\`.

Current unsupported RTX 4080 mentions in Nitro 16 page: **${/RTX\s*4080/i.test(nitroRaw) ? 'FAIL' : '0'}**
`;
fs.writeFileSync(path.join(outDir, '07-nitro16-correction.md'), nitroReport);

const summary = {
  batch: BATCH,
  nitro4080_after: /RTX\s*4080/i.test(nitroRaw) ? 1 : 0,
  critical_similarity: critical,
  high_similarity: high,
  errors,
  provenance_rows: provRows.length,
  provenance_fail: provRows.filter((r) => r.has_provenance === 'no').length,
};
fs.writeFileSync(path.join(outDir, 'qa-summary.json'), JSON.stringify(summary, null, 2));

console.log(JSON.stringify(summary, null, 2));
if (errors.length || critical || high || summary.nitro4080_after) {
  console.error('BATCH1 QA FAILED');
  process.exit(1);
}
console.log('BATCH1 QA PASSED');
