import sharp from 'sharp';
import fs from 'node:fs/promises';

const [cashSrc, shopSrc, teamSrc] = process.argv.slice(2);
if (!cashSrc || !shopSrc || !teamSrc) {
  throw new Error('Usage: node scripts/convert-trust-images.mjs <cash.png> <shop.png> <team.png>');
}

await fs.mkdir('public/images/trust', { recursive: true });

const inputs = [
  { src: cashSrc, base: 'rubsue-notebook-trust-cash-payment' },
  { src: shopSrc, base: 'rubsue-notebook-trust-real-shopfront' },
  { src: teamSrc, base: 'rubsue-notebook-trust-team-checking' },
];

for (const it of inputs) {
  await sharp(it.src)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`public/images/trust/${it.base}.webp`);

  await sharp(it.src)
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(`public/images/trust/${it.base}-640.webp`);
}

console.log('ok');

