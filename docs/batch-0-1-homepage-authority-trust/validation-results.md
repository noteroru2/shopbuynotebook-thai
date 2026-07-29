# Validation Results

## Astro check

- Result: PASS
- Files checked: 96
- Errors: 0
- Warnings: 0
- Hints: 85 (deprecation/unused hints เดิม ไม่ใช่ build warnings)

## Production build

- Result: PASS
- Built pages: 2,460
- CSS keyframe warning: ไม่พบ
- Sitemap generated: PASS

## SEO validator

- HTML artifacts: 2,462
- Indexable: 371
- Noindex: 2,090
- Sitemap URLs: 371
- Broken internal links: 0
- Duplicate titles/descriptions: 0/0
- Errors: 0
- Warnings: 1 (orphan URLs 2 รายการที่ถอดออกจาก navigation ตามคำสั่ง)

## Visual QA

พยายามตรวจผ่าน in-app browser ที่ desktop viewport แต่ browser environment เชื่อมต่อ `127.0.0.1` ของ workspace ไม่ได้ จึงไม่บันทึกผล screenshot ที่ตรวจไม่ได้จริง. การตรวจ responsive ขั้นพื้นฐานใช้ built markup, Tailwind breakpoints, overflow-related classes และ successful production rendering.
