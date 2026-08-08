/**
 * Build existing Series/Model inventory from src/content/brands only.
 * Does not invent models or mutate content.
 *
 * Usage: node scripts/spec-data/build-existing-inventory.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const brandsDir = path.join(root, 'src/content/brands');
const outDir = path.join(root, 'docs/spec-data-foundation');

const BRAND_HUBS = new Set([
  'asus', 'acer', 'lenovo', 'hp', 'dell', 'msi', 'macbook', 'surface', 'gaming',
  'samsung', 'huawei', 'lg', 'honor', 'razer', 'gigabyte', 'office',
]);

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { data: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: raw };
  const fm = raw.slice(3, end).trim();
  const body = raw.slice(end + 4);
  const data = {};
  let key = null;
  let buf = [];
  const flush = () => {
    if (!key) return;
    const v = buf.join('\n').trim();
    if (v.startsWith('- ') || buf.some((l) => /^\s*-\s+/.test(l))) {
      data[key] = v.split('\n').map((l) => l.replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, '')).filter(Boolean);
    } else data[key] = v.replace(/^["']|["']$/g, '');
    key = null;
    buf = [];
  };
  for (const line of fm.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (m && !line.startsWith('  ') && !line.startsWith('- ')) {
      flush();
      key = m[1];
      buf = m[2] !== '' ? [m[2]] : [];
    } else if (key) buf.push(line);
  }
  flush();
  return { data, body };
}

function classify(slug) {
  if (BRAND_HUBS.has(slug)) return 'Brand';
  const parts = slug.split('-');
  if (parts.length >= 3 || /m\d|rtx|gen/i.test(slug)) return 'Model';
  return 'Series';
}

function brandOf(slug) {
  if (slug.startsWith('macbook')) return 'Apple';
  if (slug.startsWith('thinkpad')) return 'Lenovo';
  if (slug.startsWith('alienware')) return 'Dell';
  if (slug.startsWith('surface')) return 'Microsoft';
  const map = {
    asus: 'ASUS', acer: 'Acer', lenovo: 'Lenovo', hp: 'HP', dell: 'Dell', msi: 'MSI',
    samsung: 'Samsung', huawei: 'Huawei', lg: 'LG', honor: 'Honor', razer: 'Razer',
    gigabyte: 'Gigabyte', gaming: 'Multi-brand', office: 'Multi-brand', macbook: 'Apple',
  };
  const first = slug.split('-')[0];
  return map[first] || first;
}

function brandSlugOf(slug) {
  if (slug.startsWith('macbook')) return 'macbook';
  if (slug.startsWith('thinkpad')) return 'lenovo';
  if (slug.startsWith('alienware')) return 'dell';
  if (slug.startsWith('surface')) return 'surface';
  return slug.split('-')[0];
}

function findSeries(slug, pageType, files) {
  if (pageType !== 'Model') return pageType === 'Series' ? slug : '';
  const parts = slug.split('-');
  for (let i = parts.length - 1; i >= 2; i--) {
    const cand = parts.slice(0, i).join('-');
    if (files.has(cand) && classify(cand) === 'Series') return cand;
  }
  return '';
}

function extractMentions(text) {
  const out = new Set();
  const patterns = [
    /\bRTX\s?\d{3,4}(?:\s*Ti)?/gi,
    /\bGTX\s?\d{3,4}/gi,
    /\b(?:Intel\s+Core\s+(?:Ultra\s+)?[iI]?\d[\w-]*)/gi,
    /\b(?:AMD\s+Ryzen\s+\d[\w-]*)/gi,
    /\bM[1-5](?:\s+(?:Pro|Max|Ultra))?/gi,
    /\b\d+\s*GB(?:\s*\/\s*\d+\s*GB)?/gi,
    /\b\d+(?:\.\d)?\s*(?:นิ้ว|inch)/gi,
    /\b\d{2,3}\s*Hz\b/gi,
  ];
  for (const re of patterns) {
    for (const m of text.matchAll(re)) out.add(m[0].replace(/\s+/g, ' ').trim());
  }
  return [...out];
}

/** Conservative normalization — no guessing machine types / product numbers. */
function normalize(slug, title, pageType) {
  const brand = brandOf(slug);
  const parts = slug.split('-');
  let family = '';
  let series = '';
  let marketingName = title;
  let modelFamily = '';
  let modelCode = '';
  let generation = '';
  let normalizationStatus = 'OK';

  if (slug.startsWith('macbook-')) {
    family = parts.includes('air') ? 'MacBook Air' : parts.includes('pro') ? 'MacBook Pro' : 'MacBook';
    series = family;
    const chip = (slug.match(/m([1-5])/) || [])[1];
    const size = (slug.match(/\b(13|14|15|16)\b/) || [])[1];
    if (chip) generation = `M${chip}`;
    if (size) modelFamily = `${family} ${size}`;
    else if (chip) modelFamily = `${family} M${chip}`;
    else modelFamily = family;
    if (!chip && !size) normalizationStatus = 'NEEDS_REVIEW';
  } else if (slug.startsWith('thinkpad-')) {
    family = 'ThinkPad';
    series = parts.slice(0, 2).join('-');
    modelFamily = title;
    modelCode = parts.slice(2).join('-') || '';
  } else if (slug.startsWith('alienware-')) {
    family = 'Alienware';
    series = parts.length >= 2 ? parts.slice(0, 2).join('-') : slug;
    modelFamily = title;
    modelCode = parts.slice(2).join('-');
  } else if (slug.startsWith('surface-')) {
    family = 'Surface';
    series = parts.slice(0, 2).join('-');
    modelFamily = title;
  } else if (pageType === 'Series') {
    family = title;
    series = slug;
    modelFamily = title;
  } else {
    series = parts.length >= 2 ? parts.slice(0, 2).join('-') : '';
    family = title;
    modelFamily = title;
    modelCode = parts.slice(2).join('-');
    if (parts.length < 3 && !/m\d|rtx|gen/i.test(slug)) normalizationStatus = 'NEEDS_REVIEW';
  }

  return {
    brand,
    family,
    series_slug: series,
    marketing_name: marketingName,
    model_family: modelFamily,
    model_code: modelCode,
    machine_type: '',
    product_number: '',
    region_code: '',
    generation,
    normalization_status: normalizationStatus,
    normalized_model: [brand, modelFamily || title].filter(Boolean).join(' | '),
  };
}

