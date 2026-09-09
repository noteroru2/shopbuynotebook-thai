import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const policyPath = path.join(root, 'src/data/rebuild-v2-policy.json');
const budgetPath = path.join(root, 'src/data/rebuild-v2-index-budget.json');
const comboPath = path.join(root, 'src/pages/รับซื้อโน๊ตบุ๊ค/[location]/[slug].astro');
const astroConfigPath = path.join(root, 'astro.config.mjs');
const headerPath = path.join(root, 'src/components/Header.astro');
const sellOwnerPath = path.join(root, 'src/pages/ขายโน๊ตบุ๊ค.astro');
const errors = [];
const budget = fs.existsSync(budgetPath) ? JSON.parse(fs.readFileSync(budgetPath, 'utf8')) : {};
const productionRelease = budget.releaseState === 'PRODUCTION_MIGRATION_CANDIDATE';

let policy = null;
if (!fs.existsSync(policyPath)) errors.push('Missing src/data/rebuild-v2-policy.json');
else {
  policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
  if (policy.releaseState !== 'PRE_MIGRATION_NOINDEX') errors.push(`Unexpected base policy releaseState: ${policy.releaseState}`);

  const clusters = new Set();
  const queries = new Map();
  for (const item of policy.queryOwners ?? []) {
    if (!item.cluster || !item.owner) errors.push('Every query owner needs cluster + owner');
    if (clusters.has(item.cluster)) errors.push(`Duplicate query cluster: ${item.cluster}`);
    clusters.add(item.cluster);
    for (const rawQuery of item.queries ?? []) {
      const q = String(rawQuery).trim().toLowerCase();
      const prior = queries.get(q);
      if (prior && prior !== item.owner) errors.push(`Query has multiple owners: ${rawQuery} => ${prior}, ${item.owner}`);
      queries.set(q, item.owner);
    }
  }

  const min = policy.targetIndexSurface?.min;
  const max = policy.targetIndexSurface?.max;
  if (!(Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min)) errors.push('Invalid targetIndexSurface min/max');
  if (max > 150) errors.push(`Target index surface too large for rebuild phase: ${max}`);

  if (!productionRelease) {
    for (const hub of policy.newHubRoutes ?? []) if (hub.indexable !== false) errors.push(`Pre-migration hub must be noindex: ${hub.path}`);
  }

  if (policy.legacyComboDefault?.action !== 'HOLD_NOINDEX') errors.push('Legacy combo default must remain HOLD_NOINDEX');
  if (policy.legacyComboDefault?.sitemap !== false) errors.push('Legacy combos must remain excluded from sitemap');

  for (const row of policy.legacyLifecycleSeeds ?? []) {
    if (row.action === 'GONE_410' && row.backlinkStatus !== 'CHECKED_NONE') errors.push(`410 blocked until backlink review: ${row.from}`);
    if (/301/.test(row.action) && !row.to) errors.push(`Redirect candidate missing target: ${row.from}`);
  }
  const protectedSet = new Set(policy.protectedSignalPaths ?? []);
  for (const row of policy.legacyLifecycleSeeds ?? []) if (protectedSet.has(row.from) && row.action === 'GONE_410') errors.push(`Protected search-signal URL cannot be 410: ${row.from}`);

  const money = policy.moneyPageConsolidation;
  if (!money || money.state !== 'SOURCE_CONSOLIDATED_REDIRECT_LAYER_PENDING') errors.push('R4 money-page consolidation state missing or unexpected');
  if (money && money.http301RequiredBeforeProduction !== true) errors.push('R4 must require real HTTP 301 before production migration');
}

if (!fs.existsSync(comboPath)) errors.push('Legacy combo template missing');
else if (!fs.readFileSync(comboPath, 'utf8').includes('noindex={true}')) errors.push('Legacy location x topic combo template must remain noindex');

if (!fs.existsSync(astroConfigPath)) errors.push('astro.config.mjs missing');
else if (!fs.readFileSync(astroConfigPath, 'utf8').includes('segments.length >= 2')) errors.push('Sitemap guard for depth-2 legacy combo URLs is missing');

