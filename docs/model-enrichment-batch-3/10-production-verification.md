# Production Verification — Batch 3

Status: **PASS WITH WARNING** (Victus 17 deferred; no factual issue)

Date: 2026-08-08

## Attestation

| Item | Value |
| --- | --- |
| Source Main (pre-batch) | `803a72e11b3cdd8d909e351f6029d5f6a4a24c12` |
| Merge / Checkout / Deployed / Runtime SHA | `a575189719cef66f408296f71d6a5867dcef43ec` |
| Workflow Run | https://github.com/noteroru2/shopbuynotebook-thai/actions/runs/31242430474 |
| Deployment ID | `5805969674` |

## Sitemap crawl

- URLs: **371 / 371 PASS**
- Evidence: `09-production-crawl.csv`, `09-production-crawl-summary.json`

## Enriched models on production

All 3 pages PASS (`09b-production-models.csv`):

- `hp-omen-16`
- `asus-tuf-a15-f15`
- `lenovo-loq-15-16`

## Deferred

- `hp-victus-17` — AMBIGUOUS_MODEL; page left unchanged; no READY enrichment

## Frozen / URL architecture

Unchanged: Routes 2460 · Indexable 371 · Sitemap 371
