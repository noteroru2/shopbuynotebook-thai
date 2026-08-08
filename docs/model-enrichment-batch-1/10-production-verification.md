# Production Verification — Batch 1

## Deploy

| Item | Value |
| --- | --- |
| Workflow | Deploy Cloudflare Production |
| Workflow Run | https://github.com/noteroru2/shopbuynotebook-thai/actions/runs/31239195256 |
| Conclusion | success |
| Checkout / Deployed SHA | `1c4f9da5fd380f84443ae2e9c04d49f00c806548` |
| Artifact | production-qa-31239195256 |

## Crawl

- Sitemap URLs crawled: **371 / 371 PASS**
- Failures: **0**
- Evidence: `09-production-crawl.csv`, `09-production-crawl-summary.json`

## Manual model verification (production)

All 10 enriched models opened/fetched on production:

| Slug | HTTP | Verified panel | Unsupported RTX 4080 |
| --- | ---: | --- | --- |
| asus-rog-ally-x | 200 | yes | 0 |
| acer-nitro-16 | 200 | yes | **0** |
| asus-zephyrus-g14 | 200 | yes | 0 |
| hp-victus-15 | 200 | yes | 0 |
| lenovo-legion-5 | 200 | yes | 0 |
| thinkpad-x1-carbon | 200 | yes | 0 |
| macbook-pro-m3 | 200 | yes | 0 |
| macbook-air-m3 | 200 | yes | 0 |
| macbook-air-m4 | 200 | yes | 0 |
| macbook-air-m5 | 200 | yes | 0 |

Production content failures: **0**

## Freeze confirmation

Homepage / Money / Province / Condition / Blog bodies were not part of this release content churn.
