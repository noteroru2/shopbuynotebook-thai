# 02 — Query clusters

Period: chart **2026-04-29 → 2026-07-28** (UI: 3 เดือนล่าสุด). Source: Queries sheet only.

All clusters are classified **Insufficient Evidence** for cannibalization because **ranking URL is unknown**.

| Cluster | Sample queries | Clicks | Imps | WAvg pos | Notes |
|---------|----------------|--------|------|----------|-------|
| irrelevant_review | รับรีวิวโน้ตบุ๊ค, รับรีวิว notebook | 0 | 26 | ~61 | Highest imps; not buy-intent |
| brand_rog_flow_z13 | asus/rog flow z13 มือสอง | 1 | 5 | ~37 | Only click in Queries sheet |
| brand_surface | microsoft surface มือสอง | 0 | 6 | 35 | Brand used |
| valuation_acer | โน๊ตบุ๊ค acer ขายได้เท่าไหร่ | 0 | 5 | 52 | Valuation intent |
| commercial_where_to_sell | ขายโน๊ตบุ๊คที่ไหนดี | 0 | 4 | 48 | Commercial investigation |
| core_notebook_en | รับซื้อ notebook | 0 | 2 | 95 | Core EN; page unknown |
| local_* / brand_macbook / condition_* | various | 0 | 1–2 | mixed | Long-tail / local |
| irrelevant_auction | ขายทอดตลาด* | 0 | 2 | — | Out of scope |

See `15-query-clusters.csv`.

**Missing expected head terms** (not in export): exact `รับซื้อโน๊ตบุ๊ค`, `ร้านรับซื้อโน๊ตบุ๊ค`, `รับซื้อโน๊ตบุ๊คมือสอง`, `เช็คราคา*`, `ตีราคา*` — treat as **unknown volume**, not zero.
