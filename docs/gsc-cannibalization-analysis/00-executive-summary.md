# 00 — Executive summary

**Verdict: BLOCKED — GSC PERFORMANCE DATA UNAVAILABLE FOR QUERY×PAGE**

Property (inferred from export filename / site config): `sc-domain` / host `xn--42cn4aobed0eb6hubj4es0m5dhvd.com` → `ร้านรับซื้อโน๊ตบุ๊ค.com`  
Data source: local GSC UI Performance export (not API)  
Export file (not committed): `xn--42cn4aobed0eb6hubj4es0m5dhvd.com-Performance-on-Search-2026-07-30.xlsx`  
UI filter: Search type **เว็บ**, date label **3 เดือนล่าสุด**  
Chart absolute dates: **2026-04-29 → 2026-07-28**  
Export file date: **2026-07-30**

## Why blocked

| Required for cannibalization | Available? |
|------------------------------|------------|
| Query × Page rows | **No** (Queries and Pages are separate sheets) |
| Date × Query × Page (winner switching) | **No** |
| GSC Search Analytics API | **No** (no `GOOGLE_APPLICATION_CREDENTIALS` / GSC secrets) |
| Page-level Performance | Yes (88 URLs) |
| Query-level Performance | Yes (16 queries) |
| Source Title/H1/URL inventory | Yes |

Without Query×Page, **True Cannibalization cannot be proven**. Merge / Redirect / Noindex of money pages are **forbidden** in this round.

## Sparse Performance snapshot (site chart)

| Metric | Value |
|--------|-------|
| Clicks (chart sum) | 9 |
| Impressions (chart sum) | 157 |
| Thailand | 9 clicks / 141 impressions |
| Root `/` (Pages sheet) | 0 clicks / **37** impressions / position **45.68** |
| `/รับซื้อ-notebook/` | 0 / 8 / 27.62 |
| `/รับซื้อโน๊ตบุ๊คมือสอง/` | 0 / 3 / **3.0** |
| Exact query `รับซื้อโน๊ตบุ๊ค` | **Absent** from Queries sheet |
| Query `รับซื้อ notebook` | 0 / 2 / **95** (page unknown) |

## Decisions this round

| Action | Status |
|--------|--------|
| Safe metadata/internal-link remediations | **None applied** (insufficient Query×Page proof) |
| Merge / Redirect money pages | **Not candidates for deploy** |
| Mass noindex locations | **Not done** |
| Deploy | **Not run** (analysis-only) |

## Unblock checklist

1. Export GSC Performance with **Query + Page** dimensions (or enable Search Analytics API).  
2. Prefer **Last 16 months** plus rolling 28/90-day slices with absolute dates.  
3. Optionally Date + Query + Page for winner-switch counts.  
4. Re-run this analysis folder; then reconsider Retarget / Merge / Redirect with High confidence only.
