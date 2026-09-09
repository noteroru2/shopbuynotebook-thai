import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const errors = [];

const graph = JSON.parse(read('src/data/rebuild-v2-internal-link-authority.json'));
const header = read('src/components/Header.astro');
const footer = read('src/components/Footer.astro');
const related = read('src/components/RelatedLinks.astro');
const authorityLinks = read('src/components/AuthorityLinks.astro');
const blog = read('src/pages/blog/[slug].astro');
const stagedPages = [
  'src/pages/แบรนด์/[slug].astro',
  'src/pages/รุ่น/[slug].astro',
  'src/pages/อาการ/[slug].astro',
  'src/pages/พื้นที่/[slug].astro',
];

if (graph.version !== '2026-09-09-r10') errors.push('Unexpected R10 graph version');
if (!Array.isArray(graph.coreOwners) || graph.coreOwners.length < 8) errors.push('R10 core owner graph is incomplete');
if (!Array.isArray(graph.priorityBrands) || graph.priorityBrands.length !== 8) errors.push('R10 priority brand set must contain 8 staged brand owners');

const requiredNav = ['/ประเมินราคา/', '/ขายโน๊ตบุ๊ค/', '/แบรนด์/', '/รุ่น/', '/อาการ/', '/พื้นที่/', '/blog/'];
for (const href of requiredNav) if (!header.includes(`href: '${href}'`)) errors.push(`Header missing R10 owner: ${href}`);

const forbiddenPromoted = Object.keys(graph.rewriteMap);
for (const href of forbiddenPromoted) {
  if (footer.includes(`href=\"${href}\"`) || footer.includes(`href='${href}'`)) errors.push(`Footer still promotes retired/legacy URL: ${href}`);
}

for (const brand of graph.priorityBrands) if (!footer.includes('priorityAuthorityBrands')) errors.push(`Footer must source priority brands from authority graph (${brand.href})`);
for (const token of ['rewriteAuthorityHref', 'resolvedLinks']) if (!related.includes(token)) errors.push(`RelatedLinks missing R10 rewrite enforcement: ${token}`);
for (const token of ['context:', "'brand'", "'model'", "'condition'", "'location'", "'blog'"]) if (!authorityLinks.includes(token)) errors.push(`AuthorityLinks missing context token: ${token}`);

if (!blog.includes("resolvedBlogAction === 'KEEP_INFORMATIONAL' ? <AuthorityLinks context=\"blog\" />")) errors.push('Only KEEP_INFORMATIONAL blog pages may receive the R10 contextual authority block');
if (!blog.includes('href=\"/ขายโน๊ตบุ๊ค/\"')) errors.push('Blog CTA must point to the seller-flow owner');

for (const file of stagedPages) {
  const src = read(file);
  if (!src.includes('AuthorityLinks')) errors.push(`${file} missing contextual authority links`);
  for (const visibleInternalLabel of ['Brand Owner', 'Model Owner', 'Condition Owner', 'Local Owner', 'R5 Priority', 'Why this brand is in R5']) {
    if (src.includes(visibleInternalLabel)) errors.push(`${file} exposes internal rebuild language: ${visibleInternalLabel}`);
  }
}

const brandPage = read('src/pages/แบรนด์/[slug].astro');
if (!brandPage.includes('authority.children.map')) errors.push('Brand page must distribute authority to curated series/model children');
const modelPage = read('src/pages/รุ่น/[slug].astro');
if (!modelPage.includes('brandHref')) errors.push('Model page must return authority to its brand parent when known');

for (const forbidden of ['return Response.redirect', 'status: 301', 'status: 410']) {
  for (const file of ['src/lib/internal-links.ts', 'src/components/AuthorityLinks.astro', ...stagedPages]) {
    if (read(file).includes(forbidden)) errors.push(`R10 must not implement production HTTP lifecycle in ${file}: ${forbidden}`);
  }
}

if (errors.length) {
  console.error('REBUILD V2 R10 GATE: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('REBUILD V2 R10 GATE: PASS');
console.log(`- Core owners: ${graph.coreOwners.length}`);
console.log(`- Priority brand owners: ${graph.priorityBrands.length}`);
console.log(`- Rewrite rules: ${Object.keys(graph.rewriteMap).length}`);
console.log('- Header, footer, related links and contextual links point authority toward declared owners');
console.log('- Informational blog authority block is limited to KEEP_INFORMATIONAL posts');
console.log('- No production HTTP 301/410 release is claimed in R10');
