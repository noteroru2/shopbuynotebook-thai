import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const errors = [];

for (const p of [
  'src/data/rebuild-v2-trust-proof.json',
  'src/components/TrustProof.astro',
  'src/pages/เกี่ยวกับเรา.astro',
  'src/components/Footer.astro',
  'src/components/TrustBadges.astro',
  'src/lib/schema.ts',
]) if (!fs.existsSync(path.join(root, p))) errors.push(`Missing R11 file: ${p}`);

const proof = JSON.parse(read('src/data/rebuild-v2-trust-proof.json'));
if (proof.version !== 'R11') errors.push('Trust proof manifest must be R11');
if (proof.entity.operatorLegalName !== 'บริษัท อำพล เทรดดิ้ง จำกัด') errors.push('Unexpected legal operator identity');
if (proof.entity.physicalStoreName !== 'ร้านอำพล เทรดดิ้ง') errors.push('Unexpected physical store identity');
if (proof.entity.storeLocation !== 'อุบลราชธานี') errors.push('Physical store location must remain Ubon Ratchathani');
if (!proof.proofRules?.some((x) => x.includes('Do not invent'))) errors.push('R11 must explicitly prohibit invented trust claims');

const trustComponent = read('src/components/TrustProof.astro');
for (const token of ['SITE.companyLegalName','SITE.physicalStoreName','SITE.googleMapsUrl','ราคาประเมินเบื้องต้นไม่ใช่ราคาสุดท้าย','/เกี่ยวกับเรา/','/ขั้นตอนและเงื่อนไขการให้บริการ/']) {
  if (!trustComponent.includes(token)) errors.push(`TrustProof missing token: ${token}`);
}

const about = read('src/pages/เกี่ยวกับเรา.astro');
for (const token of ['<TrustProof','SITE.companyLegalName','SITE.physicalStoreName','ไม่ยืนยันราคาสุดท้ายก่อนตรวจเครื่องจริง','เว็บไซต์ไม่อ้างว่ามีหน้าร้านหลายจังหวัด']) {
  if (!about.includes(token)) errors.push(`About page missing R11 evidence token: ${token}`);
}

const footer = read('src/components/Footer.astro');
if (!footer.includes('/เกี่ยวกับเรา/')) errors.push('Footer must expose operator transparency page');
if (!footer.includes('ผู้ดำเนินเว็บไซต์')) errors.push('Footer must identify website operator');

const badges = read('src/components/TrustBadges.astro');
for (const forbidden of ['ตอบไว','ประเมินฟรี','จ่ายเงินสดหรือโอนชำระเงิน']) {
  if (badges.includes(forbidden)) errors.push(`TrustBadges retains unsupported marketing claim: ${forbidden}`);
}

const schema = read('src/lib/schema.ts');
for (const token of ['contactPoint',"'@id': `${SITE.url}#organization`",'publisher: { \'@id\': `${SITE.url}#organization` }']) {
  if (!schema.includes(token)) errors.push(`Schema missing R11 entity reference: ${token}`);
}

if (errors.length) {
  console.error('REBUILD V2 R11 GATE: FAIL');
  errors.forEach((e) => console.error(`- ${e}`));
  process.exit(1);
}
console.log('REBUILD V2 R11 GATE: PASS');
console.log('- Operator identity is centralized and visible');
console.log('- Physical storefront remains Ubon-only');
console.log('- Valuation limitations are explicit');
console.log('- Unsupported trust-marketing claims are blocked');
console.log('- Blog/WebPage schema references the same Organization entity');
