import fs from 'node:fs';

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

const before = {
  'asus-rog-ally-x': 87,
  'acer-nitro-16': 91,
  'asus-zephyrus-g14': 87,
  'hp-victus-15': 91,
  'lenovo-legion-5': 88,
  'thinkpad-x1-carbon': 91,
  'macbook-pro-m3': 91,
  'macbook-air-m3': 87,
  'macbook-air-m4': 84,
  'macbook-air-m5': 84,
};

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

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { data: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  const fm = raw.slice(3, end);
  const body = raw.slice(end + 4);
  const data = {};
  const title = fm.match(/^title:\s*(.*)$/m);
  const h1 = fm.match(/^pageH1:\s*(.*)$/m);
  const desc = fm.match(/^description:\s*(.*)$/m);
  data.title = title?.[1]?.replace(/^["']|["']$/g, '') || '';
  data.pageH1 = h1?.[1]?.replace(/^["']|["']$/g, '') || '';
  data.description = desc?.[1]?.replace(/^["']|["']$/g, '') || '';
  data.seoTitle = (fm.match(/^seoTitle:\s*(.*)$/m)?.[1] || '').replace(/^["']|["']$/g, '');
  data.hasFaqs = /^faqs:/m.test(fm);
  return { data, body };
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

const rows = [];
for (const slug of batch) {
  const raw = fs.readFileSync(`src/content/brands/${slug}.md`, 'utf8');
  const { data, body } = parseFrontmatter(raw);
  const wordCount = thaiWordCount(`${data.description || ''}\n${body}`);
  const title = data.seoTitle || data.title || '';
  const h1 = data.pageH1 || data.title || '';
  const { score, status } = scorePage({
    pageType: 'Model',
    wordCount,
    body,
    title,
    h1,
    hasFaqs: data.hasFaqs,
  });
  rows.push({
    slug,
    score_before: before[slug] ?? '',
    score_after: score,
    status,
    word_count: wordCount,
    delta: score - (before[slug] ?? score),
  });
}
const avgBefore = rows.reduce((a, r) => a + Number(r.score_before || 0), 0) / rows.length;
const avgAfter = rows.reduce((a, r) => a + r.score_after, 0) / rows.length;
const header = 'slug,score_before,score_after,status,word_count,delta';
const csv =
  [header, ...rows.map((r) => `${r.slug},${r.score_before},${r.score_after},${r.status},${r.word_count},${r.delta}`)].join('\r\n') +
  '\r\n';
fs.writeFileSync('docs/model-enrichment-batch-1/05-before-after-quality.csv', csv);
console.log(JSON.stringify({ rows, avgBefore, avgAfter }, null, 2));
