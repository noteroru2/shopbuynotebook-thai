import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const triagePath = path.join(root, 'src/data/rebuild-v2-model-series-triage.json');
const supplementPath = path.join(root, 'src/data/rebuild-v2-model-series-r13-supplement.json');
const inventoryPath = path.join(root, 'docs/authority-phase/01-series-model-inventory.csv');
const brandLayoutPath = path.join(root, 'src/layouts/BrandLayout.astro');
const astroConfigPath = path.join(root, 'astro.config.mjs');
const errors = [];
const allowedActions = new Set(['KEEP_CURRENT_URL', 'MIGRATE_LATER', 'HOLD_NOINDEX', 'MERGE']);

if (!fs.existsSync(triagePath)) errors.push('Missing R6 triage manifest');
if (!fs.existsSync(supplementPath)) errors.push('Missing R13 model triage supplement');
if (!fs.existsSync(inventoryPath)) errors.push('Missing authority series/model inventory');
const triage = fs.existsSync(triagePath) ? JSON.parse(fs.readFileSync(triagePath, 'utf8')) : { policy: {}, items: [] };
const supplement = fs.existsSync(supplementPath) ? JSON.parse(fs.readFileSync(supplementPath, 'utf8')) : { items: [] };
if (triage.policy?.defaultForUnclassified !== 'HOLD_NOINDEX') errors.push('R6 defaultForUnclassified must be HOLD_NOINDEX');
const allItems = [...(triage.items ?? []), ...(supplement.items ?? [])];

const bySlug = new Map();
const counts = new Map();
for (const item of allItems) {
  if (!item.slug || !item.brand || !item.type || !item.action) { errors.push(`Incomplete triage row: ${JSON.stringify(item)}`); continue; }
  if (bySlug.has(item.slug)) errors.push(`Duplicate triage slug across R6/R13: ${item.slug}`);
  bySlug.set(item.slug, item);
  if (!allowedActions.has(item.action)) errors.push(`Invalid R6 action: ${item.slug} => ${item.action}`);
  if (item.action === 'MERGE' && !item.target) errors.push(`MERGE missing target: ${item.slug}`);
  if (item.action !== 'MERGE' && item.target) errors.push(`Only MERGE may carry target: ${item.slug}`);
  counts.set(item.action, (counts.get(item.action) ?? 0) + 1);
}

const protectedWinners = new Set(['asus-rog-flow','lenovo-legion-pro-7','lenovo-legion-pro','thinkpad-x1-carbon','hp-omen-16','acer-predator-triton','lenovo-legion-slim','macbook-pro-m3','macbook-pro-m4','surface-laptop','surface-pro']);
for (const slug of protectedWinners) {
  const row = bySlug.get(slug);
  if (!row) errors.push(`Protected winner missing from R6: ${slug}`);
  else if (row.action !== 'KEEP_CURRENT_URL') errors.push(`Protected winner must KEEP_CURRENT_URL: ${slug}`);
}

if (fs.existsSync(inventoryPath)) {
  const lines = fs.readFileSync(inventoryPath, 'utf8').split(/\r?\n/).slice(1).filter(Boolean);
  const inventorySlugs = new Set();
  for (const line of lines) {
    const firstComma = line.indexOf(',');
    const url = firstComma >= 0 ? line.slice(0, firstComma) : line;
    const match = url.match(/^\/รับซื้อโน๊ตบุ๊ค\/([^/]+)\/$/);
    if (match) inventorySlugs.add(match[1]);
  }
  for (const slug of inventorySlugs) if (!bySlug.has(slug)) errors.push(`Inventory Series/Model missing triage classification: ${slug}`);
  for (const slug of bySlug.keys()) if (!inventorySlugs.has(slug)) errors.push(`R6/R13 triage slug not found in authority inventory: ${slug}`);
}

if (!fs.existsSync(brandLayoutPath)) errors.push('BrandLayout missing');
else {
  const src = fs.readFileSync(brandLayoutPath, 'utf8');
  for (const token of ['rebuild-v2-model-series-triage.json','rebuild-v2-model-series-r13-supplement.json','modelTriageItem',"lifecycleItem?.action === 'HOLD_NOINDEX'", "lifecycleItem?.action === 'MERGE'",'lifecycleCanonical']) if (!src.includes(token)) errors.push(`BrandLayout missing R6 enforcement token: ${token}`);
}
if (!fs.existsSync(astroConfigPath)) errors.push('astro.config.mjs missing');
else {
  const src = fs.readFileSync(astroConfigPath, 'utf8');
  for (const token of ['rebuild-v2-model-series-triage.json','rebuild-v2-model-series-r13-supplement.json','R6_SITEMAP_INCLUDED','R13_REDIRECT_SOURCES','R13_STAGING_PREFIXES','R5_LEGACY_BRANDS']) if (!src.includes(token)) errors.push(`Sitemap missing release enforcement token: ${token}`);
}

if (errors.length) {
  console.error('REBUILD V2 R6 GATE: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('REBUILD V2 R6 GATE: PASS');
for (const action of ['KEEP_CURRENT_URL','MIGRATE_LATER','HOLD_NOINDEX','MERGE']) console.log(`- ${action}: ${counts.get(action) ?? 0}`);
