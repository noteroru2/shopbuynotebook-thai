# Batch 5 — NAP / hours / schema

## Scope
Align visible hours with verified facts; do not invent `openingHoursSpecification`.

## Changes
- Footer / ติดต่อเรา: removed hard-coded `ทุกวัน 10:00–20:00`
- Replaced with “สอบถามเวลาทำการก่อนนัดผ่าน LINE/โทร”
- FAQ hours answer updated similarly
- `site.ts` TODO_OWNER expanded: confirm GBP before UI hours + schema

## Schema
- LocalBusiness unchanged (still no openingHours) — correct until GBP confirmed
- NAP (name/address/phone/maps) unchanged and consistent

## Commit
`22f6b30`