function researchPriority(slug, pageType, mentions) {
  if (/macbook|zephyrus|legion|tuf|rog|katana|stealth|victus|omen|nitro|predator|xps|latitude|thinkpad|elitebook|ally/i.test(slug)) {
    return 'A';
  }
  if (pageType === 'Series') return 'B';
  if (mentions.length >= 3) return 'B';
  return 'C';
}

function csvEscape(v) {
  const t = String(v ?? '');
  return /[",\r\n]/.test(t) ? `"${t.replaceAll('"', '""')}"` : t;
}

fs.mkdirSync(outDir, { recursive: true });
const files = fs.readdirSync(brandsDir).filter((f) => f.endsWith('.md'));
const slugSet = new Set(files.map((f) => f.replace(/\.md$/, '')));

const rows = [];
const normRows = [];
for (const file of files) {
  const abs = path.join(brandsDir, file);
  const raw = fs.readFileSync(abs, 'utf8');
  const { data, body } = parseFrontmatter(raw);
  const slug = data.slug || file.replace(/\.md$/, '');
  const pageType = classify(slug);
  if (pageType === 'Brand') continue; // hubs only listed separately in summary
  const series = findSeries(slug, pageType, slugSet);
  const popular = Array.isArray(data.popularModels) ? data.popularModels : [];
  const mentions = extractMentions([popular.join(' '), data.description || '', body].join('\n'));
  const verifiedFields = [
    data.title ? 'title' : null,
    data.slug ? 'slug' : null,
    popular.length ? 'popularModels' : null,
    Array.isArray(data.faqs) && data.faqs.length ? 'faqs' : null,
  ].filter(Boolean);
  const n = normalize(slug, data.title || slug, pageType);
  const priority = researchPriority(slug, pageType, mentions);
  const dataQuality = mentions.length >= 4 || popular.length >= 3 ? 'repo_rich_unverified' : popular.length ? 'repo_partial_unverified' : 'repo_name_only';

  rows.push({
    brand: n.brand,
    series: series || n.series_slug,
    model: pageType === 'Model' ? slug : '',
    normalized_model: n.normalized_model,
    URL: `/รับซื้อโน๊ตบุ๊ค/${slug}/`,
    source_path: path.relative(root, abs).replaceAll('\\', '/'),
    page_type: pageType,
    current_verified_fields: verifiedFields.join('|'),
    current_spec_mentions: mentions.join(' | '),
    popularModels: popular.join(' | '),
    data_quality: dataQuality,
    research_priority: priority,
    normalization_status: n.normalization_status,
    family: n.family,
    marketing_name: n.marketing_name,
    model_family: n.model_family,
    model_code: n.model_code,
    generation: n.generation,
  });

  normRows.push({
    slug,
    page_type: pageType,
    brand: n.brand,
    family: n.family,
    series: series || n.series_slug,
    marketing_name: n.marketing_name,
    model_family: n.model_family,
    model_code: n.model_code,
    machine_type: n.machine_type,
    product_number: n.product_number,
    region_code: n.region_code,
    generation: n.generation,
    normalization_status: n.normalization_status,
  });
}

const headers = [
  'brand', 'series', 'model', 'normalized_model', 'URL', 'source_path', 'page_type',
  'current_verified_fields', 'current_spec_mentions', 'popularModels', 'data_quality',
  'research_priority', 'normalization_status', 'family', 'marketing_name', 'model_family',
  'model_code', 'generation',
];
fs.writeFileSync(
  path.join(outDir, '01-existing-model-inventory.csv'),
  [headers.join(','), ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join('\r\n') + '\r\n',
);

const nHeaders = Object.keys(normRows[0]);
fs.writeFileSync(
  path.join(outDir, '01b-normalization.csv'),
  [nHeaders.join(','), ...normRows.map((r) => nHeaders.map((h) => csvEscape(r[h])).join(','))].join('\r\n') + '\r\n',
);

const summary = {
  brand_files: files.length,
  series: rows.filter((r) => r.page_type === 'Series').length,
  models: rows.filter((r) => r.page_type === 'Model').length,
  needs_review: normRows.filter((r) => r.normalization_status === 'NEEDS_REVIEW').length,
  priority_a: rows.filter((r) => r.research_priority === 'A').length,
  priority_b: rows.filter((r) => r.research_priority === 'B').length,
  priority_c: rows.filter((r) => r.research_priority === 'C').length,
};
fs.writeFileSync(path.join(outDir, '01-inventory-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
