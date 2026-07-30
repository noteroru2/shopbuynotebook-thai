import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const expectedHost = 'xn--42cn4aobed0eb6hubj4es0m5dhvd.com';
const legacyHomepagePath = '/รับซื้อโน๊ตบุ๊ค/';
const expectedHomepageTitle =
  'รับซื้อโน๊ตบุ๊ค ประเมินตามรุ่น สเปก และสภาพจริง | ร้านรับซื้อโน๊ตบุ๊ค.com';
const expectedHomepageDescription =
  'รับซื้อโน๊ตบุ๊ค ส่งรูป รุ่น สเปก และสภาพเพื่อประเมินเบื้องต้น ราคาสุดท้ายยืนยันหลังตรวจเครื่อง มีหน้าร้านอุบลราชธานี จังหวัดอื่นนัดหรือจัดส่งตามเงื่อนไข';
const wranglerConfigPath = path.join(root, 'wrangler.toml');

if (!fs.existsSync(dist)) {
  console.error('SEO validation requires dist/. Run npm run build first.');
  process.exit(1);
}

const htmlFiles = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name.endsWith('.html')) htmlFiles.push(target);
  }
};
walk(dist);

const value = (html, regex) => (html.match(regex) || [])[1]?.trim() ?? '';
const decodePath = (input) => {
  try {
    return decodeURI(input);
  } catch {
    return input;
  }
};
const routeFromFile = (file) => {
  const relative = path.relative(dist, file).replaceAll('\\', '/');
  if (relative === 'index.html') return '/';
  return `/${relative.replace(/index\.html$/, '')}`;
};

const pages = htmlFiles.map((file) => {
  const html = fs.readFileSync(file, 'utf8');
  return {
    file,
    route: routeFromFile(file),
    html,
    title: value(html, /<title>([\s\S]*?)<\/title>/i),
    description:
      value(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i) ||
      value(html, /<meta[^>]+content="([^"]*)"[^>]+name="description"/i),
    canonical:
      value(html, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i) ||
      value(html, /<link[^>]+href="([^"]*)"[^>]+rel="canonical"/i),
    robots: value(html, /<meta[^>]+name="robots"[^>]+content="([^"]*)"/i),
    h1Count: (html.match(/<h1\b/gi) || []).length,
    hrefs: [...html.matchAll(/<a[^>]+href="([^"#?]+)"/gi)].map((match) => match[1]),
    localBusiness: /"@type":"(?:LocalBusiness|Store)"/i.test(html),
  };
});

