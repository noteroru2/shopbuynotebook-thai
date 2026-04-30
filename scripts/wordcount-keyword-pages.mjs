import fs from "node:fs";
import path from "node:path";

const files = [
  // service pages (secondary keywords)
  "src/pages/รับซื้อโน๊ตบุ๊คมือสอง.astro",
  "src/pages/รับซื้อ-notebook.astro",
  "src/pages/ขายโน๊ตบุ๊ค.astro",
  "src/pages/เช็คราคาโน๊ตบุ๊ค.astro",
  "src/pages/ตีราคาโน๊ตบุ๊ค.astro",

  // hub pages
  "src/pages/รับซื้อโน๊ตบุ๊ค/index.astro",
  "src/pages/วิธีขายโน๊ตบุ๊ค/index.astro",
  "src/pages/พื้นที่ให้บริการ/index.astro",
  "src/pages/คำถามที่พบบ่อย/index.astro",
];

function stripFrontmatterIfAny(s) {
  // Support both Markdown frontmatter and Astro frontmatter (--- ... --- at top)
  if (!s.startsWith("---")) return s;
  const idx = s.indexOf("\n---", 3);
  if (idx === -1) return s;
  const after = s.indexOf("\n", idx + 4);
  return after === -1 ? "" : s.slice(after + 1);
}

function normalizeBody(raw) {
  // Astro/MD-ish cleanup: remove code blocks and most tags/attrs
  return stripFrontmatterIfAny(raw)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    // Remove inline Astro/JS expressions without eating large spans
    .replace(/\{[^}]*\}/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/[#>*_\-]{1,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const segmenter = new Intl.Segmenter("th", { granularity: "word" });

function countThaiWords(raw) {
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
  const wc = countThaiWords(raw);
  // eslint-disable-next-line no-console
  console.log(String(wc).padStart(5, " "), file);
}

