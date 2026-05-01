import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/count-thai-words.mjs <path.md>');
  process.exit(1);
}
const raw = fs.readFileSync(file, 'utf8');
const body = raw.replace(/^---[\s\S]*?---\s*/, '');
const seg = new Intl.Segmenter('th', { granularity: 'word' });
const words = [...seg.segment(body)].filter((s) => s.isWordLike).length;
console.log(JSON.stringify({ file, thWordLikeSegments: words, bodyChars: body.length }));
