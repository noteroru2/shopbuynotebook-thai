import fs from 'node:fs';

const readJson = (path) => JSON.parse(fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8'));
const readText = (path) => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

const budget = readJson('src/data/rebuild-v2-index-budget.json');
const r6 = readJson('src/data/rebuild-v2-model-series-triage.json');
const r7 = readJson('src/data/rebuild-v2-condition-triage.json');
const r8 = readJson('src/data/rebuild-v2-location-triage.json');
const r9 = readJson('src/data/rebuild-v2-blog-triage.json');
const config = readText('astro.config.mjs');

const fail = (message) => {
  console.error(`R12 FAIL: ${message}`);
  process.exitCode = 1;
};

const count = (items, allowed) => items.filter((item) => allowed.includes(item.action)).length;
const modelSeries = count(r6.items, ['KEEP_CURRENT_URL', 'MIGRATE_LATER']);
const conditions = count(r7.items, ['KEEP_CURRENT_URL', 'MIGRATE_LATER']);
const locations = count(r8.items, ['KEEP_CURRENT_URL', 'MIGRATE_LATER']);
const blogs = count(r9.items, ['KEEP_INFORMATIONAL']);
const core = budget.corePaths.length;
const projected = modelSeries + conditions + locations + blogs + core;

if (budget.releaseState !== 'PRE_MIGRATION_INDEX_BUDGET') fail('unexpected releaseState');
if (budget.target.minIndexable !== 80) fail('minimum budget must stay 80');
if (budget.target.maxIndexable !== 120 || budget.target.hardCeiling !== 120) fail('hard ceiling must stay 120');
if (new Set(budget.corePaths).size !== budget.corePaths.length) fail('duplicate corePaths');
if (modelSeries !== budget.controlledSurface.modelSeries.projected) fail(`model/series count drift: ${modelSeries}`);
if (conditions !== budget.controlledSurface.conditions.projected) fail(`condition count drift: ${conditions}`);
if (locations !== budget.controlledSurface.locations.projected) fail(`location count drift: ${locations}`);
if (blogs !== budget.controlledSurface.blogs.projected) fail(`blog count drift: ${blogs}`);
if (projected !== budget.target.projectedIndexable) fail(`projected total drift: ${projected}`);
if (projected < budget.target.minIndexable || projected > budget.target.maxIndexable) fail(`projected surface ${projected} outside 80-120`);

for (const required of ['/', '/รับซื้อโน๊ตบุ๊ค/', '/รับซื้อโน๊ตบุ๊คมือสอง/', '/ขายโน๊ตบุ๊ค/', '/พื้นที่ให้บริการ/', '/blog/']) {
  if (!budget.corePaths.includes(required)) fail(`missing protected core path ${required}`);
}

for (const retired of ['/รับซื้อ-notebook/', '/เช็คราคาโน๊ตบุ๊ค/', '/เช็คราคาโน๊ตบุ๊คมือสอง/', '/ตีราคาโน๊ตบุ๊ค/', '/ขายโน๊ตบุ๊คด่วน/']) {
  if (budget.corePaths.includes(retired)) fail(`retired money path leaked into core allowlist: ${retired}`);
}

for (const requiredSnippet of [
  'rebuild-v2-index-budget.json',
  'R12_CORE_PATHS',
  'R12_STAGING_PREFIXES',
  'R6_SITEMAP_INCLUDED',
  'R7_CONDITION_SITEMAP_INCLUDED',
  'R8_LOCATION_SITEMAP_INCLUDED',
  'R9_BLOG_SITEMAP_INCLUDED',
  'return R12_CORE_PATHS.has(pathname)',
  'catch {\n          return false;',
]) {
  if (!config.includes(requiredSnippet)) fail(`astro sitemap control missing: ${requiredSnippet}`);
}

const badR6 = r6.items.filter((item) => ['HOLD_NOINDEX', 'MERGE'].includes(item.action) && ['KEEP_CURRENT_URL', 'MIGRATE_LATER'].includes(item.action));
if (badR6.length) fail('invalid R6 action overlap');

console.log(JSON.stringify({
  verdict: process.exitCode ? 'FAIL' : 'PASS',
  projectedIndexable: projected,
  budget: `${budget.target.minIndexable}-${budget.target.maxIndexable}`,
  breakdown: { core, modelSeries, conditions, locations, blogs },
}, null, 2));
