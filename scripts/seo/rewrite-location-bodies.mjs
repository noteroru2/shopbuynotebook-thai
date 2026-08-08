/**
 * Rewrite location markdown bodies to reduce doorway/template footprint.
 * Keeps existing frontmatter; regenerates body only.
 * Preserves URL/slug. Does not invent branches or fake local facts.
 *
 * Usage: node scripts/seo/rewrite-location-bodies.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const locDir = path.resolve(__dirname, '../../src/content/locations');

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function splitFm(raw) {
  if (!raw.startsWith('---')) return { fm: '', body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { fm: '', body: raw };
  return { fm: raw.slice(0, end + 4), body: raw.slice(end + 4) };
}

function getFmField(fm, key) {
  const re = new RegExp(`^${key}:\\s*(.+)$`, 'm');
  const m = fm.match(re);
  return m ? m[1].replace(/^["']|["']$/g, '').trim() : '';
}

function getList(fm, key) {
  const re = new RegExp(`^${key}:\\n((?:  - .+\\n?)+)`, 'm');
  const m = fm.match(re);
  if (!m) return [];
  return m[1]
    .split('\n')
    .map((l) => l.replace(/^\s*-\s*/, '').trim())
    .filter(Boolean);
}

/** Cap district SEO lists — keep a short reference set only */
function cappedAreas(areas, n = 5) {
  return areas.slice(0, n);
}

