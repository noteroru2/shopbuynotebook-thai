# NOTEBOOK REBUILD V2 — R1 Query Ownership

Date: 2026-09-09

Principle: one primary owner per commercial intent. Supporting pages may link to the owner but must not target the same primary query as equal money pages.

| Query cluster | Primary owner | Secondary/supporting action |
|---|---|---|
| รับซื้อโน๊ตบุ๊ค / ร้านรับซื้อโน๊ตบุ๊ค | `/` | Homepage is the only primary owner |
| รับซื้อ notebook | `/` | `/รับซื้อ-notebook/` becomes MERGE_301 candidate to `/` |
| รับซื้อโน๊ตบุ๊คมือสอง | `/รับซื้อโน๊ตบุ๊คมือสอง/` | Keep only if content remains materially distinct from homepage |
| เช็คราคาโน๊ตบุ๊ค / ตีราคาโน๊ตบุ๊ค | `/ประเมินราคา/` | `/เช็คราคาโน๊ตบุ๊ค/`, `/เช็คราคาโน๊ตบุ๊คมือสอง/`, `/ตีราคาโน๊ตบุ๊ค/` migrate to one owner |
| ขายโน๊ตบุ๊ค | `/ขายโน๊ตบุ๊ค/` | `/ขายโน๊ตบุ๊คด่วน/` becomes merge candidate |
| รับซื้อโน๊ตบุ๊คบริษัท / เหมาโน๊ตบุ๊ค | `/รับซื้อโน๊ตบุ๊คบริษัท/` | Bulk/auction pages support only when intent is truly distinct |
| รับซื้อ MacBook | `/แบรนด์/macbook/` | Old `/รับซื้อโน๊ตบุ๊ค/macbook/` migrates after target is ready |
| รับซื้อ ASUS | `/แบรนด์/asus/` | Series/model pages support brand hub |
| รับซื้อ Acer | `/แบรนด์/acer/` | Series/model pages support brand hub |
| รับซื้อ Lenovo | `/แบรนด์/lenovo/` | Series/model pages support brand hub |
| รับซื้อ HP | `/แบรนด์/hp/` | Series/model pages support brand hub |
| รับซื้อ Dell | `/แบรนด์/dell/` | Series/model pages support brand hub |
| รับซื้อ MSI | `/แบรนด์/msi/` | Series/model pages support brand hub |
| โน๊ตบุ๊คเปิดไม่ติดขายได้ไหม | `/อาการ/เปิดไม่ติด/` | Related blogs become informational support |
| โน๊ตบุ๊คจอแตกขายได้ไหม | `/อาการ/จอแตก/` | Related blogs become informational support |
| โน๊ตบุ๊คแบตเสื่อมขายได้ไหม | `/อาการ/แบตเสื่อม/` | Related blogs become informational support |
| โน๊ตบุ๊คโดนน้ำขายได้ไหม | `/อาการ/โดนน้ำ/` | Related blogs become informational support |
| รับซื้อโน๊ตบุ๊คอุบล | `/พื้นที่/อุบลราชธานี/` | Strongest local owner because storefront is in Ubon |
| generic province queries | `/พื้นที่/<province>/` only when demand/evidence exists | No location x brand x condition index pages |

## Blog rule

Blog content owns informational questions only. A blog whose main intent is transaction, valuation or 'where to sell' must either:

1. be rewritten to a clearly informational intent and link to its owner; or
2. be merged into the matching money page.

## Ownership gate

FAIL if any of these occur:

- two primary owners for the same commercial cluster;
- blog title/H1 is materially identical to a money-page query target;
- model page tries to own generic brand query;
- location x condition/brand combination is opened to index;
- a new money page is created without a row in this ownership map.

Status: R1_POLICY_DEFINED
