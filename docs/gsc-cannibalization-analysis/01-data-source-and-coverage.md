# 01 — Data source and coverage

## Authentication

| Channel | Result |
|---------|--------|
| `GOOGLE_APPLICATION_CREDENTIALS` | not set |
| GitHub repo secrets (names) | none GSC-related |
| GitHub Environment `Production` secrets | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` only |
| MCP Google/GSC tools | none |
| Service account JSON in repo | none found |

## Export used

| Field | Value |
|-------|-------|
| Path | `%USERPROFILE%\Downloads\xn--42cn4aobed0eb6hubj4es0m5dhvd.com-Performance-on-Search-2026-07-30.xlsx` |
| Committed? | **No** (raw export stays outside git) |
| Sheets | แผนผัง, ข้อความค้นหา, หน้า, ประเทศ, อุปกรณ์, ลักษณะที่ปรากฏในการค้นหา, ตัวกรอง |
| Search type | เว็บ |
| Date filter label | 3 เดือนล่าสุด |
| Chart dates | 2026-04-29 … 2026-07-28 |
| Query rows | 16 |
| Page rows | 88 |
| Query×Page rows | **0** |

Duplicate file `(1).xlsx` is identical for analysis purposes.

## Coverage exports (not used for cannibalization)

Coverage Drilldown / Valid files dated 2026-07-30 exist in Downloads. Those measure indexation, not query competition.

## Historical note

`docs/batch-1b-gsc-coverage-legacy-forensics/final-report.md` cites a 2026-06-21 Performance export with ~11 query rows / 1 click / 33 impressions — also too thin and not Query×Page.

## Truncation / anonymization

- GSC UI “top” lists may omit low-volume queries (exact `รับซื้อโน๊ตบุ๊ค` missing).  
- Page-sheet impression sum (260) ≠ chart sum (157): expected when dimensions differ / privacy thresholding.  
- **Do not conclude a query has zero demand** solely because it is absent from a 16-row Queries sheet.

## Required next export schema

Minimum columns:

```text
query, page, clicks, impressions, ctr, position
```

Plus ideally:

```text
date, query, page, clicks, impressions, position, device, country
```
