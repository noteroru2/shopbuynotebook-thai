# Deploy Checklist — ร้านรับซื้อโน๊ตบุ๊ค.com (Coolify)

ใช้ก่อนเปิด production จริง ทำเครื่องหมาย `[x]` เมื่อครบ

## Build

- [ ] `npm install` (Node **20** — มี `.nvmrc` = `20`)
- [ ] `npm run build` ผ่านไม่มี error
- [ ] โฟลเดอร์ `dist/` ถูกสร้างครบ

## Coolify

- [ ] **Build command**: `npm run build`
- [ ] **Output / publish directory**: `dist`
- [ ] Runtime: **Static site** (ไม่ต้องรัน Node server ถ้า deploy แบบ static)
- [ ] ตั้ง **โดเมน + SSL** ให้ชี้มาที่ Coolify และรองรับ IDN (`ร้านรับซื้อโน๊ตบุ๊ค.com`) / punycode ตาม DNS

## SEO

- [ ] `public/robots.txt` — `Allow: /` และ `Sitemap` ชี้ `https://ร้านรับซื้อโน๊ตบุ๊ค.com/sitemap-index.xml`
- [ ] หลัง build มี `dist/sitemap-index.xml` (+ ไฟล์ sitemap ย่อยที่ Astro gen)
- [ ] `canonical` เป็นค่าเต็ม (absolute) และใช้ **trailing slash** สอดคล้อง `trailingSlash: 'always'` ใน `astro.config.mjs`
- [ ] `title` / `meta description` ไม่ซ้ำกันทุกหน้าโดยไม่จำเป็น
- [ ] หน้า **404** ตั้ง `noindex` แล้ว (`404.astro`)
- [ ] ส่ง Sitemap ใน **Google Search Console** (และ Bing Webmaster ถ้าใช้)

## Schema

- [ ] ทดสอบ JSON-LD ใน Rich Results Test / validator ว่าไม่ error
- [ ] **ไม่**ใส่ `aggregateRating` ปลอม / รีวิวปลอม / ที่อยู่ปลอม / ราคาเทียม
- [ ] `telephone` = `0642579353`, LINE `https://line.me/R/ti/p/@webuy`, `sameAs` ตาม `src/config/site.ts` (Facebook, TikTok, Maps)

## AEO / GEO

- [ ] `public/llms.txt` สอดคล้องบริการจริง (keyword, พื้นที่, วิธีประเมิน, ล้างข้อมูล / Apple ID)
- [ ] Hub `/คำถามที่พบบ่อย/` และหน้า hub บริการครอบคลุม intent หลัก

## Local SEO

- [ ] Google Business Profile — สร้าง/เชื่อมและให้ NAP ตรงกับเว็บ (ชื่อแบรนด์เว็บ + เบอร์ + LINE)
- [ ] เพิ่มรูปจริง / โพสต์ / หมวดบริการในโปรไฟล์ธุรกิจตามเหมาะสม

## Content ที่เจ้าของเว็บควรแก้เอง

- [ ] รีวิวจริงที่ยืนยันได้ (ไม่คัดลอกรีวิวจาก Google โดยไม่ได้รับอนุญาต)
- [ ] รูปถ่ายจริงของร้าน/ทีม (ถ้าต้องการ)
- [ ] เงื่อนไขรับซื้อ / ขั้นตอนนัดรับ–ส่ง / ช่องทางจ่ายเงินให้ตรงการทำงานจริง
- [ ] พื้นที่รับซื้อจริง — ถ้าจำกัดโซน ให้ปรับ `src/data/service-areas.ts` และเนื้อหาที่เกี่ยวข้อง
- [ ] เวลาทำการจริง — แสดงในเว็บ/schema เมื่อยืนยันแล้ว
- [ ] URL โซเชียลจริง — Facebook/TikTok ใน `site.ts` ให้ทดสอบว่ายังใช้ได้; YouTube อย่าใส่ใน schema จนกว่าจะมีช่องจริง

## Backlink หลัง Deploy

- [ ] Facebook Page / LINE OA profile / TikTok ที่ใช้งานจริง
- [ ] YouTube (ถามมี)
- [ ] Business directory / พาร์ทเนอร์ร้านซ่อม / guest post ตามแผน

## Decap CMS (`/admin/`)

- [ ] Production: ปรับ `public/admin/config.yml` **backend** จาก `git-gateway` + `local_backend` เป็น GitHub/GitLab + identity ที่ deploy ได้จริง
- [ ] ปลดคอมเมนต์ `repo:` และตั้ง OAuth / secrets ใน Coolify (ไม่ commit credential)

## PWA / Icons (optional)

- [ ] `manifest.webmanifest` ปัจจุบันใช้ `/favicon.svg` เท่านั้น — ถ้าต้องการ “ติดตั้งแอป” สวยบนมือถือ แนะนำเพิ่ม `icon-192.png` / `icon-512.png`

## ไฟล์ static ใน `dist` (ควรมีหลัง build)

- [ ] `/robots.txt`
- [ ] `/sitemap-index.xml`
- [ ] `/rss.xml`
- [ ] `/llms.txt`
- [ ] `/humans.txt`
- [ ] `/manifest.webmanifest`
- [ ] `/404.html`
- [ ] `/favicon.svg`

## Location pages (ขยายต่อได้)

- [ ] มี `/พื้นที่ให้บริการ/` และ `/รับซื้อโน๊ตบุ๊ค/กรุงเทพ/` และหน้า location ที่มีใน `src/content/locations/` แล้ว
- [ ] ถ้าต้องการครบทุกจังหวัดใน brief — เพิ่มหน้า location ทีละจังหวัดพร้อมเนื้อหาไม่ซ้ำเป๊ะ (ไม่บังคับ auto-gen ทั้งหมดในครั้งเดียว)
