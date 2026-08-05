# 06 — Cannibalization findings

## Classification counts (this data set)

| Class | Count | Notes |
|-------|-------|-------|
| True Cannibalization | **0 proven** | Needs Query×Page + intent + switching |
| Partial Cannibalization | **0 proven** | Source overlap only = hypothesis |
| Benign Overlap | **Possible** for brand/model vs root (clicks on model URLs) but unproven at query level |
| Insufficient Evidence | **All core money pairs** | See `17-cannibalization-score.csv` |

## Score formula (documented; capped)

Weights used when dimensions exist:

| Factor | Max points |
|--------|------------|
| Query overlap | 25 |
| Intent similarity | 15 |
| Winner switching | 20 |
| Impression fragmentation | 10 |
| Click fragmentation | 10 |
| Position volatility | 5 |
| Content similarity (source) | 10 |
| Internal-link conflict (source) | 5 |
| Unique-query share (inverse) | included in overlap |

**This run:** Query overlap / switching / unique-query = UNKNOWN → scores **capped ≤ 49 (Mild)** and labeled **Insufficient Evidence**. Scores must not justify Merge.

## Notable non-findings

- No evidence that `/เช็คราคาโน๊ตบุ๊ค/` or `/ตีราคาโน๊ตบุ๊ค/` steal root clicks (root also 0 clicks).  
- No evidence notebook or มือสอง outrank root for bare TH head term (head term not in export).  
- Brand/model pages received the only clicks in Pages sheet — consistent with **modifier demand**, not proof of head-term cannibalization.
