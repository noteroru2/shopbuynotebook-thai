# 03 — Query–page overlap

**Result: NOT MEASURABLE**

GSC UI export does not join Query to Page. Therefore:

| Metric | Status |
|--------|--------|
| Ranking URL count per query | Unknown |
| Click / impression share by URL per query | Unknown |
| Query overlap between `/` and money variants | Unknown |
| Unique-query share per page | Unknown |

`14-query-page-data.csv` records each query with `page=UNKNOWN_NO_QUERY_PAGE_DIMENSION` for audit honesty.

### Weak page-level proxies only (not cannibalization proof)

| URL | Clicks | Imps | Pos |
|-----|--------|------|-----|
| `/` | 0 | 37 | 45.68 |
| `/รับซื้อ-notebook/` | 0 | 8 | 27.62 |
| `/ขายโน๊ตบุ๊ค/` | 0 | 7 | 6.71 |
| `/รับซื้อโน๊ตบุ๊คมือสอง/` | 0 | 3 | 3.0 |
| `/ตีราคาโน๊ตบุ๊ค/` | 0 | 2 | 7.5 |
| `/เช็คราคาโน๊ตบุ๊ค/` | 0 | 1 | 9.0 |

Root leads page impressions; secondhand shows strong average position with tiny volume. **Cannot map which queries drive those impressions.**
