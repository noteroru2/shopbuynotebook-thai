import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const triagePath = path.join(root, 'src/data/rebuild-v2-blog-triage.json');
const blogDir = path.join(root, 'src/content/blog');
const blogPagePath = path.join(root, 'src/pages/blog/[slug].astro');
const blogIndexPath = path.join(root, 'src/pages/blog/index.astro');
const astroConfigPath = path.join(root, 'astro.config.mjs');
const redirectPath = path.join(root, 'src/data/rebuild-v2-production-redirects.json');
const errors = [];
const allowedActions = new Set(['KEEP_INFORMATIONAL', 'MERGE_TO_OWNER', 'HOLD_NOINDEX', 'RETIRE_CANDIDATE']);

if (!fs.existsSync(triagePath)) errors.push('Missing R9 blog triage manifest');
if (!fs.existsSync(blogDir)) errors.push('Missing blog collection');
const triage = fs.existsSync(triagePath) ? JSON.parse(fs.readFileSync(triagePath, 'utf8')) : { policy: {}, items: [] };
if (triage.policy?.defaultForUnclassified !== 'HOLD_NOINDEX') errors.push('R9 defaultForUnclassified must be HOLD_NOINDEX');
if (!triage.policy?.winnerProtection?.includes('clicked')) errors.push('R9 must explicitly protect clicked/page-one blog signals');

const bySlug = new Map();
const counts = new Map();
for (const item of triage.items ?? []) {
  if (!item.slug || !item.action || !item.evidence) errors.push(`Incomplete R9 row: ${JSON.stringify(item)}`);
  if (bySlug.has(item.slug)) errors.push(`Duplicate R9 blog slug: ${item.slug}`);
  bySlug.set(item.slug, item);
  if (!allowedActions.has(item.action)) errors.push(`Invalid R9 action: ${item.slug} => ${item.action}`);
  if (item.action === 'MERGE_TO_OWNER' && !item.target) errors.push(`MERGE_TO_OWNER missing target: ${item.slug}`);
  if (item.action !== 'MERGE_TO_OWNER' && item.target) errors.push(`Only MERGE_TO_OWNER may carry target: ${item.slug}`);
  if (item.target && item.target === `/blog/${item.slug}/`) errors.push(`Self-merge target: ${item.slug}`);
  counts.set(item.action, (counts.get(item.action) ?? 0) + 1);
}

const blogFiles = fs.existsSync(blogDir) ? fs.readdirSync(blogDir).filter((name) => /\.(md|mdx)$/i.test(name)) : [];
const fileSlugs = new Set(blogFiles.map((name) => name.replace(/\.(md|mdx)$/i, '')));
const defaultHoldCount = [...fileSlugs].filter((slug) => !bySlug.has(slug)).length;
if (defaultHoldCount < 1) errors.push('R9 should leave unreviewed legacy blogs safely default-held');

for (const protectedSlug of ['โน๊ตบุ๊คติดรหัส-windows-ขายได้ไหม','กรณีศึกษา-รับซื้อโน๊ตบุ๊คบอร์ดเสียช็อต-ค่าซ่อมไม่คุ้ม','กรณีศึกษา-รับซื้อโน๊ตบุ๊คองค์กร-20-เครื่อง-ปลด-asset-tag','โน๊ตบุ๊คจอแตกยังมีราคาไหม','โน๊ตบุ๊คเสียขายได้ไหม']) {
  if (bySlug.get(protectedSlug)?.action !== 'KEEP_INFORMATIONAL') errors.push(`Protected GSC blog must remain KEEP_INFORMATIONAL: ${protectedSlug}`);
}
for (const [slug, target] of [['รับซื้อโน๊ตบุ๊ค-คู่มือครบวงจรสำหรับผู้ขาย','/'],['ร้านรับซื้อโน๊ตบุ๊ค-เช็คราคาโน๊ตบุ๊ค-ประเมินราคา-คีย์หลัก','/'],['ขายโน๊ตบุ๊คที่ไหนดี-ได้ราคาและปลอดภัย','/ขายโน๊ตบุ๊ค/']]) {
  const item = bySlug.get(slug);
  if (!item || item.action !== 'MERGE_TO_OWNER' || item.target !== target) errors.push(`Commercial overlap must MERGE_TO_OWNER: ${slug} => ${target}`);
}

for (const [filePath, tokens] of [
  [blogPagePath, ['rebuild-v2-blog-triage.json','resolvedBlogAction','lifecycleNoindex','MERGE_TO_OWNER','selfCanonical',"resolvedBlogAction === 'MERGE_TO_OWNER'",'noindex={lifecycleNoindex}']],
  [blogIndexPath, ['rebuild-v2-blog-triage.json','KEEP_INFORMATIONAL','.filter((post) => keepSlugs.has(toSlug(post)))']],
  [astroConfigPath, ['rebuild-v2-blog-triage.json','R9_BLOG_SITEMAP_INCLUDED',"pathname.startsWith('/blog/')",'R8_LOCATION_SITEMAP_INCLUDED']],
]) {
  if (!fs.existsSync(filePath)) { errors.push(`Missing R9 enforcement file: ${path.relative(root, filePath)}`); continue; }
  const src = fs.readFileSync(filePath, 'utf8');
  for (const token of tokens) if (!src.includes(token)) errors.push(`${path.relative(root, filePath)} missing R9 token: ${token}`);
}

if (fs.existsSync(redirectPath)) {
  const redirects = JSON.parse(fs.readFileSync(redirectPath, 'utf8')).redirects ?? [];
  for (const item of [...bySlug.values()].filter((x) => x.action === 'MERGE_TO_OWNER')) {
    const source = `/blog/${item.slug}/`;
    if (!redirects.some((r) => r.source === source && r.target === item.target)) errors.push(`R13 redirect manifest missing R9 MERGE: ${source} -> ${item.target}`);
  }
}

const keepCount = counts.get('KEEP_INFORMATIONAL') ?? 0;
if (keepCount < 5) errors.push(`R9 informational authority set is implausibly small: ${keepCount}`);
if (keepCount > 40) errors.push(`R9 informational authority set is too broad: ${keepCount}`);

if (errors.length) {
  console.error('REBUILD V2 R9 GATE: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('REBUILD V2 R9 GATE: PASS');
console.log(`- KEEP_INFORMATIONAL: ${keepCount}; MERGE_TO_OWNER: ${counts.get('MERGE_TO_OWNER') ?? 0}; default HOLD: ${defaultHoldCount}`);
