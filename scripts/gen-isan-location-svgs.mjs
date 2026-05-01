/**
 * สร้างไฟล์ SVG สำหรับ featuredImage / Open Graph แต่ละจังหวัดภาคอีสาน + หน้า hub
 * รัน: node scripts/gen-isan-location-svgs.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PROVINCES, ISAN_SVG_BASE } from './isan-provinces-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'images', 'locations');

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hues(fileBase) {
  let h = 0;
  for (let i = 0; i < fileBase.length; i++) h = (Math.imul(31, h) + fileBase.charCodeAt(i)) >>> 0;
  const hue1 = h % 360;
  const hue2 = (h * 11 + 73) % 360;
  return { hue1, hue2 };
}

function laptopGraphic() {
  return `
  <g opacity="0.92" aria-hidden="true">
    <rect x="820" y="420" width="320" height="22" rx="8" fill="rgba(255,255,255,0.14)"/>
    <rect x="860" y="140" width="240" height="280" rx="14" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.28)" stroke-width="2"/>
    <rect x="880" y="160" width="200" height="120" rx="4" fill="rgba(255,255,255,0.12)"/>
  </g>`;
}

function provinceSvg(title, fileBase) {
  const { hue1, hue2 } = hues(fileBase);
  const gid = `g-${fileBase.replace(/[^a-z0-9-]/gi, '')}`;
  const line1 = `รับซื้อโน๊ตบุ๊ค${title}`;
  const line2 = 'ส่งรูปประเมินก่อนนัด · ไลน์ @webuy · โทร 0642579353';
  const line3 = 'ร้านรับซื้อโน๊ตบุ๊ค.com · ภาคอีสาน';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escapeXml(line1)}">
  <defs>
    <linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue1} 42% 24%)"/>
      <stop offset="100%" style="stop-color:hsl(${hue2} 48% 12%)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#${gid})"/>
  <text x="64" y="200" fill="#f8fafc" font-size="52" font-weight="700" font-family="'Sarabun','Noto Sans Thai',system-ui,sans-serif">${escapeXml(line1)}</text>
  <text x="64" y="278" fill="#cbd5e1" font-size="28" font-family="'Sarabun','Noto Sans Thai',system-ui,sans-serif">${escapeXml(line2)}</text>
  <text x="64" y="330" fill="#94a3b8" font-size="22" font-family="'Sarabun','Noto Sans Thai',system-ui,sans-serif">${escapeXml(line3)}</text>
  ${laptopGraphic()}
</svg>`;
}

function hubSvg() {
  const fileBase = 'isan-region-hub';
  const { hue1, hue2 } = hues(fileBase);
  const gid = 'g-isan-region-hub';
  const line1 = 'รับซื้อโน๊ตบุ๊คภาคอีสาน';
  const line2 = 'ครบ 20 จังหวัด · ส่งรูปประเมินก่อนนัด · ไลน์ @webuy · โทร 0642579353';
  const line3 = 'ร้านรับซื้อโน๊ตบุ๊ค.com';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escapeXml(line1)}">
  <defs>
    <linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue1} 42% 24%)"/>
      <stop offset="100%" style="stop-color:hsl(${hue2} 48% 12%)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#${gid})"/>
  <text x="64" y="200" fill="#f8fafc" font-size="52" font-weight="700" font-family="'Sarabun','Noto Sans Thai',system-ui,sans-serif">${escapeXml(line1)}</text>
  <text x="64" y="278" fill="#cbd5e1" font-size="28" font-family="'Sarabun','Noto Sans Thai',system-ui,sans-serif">${escapeXml(line2)}</text>
  <text x="64" y="330" fill="#94a3b8" font-size="22" font-family="'Sarabun','Noto Sans Thai',system-ui,sans-serif">${escapeXml(line3)}</text>
  ${laptopGraphic()}
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

for (const p of PROVINCES) {
  const base = ISAN_SVG_BASE[p.slug];
  const svg = provinceSvg(p.title, base);
  fs.writeFileSync(path.join(outDir, `${base}.svg`), svg, 'utf8');
}

fs.writeFileSync(path.join(outDir, 'isan-region-hub.svg'), hubSvg(), 'utf8');

console.log('Wrote', PROVINCES.length, 'province SVGs + isan-region-hub.svg →', outDir);
