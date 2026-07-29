# Route Inventory

รายละเอียดระดับ URL อยู่ใน `route-inventory.csv`

## สรุปโครงสร้าง

| กลุ่ม | Source count / output |
|---|---:|
| Homepage | 1 |
| Static money/hub/trust pages | ประมาณ 20 |
| Blog entries | 122 |
| Brand entries | 96 |
| Condition entries | 44 |
| Location entries | 87 |
| Location × brand/condition | 2,090 |
| HTML ทั้งหมด | 2,462 |
| Sitemap URLs | 372 |
| Noindex URLs | 2,090 |

Dynamic route `src/pages/รับซื้อโน๊ตบุ๊ค/[slug].astro:15-31` รวม brand, condition และ location ไว้ใน namespace เดียว ส่วน `src/pages/รับซื้อโน๊ตบุ๊ค/[location]/[slug].astro:10-39` สร้าง cross-product และบังคับ `noindex` ที่บรรทัด 109

## Indexability

- Indexable set โดยประมาณสอดคล้องกับ sitemap 372 URLs
- Cross-product 2,090 หน้าไม่อยู่ sitemap และมี `noindex,nofollow`
- `/admin/` และ `/404.html` ไม่ควร index
- Redirect artifact `/รับซื้อโน๊ตบุ๊ค/` ไม่มี content metadata/H1 เพราะชี้ไป `/`; ไม่ถือเป็น landing page

## คำแนะนำ

- อย่าเพิ่ม route จนกว่าจะมี quality gate
- คง cross-product เป็น noindex ระหว่างรอหลักฐาน GSC
- ก่อน consolidate/delete URL ใด ให้ดู clicks, impressions, backlinks, conversions และ external links
- แยก ownership ของ homepage, notebook-used, English spelling, pricing และ selling-guide ให้ชัด
