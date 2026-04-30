import sharp from 'sharp';
import fs from 'node:fs/promises';

const [src] = process.argv.slice(2);
if (!src) throw new Error('Usage: node scripts/make-logo-transparent.mjs <logo.png>');

await fs.mkdir('public/images', { recursive: true });

const input = sharp(src).ensureAlpha();
const { data, info } = await input.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
if (channels !== 4) throw new Error(`Expected RGBA (4 channels), got ${channels}`);

// Flood-fill from edges to remove near-black background only.
// This preserves dark pixels inside the logo that are not connected to edges.
const idx = (x, y) => (y * width + x) * 4;
const visited = new Uint8Array(width * height);
const qx = new Int32Array(width * height);
const qy = new Int32Array(width * height);
let qh = 0;
let qt = 0;

const isBg = (x, y) => {
  const i = idx(x, y);
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  // near-black threshold
  return r <= 28 && g <= 28 && b <= 28;
};

const push = (x, y) => {
  const p = y * width + x;
  if (visited[p]) return;
  visited[p] = 1;
  qx[qt] = x;
  qy[qt] = y;
  qt++;
};

// Seed edges
for (let x = 0; x < width; x++) {
  if (isBg(x, 0)) push(x, 0);
  if (isBg(x, height - 1)) push(x, height - 1);
}
for (let y = 0; y < height; y++) {
  if (isBg(0, y)) push(0, y);
  if (isBg(width - 1, y)) push(width - 1, y);
}

while (qh < qt) {
  const x = qx[qh];
  const y = qy[qh];
  qh++;
  const i = idx(x, y);
  data[i + 3] = 0; // alpha 0 for background

  // 4-neighbors
  if (x > 0 && isBg(x - 1, y)) push(x - 1, y);
  if (x < width - 1 && isBg(x + 1, y)) push(x + 1, y);
  if (y > 0 && isBg(x, y - 1)) push(x, y - 1);
  if (y < height - 1 && isBg(x, y + 1)) push(x, y + 1);
}

const transparent = sharp(data, { raw: { width, height, channels: 4 } });

await transparent
  .resize({ width: 420, withoutEnlargement: true })
  .webp({ quality: 90, alphaQuality: 90 })
  .toFile('public/images/logo-ranrubsue-notebook-transparent.webp');

await transparent
  .resize({ width: 280, withoutEnlargement: true })
  .webp({ quality: 88, alphaQuality: 90 })
  .toFile('public/images/logo-ranrubsue-notebook-transparent-280.webp');

console.log('ok');

