import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

const policyPath = path.join(root, 'src/data/rebuild-v2-policy.json');
const comboPath = path.join(root, 'src/pages/รับซื้อโน๊ตบุ๊ค/[location]/[slug].astro');
const astroConfigPath = path.join(root, 'astro.config.mjs');
const headerPath = path.join(root, 'src/components/Header.astro');
const sellOwnerPath = path.join(root, 'src/pages/ขายโน๊ตบุ๊ค.astro');

const errors = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

let policy = null;
if (!fs.existsSync(policyPath)) {
  errors.push('Missing src/data/rebuild-v2-policy.json');
} else {
  policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));

  if (policy.releaseState !== 'PRE_MIGRATION_NOINDEX') {
    errors.push(`Unexpected releaseState: ${policy.releaseState}`);
  }

  const clusters = new Set();
  const queries = new Map();
  for (const item of policy.queryOwners ?? []) {
    if (!item.cluster || !item.owner) errors.push('Every query owner needs cluster + owner');
    if (clusters.has(item.cluster)) errors.push(`Duplicate query cluster: ${item.cluster}`);
    clusters.add(item.cluster);
    for (const rawQuery of item.queries ?? []) {
      const q = String(rawQuery).trim().toLowerCase();
      const prior = queries.get(q);
      if (prior && prior !== item.owner) {
        errors.push(`Query has multiple owners: ${rawQuery} => ${prior}, ${item.owner}`);
      }
      queries.set(q, item.owner);
    }
  }

  const min = policy.targetIndexSurface?.min;
  const max = policy.targetIndexSurface?.max;
  if (!(Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min)) {
    errors.push('Invalid targetIndexSurface min/max');
  }
  if (max > 150) errors.push(`Target index surface too large for rebuild phase: ${max}`);

  for (const hub of policy.newHubRoutes ?? []) {
    if (hub.indexable !== false) errors.push(`Pre-migration hub must be noindex: ${hub.path}`);
  }

  if (policy.legacyComboDefault?.action !== 'HOLD_NOINDEX') {
    errors.push('Legacy combo default must remain HOLD_NOINDEX before migration review');
  }
  if (policy.legacyComboDefault?.sitemap !== false) {
    errors.push('Legacy combos must remain excluded from sitemap');
  }

  for (const row of policy.legacyLifecycleSeeds ?? []) {
    if (row.action === 'GONE_410' && row.backlinkStatus !== 'CHECKED_NONE') {
      errors.push(`410 blocked until backlink review: ${row.from}`);
    }
    if (/301/.test(row.action) && !row.to) {
      errors.push(`Redirect candidate missing target: ${row.from}`);
    }
  }

  const protectedSet = new Set(policy.protectedSignalPaths ?? []);
  for (const row of policy.legacyLifecycleSeeds ?? []) {
    if (protectedSet.has(row.from) && row.action === 'GONE_410') {
      errors.push(`Protected search-signal URL cannot be 410: ${row.from}`);
    }
  }

  const money = policy.moneyPageConsolidation;
  if (!money || money.state !== 'SOURCE_CONSOLIDATED_REDIRECT_LAYER_PENDING') {
    errors.push('R4 money-page consolidation state missing or unexpected');
  }
  if (money && money.http301RequiredBeforeProduction !== true) {
    errors.push('R4 must require real HTTP 301 before production migration');
  }
}

if (!fs.existsSync(comboPath)) {
  errors.push('Legacy combo template missing');
} else {
  const combo = fs.readFileSync(comboPath, 'utf8');
  if (!combo.includes('noindex={true}')) {
    errors.push('Legacy location x topic combo template must remain noindex');
  }
}

if (!fs.existsSync(astroConfigPath)) {
  errors.push('astro.config.mjs missing');
} else {
  const config = fs.readFileSync(astroConfigPath, 'utf8');
  if (!config.includes('segments.length >= 2')) {
    errors.push('Sitemap guard for depth-2 legacy combo URLs is missing');
  }
}

