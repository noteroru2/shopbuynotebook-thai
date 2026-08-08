/**
 * Crawl production sitemap URLs + verify Batch 1 model pages.
 */
import fs from 'node:fs';

const base = (process.env.PRODUCTION_BASE_URL || 'https://xn--42cn4aobed0eb6hubj4es0m5dhvd.com').replace(/\/$/, '');
const batch = [
  'asus-rog-ally-x',
  'acer-nitro-16',
  'asus-zephyrus-g14',
  'hp-victus-15',
  'lenovo-legion-5',
  'thinkpad-x1-carbon',
  'macbook-pro-m3',
  'macbook-air-m3',
  'macbook-air-m4',
  'macbook-air-m5',
];

function capture(html, re) {
  return html.match(re)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
}

async function fetchText(url) {
  const res = await fetch(url, {
    redirect: 'manual',
    headers: { 'cache-control': 'no-cache', 'user-agent': 'Batch1-Production-Crawl' },
  });
  const text = await res.text();
  return { res, text };
}

const smIndex = await fetchText(`${base}/sitemap-index.xml?qa=${Date.now()}`);
if (smIndex.res.status !== 200) throw new Error('sitemap-index failed');
const smFiles = [...smIndex.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const urls = [];
for (const file of smFiles) {
  const sm = await fetchText(`${file}?qa=${Date.now()}`);
  urls.push(...[...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
}

const rows = [];
const failures = [];
let i = 0;
for (const url of urls) {
  i += 1;
  const { res, text } = await fetchText(`${url}${url.includes('?') ? '&' : '?'}qa=${Date.now()}`);
  const title = capture(text, /<title>([\s\S]*?)<\/title>/i);
  const h1 = capture(text, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const canonical = capture(text, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)
    || capture(text, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const robots = capture(text, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i);
  const pathName = new URL(url).pathname;
  const canonPath = canonical ? new URL(canonical).pathname : '';
  const ok =
    res.status === 200 &&
    Boolean(title) &&
    Boolean(h1) &&
    canonPath === pathName &&
    !/\bnoindex\b/i.test(robots);
  if (!ok) failures.push(url);
  rows.push({
    url,
    http_status: res.status,
    title_ok: Boolean(title),
    h1_ok: Boolean(h1),
    canonical_ok: canonPath === pathName,
    robots_ok: !/\bnoindex\b/i.test(robots),
    pass: ok ? 'PASS' : 'FAIL',
  });
  if (i % 50 === 0) console.error(`crawled ${i}/${urls.length}`);
}

const modelChecks = [];
for (const slug of batch) {
  const url = `${base}/${encodeURI('รับซื้อโน๊ตบุ๊ค')}/${slug}/`;
  const { res, text } = await fetchText(`${url}?qa=${Date.now()}`);
  const hasPanel = text.includes(`data-verified-spec="${slug}"`);
  const rtx4080 = /RTX\s*4080/i.test(text);
  const fail = res.status !== 200 || !hasPanel || (slug === 'acer-nitro-16' && rtx4080);
  modelChecks.push({
    slug,
    http_status: res.status,
    verified_panel: hasPanel,
    rtx4080_mentions: rtx4080 ? 1 : 0,
    pass: fail ? 'FAIL' : 'PASS',
  });
  if (fail) failures.push(url);
}

function csvEscape(v) {
  const t = String(v ?? '');
  return /[",\r\n]/.test(t) ? `"${t.replaceAll('"', '""')}"` : t;
}
function writeCsv(file, headers, data) {
  fs.writeFileSync(file, [headers.join(','), ...data.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join('\r\n') + '\r\n');
}

writeCsv('docs/model-enrichment-batch-1/09-production-crawl.csv', Object.keys(rows[0]), rows);
writeCsv('docs/model-enrichment-batch-1/09b-production-models.csv', Object.keys(modelChecks[0]), modelChecks);

const summary = {
  sitemap_urls: urls.length,
  crawl_pass: rows.filter((r) => r.pass === 'PASS').length,
  crawl_fail: failures.length,
  model_pass: modelChecks.filter((m) => m.pass === 'PASS').length,
  model_checks: modelChecks,
};
fs.writeFileSync('docs/model-enrichment-batch-1/09-production-crawl-summary.json', JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (summary.crawl_pass !== urls.length || summary.model_pass !== batch.length) process.exit(1);
