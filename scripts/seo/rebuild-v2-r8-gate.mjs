import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const triagePath = path.join(root, 'src/data/rebuild-v2-location-triage.json');
const locationsDir = path.join(root, 'src/content/locations');
const layoutPath = path.join(root, 'src/layouts/LocationLayout.astro');
const astroConfigPath = path.join(root, 'astro.config.mjs');
const stagedLocationPath = path.join(root, 'src/pages/พื้นที่/[slug].astro');

const errors = [];
const allowedActions = new Set(['KEEP_CURRENT_URL', 'MIGRATE_LATER', 'HOLD_NOINDEX', 'MERGE']);

if (!fs.existsSync(triagePath)) errors.push('Missing R8 location triage manifest');
if (!fs.existsSync(locationsDir)) errors.push('Missing locations collection');

const triage = fs.existsSync(triagePath)
  ? JSON.parse(fs.readFileSync(triagePath, 'utf8'))
  : { policy: {}, items: [] };

if (triage.policy?.defaultForUnclassified !== 'HOLD_NOINDEX') errors.push('R8 defaultForUnclassified must be HOLD_NOINDEX');
if (!triage.policy?.locationOwnerIntent?.includes('Commercial')) errors.push('Missing explicit local commercial ownership policy');
if (!triage.policy?.serviceAreaHubIntent?.includes('/พื้นที่ให้บริการ/')) errors.push('Near-me/service-area ownership policy must point to /พื้นที่ให้บริการ/');

const bySlug = new Map();
const counts = new Map();
for (const item of triage.items ?? []) {
  if (!item.slug || !item.action || !item.evidence) errors.push(`Incomplete R8 row: ${JSON.stringify(item)}`);
  if (bySlug.has(item.slug)) errors.push(`Duplicate R8 location slug: ${item.slug}`);
  bySlug.set(item.slug, item);
  if (!allowedActions.has(item.action)) errors.push(`Invalid R8 action: ${item.slug} => ${item.action}`);
  if (item.action === 'MERGE' && !item.target) errors.push(`MERGE missing target: ${item.slug}`);
  if (item.action !== 'MERGE' && item.target) errors.push(`Only MERGE may carry target: ${item.slug}`);
  counts.set(item.action, (counts.get(item.action) ?? 0) + 1);
}

const locationSlugs = fs.existsSync(locationsDir)
  ? new Set(fs.readdirSync(locationsDir).filter((name) => name.endsWith('.md')).map((name) => name.replace(/\.md$/, '')))
  : new Set();
for (const slug of bySlug.keys()) if (!locationSlugs.has(slug)) errors.push(`R8 slug not found in locations collection: ${slug}`);

const defaultHoldCount = [...locationSlugs].filter((slug) => !bySlug.has(slug)).length;
const activeExplicitCount = [...bySlug.values()].filter((item) => item.action === 'KEEP_CURRENT_URL' || item.action === 'MIGRATE_LATER').length;
if (activeExplicitCount > 10) errors.push(`R8 active explicit location set is too broad: ${activeExplicitCount} > 10`);
if (defaultHoldCount < 1) errors.push('R8 must actually reduce the legacy location surface; expected unclassified HOLD_NOINDEX rows');

for (const [slug, expectedAction] of [
  ['อุบลราชธานี', 'KEEP_CURRENT_URL'],
  ['นครนายก', 'KEEP_CURRENT_URL'],
  ['รังสิต', 'KEEP_CURRENT_URL'],
  ['กรุงเทพ', 'MIGRATE_LATER'],
  ['ภาคอีสาน', 'MIGRATE_LATER'],
]) {
  if (bySlug.get(slug)?.action !== expectedAction) errors.push(`Protected/evidence location ${slug} must be ${expectedAction}`);
}

for (const slug of ['พระราม2', 'ห้วยขวาง', 'รามคำแหง', 'ลาดพร้าว']) {
  const item = bySlug.get(slug);
  if (!item || item.action !== 'MERGE' || item.target !== '/รับซื้อโน๊ตบุ๊ค/กรุงเทพ/') {
    errors.push(`Bangkok sub-area ${slug} must MERGE to /รับซื้อโน๊ตบุ๊ค/กรุงเทพ/`);
  }
}
const nearMe = bySlug.get('ใกล้ฉัน');
if (!nearMe || nearMe.action !== 'MERGE' || nearMe.target !== '/พื้นที่ให้บริการ/') {
  errors.push('ใกล้ฉัน must MERGE to /พื้นที่ให้บริการ/');
}

if (!fs.existsSync(layoutPath)) {
  errors.push('LocationLayout missing');
} else {
  const src = fs.readFileSync(layoutPath, 'utf8');
  for (const token of [
    'rebuild-v2-location-triage.json',
    'locationTriageItem',
    "resolvedLocationAction === 'HOLD_NOINDEX'",
    "resolvedLocationAction === 'MERGE'",
    'lifecycleCanonical',
  ]) if (!src.includes(token)) errors.push(`LocationLayout missing R8 enforcement token: ${token}`);
}

if (!fs.existsSync(astroConfigPath)) {
  errors.push('astro.config.mjs missing');
} else {
  const src = fs.readFileSync(astroConfigPath, 'utf8');
  for (const token of [
    'rebuild-v2-location-triage.json',
    'R8_LOCATION_SLUGS',
    'R8_LOCATION_SITEMAP_INCLUDED',
    'R7_CONDITION_SITEMAP_EXCLUDED',
    'V2_STAGING_PREFIXES',
  ]) if (!src.includes(token)) errors.push(`Sitemap missing R8 enforcement token: ${token}`);
}

if (!fs.existsSync(stagedLocationPath)) {
  errors.push('Staged /พื้นที่/[slug].astro missing');
} else {
  const src = fs.readFileSync(stagedLocationPath, 'utf8');
  if (!src.includes("new Set(['อุบลราชธานี'])")) errors.push('R8 staged /พื้นที่/ namespace must remain limited to Ubon Ratchathani');
  if (!src.includes('noindex={true}')) errors.push('R8 staged /พื้นที่/ owner must remain noindex before migration release');
}

for (const forbidden of ['return Response.redirect', 'status: 301', 'status: 410']) {
  if (fs.existsSync(layoutPath) && fs.readFileSync(layoutPath, 'utf8').includes(forbidden)) {
    errors.push(`R8 must not implement production HTTP lifecycle in LocationLayout: ${forbidden}`);
  }
}

if (errors.length) {
  console.error('REBUILD V2 R8 GATE: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('REBUILD V2 R8 GATE: PASS');
console.log(`- Location collection: ${locationSlugs.size}`);
console.log(`- KEEP_CURRENT_URL: ${counts.get('KEEP_CURRENT_URL') ?? 0}`);
console.log(`- MIGRATE_LATER: ${counts.get('MIGRATE_LATER') ?? 0}`);
console.log(`- MERGE: ${counts.get('MERGE') ?? 0}`);
console.log(`- Explicit HOLD_NOINDEX: ${counts.get('HOLD_NOINDEX') ?? 0}`);
console.log(`- Default HOLD_NOINDEX: ${defaultHoldCount}`);
console.log('- Only evidence-backed location owners remain sitemap-eligible');
console.log('- Bangkok neighborhood intent consolidates to one Bangkok owner');
console.log('- Near-me intent consolidates to /พื้นที่ให้บริการ/');
console.log('- /พื้นที่/ staging remains Ubon-only and noindex');
console.log('- No HTTP 301/410 release is claimed in R8');
