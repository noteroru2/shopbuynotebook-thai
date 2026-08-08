/**
 * Post-deploy production crawl for content-quality release gate.
 * Writes docs/content-quality-upgrade/28-production-crawl.csv (+ summary JSON).
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const base = (process.env.PRODUCTION_BASE_URL || 'https://xn--42cn4aobed0eb6hubj4es0m5dhvd.com').replace(/\/$/, '');
const outCsv = path.join(root, 'docs', 'content-quality-upgrade', '28-production-crawl.csv');
const outSummary = path.join(root, 'docs', 'content-quality-upgrade', '28-production-crawl-summary.json');
const concurrency = Number(process.env.CRAWL_CONCURRENCY || 12);

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function capture(html, regex) {
  return html.match(regex)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mainSnippet(html) {
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0]
    || html.match(/<article[\s\S]*?<\/article>/i)?.[0]
    || html;
  return stripTags(main).slice(0, 400);
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    redirect: options.redirect ?? 'manual',
    headers: {
      'cache-control': 'no-cache',
      'user-agent': options.ua || 'Content-Quality-Production-Crawl/1.0',
    },
  });
  const body = options.readBody === false ? '' : await response.text();
  return { response, body };
}

async function listSitemapUrls() {
  const indexUrl = `${base}/sitemap-index.xml`;
  const { response, body } = await fetchText(indexUrl);
  if (response.status !== 200) throw new Error(`sitemap-index HTTP ${response.status}`);
  const locs = [...body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
  const isXmlSitemap = (u) => /sitemap[^/]*\.xml(?:$|\?)/i.test(u);
  const childMaps = locs.filter(isXmlSitemap);
  const urls = new Set();
  for (const child of childMaps.length ? childMaps : locs) {
    const childRes = await fetchText(child);
    if (childRes.response.status !== 200) {
      throw new Error(`child sitemap HTTP ${childRes.response.status}: ${child}`);
    }
    for (const m of childRes.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
      const loc = m[1].trim();
      if (!isXmlSitemap(loc)) urls.add(loc);
    }
  }
  return { indexUrl, childMaps: childMaps.length ? childMaps : [indexUrl], urls: [...urls].sort() };
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let i = 0;
  async function run() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

function classifyUrl(pathname) {
  if (pathname === '/') return 'Homepage';
  if (/^\/blog\//.test(pathname) || /\/บทความ\//.test(pathname)) return 'Blog';
  if (/รับซื้อโน๊ตบุ๊ค-/.test(pathname) && /จังหวัด|อำเภอ|อุบล|กรุงเทพ|เชียง|ขอนแก่น|นคร/.test(pathname)) return 'Province';
  if (/^\/รับซื้อโน๊ตบุ๊ค\//.test(pathname)) return 'Province';
  if (/condition|สภาพ|จอแตก|เครื่องเสีย|เครื่องเก่า|แบต|ชาร์จ|น้ำเข้า|คีย์บอร์ด|บอดี้|พัดลม|ฮาร์ดดิสก์|ssd|แบตเตอรี่/.test(pathname)) return 'Condition';
  if (/เช็คราคา|ตีราคา|ประเมิน|ขายโน๊ตบุ๊ค|รับซื้อ-notebook|มือสอง|รับซื้อโน๊ตบุ๊ค\/?$/.test(pathname)) return 'Money';
  if (/asus|acer|lenovo|hp|dell|msi|apple|macbook|gigabyte|huawei|samsung|toshiba|microsoft|surface/i.test(pathname)) {
    if (/-/.test(pathname.split('/').filter(Boolean).pop() || '')) return 'Model';
    return 'Brand';
  }
  return 'Other';
}

async function crawlOne(url) {
  const { response, body: html } = await fetchText(`${url}${url.includes('?') ? '&' : '?'}qa=${Date.now()}`);
  const title = capture(html, /<title>([\s\S]*?)<\/title>/i);
  const description = capture(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)
    || capture(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const h1 = capture(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const canonical = capture(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)
    || capture(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const robots = capture(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i);
  const pathname = new URL(url).pathname;
  let canonicalOk = false;
  let canonicalNotes = '';
  try {
    if (canonical) {
      const c = new URL(canonical);
      canonicalOk = c.pathname === pathname && !c.hostname.startsWith('www.');
      if (!canonicalOk) canonicalNotes = `canonical=${canonical}`;
    } else {
      canonicalNotes = 'missing_canonical';
    }
  } catch {
    canonicalNotes = 'bad_canonical';
  }
  const noindex = /\bnoindex\b/i.test(robots);
  const snippet = mainSnippet(html);
  const hasFaq = /faq|คำถามที่พบบ่อย|quick-answers/i.test(html);
  const hasSchema = /application\/ld\+json/i.test(html);
  const placeholder = /TODO|FIXME|Lorem ipsum|\[province\]|\$\{|{{|placeholder/i.test(html);
  const encodingBroken = /Ã.|à¸|â€|Ð.|Ñ./.test(html) && /Ã.|à¸/.test(snippet);
  const internalLinks = (html.match(/href=["']\/[^"']+/gi) || []).length;
  const assetHrefs = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:css|js|webp|png|jpg|jpeg|svg|woff2?))["']/gi)]
    .map((m) => m[1])
    .slice(0, 8);
  const issues = [];
  if (response.status !== 200) issues.push(`http_${response.status}`);
  if (!title) issues.push('missing_title');
  if (!h1) issues.push('missing_h1');
  if (h1Count !== 1) issues.push(`h1_count_${h1Count}`);
  if (!canonicalOk) issues.push('canonical_error');
  if (noindex) issues.push('unexpected_noindex');
  if (placeholder) issues.push('placeholder');
  if (encodingBroken) issues.push('encoding');
  if (snippet.length < 120) issues.push('thin_main');

  return {
    url,
    type: classifyUrl(pathname),
    http_status: response.status,
    final_url: url,
    title,
    h1,
    description: description.slice(0, 180),
    canonical,
    robots: robots || '(none)',
    canonical_ok: canonicalOk,
    noindex,
    h1_count: h1Count,
    has_faq: hasFaq,
    has_schema: hasSchema,
    internal_links: internalLinks,
    main_snippet: snippet.slice(0, 220),
    asset_samples: assetHrefs.join(' | '),
    issues: issues.join('|'),
    pass: issues.length === 0,
    canonicalNotes,
  };
}

async function checkAssets(sampleRows) {
  const failures = [];
  const checked = new Set();
  for (const row of sampleRows.slice(0, 40)) {
    for (const rel of String(row.asset_samples || '').split(' | ').filter(Boolean).slice(0, 3)) {
      const abs = new URL(rel, row.url).toString();
      if (checked.has(abs)) continue;
      checked.add(abs);
      const { response } = await fetchText(abs, { readBody: false });
      if (response.status !== 200) failures.push({ asset: abs, status: response.status, from: row.url });
    }
  }
  return { checked: checked.size, failures };
}

async function checkInternalLinks(sampleRows) {
  const failures = [];
  const checked = new Set();
  for (const row of sampleRows.slice(0, 25)) {
    const { body } = await fetchText(`${row.url}?il=${Date.now()}`);
    const hrefs = [...body.matchAll(/href=["'](\/[^"'#?]+)/gi)].map((m) => m[1]);
    for (const href of hrefs.slice(0, 20)) {
      if (checked.has(href)) continue;
      checked.add(href);
      const abs = `${base}${href}`;
      const { response } = await fetchText(abs, { readBody: false, redirect: 'manual' });
      if (![200, 301, 302, 308].includes(response.status)) {
        failures.push({ href, status: response.status, from: row.url });
      }
    }
  }
  return { checked: checked.size, failures };
}

async function main() {
  console.log('Base:', base);
  const { indexUrl, childMaps, urls } = await listSitemapUrls();
  console.log(`Sitemap index: ${indexUrl}`);
  console.log(`Child sitemaps: ${childMaps.length}`);
  console.log(`URLs: ${urls.length}`);

  const robots = await fetchText(`${base}/robots.txt`);
  const googlebotBlocked = /User-agent:\s*Googlebot[\s\S]*?Disallow:\s*\//i.test(robots.body)
    && !/User-agent:\s*Googlebot[\s\S]*?Allow:\s*\//i.test(robots.body);

  const rows = await mapPool(urls, concurrency, crawlOne);
  const httpFailures = rows.filter((r) => r.http_status !== 200);
  const noindexUnexpected = rows.filter((r) => r.noindex);
  const canonicalErrors = rows.filter((r) => !r.canonical_ok);
  const thin = rows.filter((r) => String(r.issues).includes('thin_main'));
  const placeholders = rows.filter((r) => String(r.issues).includes('placeholder'));

  const assetCheck = await checkAssets(rows.filter((r) => r.pass).slice(0, 40));
  const linkCheck = await checkInternalLinks(rows.filter((r) => r.http_status === 200));

  const headers = [
    'url', 'type', 'http_status', 'final_url', 'title', 'h1', 'description', 'canonical', 'robots',
    'canonical_ok', 'noindex', 'h1_count', 'has_faq', 'has_schema', 'internal_links', 'main_snippet',
    'asset_samples', 'issues', 'pass',
  ];
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(',')),
  ].join('\r\n') + '\r\n';
  await fs.writeFile(outCsv, csv, 'utf8');

  const byType = {};
  for (const r of rows) {
    byType[r.type] = byType[r.type] || { n: 0, pass: 0, fail: 0 };
    byType[r.type].n++;
    if (r.pass) byType[r.type].pass++;
    else byType[r.type].fail++;
  }

  const summary = {
    base,
    crawled_at: new Date().toISOString(),
    sitemap_index: indexUrl,
    child_sitemaps: childMaps,
    sitemap_url_count: urls.length,
    crawled: rows.length,
    http_failures: httpFailures.length,
    unexpected_noindex: noindexUnexpected.length,
    canonical_errors: canonicalErrors.length,
    thin_main: thin.length,
    placeholders: placeholders.length,
    pass_count: rows.filter((r) => r.pass).length,
    fail_count: rows.filter((r) => !r.pass).length,
    by_type: byType,
    robots_status: robots.response.status,
    googlebot_blocked: googlebotBlocked,
    broken_assets_sampled: assetCheck.failures.length,
    assets_checked: assetCheck.checked,
    broken_internal_links_sampled: linkCheck.failures.length,
    internal_links_checked: linkCheck.checked,
    sample_http_failures: httpFailures.slice(0, 20).map((r) => ({ url: r.url, status: r.http_status })),
    sample_canonical_errors: canonicalErrors.slice(0, 20).map((r) => ({ url: r.url, canonical: r.canonical })),
    sample_broken_assets: assetCheck.failures.slice(0, 20),
    sample_broken_links: linkCheck.failures.slice(0, 20),
  };
  await fs.writeFile(outSummary, JSON.stringify(summary, null, 2), 'utf8');
  console.log(JSON.stringify(summary, null, 2));
  if (httpFailures.length || noindexUnexpected.length || assetCheck.failures.length || linkCheck.failures.length) {
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