const expectedNoindexRoutes = [
  'src/pages/แบรนด์/index.astro',
  'src/pages/แบรนด์/[slug].astro',
  'src/pages/รุ่น/index.astro',
  'src/pages/รุ่น/[slug].astro',
  'src/pages/อาการ/index.astro',
  'src/pages/อาการ/[slug].astro',
  'src/pages/พื้นที่/index.astro',
  'src/pages/พื้นที่/[slug].astro',
  'src/pages/ประเมินราคา/index.astro',
];

for (const rel of expectedNoindexRoutes) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    errors.push(`Missing V2 staging route: ${rel}`);
    continue;
  }
  const src = fs.readFileSync(abs, 'utf8');
  if (!src.includes('noindex={true}')) {
    errors.push(`V2 staging route must remain noindex: ${rel}`);
  }
}

const moneyLosers = [
  ['src/pages/รับซื้อ-notebook.astro', "const target = '/';"],
  ['src/pages/เช็คราคาโน๊ตบุ๊ค.astro', "const target = '/ประเมินราคา/';"],
  ['src/pages/เช็คราคาโน๊ตบุ๊คมือสอง.astro', "const target = '/ประเมินราคา/';"],
  ['src/pages/ตีราคาโน๊ตบุ๊ค.astro', "const target = '/ประเมินราคา/';"],
  ['src/pages/ขายโน๊ตบุ๊คด่วน.astro', "const target = '/ขายโน๊ตบุ๊ค/';"],
];

for (const [rel, targetMarker] of moneyLosers) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    errors.push(`Missing R4 loser migration stub: ${rel}`);
    continue;
  }
  const src = fs.readFileSync(abs, 'utf8');
  if (!src.includes('noindex={true}')) errors.push(`R4 loser must be noindex: ${rel}`);
  if (!src.includes('canonical={absoluteUrl(target)}')) errors.push(`R4 loser must canonicalize to owner: ${rel}`);
  if (!src.includes('MigrationNotice')) errors.push(`R4 loser must use migration notice: ${rel}`);
  if (!src.includes(targetMarker)) errors.push(`R4 loser target mismatch: ${rel}`);
}

if (!fs.existsSync(sellOwnerPath)) {
  errors.push('Sell owner missing: src/pages/ขายโน๊ตบุ๊ค.astro');
} else {
  const sell = fs.readFileSync(sellOwnerPath, 'utf8');
  if (!sell.includes('canonicalPath="/ขายโน๊ตบุ๊ค/"')) errors.push('Sell owner canonical path changed');
  if (sell.includes('noindex={true}')) errors.push('Protected sell owner must not be noindex');
  if (!sell.includes('/ประเมินราคา/')) errors.push('Sell owner must link valuation owner');
}

if (!fs.existsSync(headerPath)) {
  errors.push('Header missing');
} else {
  const header = fs.readFileSync(headerPath, 'utf8');
  for (const requiredHref of ['/ประเมินราคา/', '/ขายโน๊ตบุ๊ค/', '/แบรนด์/', '/พื้นที่/']) {
    if (!header.includes(`href: '${requiredHref}'`)) errors.push(`Header missing V2 owner link: ${requiredHref}`);
  }
  for (const retiredHref of ['/เช็คราคาโน๊ตบุ๊ค/', '/ขายโน๊ตบุ๊คด่วน/']) {
    if (header.includes(`href: '${retiredHref}'`)) errors.push(`Header still points to retired money page: ${retiredHref}`);
  }
}

const comboDynamicSource = fs.existsSync(comboPath) ? fs.readFileSync(comboPath, 'utf8') : '';
if (comboDynamicSource && !comboDynamicSource.includes('noindex={true}')) {
  errors.push('Legacy combo route reopened to index');
}

if (errors.length) {
  console.error('REBUILD V2 GATE: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('REBUILD V2 GATE: PASS');
console.log('- Query ownership is deterministic');
console.log('- Target index-surface ceiling is enforced');
console.log('- Legacy combo routes remain noindex and sitemap-excluded');
console.log('- All V2 staging hubs and child routes remain noindex before migration release');
console.log('- R4 money-page loser routes are noindex canonical stubs');
console.log('- Navigation points to V2 money-page owners');
console.log('- Real HTTP 301 remains a production migration requirement');
console.log('- 410 is blocked until backlink review');