const sitemapUrls = fs
  .readdirSync(dist)
  .filter((name) => /^sitemap-\d+\.xml$/.test(name))
  .flatMap((name) =>
    [...fs.readFileSync(path.join(dist, name), 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(
      (match) => match[1],
    ),
  );
const sitemapPaths = new Set(
  sitemapUrls.map((url) => {
    try {
      return decodePath(new URL(url).pathname);
    } catch {
      return '';
    }
  }),
);

const pageByRoute = new Map(pages.map((page) => [page.route, page]));
const inbound = new Map(pages.map((page) => [page.route, 0]));
const errors = [];
const warnings = [];

if (!fs.existsSync(wranglerConfigPath)) {
  errors.push('missing wrangler.toml');
} else {
  const wranglerConfig = fs.readFileSync(wranglerConfigPath, 'utf8');
  if (!/^\s*name\s*=\s*"shopbuynotebook-thai"\s*$/m.test(wranglerConfig)) {
    errors.push('wrangler.toml: unexpected Worker target');
  }
  if (!/^\s*directory\s*=\s*"dist"\s*$/m.test(wranglerConfig)) {
    errors.push('wrangler.toml: static assets directory must be dist');
  }
  if (/^\s*main\s*=/m.test(wranglerConfig)) {
    errors.push('wrangler.toml: Worker entrypoint is not allowed for static assets-first routing');
  }
  if (/^\s*run_worker_first\s*=\s*true\s*$/m.test(wranglerConfig)) {
    errors.push('wrangler.toml: run_worker_first must not be enabled');
  }
  if (/^\s*binding\s*=\s*"ASSETS"\s*$/m.test(wranglerConfig)) {
    errors.push('wrangler.toml: unused ASSETS binding must not be configured');
  }
}

const redirectsFile = path.join(dist, '_redirects');
if (!fs.existsSync(redirectsFile)) {
  errors.push('missing dist/_redirects');
} else {
  const redirectLines = fs
    .readFileSync(redirectsFile, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  const legacyRules = redirectLines.filter((line) => line.split(/\s+/)[0] === legacyHomepagePath);
  if (legacyRules.length !== 1) {
    errors.push(`expected exactly one ${legacyHomepagePath} redirect rule, found ${legacyRules.length}`);
  } else {
    const [source, destination, status] = legacyRules[0].split(/\s+/);
    if (source !== legacyHomepagePath || destination !== '/' || !['301', '308'].includes(status)) {
      errors.push(`invalid legacy homepage redirect rule: ${legacyRules[0]}`);
    }
  }
}

const excludedUtility = new Set(['/404.html', '/admin/', '/รับซื้อโน๊ตบุ๊ค/']);
const indexable = pages.filter(
  (page) => !/noindex/i.test(page.robots) && !excludedUtility.has(page.route),
);

for (const page of indexable) {
  if (!page.title) errors.push(`${page.route}: missing title`);
  if (!page.description) errors.push(`${page.route}: missing description`);
  if (!page.canonical) errors.push(`${page.route}: missing canonical`);
  if (page.h1Count !== 1) errors.push(`${page.route}: expected one H1, found ${page.h1Count}`);
  if (page.canonical) {
    try {
      if (new URL(page.canonical).hostname !== expectedHost) {
        errors.push(`${page.route}: canonical has unexpected host ${page.canonical}`);
      }
    } catch {
      errors.push(`${page.route}: invalid canonical ${page.canonical}`);
    }
  }
}

const duplicateGroups = (key) =>
  Object.entries(Object.groupBy(indexable, (page) => page[key]))
    .filter(([text, group]) => text && group.length > 1)
    .map(([text, group]) => ({ text, routes: group.map((page) => page.route) }));

for (const group of duplicateGroups('title')) {
  errors.push(`duplicate title (${group.routes.join(', ')}): ${group.text}`);
}
for (const group of duplicateGroups('description')) {
  errors.push(`duplicate description (${group.routes.join(', ')}): ${group.text}`);
}

const broken = new Set();
for (const page of pages) {
  for (const href of page.hrefs) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const raw = decodePath(href);
    const target = raw.endsWith('/') || path.extname(raw) ? raw : `${raw}/`;
    if (inbound.has(target)) inbound.set(target, inbound.get(target) + 1);
    if (!pageByRoute.has(target) && !fs.existsSync(path.join(dist, raw.replace(/^\//, '')))) {
      broken.add(`${page.route} -> ${href}`);
    }
  }
}
for (const item of broken) errors.push(`broken internal href: ${item}`);

for (const page of pages.filter((item) => /noindex/i.test(item.robots))) {
  if (sitemapPaths.has(page.route)) errors.push(`${page.route}: noindex URL is in sitemap`);
}
for (const sitemapPath of sitemapPaths) {
  if (!pageByRoute.has(sitemapPath)) errors.push(`${sitemapPath}: sitemap URL has no HTML output`);
}

const allowedLocalBusiness = new Set([
  '/',
  '/เกี่ยวกับเรา/',
  '/ติดต่อเรา/',
  '/รับซื้อโน๊ตบุ๊ค/อุบลราชธานี/',
]);
for (const page of pages.filter((item) => item.localBusiness)) {
  if (!allowedLocalBusiness.has(page.route)) {
    errors.push(`${page.route}: LocalBusiness schema is not allowed for this page type`);
  }
}

const prohibitedLocationPatterns = [
  /จุดนัดรับ[^<]{0,30}ยอดฮิต/i,
  /นัดรับได้ทันที/i,
  /รับซื้อถึงบ้าน/i,
  /ครอบคลุม\s*77\s*จังหวัด/i,
  /ทุกจังหวัดทั่วไทย/i,
  /พนักงานประจำ/i,
  /ราคาสูงที่สุด/i,
];
for (const page of pages.filter((item) => item.route.startsWith('/รับซื้อโน๊ตบุ๊ค/'))) {
  for (const pattern of prohibitedLocationPatterns) {
    if (pattern.test(page.html)) errors.push(`${page.route}: prohibited location wording ${pattern}`);
  }
}

const headerHtml = fs.readFileSync(path.join(root, 'src/components/Header.astro'), 'utf8');
const footerHtml = fs.readFileSync(path.join(root, 'src/components/Footer.astro'), 'utf8');
for (const forbidden of ['/รับเหมาคอมพิวเตอร์/', '/รับประมูลคอม/']) {
  if (headerHtml.includes(forbidden)) errors.push(`main navigation includes ${forbidden}`);
  if (footerHtml.includes(`href="${forbidden}"`)) errors.push(`service footer includes ${forbidden}`);
}

const homepage = pageByRoute.get('/');
if (!homepage?.title.startsWith('รับซื้อโน๊ตบุ๊ค')) errors.push('/: primary owner title is missing');
if (homepage?.h1Count !== 1) errors.push('/: primary owner must have exactly one H1');
if (homepage?.title !== expectedHomepageTitle) errors.push('/: homepage title changed unexpectedly');
if (homepage?.description !== expectedHomepageDescription) {
  errors.push('/: homepage description changed unexpectedly');
}
if (homepage?.canonical !== 'https://ร้านรับซื้อโน๊ตบุ๊ค.com/') {
  errors.push(`/: unexpected canonical ${homepage?.canonical}`);
}
if (homepage) {
  const processSections = homepage.html.match(/\bdata-home-process(?:\s|>)/g) || [];
  const processCards = homepage.html.match(/\bdata-home-process-card(?:\s|>)/g) || [];
  if (processSections.length !== 1) {
    errors.push(`/: expected one marked process section, found ${processSections.length}`);
  }
  if (processCards.length !== 4) {
    errors.push(`/: expected four marked process cards, found ${processCards.length}`);
  }
  const processHeadingPatterns = [/4 ขั้นตอน/i, /4 ขั้น(?!ตอน)/i, /ขั้นตอนขาย/i, /ขายโน๊ตบุ๊คกับเรา/i];
  const headingTexts = [...homepage.html.matchAll(/<h[2-3]\b[^>]*>([\s\S]*?)<\/h[2-3]>/gi)].map(
    (match) => match[1].replace(/<[^>]+>/g, '').trim(),
  );
  const processHeadings = headingTexts.filter((heading) =>
    processHeadingPatterns.some((pattern) => pattern.test(heading)),
  );
  if (processHeadings.length !== 1) {
    errors.push(`/: expected one process heading, found ${processHeadings.length}`);
  }
  for (const phrase of ['ให้ราคาสูงสุด', 'รับถึงที่ทุกจังหวัด']) {
    if (homepage.html.includes(phrase)) errors.push(`/: prohibited homepage phrase ${phrase}`);
  }
  if (homepage.hrefs.includes(legacyHomepagePath)) {
    errors.push(`/: internal link points to redirect source ${legacyHomepagePath}`);
  }
}
if (pageByRoute.has(legacyHomepagePath)) {
  errors.push(`${legacyHomepagePath}: redirect source must not have an HTML artifact`);
}
if (sitemapPaths.has(legacyHomepagePath)) {
  errors.push(`${legacyHomepagePath}: redirect source must not be in sitemap`);
}

const orphans = indexable
  .filter((page) => page.route !== '/' && (inbound.get(page.route) || 0) === 0)
  .map((page) => page.route);
const knownHoldOrphans = new Set(['/รับประมูลคอม/', '/รับเหมาคอมพิวเตอร์/']);
const unexpectedOrphans = orphans.filter((route) => !knownHoldOrphans.has(route));
const presentKnownHoldOrphans = orphans.filter((route) => knownHoldOrphans.has(route));
if (presentKnownHoldOrphans.length) {
  warnings.push(`KNOWN HOLD ORPHANS: ${presentKnownHoldOrphans.join(', ')}`);
}
if (unexpectedOrphans.length) {
  warnings.push(`unexpected indexable orphan pages (${unexpectedOrphans.length}): ${unexpectedOrphans.join(', ')}`);
}

const summary = {
  routes: pages.length,
  indexable: indexable.length,
  noindex: pages.filter((page) => /noindex/i.test(page.robots)).length,
  sitemap: sitemapPaths.size,
  brokenLinks: broken.size,
  orphanPages: orphans.length,
  duplicateTitles: duplicateGroups('title').length,
  duplicateDescriptions: duplicateGroups('description').length,
  localBusinessPages: pages.filter((page) => page.localBusiness).map((page) => page.route),
  errors: errors.length,
  warnings: warnings.length,
};

console.log(JSON.stringify(summary, null, 2));
for (const warning of warnings) console.warn(`WARN: ${warning}`);
for (const error of errors) console.error(`ERROR: ${error}`);
process.exitCode = errors.length ? 1 : 0;
