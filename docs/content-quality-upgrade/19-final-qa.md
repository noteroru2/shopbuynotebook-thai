# Final QA (local / pre-deploy)

## Automated

| Check | Command | Result |
|-------|---------|--------|
| URL inventory | `npm run inventory:content` | 372 rows (371 indexable + 1 combo summary) |
| Content gate | `npm run gate:content` | **349 PASS** / 0 FAIL / 0 WARNING |
| Similarity (inventory) | regenerated baseline | `highSimilarity: 0` on indexable rows |
| Avg quality score | baseline | ~84 (Good/Strong dominant; ~6 Needs improvement) |

## Manual spot-check (repo)

- [x] Location sample (เช่น กรุงเทพ): มีข้อความหน้าร้านอุบลฯ / ไม่ใช่สาขา
- [x] Money pages: title/H1 ไม่ชน intent กัน
- [x] Condition sample: มีจุดตรวจอาการเฉพาะ
- [x] Combo route still `noindex={true}`
- [x] No money-page redirects introduced

## Verdict

**PASS WITH WARNING** — local content/gate OK; production crawl & live sitemap parity **not verified** (see `20`).

## Residual accepted

- Some model pages still short (Good)
- Inbound link counts TBD
- Combo Tier C remains thin by design (deferred)
