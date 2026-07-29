# Prioritized Roadmap

## Batch 0 — Baseline and Truth Gate (P0)

- Objective: ทำให้ baseline ตรวจซ้ำได้และถ้อยคำธุรกิจถูกต้อง
- Scope: CSS warning, check tooling, service-fact matrix, keyword owner map
- Files likely affected: Header, package scripts/deps (เมื่ออนุมัติ), site config, location templates/data
- URLs: ทั้งเว็บ โดยเน้น locations
- Dependencies: เจ้าของยืนยัน logistics จริง
- Risks: เปลี่ยน claim อาจกระทบ conversion copy
- Acceptance: build/check ผ่าน 0 warning; fact matrix approved
- Validation: `npm run build`, `npm run check`, link scanner
- Impact: สูง
- GSC: ไม่จำเป็นสำหรับ truth fixes; จำเป็นก่อน URL changes
- Rollback: revert content/config commit เป็น batch เดียว

## Batch 1 — Trust + Intent Governance (P1, แนะนำทำจริงก่อน)

- Objective: กำหนด `/` เป็น owner “รับซื้อโน๊ตบุ๊ค” และลดข้อความพื้นที่เกินจริง
- Scope: homepage/used-notebook/notebook-English/pricing/selling/company/location messaging และ internal anchors
- Files: core Astro pages, location data/layouts, keyword map
- URLs: core money + 87 location pages
- Dependencies: Batch 0 fact matrix, GSC export
- Risks: cannibalization shift; ห้าม redirect โดยไม่มีข้อมูล
- Acceptance: intent statement ไม่ซ้ำ; ทุก location ระบุหน้าร้านอุบลและ conditional service
- Validation: build, metadata diff, query-page mapping review
- Impact: สูงมาก
- GSC: Required สำหรับ consolidate/redirect; ไม่จำเป็นสำหรับแก้ factual wording
- Rollback: commit แยก core/location

## Batch 2 — Cannibalization Resolution (P1)

- Objective: แยก service vs condition vs blog
- Scope: 8 clusters ในรายงาน
- Files/URLs: core pages, conditions, related blogs
- Dependencies: GSC + conversion data
- Risks: traffic loss หากรวมผิด
- Acceptance: owner ต่อ query family หนึ่งหน้า; supporting pages link to owner
- Validation: crawl + GSC annotation
- Impact: สูง
- GSC: Required
- Rollback: URL mapping และ redirects versioned

## Batch 3 — Brand/Model Quality (P2)

- Objective: รักษาเฉพาะหน้าที่มี unique value
- Scope: 96 brand entries
- Dependencies: GSC/backlinks/lead quality
- Acceptance: ผ่าน quality gate; thin pages Hold/Consolidate proposal
- Validation: sample content diff, metadata, schema, links
- Impact: กลาง-สูง
- GSC: Required

## Batch 4 — Location Quality (P2)

- Objective: ลด doorway-like footprint
- Scope: 87 indexable location pages; 2,090 cross-product pagesคง noindex
- Dependencies: service evidence + GSC
- Acceptance: unique local logistics/evidence หรือ Hold
- Validation: template similarity, factual review
- Impact: สูงด้าน trust
- GSC: Required ก่อน deindex/consolidate

## Batch 5 — Internal Linking (P2)

- Objective: hub-and-spoke และ click depth ชัด
- Scope: nav, breadcrumbs, contextual/related links
- Acceptance: 0 broken link; 0 orphan indexable; anchor ownership ผ่าน
- GSC: Helpful

## Batch 6 — Performance and Accessibility (P2)

- Objective: CWV/mobile/a11y baseline
- Scope: images, CSS, motion, menu, CTA, headings
- Acceptance: Lighthouse/axe thresholds ที่ตกลง, no build warnings
- GSC: ไม่จำเป็น

## Batch 7 — Content Expansion (Hold/P3)

- Objective: เพิ่มเฉพาะ gap ที่มี demand และ business intent
- Scope: notebook-only
- Dependencies: ทุก core page ผ่าน quality gate + GSC evidence
- Acceptance: ไม่มี intent overlap และมี internal owner
- GSC: Required

## Batch แรกที่แนะนำ

ทำ Batch 0 + ส่วน factual ของ Batch 1: แก้ CSS warning, ทำ automated check, สร้าง service-fact matrix, กำหนด keyword ownership และปรับคำ location ให้ conditional โดยยังไม่ลบ/เปลี่ยน URL/canonical/redirect
