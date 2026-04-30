import fs from "node:fs";
import path from "node:path";

const files = [
  "src/content/blog/ขายโน๊ตบุ๊คที่ไหนดี-ได้ราคาและปลอดภัย.md",
  "src/content/blog/ก่อนขายโน๊ตบุ๊คต้องล้างข้อมูลอย่างไร.md",
  "src/content/blog/วิธีดูรุ่นโน๊ตบุ๊ค-windows-ก่อนส่งประเมินราคา.md",
  "src/content/blog/วิธีดูสเปก-cpu-ram-ssd-ของโน๊ตบุ๊ค.md",
  "src/content/blog/โน๊ตบุ๊คเสียขายได้ไหม.md",
  "src/content/blog/โน๊ตบุ๊คเปิดไม่ติดขายได้ไหม.md",
  "src/content/blog/โน๊ตบุ๊คจอแตกยังมีราคาไหม.md",
  "src/content/blog/โน๊ตบุ๊คแบตเสื่อมขายได้ไหม.md",
  "src/content/blog/ขาย-macbook-ต้องเตรียมอะไรบ้าง.md",
  "src/content/blog/gaming-notebook-มือสองขายได้ราคาดีกว่าไหม.md",
];

function stripFrontmatter(s) {
  if (!s.startsWith("---")) return s;
  const idx = s.indexOf("\n---", 3);
  if (idx === -1) return s;
  const after = s.indexOf("\n", idx + 4);
  return after === -1 ? "" : s.slice(after + 1);
}

const segmenter = new Intl.Segmenter("th", { granularity: "word" });

function normalizeBody(raw) {
  return stripFrontmatter(raw)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/[#>*_\-]{1,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(raw) {
  const body = normalizeBody(raw);
  if (!body) return 0;
  let count = 0;
  for (const seg of segmenter.segment(body)) {
    if (seg.isWordLike) count += 1;
  }
  return count;
}

const cwd = process.cwd();
for (const file of files) {
  const abs = path.join(cwd, file);
  const raw = fs.readFileSync(abs, "utf8");
  const wc = countWords(raw);
  // eslint-disable-next-line no-console
  console.log(String(wc).padStart(5, " "), file);
}

