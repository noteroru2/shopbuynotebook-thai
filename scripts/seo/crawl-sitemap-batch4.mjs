/**
 * Crawl production sitemap URLs + verify Batch 4 model pages.
 */
import fs from 'node:fs';

const base = (process.env.PRODUCTION_BASE_URL || 'https://xn--42cn4aobed0eb6hubj4es0m5dhvd.com').replace(/\/$/, '');
const batch = ['asus-rog-strix', 'hp-omen-17', 'dell-g15-g16', 'lenovo-legion-pro'];
const outDir = 'docs/model-enrichment-batch-4';

function capture(html, re) {
  return html.match(re)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
}
function csvEscape(v) {
  const t = String(v ?? '');
  return /[",\r\n]/.test(t) ? `"${t.replaceAll('"', '""')}"` : t;
}
async function fetchText(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(60000),
      headers: { 'cache-control': 'no-cache', 'user-agent': 'Batch4-Production-Crawl' },
    });
    return { res, text: await res.text() };
  } catch (err) {
    if (attempt >= 3) throw err;
    await new Promise((r) => setTimeout(r, 2000 * attempt));
    return fetchText(url, attempt + 1);
  }
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
let failures = 0;
for (const url of urls) {
  const { res } = await fetchText(`${url}${url.includes('?') ? '&' : '?'}qa=${Date.now()}`);
  const pass = res.status === 200;
  if (!pass) failures += 1;
  rows.push({ url, http_status: res.status, pass: pass ? 'PASS' : 'FAIL', notes: pass ? '' : 'non-200' });
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  pathJoin(outDir, '09-production-crawl.csv'),
  ['url,http_status,pass,notes', ...rows.map((r) => [r.url, r.http_status, r.pass, r.notes].map(csvEscape).join(','))].join('\r\n') + '\r\n',
);

const modelRows = [];
let modelFail = 0;
for (const slug of batch) {
  const url = `${base}/รับซื้อโน๊ตบุ๊ค/${slug}/`;
  const { res, text } = await fetchText(`${url}?qa=${Date.now()}`);
  const h1 = capture(text, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const hasFacts = /Verified|สเปกตัวเลือก|SERIES|configurationScope|ข้อมูลสเปกที่ยืนยัน/i.test(text);
  const ok = res.status === 200 && h1.length > 0;
  if (!ok) modelFail += 1;
  modelRows.push({ slug, url, http_status: res.status, h1, has_verified_panelish: hasFacts ? 'YES' : 'NO', pass: ok ? 'PASS' : 'FAIL' });
}
fs.writeFileSync(
  pathJoin(outDir, '09b-production-models.csv'),
  ['slug,url,http_status,h1,has_verified_panelish,pass', ...modelRows.map((r) => [r.slug, r.url, r.http_status, r.h1, r.has_verified_panelish, r.pass].map(csvEscape).join(','))].join('\r\n') + '\r\n',
);

const summary = {
  total: urls.length,
  failures,
  pass: urls.length - failures,
  model_failures: modelFail,
  models: modelRows,
};
fs.writeFileSync(pathJoin(outDir, '09-production-crawl-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (failures || modelFail || urls.length !== 371) {
  console.error(`CRAWL FAIL total=${urls.length} failures=${failures} modelFail=${modelFail}`);
  process.exit(1);
}
console.log('BATCH4 PRODUCTION CRAWL PASSED');

function pathJoin(...parts) {
  return parts.join('/');
}
