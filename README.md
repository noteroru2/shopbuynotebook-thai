# ร้านรับซื้อโน๊ตบุ๊ค.com — Static SEO Website (Astro + Tailwind + Decap CMS)

โปรเจกต์นี้เป็นเว็บไซต์ Static (mobile-first) สำหรับธุรกิจ “ร้านรับซื้อโน๊ตบุ๊ค.com” เน้น SEO keyword หลัก “รับซื้อโน๊ตบุ๊ค”
พร้อมระบบคอนเทนต์ผ่าน **Astro Content Collections** และ **Decap CMS** สำหรับเพิ่มบทความ/หน้า SEO ภายหลัง

## โครงสร้างหลัก

```text
src/
  content/
    content.config.ts
    blog/
    brands/
    conditions/
    locations/
    reviews/
  layouts/
    BaseLayout.astro
    ServiceLayout.astro
    BlogLayout.astro
    BrandLayout.astro
    LocationLayout.astro
  components/
    Header.astro
    Footer.astro
    Hero.astro
    CTAButtons.astro
    StickyMobileCTA.astro
    TrustBadges.astro
    BrandGrid.astro
    ConditionGrid.astro
    PriceFactors.astro
    ProcessSteps.astro
    ReviewCards.astro
    FAQ.astro
    Breadcrumbs.astro
    JsonLd.astro
  pages/
    index.astro
    รับซื้อโน๊ตบุ๊คมือสอง.astro
    รับซื้อ-notebook.astro
    ขายโน๊ตบุ๊ค.astro
    เช็คราคาโน๊ตบุ๊ค.astro
    ตีราคาโน๊ตบุ๊ค.astro
    เกี่ยวกับเรา.astro
    ติดต่อเรา.astro
    นโยบายความเป็นส่วนตัว.astro
    blog/
      index.astro
      [...slug].astro
    รับซื้อโน๊ตบุ๊ค/
      index.astro
      [slug].astro
    พื้นที่ให้บริการ/
      index.astro
    คำถามที่พบบ่อย/
      index.astro
    วิธีขายโน๊ตบุ๊ค/
      index.astro
    404.astro
public/
  admin/
    index.html
    config.yml
  robots.txt
  llms.txt
  humans.txt
  manifest.webmanifest
  icons/
  images/
```

## ติดตั้งและรัน

```bash
npm install
npm run dev
```

เปิด `http://localhost:4321`

## Build / Preview

```bash
npm run build
npm run preview
```

ผลลัพธ์จะอยู่ที่โฟลเดอร์ `dist/`

## Deploy บน Coolify (Static Site)

- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Node version**: 20 (ดูไฟล์ `.nvmrc`)

หมายเหตุ: ใน `astro.config.mjs` ตั้งค่า `site` เป็น `https://ร้านรับซื้อโน๊ตบุ๊ค.com/` เพื่อให้ sitemap/canonical ถูกต้อง

## เพิ่ม/แก้บทความและหน้า SEO

- **Blog**: เพิ่มไฟล์ `.md` หรือ `.mdx` ที่ `src/content/blog/`
- **Brand pages**: `src/content/brands/`
- **Condition pages**: `src/content/conditions/`
- **Location pages**: `src/content/locations/`
- **Reviews**: `src/content/reviews/*.json`

## ตั้งค่าเบอร์โทร/LINE/โซเชียล

แก้ได้ที่ไฟล์ `src/config/site.ts` (แหล่งข้อมูลกลาง)

- `telephone`: เบอร์โทร
- `lineUrl`: ลิงก์ LINE
- `sameAs`: ลิงก์ Facebook/YouTube/TikTok placeholder
- `serviceAreaGroups` / `areaServed`: พื้นที่ให้บริการ (ใช้ทั้งหน้าเว็บ + schema)

## Decap CMS (เพิ่มคอนเทนต์ผ่านหน้า Admin)

เข้า ` /admin/ `

ไฟล์สำคัญ:
- `public/admin/index.html`
- `public/admin/config.yml`

