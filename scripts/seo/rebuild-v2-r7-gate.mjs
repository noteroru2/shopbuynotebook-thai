import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const triagePath = path.join(root, 'src/data/rebuild-v2-condition-triage.json');
const conditionsDir = path.join(root, 'src/content/conditions');
const layoutPath = path.join(root, 'src/layouts/BrandLayout.astro');
const astroConfigPath = path.join(root, 'astro.config.mjs');

const errors = [];
const allowedActions = new Set(['KEEP_CURRENT_URL', 'MIGRATE_LATER', 'HOLD_NOINDEX', 'MERGE']);

if (!fs.existsSync(triagePath)) errors.push('Missing R7 condition triage manifest');
if (!fs.existsSync(conditionsDir)) errors.push('Missing conditions collection');
const triage = fs.existsSync(triagePath) ? JSON.parse(fs.readFileSync(triagePath, 'utf8')) : { policy: {}, items: [] };

if (triage.policy?.defaultForUnclassified !== 'HOLD_NOINDEX') errors.push('R7 defaultForUnclassified must be HOLD_NOINDEX');
if (!triage.policy?.conditionOwnerIntent?.includes('Commercial')) errors.push('Missing explicit commercial condition ownership policy');
if (!triage.policy?.blogOwnerIntent?.includes('diagnosis')) errors.push('Missing explicit blog educational ownership policy');

const bySlug = new Map();
const counts = new Map();
for (const item of triage.items ?? []) {
  if (!item.slug || !item.action || !item.evidence) errors.push(`Incomplete R7 row: ${JSON.stringify(item)}`);
  if (bySlug.has(item.slug)) errors.push(`Duplicate R7 condition slug: ${item.slug}`);
  bySlug.set(item.slug, item);
  if (!allowedActions.has(item.action)) errors.push(`Invalid R7 action: ${item.slug} => ${item.action}`);
  if (item.action === 'MERGE' && !item.target) errors.push(`MERGE missing target: ${item.slug}`);
  if (item.action !== 'MERGE' && item.target) errors.push(`Only MERGE may carry target: ${item.slug}`);
  counts.set(item.action, (counts.get(item.action) ?? 0) + 1);
}

if (fs.existsSync(conditionsDir)) {
  const conditionSlugs = new Set(fs.readdirSync(conditionsDir).filter((name) => name.endsWith('.md')).map((name) => name.replace(/\.md$/, '')));
  for (const slug of conditionSlugs) if (!bySlug.has(slug)) errors.push(`Condition missing R7 classification: ${slug}`);
  for (const slug of bySlug.keys()) if (!conditionSlugs.has(slug)) errors.push(`R7 slug not found in conditions collection: ${slug}`);
}

const protectedWinner = bySlug.get('เปิดไม่ติด');
if (!protectedWinner || protectedWinner.action !== 'KEEP_CURRENT_URL') errors.push('Protected condition winner เปิดไม่ติด must KEEP_CURRENT_URL');

if (!fs.existsSync(layoutPath)) {
  errors.push('BrandLayout missing');
} else {
  const src = fs.readFileSync(layoutPath, 'utf8');
  for (const token of [
    'rebuild-v2-condition-triage.json',
    'conditionTriageItem',
    "lifecycleItem?.action === 'HOLD_NOINDEX'",
    "lifecycleItem?.action === 'MERGE'",
    'lifecycleCanonical',
  ]) if (!src.includes(token)) errors.push(`BrandLayout missing R7 enforcement token: ${token}`);
}

if (!fs.existsSync(astroConfigPath)) {
  errors.push('astro.config.mjs missing');
} else {
  const src = fs.readFileSync(astroConfigPath, 'utf8');
  for (const token of [
    'rebuild-v2-condition-triage.json',
    'R7_CONDITION_SITEMAP_EXCLUDED',
    'R6_SITEMAP_EXCLUDED',
    'V2_STAGING_PREFIXES',
  ]) if (!src.includes(token)) errors.push(`Sitemap missing R7 enforcement token: ${token}`);
}

// R7 is staging-only: do not claim or implement HTTP redirects here.
for (const forbidden of ['redirects:', 'return Response.redirect', 'status: 301']) {
  if (fs.existsSync(layoutPath) && fs.readFileSync(layoutPath, 'utf8').includes(forbidden)) errors.push(`R7 must not implement HTTP redirect in layout: ${forbidden}`);
}

if (errors.length) {
  console.error('REBUILD V2 R7 GATE: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('REBUILD V2 R7 GATE: PASS');
for (const action of ['KEEP_CURRENT_URL', 'MIGRATE_LATER', 'HOLD_NOINDEX', 'MERGE']) {
  console.log(`- ${action}: ${counts.get(action) ?? 0}`);
}
console.log('- Every condition collection row has an explicit R7 classification');
console.log('- Protected historical condition winner remains on current URL');
console.log('- HOLD/MERGE are noindex and sitemap-excluded in staging');
console.log('- Condition commercial intent and Blog educational intent are explicitly separated');
console.log('- No condition HTTP redirect is claimed in R7');
