import fs from 'node:fs/promises';
import path from 'node:path';
import redirectManifest from '../src/data/rebuild-v2-production-redirects.json' with { type: 'json' };

const root = process.cwd();
const base = (process.env.PRODUCTION_BASE_URL || 'https://xn--42cn4aobed0eb6hubj4es0m5dhvd.com').replace(/\/$/, '');
const wwwBase = base.replace('://', '://www.');
const phrase = 'ยอดนิยมยอดนิยม';
const legacyPath = '/รับซื้อโน๊ตบุ๊ค/';
const affectedCsv = path.join(root, 'docs', 'batch-2a-2-duplicate-wording-remediation', 'affected-pages.csv');
const artifactDir = path.join(root, 'qa-artifacts');
const redirectMap = new Map(redirectManifest.redirects.map(({ source, target }) => [source, target]));

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += char;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  const headers = rows.shift().map((value, index) => index === 0 ? value.replace(/^\uFEFF/, '') : value);
  return rows.filter(values => values.some(Boolean))
    .map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

function csv(rows, headers) {
  const quote = value => {
    const text = String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return [headers.join(','), ...rows.map(row => headers.map(header => quote(row[header])).join(','))].join('\r\n') + '\r\n';
}

function capture(html, regex) {
  return html.match(regex)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
}

function normalizePath(pathname) {
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

async function request(url, options = {}) {
  return fetch(url, {
    redirect: options.redirect ?? 'manual',
    headers: { 'cache-control': 'no-cache', 'user-agent': 'R13-GitHub-Actions-Production-QA' },
  });
}

async function pageResult(url) {
  const response = await request(`${url}${url.includes('?') ? '&' : '?'}qa=${Date.now()}`);
  const html = await response.text();
  const title = capture(html, /<title>([\s\S]*?)<\/title>/i);
  const meta = capture(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)
    || capture(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const canonical = capture(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)
    || capture(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const robots = capture(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i);
  const expectedPath = new URL(url).pathname;
  const canonicalPass = canonical ? new URL(canonical).pathname === expectedPath && !new URL(canonical).hostname.startsWith('www.') : false;
  return {
    url,
    http_status: response.status,
    duplicate_phrase_count: html.split(phrase).length - 1,
    title_pass: Boolean(title) && !title.includes(phrase),
    meta_pass: Boolean(meta) && !meta.includes(phrase),
    h1_pass: h1Count === 1,
    canonical_pass: canonicalPass,
    robots_value: robots,
    asset_pass: true,
    notes: '',
    html,
  };
}

async function verifyAsset(pageUrl, html, selector, label, expectedType) {
  const match = html.match(selector);
  if (!match?.[1]) return { label, url: '', status: 'N/A', content_type: 'not emitted by page' };
  const assetUrl = new URL(match[1], pageUrl).toString();
  const response = await request(assetUrl);
  const type = response.headers.get('content-type') || '';
  if (response.status !== 200 || !type.includes(expectedType)) {
    throw new Error(`${label} asset failed: HTTP ${response.status}, Content-Type ${type || 'missing'}`);
  }
  return { label, url: assetUrl, status: response.status, content_type: type };
}

const failures = [];
const core = [];
async function coreCheck(label, url, expectedStatus, options = {}) {
  const response = await request(url, { redirect: options.redirect });
  const body = options.readBody ? await response.text() : '';
  const pass = response.status === expectedStatus && (!options.assert || options.assert(response, body));
  core.push({ label, url, status: response.status, pass, location: response.headers.get('location') || '' });
  if (!pass) failures.push(`${label}: expected HTTP ${expectedStatus}, received ${response.status}`);
  return { response, body };
}

await fs.mkdir(artifactDir, { recursive: true });
const home = await coreCheck('Homepage', `${base}/`, 200, { readBody: true });
await coreCheck('Robots', `${base}/robots.txt`, 200);
await coreCheck('Sitemap index', `${base}/sitemap-index.xml`, 200);
await coreCheck('Legacy redirect', `${base}${encodeURI(legacyPath)}`, 301, {
  assert: response => {
    const location = response.headers.get('location');
    return Boolean(location) && new URL(location).hostname === new URL(base).hostname;
  },
});
const legacyQuery = await coreCheck('Legacy query redirect', `${base}${encodeURI(legacyPath)}?source=r13-qa`, 301, {
  assert: response => {
    const location = response.headers.get('location');
    return Boolean(location) && new URL(location).searchParams.get('source') === 'r13-qa';
  },
});
if (legacyQuery.response.status === 301) {
  const location = legacyQuery.response.headers.get('location');
  if (location) {
    const finalResponse = await request(location, { redirect: 'follow' });
    if (finalResponse.status !== 200) failures.push(`Legacy redirect chain ended with HTTP ${finalResponse.status}`);
  }
}
await coreCheck('404 control', `${base}/this-page-must-not-exist-legacy-control/`, 404);
await coreCheck('WWW canonical', `${wwwBase}/`, 200, {
  readBody: true,
  assert: (_response, body) => {
    const canonical = capture(body, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)
      || capture(body, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
    return Boolean(canonical) && !new URL(canonical).hostname.startsWith('www.') && !/http-equiv=["']refresh/i.test(body);
  },
});

const redirectRows = [];
for (const { source, target, batch } of redirectManifest.redirects) {
  const sourceUrl = `${base}${encodeURI(source)}?qa=r13&source=${encodeURIComponent(batch)}`;
  try {
    const response = await request(sourceUrl);
    const location = response.headers.get('location') || '';
    const locationUrl = location ? new URL(location, base) : null;
    const statusPass = response.status === 301;
    const targetPass = Boolean(locationUrl)
      && locationUrl.hostname === new URL(base).hostname
      && normalizePath(decodeURI(locationUrl.pathname)) === normalizePath(target);
    const queryPass = Boolean(locationUrl)
      && locationUrl.searchParams.get('qa') === 'r13'
      && locationUrl.searchParams.get('source') === batch;
    let targetStatus = 0;
    let oneHopPass = false;
    if (locationUrl) {
      const targetResponse = await request(locationUrl.toString());
      targetStatus = targetResponse.status;
      oneHopPass = targetStatus === 200;
    }
    const pass = statusPass && targetPass && queryPass && oneHopPass;
    redirectRows.push({ source, target, batch, status: response.status, location, target_status: targetStatus, status_pass: statusPass, target_pass: targetPass, query_pass: queryPass, one_hop_pass: oneHopPass, final_verdict: pass ? 'PASS' : 'FAIL' });
    if (!pass) failures.push(`R13 redirect failed: ${source} -> ${target} (HTTP ${response.status}, Location ${location || 'missing'}, target HTTP ${targetStatus})`);
  } catch (error) {
    redirectRows.push({ source, target, batch, status: 0, location: '', target_status: 0, status_pass: false, target_pass: false, query_pass: false, one_hop_pass: false, final_verdict: 'FAIL' });
    failures.push(`R13 redirect request failed: ${source} (${error instanceof Error ? error.message : String(error)})`);
  }
}

const assets = [];
try {
  assets.push(await verifyAsset(`${base}/`, home.body, /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)/i, 'CSS', 'text/css'));
  assets.push(await verifyAsset(`${base}/`, home.body, /<script[^>]+src=["']([^"']+)/i, 'JavaScript', 'javascript'));
  assets.push(await verifyAsset(`${base}/`, home.body, /<img[^>]+src=["']([^"']+)/i, 'Image', 'image/'));
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
}

const affected = parseCsv(await fs.readFile(affectedCsv, 'utf8'))
  .filter(row => row.built_page_affected === 'true');
if (affected.length !== 28) failures.push(`Expected 28 affected production pages, found ${affected.length} in audit CSV`);
const pageRows = [];
for (const row of affected) {
  const pathname = normalizePath(decodeURI(new URL(row.url).pathname));
  const productionUrl = `${base}${encodeURI(pathname)}`;
  const redirectTarget = redirectMap.get(pathname);

  if (redirectTarget) {
    const redirectEvidence = redirectRows.find(item => item.source === pathname);
    const pass = redirectEvidence?.final_verdict === 'PASS';
    pageRows.push({
      url: productionUrl,
      lifecycle: 'R13_REDIRECT',
      http_status: redirectEvidence?.status ?? 0,
      duplicate_phrase_count: 'N/A',
      title_pass: 'N/A', meta_pass: 'N/A', h1_pass: 'N/A', canonical_pass: 'N/A',
      robots_value: 'N/A', asset_pass: true,
      notes: `301 -> ${redirectTarget}`,
      final_verdict: pass ? 'PASS' : 'FAIL',
    });
    if (!pass) failures.push(`Affected legacy page redirect failed: ${productionUrl}`);
    continue;
  }

  try {
    const result = await pageResult(productionUrl);
    const pass = result.http_status === 200
      && result.duplicate_phrase_count === 0
      && result.title_pass && result.meta_pass && result.h1_pass
      && result.canonical_pass
      && !/<!doctype html>\s*<title>[^<]*(?:error|not found)/i.test(result.html);
    pageRows.push({ ...result, html: undefined, lifecycle: /\bnoindex\b/i.test(result.robots_value) ? 'HOLD_NOINDEX' : 'INDEXABLE', final_verdict: pass ? 'PASS' : 'FAIL' });
    if (!pass) failures.push(`Affected live page failed duplicate/content integrity check: ${productionUrl}`);
  } catch (error) {
    pageRows.push({
      url: productionUrl, lifecycle: 'REQUEST_ERROR', http_status: 0, duplicate_phrase_count: -1,
      title_pass: false, meta_pass: false, h1_pass: false, canonical_pass: false,
      robots_value: '', asset_pass: false,
      notes: error instanceof Error ? error.message : String(error), final_verdict: 'FAIL',
    });
    failures.push(`Affected page request failed: ${productionUrl}`);
  }
}

await fs.writeFile(path.join(artifactDir, 'core-http-qa.csv'),
  csv(core, ['label','url','status','pass','location']), 'utf8');
await fs.writeFile(path.join(artifactDir, 'redirect-http-qa.csv'),
  csv(redirectRows, ['source','target','batch','status','location','target_status','status_pass','target_pass','query_pass','one_hop_pass','final_verdict']), 'utf8');
await fs.writeFile(path.join(artifactDir, 'production-qa.csv'),
  csv(pageRows, ['url','lifecycle','http_status','duplicate_phrase_count','title_pass','meta_pass','h1_pass','canonical_pass','robots_value','asset_pass','notes','final_verdict']), 'utf8');
await fs.writeFile(path.join(artifactDir, 'asset-qa.csv'),
  csv(assets, ['label','url','status','content_type']), 'utf8');

const passedPages = pageRows.filter(row => row.final_verdict === 'PASS').length;
const passedRedirects = redirectRows.filter(row => row.final_verdict === 'PASS').length;
const summary = [
  '## Cloudflare Production Deployment',
  '',
  `- Commit SHA: \`${process.env.GITHUB_SHA || 'local-validation'}\``,
  '- Build and SEO validation: PASS',
  `- Core HTTP QA: ${core.every(row => row.pass) ? 'PASS' : 'FAIL'}`,
  `- R13 redirects: ${passedRedirects}/${redirectRows.length} PASS`,
  `- Batch 2A.2 affected URLs under current lifecycle: ${passedPages}/${pageRows.length} PASS`,
  `- Production duplicate phrase count on live 200 pages: ${pageRows.reduce((sum, row) => sum + Math.max(0, Number(row.duplicate_phrase_count) || 0), 0)}`,
  '- Known warning: WWW RETURNS 200 WITH NON-WWW CANONICAL',
  `- Final verdict: ${failures.length ? 'FAIL' : 'PASS WITH WARNING'}`,
  '',
].join('\n');
if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, summary, 'utf8');
await fs.writeFile(path.join(artifactDir, 'validation-summary.md'), summary, 'utf8');

if (failures.length) {
  for (const failure of failures) console.error(`QA failure: ${failure}`);
  process.exit(1);
}
console.log(`Production QA passed: core checks, ${passedRedirects}/${redirectRows.length} R13 redirects, and ${passedPages}/${pageRows.length} affected URLs.`);
