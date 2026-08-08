/**
 * Crawl production sitemap URLs + verify Batch 3 model pages.
 */
import fs from 'node:fs';

const base = (process.env.PRODUCTION_BASE_URL || 'https://xn--42cn4aobed0eb6hubj4es0m5dhvd.com').replace(/\/$/, '');
const batch = ['hp-omen-16', 'asus-tuf-a15-f15', 'lenovo-loq-15-16'];
const outDir = 'docs/model-enrichment-batch-3';

function capture(html, re) {
  return html.match(re)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
}
function csvEscape(v) {
  const t = String(v ?? '');
  return /[",\r\n]/.test(t) ? `"${t.replaceAll('"', '""')}"` : t;
}
async function fetchText(url) {
  const res = await fetch(url, { redirect: 'manual', headers: { 'cache-control': 'no-cache', 'user-agent': 'Batch3-Production-Crawl' } });
  return { res, text: await res.text() };
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
  const ok = res.status === 200 && Boolean(title) && Boolean(h1) && canonPath === pathName && !/\bnoindex\b/i.test(robots);
  if (!ok) failures.push(url);
  rows.push({ url, http_status: res.status, title_ok: Boolean(title), h1_ok: Boolean(h1), canonical_ok: canonPath === pathName, robots_ok: !/\bnoindex\b/i.test(robots), pass: ok ? 'PASS' : 'FAIL' });
  if (i % 50 === 0) console.error(`crawled ${i}/${urls.length}`);
}

const modelChecks = [];
for (const slug of batch) {
  const url = `${base}/${encodeURI('รับซื้อโน๊ตบุ๊ค')}/${slug}/`;
  const { res, text } = await fetchText(`${url}?qa=${Date.now()}`);
  const hasPanel = text.includes(`data-verified-spec="${slug}"`);
  const badTuf = slug === 'asus-tuf-a15-f15' && /GTX\s*1650|RTX\s*2060/i.test(text);
  const exactSku = /รุ่นนี้ใช้\s*CPU.+\+\s*GPU/i.test(text);
  const fail = res.status !== 200 || !hasPanel || badTuf || exactSku;
  modelChecks.push({ slug, http_status: res.status, verified_panel: hasPanel, unsupported_claim: badTuf || exactSku, pass: fail ? 'FAIL' : 'PASS' });
  if (fail) failures.push(url);
}

fs.writeFileSync(`${outDir}/09-production-crawl.csv`, [Object.keys(rows[0]).join(','), ...rows.map((r) => Object.keys(rows[0]).map((h) => csvEscape(r[h])).join(','))].join('\r\n') + '\r\n');
fs.writeFileSync(`${outDir}/09b-production-models.csv`, [Object.keys(modelChecks[0]).join(','), ...modelChecks.map((r) => Object.keys(modelChecks[0]).map((h) => csvEscape(r[h])).join(','))].join('\r\n') + '\r\n');
const summary = { sitemap_urls: urls.length, crawl_pass: rows.filter((r) => r.pass === 'PASS').length, crawl_fail: failures.length, model_pass: modelChecks.filter((r) => r.pass === 'PASS').length, model_fail: modelChecks.filter((r) => r.pass !== 'PASS').length, failures: failures.slice(0, 20) };
fs.writeFileSync(`${outDir}/09-production-crawl-summary.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (urls.length !== 371 || summary.crawl_fail || summary.model_fail) process.exit(1);
