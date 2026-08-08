import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';

const baseSha = process.argv[2] || '3d6e2cba738e53e95fc2d8db96e039611b811ded';
const FROZEN_TYPES = new Set([
  'Homepage', 'Notebook-English', 'Second-hand', 'Price/valuation',
  'Province', 'Condition', 'Secondary service', 'Guide',
]);

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

function norm(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function hash(text) {
  return crypto.createHash('sha256').update(norm(text)).digest('hex').slice(0, 16);
}

function gitShow(sha, rel) {
  try {
    return execSync(`git show ${sha}:${rel}`, { encoding: 'buffer', maxBuffer: 10 * 1024 * 1024 }).toString('utf8');
  } catch {
    return null;
  }
}

const changedFiles = new Set(
  execSync(`git diff --name-only ${baseSha}`, { encoding: 'utf8' })
    .split(/\r?\n/)
    .map((s) => s.trim().replaceAll('\\', '/'))
    .filter(Boolean),
);

const inv = parseCsv(fs.readFileSync('docs/content-quality-upgrade/01-url-inventory.csv', 'utf8'));
const rows = [];
let blocked = false;

for (const r of inv) {
  if (String(r.Indexable).toLowerCase() === 'no' && r['Page type'] === 'Noindex combo') continue;
  const source = (r['Source file/data source'] || '').replaceAll('\\', '/');
  let before = '';
  let after = '';
  let changed = 'no';
  let reason = '';
  let workstream = '';

  if (source.startsWith('src/') && fs.existsSync(source)) {
    const cur = fs.readFileSync(source, 'utf8');
    after = hash(cur);
    const prev = gitShow(baseSha, source);
    before = prev ? hash(prev) : '';
    const fileChanged = changedFiles.has(source) || (before && before !== after);
    changed = fileChanged ? 'yes' : 'no';
    if (changed === 'yes') {
      if (source.includes('/brands/')) {
        workstream = 'B';
        reason = 'series_model_authority_enrichment';
      } else if (source.includes('/blog/')) {
        workstream = 'C';
        reason = 'selective_blog_enrichment';
      } else if (source.includes('[slug].astro')) {
        workstream = 'B8';
        reason = 'hierarchy_internal_linking_template';
      } else if (FROZEN_TYPES.has(r['Page type'])) {
        workstream = 'BLOCKED_FROZEN';
        reason = 'frozen_type_content_changed';
        blocked = true;
      } else {
        workstream = 'OTHER';
        reason = 'reviewed_non_frozen';
      }
    }
  } else {
    before = hash(`static:${r.URL}`);
    after = before;
  }

  rows.push({
    URL: r.URL,
    Type: r['Page type'],
    'Changed?': changed,
    'Before hash': before,
    'After hash': after,
    Reason: reason,
    'Approved workstream': workstream,
    Source: source,
  });
}

// Also flag slug template if changed
if (changedFiles.has('src/pages/รับซื้อโน๊ตบุ๊ค/[slug].astro')) {
  // already covered via inventory source path if present
}

function csvEscape(v) {
  const t = String(v ?? '');
  return /[",\r\n]/.test(t) ? `"${t.replaceAll('"', '""')}"` : t;
}
const headers = ['URL', 'Type', 'Changed?', 'Before hash', 'After hash', 'Reason', 'Approved workstream', 'Source'];
fs.mkdirSync('docs/authority-phase', { recursive: true });
fs.writeFileSync(
  'docs/authority-phase/06-content-delta.csv',
  [headers.join(','), ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join('\r\n') + '\r\n',
);
const changedRows = rows.filter((r) => r['Changed?'] === 'yes');
console.log(JSON.stringify({
  blocked,
  changedFiles: [...changedFiles].filter((f) => f.startsWith('src/')),
  changedUrls: changedRows.length,
  byType: changedRows.reduce((a, r) => { a[r.Type] = (a[r.Type] || 0) + 1; return a; }, {}),
  frozenHits: changedRows.filter((r) => r['Approved workstream'] === 'BLOCKED_FROZEN'),
}, null, 2));
process.exitCode = blocked ? 2 : 0;
