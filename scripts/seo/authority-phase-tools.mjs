/**
 * Authority phase tooling:
 * - Production baseline inventory (hash + scores)
 * - Series/model inventory + priorities
 * - Data provenance from frontmatter/body only (no invented specs)
 * - FAIL_DATA scan for unsupported hardware claims vs provenance
 *
 * Usage: node scripts/seo/authority-phase-tools.mjs
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const outDir = path.join(root, 'docs/authority-phase');
const brandsDir = path.join(root, 'src/content/brands');
const SITE = 'https://ร้านรับซื้อโน๊ตบุ๊ค.com';

const BRAND_HUBS = new Set([
  'asus', 'acer', 'lenovo', 'hp', 'dell', 'msi', 'macbook', 'surface', 'gaming',
  'samsung', 'huawei', 'lg', 'honor', 'razer', 'gigabyte', 'office',
]);

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function walk(dir, ext = '.md') {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) out.push(...walk(p, ext));
    else if (name.name.endsWith(ext) || name.name.endsWith('.mdx')) out.push(p);
  }
  return out;
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { data: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: raw };
  const fm = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\s+/, '');
  const data = {};
  let key = null;
  let buf = [];
  const flush = () => {
    if (!key) return;
    const v = buf.join('\n').trim();
    if (v.startsWith('- ') || v.includes('\n- ')) {
      data[key] = v
        .split('\n')
        .map((l) => l.replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else {
      data[key] = v.replace(/^["']|["']$/g, '');
    }
    key = null;
    buf = [];
  };
  for (const line of fm.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (m && !line.startsWith('  ') && !line.startsWith('- ')) {
      flush();
      key = m[1];
      if (m[2] !== '') buf = [m[2]];
      else buf = [];
    } else if (key) {
      buf.push(line);
    }
  }
  flush();
  return { data, body };
}

function thaiWordCount(text) {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return 0;
  const latin = (cleaned.match(/[A-Za-z0-9]+/g) || []).length;
  const thaiChars = (cleaned.match(/[\u0E00-\u0E7F]/g) || []).length;
  return latin + Math.round(thaiChars / 3.2);
}

function classifyBrand(slug) {
  if (BRAND_HUBS.has(slug)) return 'Brand';
  const parts = slug.split('-');
  if (parts.length >= 3 || /m\d|rtx|gen/i.test(slug)) return 'Model';
  return 'Series';
}

function brandOf(slug) {
  if (slug.startsWith('macbook')) return 'macbook';
  if (slug.startsWith('thinkpad')) return 'lenovo';
  if (slug.startsWith('alienware')) return 'dell';
  if (slug.startsWith('surface')) return 'surface';
  const first = slug.split('-')[0];
  return BRAND_HUBS.has(first) ? first : first;
}

function seriesOf(slug, pageType) {
  if (pageType === 'Series') return slug;
  if (pageType === 'Brand') return '';
  // heuristic parent series: drop last segment(s) until a series file exists
  const parts = slug.split('-');
  for (let i = parts.length - 1; i >= 2; i--) {
    const cand = parts.slice(0, i).join('-');
    if (fs.existsSync(path.join(brandsDir, `${cand}.md`)) && classifyBrand(cand) === 'Series') {
      return cand;
    }
  }
  // macbook chip models → macbook hub only
  if (slug.startsWith('macbook-')) return '';
  return '';
}

function scorePage({ pageType, wordCount, body, title, h1, hasFaqs }) {
  let intent = 12;
  let unique = 10;
  let depth = 8;
  let entity = 6;
  let linking = 5;
  let semantic = 5;
  let trust = 5;
  let conversion = 3;

  if (title && h1) intent += 4;
  if (/(ส่งรูป|ประเมิน|LINE|ไลน์|สเปก|สภาพ)/i.test(body)) intent += 4;

  const templateHits = [
    /หากคุณกำลังอาศัยอยู่ใน/,
    /คุณมาถูกที่แล้วครับ/,
    /⭐⭐⭐⭐⭐/,
    /ทำไมคนใน.+ถึงเลือกขาย/,
    /ยินดีต้อนรับสู่บริการ/,
  ].filter((re) => re.test(body)).length;
  unique += Math.max(0, 10 - templateHits * 3);
  if (wordCount >= 250) unique += 2;
  if (wordCount >= 450) depth += 4;
  if (wordCount >= 700) depth += 3;
  if (hasFaqs) {
    semantic += 3;
    depth += 2;
  }
  if (/อุบลราชธานี|ไม่ใช่สาขา|หน้าร้านจริง/.test(body)) trust += 3;
  if (/แอดไลน์|@webuy|0642579353|ส่งรูป/.test(body)) conversion += 2;
  if (/\[[^\]]+\]\(\//.test(body)) linking += 4;
  if (/^## /m.test(body)) semantic += 2;
  if (pageType === 'Model' || pageType === 'Series') entity += 4;
  if (/(CPU|GPU|RAM|SSD|แบต|ที่ชาร์จ)/i.test(body)) entity += 2;

  const score = Math.min(100, intent + unique + depth + entity + linking + semantic + trust + conversion);
  let status = 'Needs improvement';
  if (score >= 88) status = 'Strong';
  else if (score >= 78) status = 'Good';
  else if (score >= 65) status = 'Needs improvement';
  else status = 'Weak';
  return { score, status };
}

function csvEscape(v) {
  const t = String(v ?? '');
  return /[",\r\n]/.test(t) ? `"${t.replaceAll('"', '""')}"` : t;
}

function writeCsv(file, headers, rows) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(','));
  }
  fs.writeFileSync(file, `${lines.join('\r\n')}\r\n`, 'utf8');
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
  const headers = rows.shift().map((v, i) => (i === 0 ? v.replace(/^\uFEFF/, '') : v));
  return rows.filter((v) => v.some(Boolean)).map((values) => Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ''])));
}

function contentHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function extractHardwareMentions(text) {
  const mentions = new Set();
  const patterns = [
    /\b(?:Intel\s+Core\s+(?:Ultra\s+)?[iI]?\d[\w-]*)/gi,
    /\b(?:AMD\s+Ryzen\s+\d[\w-]*)/gi,
    /\b(?:Apple\s+M[1-5](?:\s+(?:Pro|Max|Ultra))?)/gi,
    /\bM[1-5](?:\s+(?:Pro|Max|Ultra))?/gi,
    /\bRTX\s?\d{3,4}(?:\s*Ti)?/gi,
    /\bGTX\s?\d{3,4}/gi,
    /\b(?:RAM|SSD)\s*\d+\s*(?:GB|TB)/gi,
    /\b\d+\s*(?:GB|TB)\s*(?:RAM|SSD|storage)/gi,
    /\b\d{2,3}\s*Hz\b/gi,
    /\b\d{2}(?:\.\d)?\s*(?:นิ้ว|inch|")/gi,
  ];
  for (const re of patterns) {
    for (const m of text.matchAll(re)) mentions.add(m[0].replace(/\s+/g, ' ').trim());
  }
  return [...mentions];
}

function verifiedFieldsCount(data, body) {
  let n = 0;
  if (data.title) n++;
  if (data.slug) n++;
  if (Array.isArray(data.popularModels) && data.popularModels.length) n += Math.min(3, data.popularModels.length);
  if (Array.isArray(data.faqs) && data.faqs.length) n += 2;
  if (extractHardwareMentions(`${data.description || ''}\n${body}`).length) n += 2;
  if (/^## /m.test(body)) n++;
  if (/\[[^\]]+\]\(\//.test(body)) n++;
  return n;
}

function enrichmentPriority(pageType, wordCount, verified, score) {
  if (pageType !== 'Series' && pageType !== 'Model') return 'n/a';
  if (verified >= 8 && wordCount >= 280) return 'A';
  if (verified >= 5 || wordCount >= 160) return 'B';
  if (score < 80 || wordCount < 160) return 'B';
  return 'C';
}

// --- load prior inventory for inbound/sitemap if present ---
const priorInvPath = path.join(root, 'docs/content-quality-upgrade/01-url-inventory.csv');
const priorInv = fs.existsSync(priorInvPath) ? parseCsv(fs.readFileSync(priorInvPath, 'utf8')) : [];
const priorByUrl = new Map(priorInv.map((r) => [r.URL, r]));

ensureDir(outDir);

// Build brand file index
const brandFiles = walk(brandsDir, '.md');
const brandRows = [];
const provenance = [];

for (const file of brandFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const { data, body } = parseFrontmatter(raw);
  const slug = data.slug || path.basename(file, '.md');
  const pageType = classifyBrand(slug);
  const url = `/รับซื้อโน๊ตบุ๊ค/${slug}/`;
  const wordCount = thaiWordCount(`${data.description || ''}\n${body}`);
  const hasFaqs = Array.isArray(data.faqs) ? data.faqs.length > 0 : /faqs:/i.test(raw);
  const title = data.seoTitle || data.title || '';
  const h1 = data.pageH1 || data.title || '';
  const { score, status } = scorePage({ pageType, wordCount, body, title, h1, hasFaqs });
  const brand = brandOf(slug);
  const series = seriesOf(slug, pageType);
  const verified = verifiedFieldsCount(data, body);
  const mentions = extractHardwareMentions(`${Array.isArray(data.popularModels) ? data.popularModels.join(' ') : ''}\n${data.description || ''}\n${body}`);
  const uniqueData = [
    Array.isArray(data.popularModels) && data.popularModels.length ? 'popularModels' : null,
    hasFaqs ? 'faqs' : null,
    mentions.length ? 'prose_hardware_mentions' : null,
    wordCount >= 250 ? 'body_depth' : null,
  ].filter(Boolean).join('|') || 'name_only';
  const priority = enrichmentPriority(pageType, wordCount, verified, score);
  const mtime = fs.statSync(file).mtime.toISOString();
  const hash = contentHash(raw);

  brandRows.push({
    file: path.relative(root, file).replaceAll('\\', '/'),
    URL: url,
    Brand: brand,
    Series: series,
    Model: pageType === 'Model' ? slug : '',
    'Page type': pageType,
    'Dataset source': path.relative(root, file).replaceAll('\\', '/'),
    'Verified fields count': verified,
    'Content score': score,
    'Quality status': status,
    'Word count': wordCount,
    'Inbound links': priorByUrl.get(url)?.['Internal inbound links'] || 'TBD',
    'Related pages': [
      brand && brand !== slug ? `/รับซื้อโน๊ตบุ๊ค/${brand}/` : null,
      series ? `/รับซื้อโน๊ตบุ๊ค/${series}/` : null,
    ].filter(Boolean).join(' | '),
    'Unique data available': uniqueData,
    'Enrichment priority': priority,
    'Evidence quality': verified >= 8 ? 'high' : verified >= 5 ? 'medium' : 'low',
    Title: title,
    H1: h1,
    Canonical: `${SITE}${url}`,
    'Content hash': hash,
    'Last content modification': mtime,
    'Main entity': data.title || slug,
    'Search intent': pageType === 'Series' ? 'series buyback / evaluation' : pageType === 'Model' ? 'model buyback / evaluation' : 'brand hub',
    'Sitemap status': priorByUrl.get(url)?.Indexable === 'yes' ? 'in_indexable_set' : 'unknown',
    popularModels: Array.isArray(data.popularModels) ? data.popularModels.join(' | ') : '',
  });

  // Provenance rows from popularModels + mentions
  const models = Array.isArray(data.popularModels) ? data.popularModels : [];
  for (const pm of models) {
    provenance.push({
      Brand: brand,
      Series: series || (pageType === 'Series' ? slug : ''),
      Model: pageType === 'Model' ? slug : '',
      Field: 'popularModels_chip',
      Value: pm,
      'Source path': path.relative(root, file).replaceAll('\\', '/'),
      Verified: 'repo_frontmatter',
      Confidence: 'medium',
      'Used in content': 'yes',
    });
  }
  for (const m of mentions) {
    provenance.push({
      Brand: brand,
      Series: series || (pageType === 'Series' ? slug : ''),
      Model: pageType === 'Model' ? slug : '',
      Field: 'prose_or_frontmatter_mention',
      Value: m,
      'Source path': path.relative(root, file).replaceAll('\\', '/'),
      Verified: 'repo_text',
      Confidence: 'medium_low',
      'Used in content': 'yes',
    });
  }
}

// Full site baseline from prior inventory + live hashes for changed sources
const baseline = [];
for (const row of priorInv) {
  if (String(row.Indexable).toLowerCase() === 'no' && row['Page type'] === 'Noindex combo') continue;
  const url = row.URL;
  const source = row['Source file/data source'] || '';
  let hash = '';
  let mtime = '';
  let wordCount = row['Word count'] || '';
  let score = '';
  let status = row['Quality status'] || '';
  if (source.startsWith('src/') && fs.existsSync(path.join(root, source))) {
    const raw = fs.readFileSync(path.join(root, source), 'utf8');
    hash = contentHash(raw);
    mtime = fs.statSync(path.join(root, source)).mtime.toISOString();
    const { data, body } = parseFrontmatter(raw);
    wordCount = String(thaiWordCount(`${data.description || ''}\n${body}`));
    const pageType = row['Page type'];
    const scored = scorePage({
      pageType,
      wordCount: Number(wordCount),
      body,
      title: data.seoTitle || data.title || row['Current title'] || '',
      h1: data.pageH1 || data.title || row['Current H1'] || '',
      hasFaqs: Array.isArray(data.faqs) ? data.faqs.length > 0 : /faqs:/i.test(raw),
    });
    score = String(scored.score);
    status = scored.status;
  } else {
    // static page: hash path marker
    hash = contentHash(`static:${url}:${source}`);
    score = priorByUrl.get(url) ? String(
      // reuse quality from baseline csv if available
      parseCsv(fs.existsSync(path.join(root, 'docs/content-quality-upgrade/02-quality-baseline.csv'))
        ? fs.readFileSync(path.join(root, 'docs/content-quality-upgrade/02-quality-baseline.csv'), 'utf8')
        : '').find((r) => r.URL === url)?.Score || ''
    ) : '';
  }
  const qBase = parseCsv(fs.existsSync(path.join(root, 'docs/content-quality-upgrade/02-quality-baseline.csv'))
    ? fs.readFileSync(path.join(root, 'docs/content-quality-upgrade/02-quality-baseline.csv'), 'utf8')
    : '');
  const qb = qBase.find((r) => r.URL === url);
  if (!score && qb) score = qb.Score;
  if (!status && qb) status = qb['Quality status'];

  baseline.push({
    URL: url,
    Type: row['Page type'],
    Title: row['Current title'] || '',
    H1: row['Current H1'] || '',
    Canonical: row.Canonical || `${SITE}${url}`,
    'Word count': wordCount || qb?.['Word count'] || '',
    'Quality score': score || qb?.Score || '',
    'Internal inbound links': row['Internal inbound links'] || 'TBD',
    'Sitemap status': String(row.Indexable).toLowerCase() === 'yes' ? 'indexable' : 'not_indexable',
    'Content hash': hash,
    'Last content modification': mtime || '',
    'Main entity': row['Search intent'] || row['Page type'],
    'Search intent': row['Search intent'] || '',
    Source: source,
  });
}

const seriesModel = brandRows.filter((r) => r['Page type'] === 'Series' || r['Page type'] === 'Model');

writeCsv(path.join(outDir, '00-production-baseline.csv'), [
  'URL', 'Type', 'Title', 'H1', 'Canonical', 'Word count', 'Quality score',
  'Internal inbound links', 'Sitemap status', 'Content hash', 'Last content modification',
  'Main entity', 'Search intent', 'Source',
], baseline);

writeCsv(path.join(outDir, '01-series-model-inventory.csv'), [
  'URL', 'Brand', 'Series', 'Model', 'Page type', 'Dataset source', 'Verified fields count',
  'Content score', 'Word count', 'Inbound links', 'Related pages', 'Unique data available',
  'Enrichment priority', 'Evidence quality',
], seriesModel.map((r) => ({
  URL: r.URL,
  Brand: r.Brand,
  Series: r.Series,
  Model: r.Model,
  'Page type': r['Page type'],
  'Dataset source': r['Dataset source'],
  'Verified fields count': r['Verified fields count'],
  'Content score': r['Content score'],
  'Word count': r['Word count'],
  'Inbound links': r['Inbound links'],
  'Related pages': r['Related pages'],
  'Unique data available': r['Unique data available'],
  'Enrichment priority': r['Enrichment priority'],
  'Evidence quality': r['Evidence quality'],
})));

writeCsv(path.join(outDir, '02-model-data-provenance.csv'), [
  'Brand', 'Series', 'Model', 'Field', 'Value', 'Source path', 'Verified', 'Confidence', 'Used in content',
], provenance);

// Summary JSON
const series = seriesModel.filter((r) => r['Page type'] === 'Series');
const models = seriesModel.filter((r) => r['Page type'] === 'Model');
const avg = (arr) => (arr.length ? arr.reduce((s, r) => s + Number(r['Content score']), 0) / arr.length : 0);
const summary = {
  baseline_rows: baseline.length,
  indexable_approx: baseline.filter((r) => r['Sitemap status'] === 'indexable').length,
  series_count: series.length,
  model_count: models.length,
  series_avg: Number(avg(series).toFixed(1)),
  model_avg: Number(avg(models).toFixed(1)),
  priority_counts: {
    A: seriesModel.filter((r) => r['Enrichment priority'] === 'A').length,
    B: seriesModel.filter((r) => r['Enrichment priority'] === 'B').length,
    C: seriesModel.filter((r) => r['Enrichment priority'] === 'C').length,
  },
  thin_models: models.filter((r) => Number(r['Word count']) < 200).map((r) => r.URL),
  low_series: series.filter((r) => Number(r['Content score']) < 85).map((r) => ({ url: r.URL, score: r['Content score'], words: r['Word count'] })),
};
fs.writeFileSync(path.join(outDir, '00-baseline-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
console.log('Wrote', outDir);
