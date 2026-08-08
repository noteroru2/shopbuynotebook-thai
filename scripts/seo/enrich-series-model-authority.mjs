/**
 * Enrich thin Series/Model markdown using ONLY repo-verified fields:
 * title, slug, popularModels, existing body mentions.
 * Does not invent CPU/GPU SKUs beyond popularModels / existing prose.
 *
 * Usage: node scripts/seo/enrich-series-model-authority.mjs [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const brandsDir = path.join(root, 'src/content/brands');
const dryRun = process.argv.includes('--dry-run');

const BRAND_HUBS = new Set([
  'asus', 'acer', 'lenovo', 'hp', 'dell', 'msi', 'macbook', 'surface', 'gaming',
  'samsung', 'huawei', 'lg', 'honor', 'razer', 'gigabyte',
]);

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { fm: '', data: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { fm: '', data: {}, body: raw };
  const fmBlock = raw.slice(0, end + 4);
  const fm = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\s+/, '');
  const data = {};
  let key = null;
  let buf = [];
  const flush = () => {
    if (!key) return;
    const v = buf.join('\n').trim();
    if (v.startsWith('- ') || (buf.length > 1 && buf.some((l) => /^\s*-\s+/.test(l)))) {
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
      buf = m[2] !== '' ? [m[2]] : [];
    } else if (key) buf.push(line);
  }
  flush();
  return { fm: fmBlock, data, body };
}

function thaiWordCount(text) {
  const cleaned = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[#>*_`|]/g, ' ').replace(/\s+/g, ' ').trim();
  const latin = (cleaned.match(/[A-Za-z0-9]+/g) || []).length;
  const thaiChars = (cleaned.match(/[\u0E00-\u0E7F]/g) || []).length;
  return latin + Math.round(thaiChars / 3.2);
}

function classify(slug) {
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

function findSeries(slug, pageType) {
  if (pageType !== 'Model') return '';
  const parts = slug.split('-');
  for (let i = parts.length - 1; i >= 2; i--) {
    const cand = parts.slice(0, i).join('-');
    if (fs.existsSync(path.join(brandsDir, `${cand}.md`)) && classify(cand) === 'Series') return cand;
  }
  return '';
}

function categoryOf(slug, title) {
  if (/macbook|surface/i.test(slug)) return 'apple_surface';
  if (/gaming|rog|tuf|nitro|predator|legion|loq|victus|omen|katana|stealth|cyborg|raider|vector|alienware|zephyrus|strix|aorus|blade/i.test(slug + title)) {
    return 'gaming';
  }
  if (/thinkpad|latitude|elitebook|probook|expertbook|travelmate|vostro|thinkbook/i.test(slug)) return 'business';
  return 'general';
}

function yamlFaqs(faqs) {
  if (!faqs?.length) return '';
  let out = 'faqs:\n';
  for (const f of faqs) {
    out += `  - question: ${JSON.stringify(f.question)}\n`;
    out += `    answer: ${JSON.stringify(f.answer)}\n`;
  }
  return out;
}

function ensureFaqsInFrontmatter(fmBlock, faqs) {
  if (/^faqs:/m.test(fmBlock)) return fmBlock; // keep existing
  const insert = yamlFaqs(faqs);
  return fmBlock.replace(/\n---\s*$/, `\n${insert}---\n`);
}

function variantList(popularModels, title) {
  const list = (popularModels || []).filter(Boolean);
  if (!list.length) {
    return `หน้านี้รองรับการประเมินเครื่องในตระกูล **${title}** โดยตรง รุ่นนี้มักมีหลายสเปกย่อย จึงควรแจ้ง CPU, GPU (ถ้ามี), RAM และ SSD ของเครื่องจริงก่อนประเมินราคา`;
  }
  return [
    `ข้อมูลรุ่น/สเปกย่อยที่มีในคลังเนื้อหาของเว็บ (ไม่ใช่รายการครบทุก SKU ทั่วโลก):`,
    ...list.map((m) => `- ${m}`),
    '',
    `รุ่นนี้มีหลายสเปกย่อยได้ จึงควรแจ้ง CPU, GPU (ถ้ามี), RAM และ SSD ของเครื่องจริงก่อนประเมินราคา`,
  ].join('\n');
}

function buildModelBody({ title, slug, popularModels, brand, series, category }) {
  const brandUrl = `/รับซื้อโน๊ตบุ๊ค/${brand}/`;
  const seriesUrl = series ? `/รับซื้อโน๊ตบุ๊ค/${series}/` : '';
  const isMac = category === 'apple_surface' && /macbook/i.test(slug);
  const isGaming = category === 'gaming';

  const identity = isMac
    ? `**${title}** เป็นหน้าประเมินรับซื้อเฉพาะกลุ่ม MacBook ตามชื่อรุ่น/ขนาดที่ระบุ ไม่ใช่หน้าแบรนด์รวม และไม่ใช่หน้าเช็คราคาทั่วไป`
    : `**${title}** เป็นหน้าประเมินรับซื้อเฉพาะรุ่น/ตระกูลนี้ ใช้เมื่อผู้ขายรู้ชื่อรุ่นแล้วและต้องการส่งข้อมูลให้ตรงเครื่อง`;

  const howToId = isMac
    ? `เปิด **About This Mac** หรือดูป้ายรุ่นใต้เครื่อง/กล่อง แล้วส่งรูปหน้าจอที่เห็นชิป ความจุ และปีรุ่นประกอบ หากมีหลายเครื่องในบ้าน อย่าส่งเฉพาะชื่อการตลาดอย่างเดียว`
    : `ดูสติ๊กเกอร์ใต้เครื่อง / กล่อง / System → About หรือ Task Manager แล้วส่งรูปที่เห็นชื่อรุ่น CPU RAM และ GPU (ถ้ามี)`;

  const priceFactors = isMac
    ? [
      '- ชิป Apple Silicon และขนาดหน้าจอตามรุ่นจริง',
      '- ความจุ RAM / SSD ตามที่เครื่องรายงาน',
      '- Battery Health และจำนวนรอบชาร์จ',
      '- สภาพจอ บอดี้ บานพับ และพอร์ต MagSafe/USB-C',
      '- ความครบของที่ชาร์จและสถานะ Find My / บัญชี',
    ]
    : isGaming
      ? [
        '- รุ่น GPU แยกและ CPU ตามสเปกจริง (แจ้งจากหน้าจอระบบ ไม่เดา)',
        '- RAM / SSD และว่ามีการอัปเกรดหลังซื้อหรือไม่',
        '- สภาพความร้อน พัดลม และรอยบานพับ',
        '- สภาพจอ (รีเฟรชเรทถ้าทราบจากสเปกเครื่อง) และบอดี้',
        '- ที่ชาร์จกำลังไฟตรงรุ่นและความครบของอุปกรณ์',
      ]
      : [
        '- CPU / RAM / SSD ตามสเปกจริง',
        '- สภาพบอดี้ คีย์บอร์ด จอ และพอร์ต',
        '- แบตเตอรี่และที่ชาร์จ',
        '- ปีใช้งานโดยประมาณและอาการที่พบ',
        '- อุปกรณ์เสริมที่ส่งมาด้วย',
      ];

  const photos = isMac
    ? ['ฝาบนและมุมเครื่อง', 'หน้าจอติดปกติ', 'คีย์บอร์ดและแทร็กแพด', 'พอร์ตด้านข้าง', 'About This Mac', 'Battery Health', 'ที่ชาร์จ MagSafe/USB-C', 'จุดตำหนิชัด ๆ']
    : ['ฝาบน', 'หน้าจอ', 'คีย์บอร์ด/ปาล์มเรส', 'ก้นเครื่องพร้อมป้ายรุ่น', 'หน้าจอสเปกระบบ', 'ที่ชาร์จ', 'จุดตำหนิ/บานพับ', 'อาการที่เกี่ยวข้อง (วิดีโอสั้นถ้ามี)'];

  const faq1q = isMac ? `${title} ต้องปลด Find My ก่อนขายไหม?` : `${title} ต้องถอด RAM/SSD ที่อัปเกรดออกก่อนขายไหม?`;
  const faq1a = isMac
    ? 'ควรตรวจสอบและจัดการบัญชี/Find My ให้พร้อมก่อนส่งมอบ เพื่อให้ประเมินและตรวจรับได้ราบรื่น หากยังติดบัญชีอยู่ ให้แจ้งชัดเจนตอนส่งข้อมูล'
    : 'ไม่จำเป็นต้องถอดออกหากติดตั้งใช้งานจริง แต่ควรแจ้งว่าอัปเกรดอะไรบ้าง และส่งรูปสเปกปัจจุบัน เพื่อไม่ให้ประเมินคลาดเคลื่อน';
  const faq2q = `${title} มีหลายสเปก ต้องแจ้งอะไรเป็นอย่างน้อย?`;
  const faq2a = 'อย่างน้อยแจ้งรุ่นย่อย/ชิป, RAM, ที่เก็บข้อมูล, สภาพแบต/ที่ชาร์จ และตำหนิที่เห็นชัด จากนั้นส่งรูปประกอบ';

  const links = [
    `- [รับซื้อโน๊ตบุ๊ค ${brand === 'macbook' ? 'MacBook' : brand.toUpperCase()}](${brandUrl})`,
    seriesUrl ? `- [ซีรีส์ที่เกี่ยวข้อง](${seriesUrl})` : null,
    `- [รับซื้อโน๊ตบุ๊คมือสอง](/รับซื้อโน๊ตบุ๊คมือสอง/)`,
    `- [เช็คราคาโน๊ตบุ๊ค](/เช็คราคาโน๊ตบุ๊ค/)`,
    isMac
      ? `- [Battery Health มีผลต่อราคาไหม](/blog/macbook-battery-health-มีผลต่อราคาไหม/)`
      : `- [วิธีดูสเปก CPU RAM SSD](/blog/วิธีดูสเปก-cpu-ram-ssd-ของโน๊ตบุ๊ค/)`,
    isGaming ? `- [รับซื้อ Gaming Notebook](/รับซื้อโน๊ตบุ๊ค/gaming/)` : null,
  ].filter(Boolean);

  return `## ${title} คืออะไรในมุมรับซื้อ

${identity}

${variantList(popularModels, title)}

## สิ่งที่ต้องแจ้งเมื่อขาย ${title}

1. ชื่อรุ่นย่อยตามเครื่องจริง
2. สเปกหลักที่อ่านได้จากระบบ
3. สภาพการใช้งานและตำหนิ
4. ความครบของที่ชาร์จ/อุปกรณ์
5. อาการที่พบ (ถ้ามี)

### วิธีดูรุ่น/สเปกอย่างปลอดภัย

${howToId}

## ปัจจัยที่มีผลต่อการประเมิน ${title}

${priceFactors.join('\n')}

ร้านไม่ได้ประกาศว่าปัจจัยใดมีน้ำหนักมากที่สุดตายตัวในทุกเคส เพราะขึ้นกับสภาพจริงและความต้องการของตลาดขณะประเมิน

## จุดที่ควรถ่ายรูปส่งประเมิน

${photos.map((p) => `- ${p}`).join('\n')}

## คำถามที่พบบ่อยเฉพาะ ${title}

### ${faq1q}

${faq1a}

### ${faq2q}

${faq2a}

## ลิงก์ที่เกี่ยวข้อง

${links.join('\n')}
`;
}

function buildSeriesBody({ title, slug, popularModels, brand, childModels, category }) {
  const brandUrl = `/รับซื้อโน๊ตบุ๊ค/${brand}/`;
  const children = childModels.length
    ? childModels.map((c) => `- [${c.title}](/รับซื้อโน๊ตบุ๊ค/${c.slug}/)`).join('\n')
    : '- (ยังไม่มีหน้ารุ่นย่อยแยกในเว็บ — ส่งชื่อรุ่นย่อยจากเครื่องจริงมาประเมินได้โดยตรง)';

  const useCase = category === 'gaming'
    ? `ซีรีส์ **${title}** อยู่ในกลุ่มเครื่องประสิทธิภาพสูง/เกมมิ่ง การประเมินจึงโฟกัสสเปกกราฟิก ความร้อน และสภาพบอดี้จากการใช้งานหนัก`
    : category === 'business'
      ? `ซีรีส์ **${title}** มักถูกใช้ทำงาน/องค์กร การประเมินโฟกัสรุ่นย่อย สภาพคีย์บอร์ด พอร์ต และความครบของอุปกรณ์`
      : `ซีรีส์ **${title}** เป็นกลุ่มรุ่นที่ลูกค้าส่งประเมินบ่อย การประเมินอิงรุ่นย่อย สเปกจริง และสภาพเครื่อง`;

  return `## สรุปซีรีส์ ${title}

${useCase}

หน้านี้เป็น **Series Authority Hub** ไม่ใช่หน้ารับซื้อทั่วไป และไม่ใช่หน้ารุ่นเดียวตายตัว

## รุ่นในซีรีส์ที่เว็บมีหน้าแยก

${children}

## รุ่น/สเปกย่อยที่อ้างอิงจากคลังเนื้อหา

${variantList(popularModels, title)}

## สิ่งที่ต้องแจ้งเมื่อขายเครื่องซีรีส์นี้

- ชื่อรุ่นย่อยเต็ม
- CPU / GPU (ถ้ามี) / RAM / SSD จากหน้าจอระบบ
- ปีโดยประมาณหรือรหัสรุ่นใต้เครื่อง
- สภาพจอ บานพับ คีย์บอร์ด พอร์ต
- ที่ชาร์จและความจุแบตตามที่ตรวจได้

## จุดตรวจสภาพที่มักเกี่ยวกับซีรีส์นี้

${category === 'gaming'
    ? `- พัดลม/เสียงผิดปกติและความร้อนขณะโหลด
- รอยบานพับและขาพอร์ตที่ใช้งานบ่อย
- สภาพจอและระบบไฟตกแต่ง (ถ้ามีในรุ่นนั้น)
- ที่ชาร์จกำลังไฟตรงรุ่น`
    : `- รอยบอดี้และฝาจอ
- คีย์บอร์ด/แทร็กแพด
- พอร์ตชาร์จและพอร์ตข้อมูล
- แบตเตอรี่และการชาร์จ`}

## FAQ เฉพาะซีรีส์ ${title}

### ต้องรู้รุ่นย่อยก่อนส่งไหม?

ช่วยได้มาก เพราะซีรีส์เดียวกันอาจต่างสเปกและอะไหล่ หากไม่แน่ใจ ส่งรูปป้ายรุ่นใต้เครื่องและหน้าจอระบบมาได้

### ลิงก์ไปหน้ารุ่นย่อยแล้วยังส่งประเมินที่นี่ได้ไหม?

ได้ครับ ใช้หน้าซีรีส์เมื่อยังไม่ชัวร์รุ่นย่อย หรือใช้หน้ารุ่นเมื่อรู้ชื่อรุ่นแล้ว

## ลิงก์ที่เกี่ยวข้อง

- [หน้าแบรนด์](${brandUrl})
- [รับซื้อโน๊ตบุ๊คมือสอง](/รับซื้อโน๊ตบุ๊คมือสอง/)
- [ตีราคาโน๊ตบุ๊ค](/ตีราคาโน๊ตบุ๊ค/)
- [วิธีดูสเปก CPU RAM SSD](/blog/วิธีดูสเปก-cpu-ram-ssd-ของโน๊ตบุ๊ค/)
`;
}

function uniqueFaqs(title, category, isSeries) {
  if (isSeries) {
    return [
      {
        question: `ซีรีส์ ${title} ต้องระบุรุ่นย่อยก่อนประเมินไหม?`,
        answer: 'ควรระบุหรือส่งรูปป้ายรุ่น/หน้าจอระบบ เพราะซีรีส์เดียวกันอาจมีหลายสเปกย่อย การประเมินจะตรงขึ้นเมื่อรู้เครื่องจริง',
      },
      {
        question: `ขายเครื่องซีรีส์ ${title} ส่งรูปอะไรก่อนดี?`,
        answer: 'ส่งรูปตัวเครื่องรอบด้าน หน้าจอติด ป้ายรุ่นใต้เครื่อง หน้าจอสเปก และที่ชาร์จ รวมถึงจุดตำหนิที่เห็นชัด',
      },
    ];
  }
  if (category === 'apple_surface') {
    return [
      {
        question: `${title} ดูชิปและความจุจากตรงไหน?`,
        answer: 'เปิด About This Mac แล้วส่งภาพหน้าจอที่เห็นชิปและความจุ หรือส่งรูปป้ายรุ่นประกอบ หากมีหลายความจุในชื่อการตลาดเดียวกัน',
      },
      {
        question: `${title} Battery Health ต่ำขายได้ไหม?`,
        answer: 'ประเมินได้ โดยแจ้งเปอร์เซ็นต์สุขภาพแบตและอาการชาร์จ จะช่วยให้กรอบราคาใกล้เคียงขึ้น',
      },
    ];
  }
  if (category === 'gaming') {
    return [
      {
        question: `${title} ต้องแจ้ง GPU แยกไหม?`,
        answer: 'ควรแจ้งจากหน้าจอระบบหรือ Task Manager เพราะรุ่นการตลาดเดียวกันอาจต่าง GPU และการประเมินอิงสเปกจริง',
      },
      {
        question: `${title} เครื่องร้อนหรือพัดลมดัง รับประเมินไหม?`,
        answer: 'รับประเมิน โดยแจ้งอาการและส่งวิดีโอสั้นถ้าได้ จะได้ไม่ประเมินคลาดเคลื่อนจากสภาพจริง',
      },
    ];
  }
  return [
    {
      question: `${title} ต้องมีกล่องและใบเสร็จไหม?`,
      answer: 'ไม่มีก็ประเมินได้ แต่ควรแจ้งความครบของอุปกรณ์และส่งรูปเครื่องกับสเปกให้ชัด',
    },
    {
      question: `${title} อัปเกรด RAM/SSD เองมีผลไหม?`,
      answer: 'อาจมีผลตามสเปกปัจจุบัน ควรแจ้งชิ้นส่วนที่อัปและส่งรูปหน้าจอระบบที่ใช้งานจริง',
    },
  ];
}

// Index all brands for child discovery
const files = fs.readdirSync(brandsDir).filter((f) => f.endsWith('.md'));
const index = files.map((f) => {
  const raw = fs.readFileSync(path.join(brandsDir, f), 'utf8');
  const { data } = parseFrontmatter(raw);
  const slug = data.slug || f.replace(/\.md$/, '');
  return {
    file: f,
    slug,
    title: data.title || slug,
    pageType: classify(slug),
    popularModels: Array.isArray(data.popularModels) ? data.popularModels : [],
    brand: brandOf(slug),
  };
});

const changed = [];
for (const item of index) {
  if (item.pageType !== 'Model' && item.pageType !== 'Series') continue;
  const abs = path.join(brandsDir, item.file);
  const raw = fs.readFileSync(abs, 'utf8');
  const { fm, data, body } = parseFrontmatter(raw);
  const words = thaiWordCount(`${data.description || ''}\n${body}`);
  const series = findSeries(item.slug, item.pageType);
  const category = categoryOf(item.slug, item.title);

  const alreadyMarked = /Series Authority Hub|ในมุมรับซื้อ/.test(body);
  // Models: only truly thin stubs. Mid-tier pages keep unique prose.
  const shouldEnrich = item.pageType === 'Model'
    ? words < 200 && !alreadyMarked
    : (words < 360 || (body.match(/^## /gm) || []).length < 3) && !alreadyMarked;

  if (!shouldEnrich) continue;

  const childModels = item.pageType === 'Series'
    ? index.filter((x) => x.pageType === 'Model' && findSeries(x.slug, 'Model') === item.slug)
    : [];

  let newBody;
  let mode;
  if (item.pageType === 'Model') {
    mode = 'replace';
    newBody = buildModelBody({
      title: item.title,
      slug: item.slug,
      popularModels: item.popularModels,
      brand: item.brand,
      series,
      category,
    });
  } else if (words < 200) {
    mode = 'replace';
    newBody = buildSeriesBody({
      title: item.title,
      slug: item.slug,
      popularModels: item.popularModels,
      brand: item.brand,
      childModels,
      category,
    });
  } else {
    // Preserve unique existing series prose; append hub sections only.
    mode = 'append';
    const appendix = [

      '',
      '## รุ่นในซีรีส์ที่เว็บมีหน้าแยก',
      childModels.length
        ? childModels.map((c) => `- [${c.title}](/รับซื้อโน๊ตบุ๊ค/${c.slug}/)`).join('\n')
        : '- ยังไม่มีหน้ารุ่นย่อยแยก — ส่งชื่อรุ่นย่อยจากเครื่องจริงมาประเมินได้โดยตรง',
      '',
      '## Series Authority Hub: สิ่งที่ต้องแจ้ง',
      `- ชื่อรุ่นย่อยเต็มของ ${item.title}`,
      '- CPU / GPU (ถ้ามี) / RAM / SSD จากหน้าจอระบบ',
      '- สภาพจอ บานพับ คีย์บอร์ด พอร์ต',
      '- ที่ชาร์จและอาการที่พบ',
      '',
      `> หน้านี้เป็น Series Authority Hub ของ ${item.title} ไม่ใช่หน้ารับซื้อทั่วไป และไม่ใช่หน้ารุ่นเดียวตายตัว`,
      '',
      '## ลิงก์แบรนด์และคู่มือ',
      `- [หน้าแบรนด์](/รับซื้อโน๊ตบุ๊ค/${item.brand}/)`,
      '- [รับซื้อโน๊ตบุ๊คมือสอง](/รับซื้อโน๊ตบุ๊คมือสอง/)',
      '- [วิธีดูสเปก CPU RAM SSD](/blog/วิธีดูสเปก-cpu-ram-ssd-ของโน๊ตบุ๊ค/)',
    ].join('\n');
    newBody = `${body.trim()}\n${appendix}\n`;
  }

  const faqs = uniqueFaqs(item.title, category, item.pageType === 'Series');
  const newFm = ensureFaqsInFrontmatter(fm.endsWith('\n') ? fm : `${fm}\n`, faqs);
  const next = `${newFm}\n${newBody.trim()}\n`;
  const nextWords = thaiWordCount(newBody);

  changed.push({
    slug: item.slug,
    pageType: item.pageType,
    mode,
    beforeWords: words,
    afterWords: nextWords,
    file: path.relative(root, abs).replaceAll('\\', '/'),
  });

  if (!dryRun) fs.writeFileSync(abs, next, 'utf8');
}

console.log(JSON.stringify({ dryRun, changed: changed.length, items: changed }, null, 2));
