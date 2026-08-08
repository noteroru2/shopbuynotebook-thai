# Province Pages

**Collection:** `src/content/locations/` (ส่วนใหญ่) · **URLs:** `/รับซื้อโน๊ตบุ๊ค/{จังหวัด}/` · **Count:** ~85 Province + related · **Rewritten:** 87 location MD bodies

## Improved (major)

1. **8 content archetypes** (`rewrite-location-bodies.mjs`): metro-logistics, student-upgrade, office-fleet, gaming-thermal, remote-shipping, และชุดอื่น — กระจายตาม hash(slug)
2. **Doorway cleanup:** ตัด star tables / “คุณมาถูกที่แล้ว” / template ซ้ำ
3. **Storefront clarity:** หน้าร้านจริงอุบลราชธานี; จังหวัดอื่น = พื้นที่ให้บริการ ไม่ใช่สาขา
4. **District stuffing capped** (อ้างอิงพื้นที่สั้น ๆ ไม่ยัด keyword อำเภอทั้งจังหวัด)
5. Location layout UI: จำกัดรายการ sub-area ที่โชว์

## Unchanged

- URL/slug ทุกจังหวัด
- Indexable yes (Tier A/B ตาม `seo-index-tier.ts`)

## Deferred

- Hand-crafted unique local facts ต่อจังหวัด (ห้ามแต่ง)
- Merge จังหวัดต่ำทราฟฟิกโดยไม่มี GSC

## Similarity risk

**Before:** High → **After:** Low (archetype + local name + capped areas; gate templateHits 0)
