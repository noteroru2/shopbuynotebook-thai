# Metadata

## Improved

- Money pages: title/H1/description แยก intent (ไม่ copy-paste คำว่า “รับซื้อโน๊ตบุ๊ค” อย่างเดียว)
- Conditions: `seoTitle` / `pageH1` เฉพาะอาการ (จากรอบ remediation ก่อนหน้า + deepen รอบนี้)
- Locations: `seoTitle` คง slug จังหวัด; body ไม่ทำลาย frontmatter
- Brands/models select: เติม `pageH1` / description ที่ขาด

## Unchanged

- Canonical self-URL pattern `https://ร้านรับซื้อโน๊ตบุ๊ค.com{path}/`
- Combo Tier C: `noindex,nofollow` via layout (`[location]/[slug].astro`)
- Admin CMS shell noindex (prior SEO batch)

## Gate checks

`content-quality-gate.mjs` flags: missing_title / missing_h1 / missing_description / fake_claim / placeholder

Local result: **349 PASS** (collections brands/conditions/locations/blog)

## Deferred

- Full SERP CTR rewrite ทุก title
- Open Graph image audit ทั้งไซต์