const alwaysNoindexRoutes = [
  'src/pages/รุ่น/index.astro','src/pages/รุ่น/[slug].astro',
  'src/pages/อาการ/index.astro','src/pages/อาการ/[slug].astro',
  'src/pages/พื้นที่/index.astro','src/pages/พื้นที่/[slug].astro',
];
const stagingOnlyRoutes = ['src/pages/แบรนด์/index.astro','src/pages/แบรนด์/[slug].astro'];
for (const rel of [...alwaysNoindexRoutes, ...stagingOnlyRoutes]) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) { errors.push(`Missing V2 route: ${rel}`); continue; }
  const src = fs.readFileSync(abs, 'utf8');
  if (alwaysNoindexRoutes.includes(rel) && !src.includes('noindex={true}')) errors.push(`V2 route must remain noindex: ${rel}`);
  if (stagingOnlyRoutes.includes(rel)) {
    if (productionRelease && src.includes('noindex={true}')) errors.push(`R13 released route must not remain noindex: ${rel}`);
    if (!productionRelease && !src.includes('noindex={true}')) errors.push(`V2 staging route must remain noindex: ${rel}`);
  }
}

const valuationPath = path.join(root, 'src/pages/ประเมินราคา/index.astro');
if (!fs.existsSync(valuationPath)) errors.push('Missing valuation owner route');
else if (!productionRelease && !fs.readFileSync(valuationPath, 'utf8').includes('noindex={true}')) errors.push('Pre-migration valuation owner must remain noindex');
if (productionRelease) {
  const baseLayout = fs.readFileSync(path.join(root, 'src/layouts/BaseLayout.astro'), 'utf8');
  if (!baseLayout.includes("normalizedPath === '/ประเมินราคา/' ? false : noindex")) errors.push('R13 valuation noindex release override missing');
}

const moneyLosers = [
  ['src/pages/รับซื้อ-notebook.astro', "const target = '/';"],
  ['src/pages/เช็คราคาโน๊ตบุ๊ค.astro', "const target = '/ประเมินราคา/';"],
  ['src/pages/เช็คราคาโน๊ตบุ๊คมือสอง.astro', "const target = '/ประเมินราคา/';"],
  ['src/pages/ตีราคาโน๊ตบุ๊ค.astro', "const target = '/ประเมินราคา/';"],
  ['src/pages/ขายโน๊ตบุ๊คด่วน.astro', "const target = '/ขายโน๊ตบุ๊ค/';"],
];
for (const [rel, marker] of moneyLosers) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) { errors.push(`Missing R4 loser migration stub: ${rel}`); continue; }
  const src = fs.readFileSync(abs, 'utf8');
  if (!src.includes('noindex={true}')) errors.push(`R4 loser must be noindex: ${rel}`);
  if (!src.includes('canonical={absoluteUrl(target)}')) errors.push(`R4 loser must canonicalize to owner: ${rel}`);
  if (!src.includes('MigrationNotice')) errors.push(`R4 loser must use migration notice: ${rel}`);
  if (!src.includes(marker)) errors.push(`R4 loser target mismatch: ${rel}`);
}

if (!fs.existsSync(sellOwnerPath)) errors.push('Sell owner missing');
else {
  const sell = fs.readFileSync(sellOwnerPath, 'utf8');
  if (!sell.includes('canonicalPath="/ขายโน๊ตบุ๊ค/"')) errors.push('Sell owner canonical path changed');
  if (sell.includes('noindex={true}')) errors.push('Protected sell owner must not be noindex');
  if (!sell.includes('/ประเมินราคา/')) errors.push('Sell owner must link valuation owner');
}

if (!fs.existsSync(headerPath)) errors.push('Header missing');
else {
  const header = fs.readFileSync(headerPath, 'utf8');
  for (const href of ['/ประเมินราคา/','/ขายโน๊ตบุ๊ค/','/แบรนด์/','/พื้นที่/']) if (!header.includes(`href: '${href}'`)) errors.push(`Header missing V2 owner link: ${href}`);
  for (const href of ['/เช็คราคาโน๊ตบุ๊ค/','/ขายโน๊ตบุ๊คด่วน/']) if (header.includes(`href: '${href}'`)) errors.push(`Header still points to retired money page: ${href}`);
}

if (errors.length) {
  console.error('REBUILD V2 GATE: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`REBUILD V2 GATE: PASS (${productionRelease ? 'R13_RELEASE' : 'STAGING'})`);