const ARCHETYPES = [
  {
    id: 'metro-logistics',
    who: 'เหมาะกับผู้ที่ต้องการประเมินก่อนเลือกวิธีส่งมอบ เช่น ส่งรูปก่อน แล้วค่อยคุยเรื่องจุดนัดสาธารณะหรือขนส่งตามความสะดวก',
    focus: 'เน้นความชัดของข้อมูลรุ่น สเปก และรูปตำหนิ เพราะในพื้นที่ที่มีการเดินทางหนาแน่น การตกลงเงื่อนไขก่อนนัดช่วยลดเวลารอบสอง',
    prep: 'แนะนำเตรียมรุ่นจากสติ๊กเกอร์ฝาหลัง แคปสเปก และแจ้งโซนคร่าว ๆ เพื่อสอบถามวิธีรับเครื่องหลังประเมิน',
    faqExtra: (t) => ({
      q: `อยู่${t}ต้องนัดก่อนหรือส่งรูปอย่างเดียวก็ได้`,
      a: `ส่งรูปและข้อมูลก่อนได้เสมอ หลังได้กรอบราคาแล้วค่อยสอบถามวิธีนัดหรือจัดส่งตามพื้นที่ ตารางงาน และการยืนยันจากทีมงาน`,
    }),
  },
  {
    id: 'student-upgrade',
    who: 'เหมาะกับนักเรียน นักศึกษา หรือผู้ปกครองที่ต้องการขายเครื่องหลังจบเทอมหรืออัปเกรดสเปก',
    focus: 'มักเจอเครื่องใช้งานเรียน งานเอกสาร และเครื่องเกมมิ่งเบา ๆ จุดที่ควรแจ้งคือสุขภาพแบต การอัปเกรด RAM/SSD และรอยบานพับจากการพกพา',
    prep: 'สำรองงานเรียน ออกจากบัญชีโรงเรียน/มหาวิทยาลัยถ้ามี แล้วล้างข้อมูลก่อนส่งมอบ',
    faqExtra: (t) => ({
      q: `โน๊ตบุ๊คเรียนใน${t}ไม่มีกล่องขายได้ไหม`,
      a: `ขายประเมินได้ครับ แจ้งว่ามีหรือไม่มีกล่อง/ที่ชาร์จ จะได้ประเมินความครบของอุปกรณ์ตรงขึ้น`,
    }),
  },
  {
    id: 'office-fleet',
    who: 'เหมาะกับพนักงานออฟฟิศ ฟรีแลนซ์ หรือหน่วยงานที่มีเครื่องทำงานหลายเครื่องรอจัดการ',
    focus: 'ควรแยกส่งข้อมูลทีละเครื่อง ถ่ายสติ๊กเกอร์รุ่นให้ชัด และแจ้งว่ามี Asset Tag หรือรหัสเครื่ององค์กรหรือไม่',
    prep: 'ออกจากบัญชีองค์กร ล้างข้อมูล และรวบรวมที่ชาร์จของแต่ละเครื่องก่อนส่งประเมิน',
    faqExtra: (t) => ({
      q: `ขายโน๊ตบุ๊คบริษัทจาก${t}ต้องเตรียมอะไร`,
      a: `ส่งรูป รุ่น สเปก จำนวนเครื่อง และแจ้งสถานะบัญชี/Asset Tag แล้วสอบถามขั้นตอนหลังประเมินเบื้องต้น`,
    }),
  },
  {
    id: 'gaming-thermal',
    who: 'เหมาะกับผู้ขาย Gaming Notebook หรือเครื่องทำงานกราฟิกที่ใช้งานหนัก',
    focus: 'ราคาขึ้นกับ GPU รุ่นย่อย อุณหภูมิ/พัดลม สภาพช่องระบายอากาศ และอะแดปเตอร์วัตต์สูง',
    prep: 'ถ่ายช่องระบายอากาศ แจ้งรุ่น GPU จาก Task Manager หรือสติ๊กเกอร์ และถ่ายอะแดปเตอร์ให้เห็นวัตต์',
    faqExtra: (t) => ({
      q: `เครื่องเกมมิ่งใน${t}ร้อนจัดยังประเมินได้ไหม`,
      a: `ประเมินได้หากแจ้งอาการตรง ๆ แนะนำส่งวิดีโอสั้นตอนเปิดเครื่องหรือตอนเล่นหนักประกอบรูปสเปก`,
    }),
  },
  {
    id: 'remote-shipping',
    who: 'เหมาะกับผู้ที่อยู่ห่างจากหน้าร้านและสะดวกเริ่มจากประเมินออนไลน์ก่อนเลือกวิธีส่งเครื่อง',
    focus: 'เน้นแพ็กเครื่องให้ปลอดภัย มีเลขพัสดุ และยืนยันรายการอุปกรณ์ก่อนส่ง ราคาสุดท้ายยืนยันหลังตรวจของจริง',
    prep: 'ห่อกันกระแทก ถอดซิม/อุปกรณ์แยกถ้ามี และถ่ายรูปเครื่องก่อนแพ็กเก็บไว้เป็นหลักฐาน',
    faqExtra: (t) => ({
      q: `จาก${t}ส่งขนส่งมาประเมินได้ไหม`,
      a: `สอบถามขั้นตอนจัดส่งหลังประเมินเบื้องต้นได้ ควรตกลงเงื่อนไขและรายการของที่จะส่งให้ชัดก่อนแพ็ก`,
    }),
  },
  {
    id: 'condition-first',
    who: 'เหมาะกับผู้ที่มีเครื่องมีตำหนิหรือเสียบางอาการ แต่ยังอยากรู้มูลค่าก่อนตัดสินใจซ่อมหรือขาย',
    focus: 'ส่งรูปและวิดีโออาการสำคัญกว่าคำอธิบายยาว เช่น เปิดไม่ติด จอเป็นเส้น แบตบวม คีย์บอร์ดบางปุ่มเสีย',
    prep: 'อย่ารื้อเครื่องเองหากไม่ชำนาญ ถ่ายจุดเสียให้ชัด แล้วลิงก์ดูหน้าเงื่อนไขอาการที่เกี่ยวข้อง',
    faqExtra: (t) => ({
      q: `เครื่องเสียใน${t}ต้องซ่อมก่อนขายไหม`,
      a: `โดยทั่วไปส่งประเมินตามสภาพได้ หากอาการชัด แจ้งตรง ๆ มักช่วยตัดสินใจได้เร็วว่าควรซ่อมเองหรือขายตามสภาพ`,
    }),
  },
  {
    id: 'mac-apple-id',
    who: 'เหมาะกับผู้ขาย MacBook หรือเครื่องที่ผูกบัญชีผู้ใช้ ซึ่งต้องจัดการข้อมูลก่อนส่งมอบ',
    focus: 'ตรวจรุ่นชิป ปีเครื่อง Battery Health และสถานะ Apple ID/Find My หรือบัญชี Microsoft ตามระบบ',
    prep: 'สำรองข้อมูล ออกจากบัญชี และปิดการล็อกเครื่องก่อนนัดหรือส่งของ',
    faqExtra: (t) => ({
      q: `MacBook จาก${t}ติด Apple ID ขายได้ไหม`,
      a: `ต้องปลดล็อกได้ก่อนเพื่อความถูกต้องในการรับซื้อ แนะนำจัดการบัญชีให้เรียบร้อยก่อนส่งมอบ`,
    }),
  },
  {
    id: 'ubon-storefront',
    who: 'จังหวัดนี้เป็นที่ตั้งหน้าร้านจริง สามารถส่งรูปประเมินก่อน แล้วนัดเข้าตรวจที่ร้านตามคิว',
    focus: 'ยังต้องส่งรุ่น สเปก และรูปสภาพก่อนเข้าร้าน เพื่อให้เตรียมการตรวจได้ตรง',
    prep: 'นัดหมายก่อนเดินทางมา และเตรียมที่ชาร์จ/อุปกรณ์ที่มีมาด้วย',
    faqExtra: (t) => ({
      q: `ต้องเดินทางมาที่ร้าน${t}ก่อนไหม`,
      a: `แนะนำส่งรูปประเมินทาง LINE ก่อนเสมอ แล้วค่อยนัดเข้าตรวจที่หน้าร้านตามคิวที่ตกลง`,
    }),
  },
];

