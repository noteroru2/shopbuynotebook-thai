/**
 * FAIL_DATA guard for authority-phase additions only.
 * Scans appended/replaced authority sections for hardware tokens that are not
 * present in the same file's frontmatter popularModels/title/description.
 */
import fs from 'node:fs';
import path from 'node:path';

const brandsDir = 'src/content/brands';

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { data: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: raw };
  const fm = raw.slice(3, end).trim();
  const body = raw.slice(end + 4);
  const data = {};
  let key = null; let buf = [];
  const flush = () => {
    if (!key) return;
    const v = buf.join('\n').trim();
    if (v.startsWith('- ') || buf.some((l) => /^\s*-\s+/.test(l))) {
      data[key] = v.split('\n').map((l) => l.replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, '')).filter(Boolean);
    } else data[key] = v.replace(/^["']|["']$/g, '');
    key = null; buf = [];
  };
  for (const line of fm.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (m && !line.startsWith('  ') && !line.startsWith('- ')) {
      flush(); key = m[1]; buf = m[2] !== '' ? [m[2]] : [];
    } else if (key) buf.push(line);
  }
  flush();
  return { data, body };
}

function extractRisky(text) {
  const out = new Set();
  const patterns = [
    /\bRTX\s?\d{3,4}(?:\s*Ti)?/gi,
    /\bGTX\s?\d{3,4}/gi,
    /\b(?:Intel\s+Core\s+(?:Ultra\s+)?[iI]\d[\w-]*)/gi,
    /\b(?:AMD\s+Ryzen\s+\d[\w-]*)/gi,
  ];
  for (const re of patterns) {
    for (const m of text.matchAll(re)) out.add(m[0].replace(/\s+/g, ' ').trim());
  }
  return [...out];
}

function authoritySlices(body) {
  const markers = [
    '## ในมุมรับซื้อ',
    '## Series Authority Hub',
    '<!-- Authority append -->',
    'Series Authority Hub:',
  ];
  const idx = markers.map((m) => body.indexOf(m)).filter((i) => i >= 0);
  if (!idx.length) return '';
  const start = Math.min(...idx);
  // Prefer from first marker; for "ในมุมรับซื้อ" files the whole body is authority-written
  if (body.includes('ในมุมรับซื้อ')) return body;
  return body.slice(start);
}

const fails = [];
for (const file of fs.readdirSync(brandsDir).filter((f) => f.endsWith('.md'))) {
  const raw = fs.readFileSync(path.join(brandsDir, file), 'utf8');
  const { data, body } = parseFrontmatter(raw);
  const slice = authoritySlices(body);
  if (!slice) continue;
  const seed = [
    ...(Array.isArray(data.popularModels) ? data.popularModels : []),
    data.title || '',
    data.description || '',
    data.seoTitle || '',
    data.pageH1 || '',
  ].join(' ').toLowerCase();
  for (const token of extractRisky(slice)) {
    if (!seed.includes(token.toLowerCase())) {
      fails.push({ file, token });
    }
  }
}

fs.mkdirSync('docs/authority-phase', { recursive: true });
fs.writeFileSync(
  'docs/authority-phase/fail-data-scan.csv',
  ['file,token', ...fails.map((f) => `${f.file},${JSON.stringify(f.token)}`)].join('\r\n') + '\r\n',
);
console.log(JSON.stringify({ FAIL_DATA: fails.length, fails }, null, 2));
process.exitCode = fails.length ? 2 : 0;
