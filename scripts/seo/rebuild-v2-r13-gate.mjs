import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const exists = (p) => fs.existsSync(path.join(root, p));
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

const budget = json('src/data/rebuild-v2-index-budget.json');
const redirectsManifest = json('src/data/rebuild-v2-production-redirects.json');
const r6 = json('src/data/rebuild-v2-model-series-triage.json');
const r7 = json('src/data/rebuild-v2-condition-triage.json');
const r8 = json('src/data/rebuild-v2-location-triage.json');
const r9 = json('src/data/rebuild-v2-blog-triage.json');
const astro = read('astro.config.mjs');
const worker = read('worker/index.js');
const wrangler = read('wrangler.toml');
const brandHub = read('src/pages/แบรนด์/index.astro');
const brandDetail = read('src/pages/แบรนด์/[slug].astro');
const baseLayout = read('src/layouts/BaseLayout.astro');

const countEligible = (manifest, actions) => manifest.items.filter((item) => actions.includes(item.action)).length;
const calculated =
  budget.corePaths.length +
  budget.releasedV2BrandPaths.length +
  countEligible(r6, ['KEEP_CURRENT_URL', 'MIGRATE_LATER']) +
  countEligible(r7, ['KEEP_CURRENT_URL', 'MIGRATE_LATER']) +
  countEligible(r8, ['KEEP_CURRENT_URL', 'MIGRATE_LATER']) +
  countEligible(r9, ['KEEP_INFORMATIONAL']);

assert(budget.releaseState === 'PRODUCTION_MIGRATION_CANDIDATE', 'Budget must be in PRODUCTION_MIGRATION_CANDIDATE state.');
assert(calculated === budget.target.projectedIndexable, `Declared index budget ${budget.target.projectedIndexable} != calculated ${calculated}.`);
assert(calculated >= budget.target.minIndexable && calculated <= budget.target.hardCeiling, `Calculated release surface ${calculated} is outside ${budget.target.minIndexable}-${budget.target.hardCeiling}.`);
assert(calculated === 112, `R13 immutable initial release surface must be 112 URLs, got ${calculated}.`);
assert(!budget.corePaths.includes('/รับซื้อโน๊ตบุ๊ค/'), 'Redirecting /รับซื้อโน๊ตบุ๊ค/ must not remain in core sitemap allowlist.');
assert(budget.corePaths.includes('/ประเมินราคา/'), 'Valuation owner must be in release allowlist.');
assert(budget.releasedV2BrandPaths.length === 9, 'Brand release must contain hub + 8 brand owners.');

assert(!brandHub.includes('noindex={true}'), 'Released brand hub must not remain noindex.');
assert(!brandDetail.includes('noindex={true}'), 'Released brand detail pages must not remain noindex.');
assert(baseLayout.includes("normalizedPath === '/ประเมินราคา/' ? false : noindex"), 'Valuation exact-path noindex release override is missing.');

const redirectRows = redirectsManifest.redirects;
const sourceSet = new Set();
for (const row of redirectRows) {
  assert(row.source?.startsWith('/') && row.target?.startsWith('/'), `Invalid redirect row: ${JSON.stringify(row)}`);
  assert(row.source !== row.target, `Self redirect: ${row.source}`);
  assert(!sourceSet.has(row.source), `Duplicate redirect source: ${row.source}`);
  sourceSet.add(row.source);
}
for (const row of redirectRows) {
  assert(!sourceSet.has(row.target), `Redirect chain detected: ${row.source} -> ${row.target}, where target is another redirect source.`);
}
assert(redirectRows.length === 31, `Expected 31 controlled migration redirects, got ${redirectRows.length}.`);
assert(worker.includes('rebuild-v2-production-redirects.json'), 'Worker must consume the R13 redirect manifest.');
assert(worker.includes('Response.redirect(destination.toString(), 301)'), 'Worker must emit HTTP 301 redirects.');
assert(wrangler.includes('run_worker_first = true'), 'Cloudflare Worker must run before assets for the full route surface.');

