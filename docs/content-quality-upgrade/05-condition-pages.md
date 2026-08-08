# Condition Pages

**Collection:** `src/content/conditions/` · **URLs:** `/รับซื้อโน๊ตบุ๊ค/{slug}/` · **Count:** 44 · **Indexable:** yes

## Improved

- Thin / generic symptom bodies deepened ด้วยจุดตรวจเฉพาะอาการ (เช่น จอแตก, SSD เสีย, ไฟไม่เข้า, HDMI เสีย)
- Titles/H1 เน้นอาการ + สิ่งที่ควรส่งรูป/วิดีโอ
- Internal links ไป blog อาการใกล้เคียง + money pages ที่เกี่ยวข้อง
- MacBook-specific conditions คง entity แยก (battery, MDM, charge port, etc.)

## Quality notes

- Gate: all condition files **PASS** (no fake claims / no duplicate doorway templates)
- ไม่ใส่ราคาตายตัว; ใช้กรณีจำลองพร้อม disclaimer เมื่อมีตัวอย่าง

## Deferred

- Full rewrite ของทุก condition ให้ยาวเท่ากัน (บางหน้า Good ไม่ใช่ Strong ก็ยอมรับได้)
- Combo `location × condition` content depth (Tier C — ดู `21-deferred-candidates.csv`)

## Similarity risk

**Before:** Medium (shared “รับซื้อโน๊ตบุ๊คเสีย” boilerplate) → **After:** Low–Medium (symptom-specific; residual shared CTA OK)