function pickArchetype(slug, title) {
  if (title === 'อุบลราชธานี' || slug === 'อุบลราชธานี') {
    return ARCHETYPES.find((a) => a.id === 'ubon-storefront');
  }
  return ARCHETYPES[hash(slug) % (ARCHETYPES.length - 1)]; // exclude ubon-only
}

function buildBody({ title, slug, region, areas, neighborsHint }) {
  const a = pickArchetype(slug, title);
  const isUbon = slug === 'อุบลราชธานี';
  const areaLine = cappedAreas(areas, 5);
  const regionLabel = region || 'พื้นที่ให้บริการ';

  const storeNote = isUbon
    ? `จังหวัด${title}เป็นที่ตั้งหน้าร้านจริงของร้านอำพล เทรดดิ้ง แนะนำส่งรูปประเมินก่อนทุกครั้ง แล้วนัดเข้าตรวจตามคิว`
    : `หน้าร้านจริงอยู่จังหวัดอุบลราชธานี จังหวัด${title}เป็นพื้นที่ให้บริการตามการนัดหมายหรือการจัดส่ง ไม่ใช่สาขาหรือสำนักงานประจำจังหวัด`;

  const areaBlock =
    areaLine.length > 0
      ? `รายชื่อด้านล่างใช้ระบุตำแหน่งคร่าว ๆ ตอนคุยในแชทเท่านั้น ไม่ได้หมายความว่ามีจุดบริการครบทุกแห่ง\n\n${areaLine.map((x) => `- ${x}`).join('\n')}`
      : `แจ้งอำเภอหรือโซนคร่าว ๆ ในแชทได้ เพื่อประกอบการสอบถามวิธีนัดหรือจัดส่ง`;

  return `## รับซื้อโน๊ตบุ๊คใน${title} — พื้นที่ให้บริการ

${storeNote}

ลูกค้าใน${title} (${regionLabel}) ส่งรูป รุ่น สเปก สภาพ/อาการ และอุปกรณ์ที่มีผ่าน LINE @webuy เพื่อประเมินเบื้องต้นได้ ราคาสุดท้ายยืนยันหลังตรวจเครื่องจริง

${a.who}

## จุดโฟกัสของการประเมินในพื้นที่นี้

${a.focus}

## สิ่งที่ควรส่งตอนขอราคา

1. รูปหน้าเครื่องตอนเปิดจอ
2. รูปคีย์บอร์ดและตัวเครื่องด้านข้าง/บานพับ
3. รูปฝาหลังหรือสติ๊กเกอร์รุ่น
4. สเปก CPU / RAM / SSD / GPU (ถ้ามี)
5. อาการหรือตำหนิที่พบแบบตรงไปตรงมา
6. อุปกรณ์ที่มี เช่น ที่ชาร์จ กล่อง ใบเสร็จ
7. อำเภอหรือโซนคร่าว ๆ ใน${title}

${a.prep}

## อ้างอิงพื้นที่สำหรับคุยนัด/จัดส่ง

${areaBlock}

การนัดรับขึ้นอยู่กับพื้นที่ ตารางงาน และการยืนยันจากทีมงาน ไม่ควรสรุปเองว่ามีบริการถึงที่ทุกจุดหรือใช้เวลาตายตัว

## เครื่องสภาพไหนส่งประเมินได้

รับประเมินทั้งเครื่องใช้งานปกติ เครื่องเก่า/ตกรุ่น Gaming Notebook MacBook และเครื่องเสียบางอาการ เช่น จอแตก เปิดไม่ติด แบตเสื่อม ไม่มีที่ชาร์จ โดยดูรุ่นและสภาพจริงเป็นหลัก

อ่านเพิ่ม: [เครื่องเสีย](/รับซื้อโน๊ตบุ๊ค/เครื่องเสีย/) · [จอแตก](/รับซื้อโน๊ตบุ๊ค/จอแตก/) · [เปิดไม่ติด](/รับซื้อโน๊ตบุ๊ค/เปิดไม่ติด/) · [แบตเสื่อม](/รับซื้อโน๊ตบุ๊ค/แบตเสื่อม/) · [มือสอง](/รับซื้อโน๊ตบุ๊คมือสอง/)

## ราคาขึ้นกับอะไร (ไม่ใช่ชื่อจังหวัดอย่างเดียว)

- รุ่นและปีเครื่อง
- CPU / GPU / RAM / ที่เก็บข้อมูล
- สภาพจอ บอดี้ บานพับ
- สุขภาพแบตเตอรี่
- ความครบของอุปกรณ์
- อาการที่แจ้งตรงกับของจริง
- ความต้องการตลาดช่วงนั้น

ดูแนวทางเปรียบเทียบได้ที่ [เช็คราคาโน๊ตบุ๊ค](/เช็คราคาโน๊ตบุ๊ค/) และวิธีคิดปัจจัยที่ [ตีราคาโน๊ตบุ๊ค](/ตีราคาโน๊ตบุ๊ค/)

## ขั้นตอนหลังประเมินเบื้องต้น

1. แอดไลน์ @webuy ส่งข้อมูลตามรายการด้านบน
2. รับกรอบราคาเบื้องต้น
3. สอบถามวิธีนัดหรือจัดส่งที่เหมาะกับ${title}
4. ตรวจเครื่องจริงและยืนยันราคา
5. ชำระเงินตามเงื่อนไขที่ตกลง — ลูกค้าไม่จำเป็นต้องขายหากไม่ตรงเงื่อนไข

ภาพรวมบริการหลักอยู่ที่ [หน้าแรก](/) และรายการพื้นที่ที่ [พื้นที่ให้บริการ](/พื้นที่ให้บริการ/)

${neighborsHint ? `## พื้นที่ใกล้เคียง\n\n${neighborsHint}\n` : ''}
## คำถามเฉพาะบริบท${title}

**${a.faqExtra(title).q}**

${a.faqExtra(title).a}

---

แอดไลน์ [@webuy](https://line.me/R/ti/p/@webuy) หรือโทร 0642579353
`;
}

function sanitizeFrontmatterFaqs(fm, title) {
  // Remove same-day / guaranteed meetup claims if present in YAML answers
  return fm
    .replace(/นัดภายในวันเดียวหรือวันถัดไปได้[^\n]*/g, 'การนัดขึ้นอยู่กับพื้นที่ ตารางงาน และการยืนยันจากทีมงาน')
    .replace(/ถึงภายใน\s*\d+\s*นาที[^\n]*/g, 'สอบถามรอบนัดหลังประเมินเบื้องต้น')
    .replace(new RegExp(`ทำไมคนใน${title}ถึงเลือก`, 'g'), `แนวทางขายโน๊ตบุ๊คใน${title}`);
}

function neighborFromBody(oldBody) {
  const m = oldBody.match(/## จังหวัดใกล้เคียง[\s\S]*?\n\n([^\n#]+)/);
  if (!m) return '';
  const line = m[1].trim();
  if (line.includes('](/รับซื้อโน๊ตบุ๊ค/')) return line;
  return '';
}

let changed = 0;
for (const name of fs.readdirSync(locDir)) {
  if (!name.endsWith('.md')) continue;
  const file = path.join(locDir, name);
  const raw = fs.readFileSync(file, 'utf8');
  const { fm: fm0, body: oldBody } = splitFm(raw);
  if (!fm0) continue;
  let fm = sanitizeFrontmatterFaqs(fm0, getFmField(fm0, 'title') || name.replace(/\.md$/, ''));
  const title = getFmField(fm, 'title') || name.replace(/\.md$/, '');
  const slug = getFmField(fm, 'slug') || title;
  const region = getFmField(fm, 'region');
  const areas = getList(fm, 'subAreas');
  // Cap subAreas in frontmatter to reduce doorway-style district stuffing
  if (areas.length > 6) {
    const kept = areas.slice(0, 6);
    fm = fm.replace(
      /^subAreas:\n(?:  - .+\n?)+/m,
      `subAreas:\n${kept.map((a) => `  - ${a}`).join('\n')}\n`,
    );
  }
  const neighborsHint = neighborFromBody(oldBody);
  const body = buildBody({
    title,
    slug,
    region,
    areas: getList(fm, 'subAreas'),
    neighborsHint,
  });
  const next = `${fm}\n${body}`;
  if (next !== raw) {
    fs.writeFileSync(file, next, 'utf8');
    changed++;
  }
}

console.log(JSON.stringify({ rewritten: changed, dir: locDir }, null, 2));
