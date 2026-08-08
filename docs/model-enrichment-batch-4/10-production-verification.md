# Production Verification — Batch 4

Status: **PASS**

Date: 2026-08-08

## Attestation

| Item | Value |
| --- | --- |
| Source Main (pre-batch) | `f5277b4bad37c13966b43d5f58727e483edc4eae` |
| Runtime Production SHA (pre-batch baseline) | `a575189719cef66f408296f71d6a5867dcef43ec` |
| Merge / Checkout / Deployed / Runtime SHA | `28a2fcd9c3b00860d04e02b9e29d735f4b48d577` |
| Workflow Run | https://github.com/noteroru2/shopbuynotebook-thai/actions/runs/31242885476 |
| Deployment ID | `5806054428` |

## Sitemap crawl

- URLs: **371 / 371 PASS**
- Evidence: `09-production-crawl.csv`, `09-production-crawl-summary.json`

## Enriched models on production

All 4 pages PASS (`09b-production-models.csv`):

- `asus-rog-strix` — SERIES sample G614; Scar excluded from verified matrix
- `hp-omen-17` — multi-family MSG + GPU matrix
- `dell-g15-g16` — merged URL with split G15 5530 / G16 7620 sources
- `lenovo-legion-pro` — Pro 5 16IRX10 + Pro 7 16IRX8H PSREF samples

## Deferred

- none

## Frozen / URL architecture

Unchanged: Routes 2460 · Indexable 371 · Sitemap 371