assert(astro.includes('R13_REDIRECT_SOURCES'), 'Sitemap must exclude R13 redirect sources.');
assert(astro.includes('R13_RELEASED_BRAND_PATHS'), 'Sitemap must include only declared released V2 brand paths.');
assert(astro.includes('return false;') && astro.includes('catch'), 'Sitemap parser must fail closed.');

const requireDist = process.argv.includes('--dist-required');
if (requireDist || exists('dist')) {
  assert(exists('dist'), 'dist/ is required but missing. Run npm run build first.');
  if (exists('dist')) {
    const dist = path.join(root, 'dist');
    const sitemapFiles = fs.readdirSync(dist).filter((name) => /^sitemap.*\.xml$/i.test(name));
    assert(sitemapFiles.length > 0, 'No generated sitemap XML files found in dist/.');

    const locs = new Set();
    for (const file of sitemapFiles) {
      const xml = fs.readFileSync(path.join(dist, file), 'utf8');
      for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        const loc = match[1].replace(/&amp;/g, '&');
        try {
          const u = new URL(loc);
          if (!u.pathname.endsWith('.xml')) locs.add(loc);
        } catch {
          errors.push(`Invalid sitemap URL in ${file}: ${loc}`);
        }
      }
    }

    assert(locs.size === budget.target.projectedIndexable, `Built sitemap has ${locs.size} page URLs; expected ${budget.target.projectedIndexable}.`);
    assert(locs.size <= budget.target.hardCeiling, `Built sitemap exceeds hard ceiling: ${locs.size}.`);

    const pathToUrl = new Map();
    for (const loc of locs) {
      const u = new URL(loc);
      const decoded = decodeURIComponent(u.pathname);
      pathToUrl.set(decoded === '/' ? '/' : `${decoded.replace(/\/+$/, '')}/`, loc);
    }

    for (const source of sourceSet) {
      assert(!pathToUrl.has(source), `Redirect source leaked into sitemap: ${source}`);
    }
    for (const target of redirectRows.map((row) => row.target)) {
      assert(pathToUrl.has(target), `Redirect target is not in built sitemap/release surface: ${target}`);
    }
    for (const released of [...budget.corePaths, ...budget.releasedV2BrandPaths]) {
      assert(pathToUrl.has(released), `Declared released path missing from built sitemap: ${released}`);
    }

    for (const [pathname, loc] of pathToUrl) {
      const rel = pathname === '/' ? 'index.html' : path.join(pathname.slice(1), 'index.html');
      const htmlPath = path.join(dist, rel);
      assert(fs.existsSync(htmlPath), `Sitemap URL has no generated HTML: ${pathname}`);
      if (!fs.existsSync(htmlPath)) continue;
      const html = fs.readFileSync(htmlPath, 'utf8');
      assert(!/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html) && !/<meta[^>]+content=["'][^"']*noindex/i.test(html), `Sitemap URL is noindex: ${pathname}`);
      const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i) || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical/i);
      assert(!!canonicalMatch, `Missing canonical on sitemap URL: ${pathname}`);
      if (canonicalMatch) {
        try {
          const canonicalUrl = new URL(canonicalMatch[1]);
          const canonicalPath = decodeURIComponent(canonicalUrl.pathname);
          const normalizedCanonical = canonicalPath === '/' ? '/' : `${canonicalPath.replace(/\/+$/, '')}/`;
          assert(normalizedCanonical === pathname, `Non-self canonical in sitemap: ${pathname} -> ${normalizedCanonical}`);
        } catch {
          errors.push(`Invalid canonical URL on ${pathname}: ${canonicalMatch[1]}`);
        }
      }
    }
  }
}

if (errors.length) {
  console.error(`R13 FAIL (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`R13 PASS: source migration controls valid; projected indexable=${calculated}; redirects=${redirectRows.length}${requireDist || exists('dist') ? '; built sitemap verified' : '; dist verification pending'}.`);
