/**
 * Production content verification sample (≥50 URLs).
 * Writes docs/content-quality-upgrade/29-production-content-sample.csv
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const base = (process.env.PRODUCTION_BASE_URL || 'https://xn--42cn4aobed0eb6hubj4es0m5dhvd.com').replace(/\/$/, '');
const out = path.join(root, 'docs', 'content-quality-upgrade', '29-production-content-sample.csv');

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

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
    else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  const headers = rows.shift().map((value, index) => (index === 0 ? value.replace(/^\uFEFF/, '') : value));
  return rows
    .filter((values) => values.some(Boolean))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function capture(html, regex) {
  return html.match(regex)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
}

async function get(url) {
  const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}pcs=${Date.now()}`, {
    headers: { 'user-agent': 'Content-Quality-Production-Sample/1.0', 'cache-control': 'no-cache' },
    redirect: 'manual',
  });
  const html = await response.text();
  return { status: response.status, html, text: strip(html) };
}

async function sourceMarker(relPath) {
  if (!relPath || !relPath.startsWith('src/')) return '';
  try {
    const raw = await fs.readFile(path.join(root, relPath), 'utf8');
    const body = raw
      .replace(/^---[\s\S]*?---/, '')
      .replace(/import[\s\S]*?;/g, '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[{}`*#_]/g, ' ')
      .replace(/\s+/g, ' ');
    const m = body.match(/[\u0E00-\u0E7F][^\n]{35,110}/);
    return m?.[0]?.trim() || '';
  } catch {
    return '';
  }
}

function hasFakeClaims(text) {
  const patterns = [
    /ราคาสูงที่สุด/,
    /ให้ราคาดีที่สุด/,
    /อันดับ\s*1/,
    /ทีมประจำจังหวัด/,
    /รับถึงบ้านทุกพื้นที่/,
    /ภายใน\s*30\s*นาที/,
    /ลูกค้ากว่า/,
  ];
  if (patterns.some((re) => re.test(text))) return true;
  // "สาขา" only when asserting a branch exists
  if (/มีสาขา|สาขาใน|สาขาจังหวัด/.test(text) && !/ไม่มีสาขา|อย่าเข้าใจว่ามีสาขา|ไม่ใช่สาขา/.test(text)) return true;
  return false;
}

function provinceFromUrl(urlPath) {
  const m = urlPath.match(/\/รับซื้อโน๊ตบุ๊ค\/([^/]+)\/?$/);
  return m ? decodeURIComponent(m[1]) : '';
}

function pickSamples(inventory) {
  const quotas = {
    Homepage: 1,
    'Notebook-English': 1,
    'Second-hand': 1,
    'Price/valuation': 3,
    'Secondary service': 2,
    Condition: 10,
    Brand: 8,
    Series: 8,
    Model: 10,
    Province: 18,
    Blog: 12,
    Guide: 1,
    Contact: 1,
  };
  const picked = [];
  const counts = Object.fromEntries(Object.keys(quotas).map((k) => [k, 0]));
  for (const row of inventory) {
    const type = row['Page type'];
    if (!(type in quotas) || counts[type] >= quotas[type]) continue;
    if (row.Indexable && row.Indexable.toLowerCase() === 'no') continue;
    picked.push({
      url: row.URL,
      type,
      source: row['Source file/data source'],
      expectedTitle: row['Current title'],
      expectedH1: row['Current H1'],
    });
    counts[type]++;
  }
  return { picked, counts };
}

async function main() {
  const inventory = parseCsv(await fs.readFile(path.join(root, 'docs', 'content-quality-upgrade', '01-url-inventory.csv'), 'utf8'));
  const { picked, counts } = pickSamples(inventory);
  if (picked.length < 50) throw new Error(`Sample too small: ${picked.length}`);

  const rows = [];
  for (const sample of picked) {
    const absUrl = `${base}${sample.url.startsWith('/') ? sample.url : `/${sample.url}`}`;
    let status = 0;
    let title = '';
    let h1 = '';
    let text = '';
    let html = '';
    try {
      const page = await get(absUrl);
      status = page.status;
      html = page.html;
      text = page.text;
      title = capture(html, /<title>([\s\S]*?)<\/title>/i);
      h1 = capture(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    } catch (e) {
      rows.push({
        URL: sample.url,
        Type: sample.type,
        Source: sample.source,
        'HTTP status': 'ERR',
        'QA result': 'FAIL',
        'Matches source': 'no',
        'Natural language': 'n/a',
        'Local accuracy': 'n/a',
        'Entity accuracy': 'n/a',
        'Fake claims': 'n/a',
        Encoding: 'n/a',
        Placeholder: 'n/a',
        Notes: String(e),
      });
      continue;
    }

    const marker = await sourceMarker(sample.source);
    const markerOk = marker ? text.includes(marker.slice(0, 28)) || html.includes(marker.slice(0, 28)) : true;
    const titleOk = sample.expectedTitle
      ? title.replace(/\s+/g, ' ').includes(sample.expectedTitle.split('|')[0].trim().slice(0, 24))
      : true;
    // Inventory H1 column can hold nav/eyebrow text; prefer live title↔H1 coherence.
    const expectedH1 = (sample.expectedH1 || '').replace(/\s+/g, ' ').trim();
    const liveH1 = h1.replace(/\s+/g, ' ').trim();
    const liveTitleCore = title.split('|')[0].replace(/\s+/g, ' ').trim();
    const h1MatchesTitle = liveH1 && liveTitleCore.includes(liveH1.slice(0, Math.min(18, liveH1.length)));
    const h1MatchesInventory = expectedH1
      && liveH1.includes(expectedH1.slice(0, Math.min(18, expectedH1.length)));
    const h1Ok = Boolean(liveH1) && (h1MatchesTitle || h1MatchesInventory || !expectedH1);

    const province = sample.type === 'Province' ? provinceFromUrl(sample.url) : '';
    const provinceOk = !province || text.includes(province);
    const issues = [];
    if (status !== 200) issues.push(`http_${status}`);
    if (!title) issues.push('no_title');
    if (!h1) issues.push('no_h1');
    if (!markerOk) issues.push('source_marker_missing');
    if (!titleOk) issues.push('title_mismatch');
    if (!h1Ok) issues.push('h1_mismatch');
    if (!provinceOk) issues.push('province_mismatch');
    if (hasFakeClaims(text)) issues.push('fake_claim');
    if (/TODO|FIXME|Lorem ipsum|\$\{province\}|{{/.test(html)) issues.push('placeholder');
    if (/Ã.|à¸|â€/.test(text)) issues.push('encoding');

    const qa = issues.length ? 'FAIL' : 'PASS';
    rows.push({
      URL: sample.url,
      Type: sample.type,
      Source: sample.source,
      'HTTP status': status,
      'QA result': qa,
      'Matches source': markerOk && titleOk && h1Ok ? 'yes' : 'partial',
      'Natural language': /[\u0E00-\u0E7F]{30}/.test(text) ? 'ok' : 'weak',
      'Local accuracy': provinceOk ? 'ok' : 'fail',
      'Entity accuracy': h1Ok ? 'ok' : 'check',
      'Fake claims': issues.includes('fake_claim') ? 'fail' : 'none',
      Encoding: issues.includes('encoding') ? 'fail' : 'ok',
      Placeholder: issues.includes('placeholder') ? 'fail' : 'none',
      Notes: issues.join('|') || `title/h1 match; marker:${marker.slice(0, 48)}`,
    });
    process.stdout.write(`${qa} ${sample.type} ${sample.url}\n`);
  }

  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join('\r\n') + '\r\n';
  await fs.writeFile(out, csv, 'utf8');
  const fails = rows.filter((r) => r['QA result'] === 'FAIL');
  console.log(JSON.stringify({
    total: rows.length,
    fails: fails.length,
    counts,
    failUrls: fails.map((f) => ({ url: f.URL, notes: f.Notes })),
  }, null, 2));
  if (fails.length) process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