โปรเจกต์นี้ตั้งค่า backend (`git-gateway`) — ก่อนใช้งานจริงต้อง:
- เปลี่ยนเป็น `github` และตั้งค่า `repo: owner/repo` (หรือใช้ git-gateway ตามระบบที่ deploy)
- ตั้งค่า auth/OAuth และสิทธิ์การเขียนไฟล์ใน repo

## SEO / AEO / GEO Guide (Operating)

- **ไฟล์สำคัญด้าน SEO/AEO/GEO**
  - `public/robots.txt` (ชี้ sitemap)
  - `public/llms.txt` (AEO/GEO สำหรับ LLM/answer engines)
  - `public/humans.txt`
  - `public/manifest.webmanifest` (PWA metadata)
  - `src/lib/schema.ts` (Organization/WebSite/WebPage/BlogPosting/ItemList helpers)
  - hub pages: `/รับซื้อโน๊ตบุ๊ค/`, `/พื้นที่ให้บริการ/`, `/คำถามที่พบบ่อย/`, `/วิธีขายโน๊ตบุ๊ค/`
- **วิธีตรวจ build**
  - `npm run build` แล้วเช็กไฟล์ใน `dist/` (รวม sitemap)
- **ตรวจ schema**
  - ใช้ Rich Results Test/Schema Validator กับหน้าหลัก/หน้า service/หน้า blog
- **ก่อนขึ้นโปรดักชัน**
  - ใส่รูปจริง/เคสจริง/รีวิวจริงเพิ่ม
  - เพิ่มไอคอน PWA: `public/icons/icon-192.png`, `public/icons/icon-512.png` (ตอนนี้ manifest ชี้ไว้ แต่ยังไม่ได้ใส่ไฟล์)

ดู checklist เพิ่มเติม: `SEO-CHECKLIST.md` และ `KEYWORD-MAP.md`

## โลโก้แบรนด์ (Brand Logos)

Brand data อยู่ที่ `src/data/brands.ts` และถูกนำไปแสดงใน `src/components/BrandGrid.astro`

ค่าเริ่มต้นของ UI จะใช้ **text-logo** (`displayLogo`) เพื่อหลีกเลี่ยงการพึ่งโลโก้ทางการ/ลิขสิทธิ์โดยไม่จำเป็น
แต่รองรับ `logo` (ไฟล์ local) ได้ถ้าต้องการเปลี่ยนเป็น SVG จริงภายหลัง

- **ใช้ไฟล์ local เท่านั้น**: ห้าม hotlink จากเว็บภายนอก
- **เปลี่ยนโลโก้ภายหลังได้ง่าย**: แค่นำไฟล์ SVG ที่ถูกต้องมา “แทน” ชื่อเดิม เช่น `apple.svg`, `asus.svg`, `microsoft.svg`
- **ข้อควรระวังเรื่องลิขสิทธิ์/CI brand**: ถ้าไม่ต้องการใช้โลโก้ทางการ แนะนำใช้ **text-logo placeholder** (ที่ทำไว้ใน repo) แทน

ไฟล์ placeholder ที่เตรียมไว้:
- `apple.svg`, `asus.svg`, `acer.svg`, `lenovo.svg`, `dell.svg`, `hp.svg`, `msi.svg`, `microsoft.svg`, `gaming.svg`

## เพิ่มแบรนด์ใหม่ใน BrandGrid

แก้ที่ไฟล์ `src/data/brands.ts` ในตัวแปร `BRANDS`:

- เพิ่ม `name`, `slug`, `href`, `models`
- ใส่ `displayLogo` เป็น text-logo (เช่น `ASUS`, ` MacBook`, `Surface`)
- ถ้าต้องการใช้โลโก้จริง ให้ใส่ `logo: '/images/brands/<file>.svg'` (ต้องเป็นไฟล์ local)
- กำหนด `alt` เป็นภาษาไทย เช่น “รับซื้อโน๊ตบุ๊ค <แบรนด์> มือสอง”

# shopbuynotebook-thai
