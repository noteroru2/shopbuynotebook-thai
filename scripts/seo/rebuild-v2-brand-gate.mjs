import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const errors = [];

const authorityPath = path.join(root, 'src/data/rebuild-v2-brand-authority.json');
const brandLayoutPath = path.join(root, 'src/layouts/BrandLayout.astro');
const brandRoutePath = path.join(root, 'src/pages/แบรนด์/[slug].astro');
const brandIndexPath = path.join(root, 'src/pages/แบรนด์/index.astro');

if (!fs.existsSync(authorityPath)) {
  errors.push('Missing R5 brand authority map');
} else {
  const authority = JSON.parse(fs.readFileSync(authorityPath, 'utf8'));
  const brands = authority.brands ?? [];
  if (authority.releaseState !== 'PRE_MIGRATION_NOINDEX') {
    errors.push(`Unexpected R5 releaseState: ${authority.releaseState}`);
  }
  if (brands.length !== 8) errors.push(`R5 must stage exactly 8 brand owners; found ${brands.length}`);

  const slugs = new Set();
  const legacyPaths = new Set();
  const ownerPaths = new Set();
  for (const brand of brands) {
    if (!brand.slug || !brand.legacyPath || !brand.ownerPath) errors.push('Every R5 brand needs slug, legacyPath and ownerPath');
    if (slugs.has(brand.slug)) errors.push(`Duplicate R5 brand slug: ${brand.slug}`);
    if (legacyPaths.has(brand.legacyPath)) errors.push(`Duplicate legacy brand path: ${brand.legacyPath}`);
    if (ownerPaths.has(brand.ownerPath)) errors.push(`Duplicate brand owner path: ${brand.ownerPath}`);
    slugs.add(brand.slug);
    legacyPaths.add(brand.legacyPath);
    ownerPaths.add(brand.ownerPath);

    if (brand.legacyPath !== `/รับซื้อโน๊ตบุ๊ค/${brand.slug}/`) {
      errors.push(`Unexpected legacy brand path for ${brand.slug}: ${brand.legacyPath}`);
    }
    if (brand.ownerPath !== `/แบรนด์/${brand.slug}/`) {
      errors.push(`Unexpected R5 owner path for ${brand.slug}: ${brand.ownerPath}`);
    }
    if (![1, 2, 3].includes(brand.priority)) errors.push(`Invalid R5 priority for ${brand.slug}`);
    if (!Array.isArray(brand.children) || brand.children.length < 2) {
      errors.push(`Brand needs at least two child paths: ${brand.slug}`);
    }
    for (const child of brand.children ?? []) {
      if (!child.href?.startsWith('/รับซื้อโน๊ตบุ๊ค/')) {
        errors.push(`R5 child winner must remain on legacy model/series namespace: ${brand.slug} -> ${child.href}`);
      }
      if (child.href === brand.legacyPath) errors.push(`Brand child cannot point back to legacy hub: ${brand.slug}`);
    }
  }

  const layout = fs.existsSync(brandLayoutPath) ? fs.readFileSync(brandLayoutPath, 'utf8') : '';
  for (const brand of brands) {
    if (!layout.includes(`'${brand.legacyPath}': '${brand.ownerPath}'`)) {
      errors.push(`BrandLayout missing legacy canonical map: ${brand.slug}`);
    }
  }
  if (!layout.includes('resolvedNoindex = migratedOwner ? true : noindex')) {
    errors.push('BrandLayout must force noindex on legacy brand hubs');
  }
}

for (const rel of [brandRoutePath, brandIndexPath]) {
  if (!fs.existsSync(rel)) errors.push(`Missing R5 route: ${path.relative(root, rel)}`);
  else if (!fs.readFileSync(rel, 'utf8').includes('noindex={true}')) {
    errors.push(`R5 staging route must remain noindex: ${path.relative(root, rel)}`);
  }
}

const brandRoute = fs.existsSync(brandRoutePath) ? fs.readFileSync(brandRoutePath, 'utf8') : '';
if (!brandRoute.includes("rebuild-v2-brand-authority.json")) {
  errors.push('Brand owner route must consume R5 authority map');
}
if (!brandRoute.includes('R5 ยังไม่ย้าย URL รุ่นที่มีสัญญาณเดิม')) {
  errors.push('R5 route must explicitly preserve existing model/series URLs');
}

if (errors.length) {
  console.error('REBUILD V2 R5 BRAND GATE: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('REBUILD V2 R5 BRAND GATE: PASS');
console.log('- 8 brand owners are unique and evidence-backed');
console.log('- Legacy brand hubs canonicalize to new brand owners and remain noindex');
console.log('- Brand owners remain noindex before migration');
console.log('- Existing model/series winner URLs are preserved for a later batch');
