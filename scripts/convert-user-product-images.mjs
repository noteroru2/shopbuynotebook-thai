import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.length < 7) {
  throw new Error(
    'Usage: node scripts/convert-user-product-images.mjs <review1> <review2> <review3> <front> <keyboard> <back> <accessories>'
  );
}

const [review1, review2, review3, front, keyboard, back, accessories] = args;

await fs.mkdir('public/images/reviews', { recursive: true });
await fs.mkdir('public/images/photo-guide', { recursive: true });

const longPath = (p) => {
  if (process.platform !== 'win32') return p;
  if (!/^[A-Za-z]:\\/.test(p)) return p;
  if (p.startsWith('\\\\?\\')) return p;
  return `\\\\?\\${p}`;
};

const reviewOut = [
  { src: review1, out: 'public/images/reviews/rubsue-notebook-review-rog-strix.webp' },
  { src: review2, out: 'public/images/reviews/rubsue-notebook-review-asus-tuf.webp' },
  { src: review3, out: 'public/images/reviews/rubsue-notebook-review-macbook-air.webp' },
];

for (const it of reviewOut) {
  await sharp(longPath(it.src))
    .resize(640, 360, { fit: 'cover', position: 'attention' })
    .webp({ quality: 82 })
    .toFile(it.out);
}

const guideOut = [
  { src: front, out: 'public/images/photo-guide/rubsue-notebook-photo-front.webp' },
  { src: keyboard, out: 'public/images/photo-guide/rubsue-notebook-photo-keyboard.webp' },
  { src: back, out: 'public/images/photo-guide/rubsue-notebook-photo-back.webp' },
  { src: accessories, out: 'public/images/photo-guide/rubsue-notebook-photo-accessories.webp' },
];

for (const it of guideOut) {
  await sharp(longPath(it.src))
    .resize(600, 400, { fit: 'cover', position: 'attention' })
    .webp({ quality: 82 })
    .toFile(it.out);
}

console.log('ok');

