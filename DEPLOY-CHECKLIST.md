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

### Cloudflare และ robots.txt (ข้อความ “Unknown directive” / Content-Signal)

ถ้าโดเมนผ่าน **Cloudflare proxy** และเปิดฟีเจอร์ **managed robots.txt** / **Control AI Crawlers** Cloudflare จะแทรกหรือรวมบรรทัดแบบ `Content-Signal: search=yes,ai-train=no` เข้าไปใน response ของ `/robots.txt` — **ไฟล์ `public/robots.txt` ใน repo ไม่ได้ผิด** แต่ Search Console / Lighthouse บางเวอร์ชันยังถือว่าเป็น directive ที่ parser ไม่รู้จัก

**ให้แจ้งเตือนหาย:** Cloudflare Dashboard → เลือกโซน →หน้า **Overview** → **Control AI Crawlers** → ปิดตัวเลือก **Display Content Signals Policy** (หรือปิดการให้ Cloudflare จัดการ robots.txt ถ้าต้องการให้เหลือแค่ไฟล์จาก origin เท่านั้น) — เอกสาร: [Managed robots.txt](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/)

**ถ้าต้องการเก็บการควบคุม AI crawler:** เปิดฟีเจอร์ต่อได้; Google ระบุว่าบรรทัดที่ parse ไม่ได้ใน robots.txt จะถูกข้าม — crawl ปกติยังใช้บรรทัด `Allow`/`Disallow`/`Sitemap` ที่ถูกต้องได้

### Markdown for Agents (`Accept: text/markdown`)

เว็บ Astro static ที่ deploy ผ่าน Coolify **ไม่แปลง HTML→Markdown ที่ origin** เอง — การให้เอเจนต์ได้ Markdown พร้อม `Content-Type: text/markdown` และหัวข้อ **`x-markdown-tokens`** (ถ้ามี) ทำที่ **Cloudflare edge** เมื่อเปิดฟีเจอร์นี้แล้วดึง HTML จาก origin มาแปลงให้คำขอที่มี content negotiation

**เงื่อนไข:** โดเมนต้องใช้ Cloudflare proxy และแผน **Pro, Business หรือ Enterprise** (หรือตามที่ระบุใน [เอกสาร ↗](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/#availability-and-pricing))

**เปิดใน Dashboard**

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → เลือกโซน  
2. **AI Crawl Control** (`/:account/:zone/ai`)  
3. เปิด **Markdown for Agents**

**เปิดด้วย API (ทางเลือก)**

```bash
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/content_converter" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {api_token}" \
  --data '{"value":"on"}'
```

ต้องการ token ที่มีสิทธิ์แก้ Zone Settings

**จำกัดเฉพาะ path/subdomain:** [Configuration Rules](https://developers.cloudflare.com/rules/configuration-rules/) → เพิ่ม setting **Markdown for Agents** = On ตาม expression ที่ต้องการ

**ทดสอบหลังเปิด**

```bash
curl -sS -D - "https://ร้านรับซื้อโน๊ตบุ๊ค.com/" -H "Accept: text/markdown" -o /dev/null
```

ควรเห็น `content-type: text/markdown` และบ่อยครั้งมี `x-markdown-tokens:` — มี `vary: accept`

**ตรวจว่าไซต์ผ่านเกณฑ์เอเจนต์:** [isitagentready.com](https://isitagentready.com/) — POST `/api/scan` with `{"url":"https://..."}` แล้วดู `checks.contentAccessibility.markdownNegotiation`

เอกสาร: [Markdown for Agents · Cloudflare](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)

**Checklist**

- [ ] โดเมนชี้ผ่าน Cloudflare proxy และแผนรองรับฟีเจอร์
- [ ] เปิด **Markdown for Agents** ใน AI Crawl Control (หรือ Configuration Rule เฉพาะ path)
- [ ] ทดสอบ `curl -H "Accept: text/markdown"` ได้ `content-type: text/markdown` และเมื่อเป็นไปได้มี `x-markdown-tokens`

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
