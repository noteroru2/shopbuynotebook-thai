# NOTEBOOK REBUILD V2 — R2 Target Architecture

Target initial indexable surface after migration: approximately 80–120 URLs. Expansion requires GSC demand or explicit business value.

```text
/
├── /แบรนด์/
│   ├── /แบรนด์/asus/
│   ├── /แบรนด์/acer/
│   ├── /แบรนด์/lenovo/
│   ├── /แบรนด์/hp/
│   ├── /แบรนด์/dell/
│   ├── /แบรนด์/msi/
│   ├── /แบรนด์/macbook/
│   └── /แบรนด์/surface/
├── /รุ่น/
│   └── explicit allowlist only
├── /อาการ/
│   ├── /อาการ/เปิดไม่ติด/
│   ├── /อาการ/จอแตก/
│   ├── /อาการ/แบตเสื่อม/
│   ├── /อาการ/โดนน้ำ/
│   ├── /อาการ/ไม่มีที่ชาร์จ/
│   └── selected high-value conditions
├── /พื้นที่/
│   ├── /พื้นที่/อุบลราชธานี/
│   └── evidence-backed locations only
├── /ประเมินราคา/
├── /ขายโน๊ตบุ๊ค/
├── /รับซื้อโน๊ตบุ๊คมือสอง/
├── /รับซื้อโน๊ตบุ๊คบริษัท/
└── /คู่มือ/
    └── informational content only
```

## Structural rules

1. Brand, series/model, condition and location are separate entities; never flatten them into one namespace again.
2. Location x brand x condition combination pages are not an indexable product surface.
3. Homepage links to hubs; hubs link to series/models; deep pages link back to their parent and to one commercial owner.
4. Model URLs require an allowlist. Existence of a content file alone must not imply indexability.
5. Location URLs require business truth + search evidence; no nationwide branch implication.
6. New V2 hubs launch as `noindex` until R13 migration gate.

## Initial target counts

| Type | Target range |
|---|---:|
| Core / money | 10–15 |
| Brand hubs | 8–12 |
| Series / models | 25–40 |
| Conditions | 8–12 |
| Locations | 5–10 |
| Guides / blog | 20–30 |
| Utility / trust | 5–8 |

## Expansion gate

A new indexable page must satisfy at least one:

- GSC impressions already exist for the corresponding legacy entity/query;
- search demand is externally validated;
- the shop receives the model/category frequently enough to justify a specialist page;
- the item is high-value/strategic (e.g. MacBook or gaming notebook);
- content is materially unique and verified, not a variable-swapped template.

Status: R2_ARCHITECTURE_DEFINED
