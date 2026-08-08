/**
 * Validate notebook spec datasets against schema + quality gates.
 * Usage: node scripts/spec-data/validate-specs.mjs [--check-urls]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const checkUrls = process.argv.includes('--check-urls');

const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas/notebook-spec.schema.json'), 'utf8'));
const modelsDoc = JSON.parse(fs.readFileSync(path.join(root, 'data/notebook-specs/models.json'), 'utf8'));
const seriesDoc = JSON.parse(fs.readFileSync(path.join(root, 'data/notebook-specs/series.json'), 'utf8'));
const provenanceDoc = JSON.parse(fs.readFileSync(path.join(root, 'data/notebook-specs/provenance.json'), 'utf8'));

const errors = [];
const warnings = [];

function fail(code, msg) {
  errors.push({ code, msg });
}

function warn(code, msg) {
  warnings.push({ code, msg });
}

const enumOr = (prop) => {
  const p = schema.properties[prop];
  return p?.enum || p?.anyOf?.find((x) => x.enum)?.enum || null;
};

function isUri(v) {
  if (v == null) return true;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function unique(arr) {
  return new Set(arr).size === arr.length;
}

function getPath(obj, dotted) {
  return dotted.split('.').reduce((a, k) => (a == null ? a : a[k]), obj);
}

function validateModel(m) {
  for (const key of schema.required) {
    if (m[key] === undefined) fail('FAIL_SPEC_SCHEMA', `${m.slug}: missing required ${key}`);
  }
  if (!schema.properties.pageType.enum.includes(m.pageType)) {
    fail('FAIL_SPEC_SCHEMA', `${m.slug}: invalid pageType`);
  }
  if (!schema.properties.configurationScope.enum.includes(m.configurationScope)) {
    fail('FAIL_SPEC_SCHEMA', `${m.slug}: invalid configurationScope`);
  }
  if (!schema.properties.eligibility.enum.includes(m.eligibility)) {
    fail('FAIL_SPEC_SCHEMA', `${m.slug}: invalid eligibility`);
  }
  if (m.category != null && !schema.properties.category.enum.includes(m.category)) {
    fail('FAIL_SPEC_SCHEMA', `${m.slug}: invalid category ${m.category}`);
  }
  if (!isUri(m.officialUrl)) fail('FAIL_SPEC_SCHEMA', `${m.slug}: officialUrl not URI`);
  if (!Array.isArray(m.cpuOptions) || !unique(m.cpuOptions)) fail('FAIL_SPEC_SCHEMA', `${m.slug}: cpuOptions invalid/dup`);
  if (!Array.isArray(m.gpuOptions) || !unique(m.gpuOptions)) fail('FAIL_SPEC_SCHEMA', `${m.slug}: gpuOptions invalid/dup`);
  for (const rate of m.display?.refreshRates || []) {
    const n = Number(String(rate).replace(/[^\d.]/g, ''));
    if (Number.isFinite(n) && (n < 30 || n > 1000)) {
      fail('FAIL_SPEC_SCHEMA', `${m.slug}: impossible refresh rate ${rate}`);
    }
  }
  if (m.memory?.ramSlots != null && (!Number.isInteger(m.memory.ramSlots) || m.memory.ramSlots < 0)) {
    fail('FAIL_SPEC_SCHEMA', `${m.slug}: invalid ramSlots`);
  }
  if (m.memory?.ramSoldered === true && m.memory?.ramSlots > 0) {
    warn('WARN_RAM_INCONSISTENT', `${m.slug}: soldered true but ramSlots > 0`);
  }
  for (const s of m.sources || []) {
    if (!isUri(s.url)) fail('FAIL_SPEC_SCHEMA', `${m.slug}: source url invalid`);
    if (!schema.properties.sources.items.properties.sourceType.enum.includes(s.sourceType)) {
      fail('FAIL_SPEC_SCHEMA', `${m.slug}: bad sourceType`);
    }
  }
  // Brand mismatch: slug brand token vs brand field (soft)
  const brandToken = String(m.brand).toLowerCase().replace(/\s+/g, '');
  const slug = String(m.slug).toLowerCase();
  const brandHints = {
    apple: ['macbook', 'apple'],
    asus: ['asus', 'rog', 'tuf', 'zephyrus'],
    acer: ['acer', 'nitro', 'predator', 'aspire'],
    dell: ['dell', 'alienware', 'xps', 'inspiron', 'latitude', 'g15', 'g16'],
    hp: ['hp', 'omen', 'victus', 'envy', 'spectre', 'elitebook'],
    lenovo: ['lenovo', 'legion', 'loq', 'ideapad', 'thinkpad'],
    msi: ['msi', 'katana', 'stealth', 'raider', 'cyborg', 'vector'],
    samsung: ['samsung', 'galaxy'],
    microsoft: ['surface', 'microsoft'],
  };
  const hints = brandHints[brandToken] || [brandToken];
  if (!hints.some((h) => slug.includes(h) || brandToken.includes(h))) {
    // allow specials
    if (!(brandToken === 'apple' && slug.startsWith('macbook'))) {
      fail('FAIL_CROSS_BRAND', `${m.slug}: brand ${m.brand} mismatch`);
    }
  }
}

const models = modelsDoc.models || [];
const series = seriesDoc.series || [];
const provenance = provenanceDoc.records || [];

if (!Array.isArray(models) || models.length === 0) fail('FAIL_SPEC_SCHEMA', 'models empty');
if (!Array.isArray(series) || series.length === 0) fail('FAIL_SPEC_SCHEMA', 'series empty');

const ids = models.map((m) => m.id);
if (!unique(ids)) fail('FAIL_SPEC_SCHEMA', 'duplicate model ids');
const codes = models.map((m) => m.modelCode).filter(Boolean);
const codeDup = codes.filter((c, i) => codes.indexOf(c) !== i);
if (codeDup.length) warn('WARN_DUP_MODEL_CODE', `duplicate modelCode values: ${[...new Set(codeDup)].join(', ')}`);

for (const m of models) validateModel(m);

// Provenance: every non-empty hardware field that is listed in provenance for researched models must have source
const hardwareKeys = [
  'cpuOptions',
  'gpuOptions',
  'wifi',
  'bluetooth',
  'batteryCapacity',
  'weightRange',
  'dimensions',
  'generation',
  'chargerWattageOptions',
  'ports',
  'operatingSystemOptions',
  'knownModelFamilies',
  'memory.ramType',
  'memory.ramSpeed',
  'memory.ramSlots',
  'memory.ramSoldered',
  'memory.ramMax',
  'memory.ramConfigurations',
  'storage.storageInterface',
  'storage.storageSlots',
  'storage.storageOptions',
  'display.displaySizes',
  'display.resolutions',
  'display.panelTypes',
  'display.refreshRates',
];

function nonempty(v) {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'string') return v.trim().length > 0;
  return true;
}

let fieldsWithoutProvenance = 0;
for (const m of models) {
  for (const key of hardwareKeys) {
    const val = getPath(m, key);
    if (!nonempty(val)) continue;
    const hit = provenance.find((p) => p.model === m.slug && p.field === key);
    if (!hit || !hit.source_url) {
      fieldsWithoutProvenance += 1;
      fail('FAIL_MISSING_PROVENANCE', `${m.slug}.${key} has value but no provenance`);
    }
  }
}

// Provenance records must have source_url
for (const p of provenance) {
  if (!p.source_url || !isUri(p.source_url)) {
    fail('FAIL_MISSING_PROVENANCE', `provenance row missing URL for ${p.model}.${p.field}`);
  }
}

if (checkUrls) {
  const urls = [...new Set([
    ...models.flatMap((m) => [m.officialUrl, ...(m.sources || []).map((s) => s.url)]),
    ...series.flatMap((s) => [s.officialUrl, ...(s.sources || []).map((x) => x.url)]),
  ].filter(Boolean))];
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (res.status >= 400) {
        // retry GET — some hosts block HEAD
        const res2 = await fetch(url, { method: 'GET', redirect: 'follow' });
        if (res2.status >= 400) warn('WARN_BROKEN_URL', `${url} -> ${res2.status}`);
      }
    } catch (e) {
      warn('WARN_BROKEN_URL', `${url} -> ${e.message}`);
    }
  }
}

const summary = {
  models: models.length,
  series: series.length,
  provenance_records: provenance.length,
  fields_without_provenance: fieldsWithoutProvenance,
  errors: errors.length,
  warnings: warnings.length,
  error_codes: [...new Set(errors.map((e) => e.code))],
};

fs.writeFileSync(
  path.join(root, 'docs/spec-data-foundation/validation-result.json'),
  JSON.stringify({ summary, errors, warnings }, null, 2),
);

console.log(JSON.stringify(summary, null, 2));
if (errors.length) {
  console.error('VALIDATION FAILED');
  for (const e of errors.slice(0, 50)) console.error(`- [${e.code}] ${e.msg}`);
  process.exit(1);
}
console.log('VALIDATION PASSED');
