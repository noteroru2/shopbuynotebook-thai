## มาตรฐานรูปภาพสำหรับบทความ (Blog Images)

โปรเจกต์นี้รองรับรูปภาพ 2 ระดับ:

- **รูปแชร์ (OG image)**: ใช้ตอนแชร์ลิงก์บน Facebook/LINE/Twitter และเป็นค่าที่แนะนำให้มีทุกบทความ
- **รูปประกอบในเนื้อหา**: ใช้ช่วย UX/SEO โดยเฉพาะบทความแนว How-to/เช็กลิสต์

---

## 1) รูปแชร์ (OG image) — ควรมีทุกบทความ

ใน `src/content.config.ts` ของ collection `blog` รองรับ:

- `ogImage`: รูปสำหรับแชร์ (จะถูกส่งเข้า `<meta property="og:image">` และ Twitter card)
- `featuredImage`: ใช้เป็นรูปประกอบสำหรับ schema `BlogPosting.image` (ถ้ามี)

### แนะนำค่าเริ่มต้น (ทำให้ลงบทความได้เร็ว)

ถ้ายังไม่มีรูปเฉพาะบทความ ให้ใช้รูปกลางของเว็บไปก่อน:

- `ogImage: /images/rubsue-notebook-og.webp`

ตัวอย่าง frontmatter:

```md
---
title: ...
description: ...
date: 2026-05-05
category: ...
ogImage: /images/rubsue-notebook-og.webp
keywords: []
---
```

> หมายเหตุ: ถ้ากำหนดทั้ง `ogImage` และ `featuredImage` หน้า `/blog/[slug]` จะใช้ `ogImage` เป็นรูปแชร์ก่อนเสมอ

---

## 2) โฟลเดอร์และการตั้งชื่อไฟล์รูป (สำคัญ)

ให้เก็บรูปเป็นไฟล์ local ภายใน `public/` เท่านั้น (ไม่ hotlink)

มาตรฐานโฟลเดอร์:

- `public/images/blog/<slug>/...`

ตัวอย่าง:

- `public/images/blog/วิธีเช็คสุขภาพแบตโน๊ตบุ๊ค/cover.webp`
- `public/images/blog/วิธีเช็คสุขภาพแบตโน๊ตบุ๊ค/step-1.webp`
- `public/images/blog/วิธีเช็คสุขภาพแบตโน๊ตบุ๊ค/step-2.webp`

มาตรฐานชื่อไฟล์แนะนำ:

- **ปก/ภาพหลัก**: `cover.webp`
- **ขั้นตอน**: `step-1.webp`, `step-2.webp`, ...
- **ประกอบ**: `example-1.webp`, `example-2.webp`, ...

---

## 3) สเปกภาพที่แนะนำ (เพื่อความเร็วเว็บ)

- **ฟอร์แมตหลัก**: `.webp`
- **ขนาด OG image**: 1200×630 (อัตราส่วน 1.91:1)
- **รูปในบทความ**:
  - กว้าง 960px หรือ 1200px (พอสำหรับ desktop)
  - ทำไฟล์ไม่ให้ใหญ่เกินไป (แนะนำ ~150–300KB ต่อภาพ ถ้าทำได้)

---

## 4) วิธีใส่รูปในบทความ Markdown

### รูปประกอบในเนื้อหา

```md
![ตัวอย่างหน้าจอ Battery report บน Windows](/images/blog/<slug>/step-1.webp)
```

### รูปปกสำหรับแชร์ (แนะนำ)

```md
---
ogImage: /images/blog/<slug>/cover.webp
---
```

---

## 5) กฎ alt text (สำคัญกับ UX/SEO)

- เขียนเป็นภาษาไทยแบบ “บอกว่ารูปนี้ช่วยอะไร”
- หลีกเลี่ยงการยัดคีย์เวิร์ดซ้ำ ๆ

ตัวอย่างดี:

- `![ตัวอย่างหน้าจอ About/รุ่นเครื่องที่ควรถ่ายส่งประเมินราคา](/images/blog/.../step-1.webp)`

---

## 6) Checklist ก่อนส่งบทความขึ้นเว็บ

- [ ] มี `ogImage` อย่างน้อย 1 รูป (ใช้รูปกลางของเว็บได้)
- [ ] รูปอยู่ใน `public/images/blog/<slug>/`
- [ ] ชื่อไฟล์สื่อความหมาย (`cover.webp`, `step-1.webp`...)
- [ ] alt text มีความหมายและไม่ยัดคีย์

