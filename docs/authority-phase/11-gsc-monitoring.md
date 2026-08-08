# GSC monitoring

## T0

- Runtime content deploy (prior phase): **2026-08-08** / SHA `b16e83b`
- Authority phase deploy: record Workflow timestamp at release

## Windows (absolute from T0 = 2026-08-08)

| Gate | Date |
|------|------|
| T+7 | 2026-08-15 |
| T+14 | 2026-08-22 |
| T+28 | 2026-09-05 |
| T+56 | 2026-10-03 — earliest consolidation review (still requires evidence) |
| T+90 | 2026-11-06 |

## Tooling

```bash
node scripts/gsc/query-landing-monitor.mjs --input path/to/gsc-export.csv --out docs/authority-phase/gsc-alignment.csv
```

Outputs alignment status: ALIGNED | PARTIAL | MISALIGNED | INSUFFICIENT_DATA  
**Does not mutate the website.**

## Freeze

Money-page merge/redirect frozen until at least **2026-10-03** and only with Query × Page evidence thereafter.
