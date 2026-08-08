# Production Verification

**Status: PENDING**

Do **not** treat this upgrade as production-verified until the checklist below is completed after deploy.

## Pending after deploy

1. **Deploy** branch `content/sitewide-quality-indexability-upgrade` to production (Cloudflare Workers/Pages per existing workflow)
2. **Live URL samples** — home, 2 money pages, 2 provinces, 2 conditions, 1 brand, 1 blog: 200 + correct title/H1
3. **robots / meta** — combo Tier C still `noindex`; indexable collections still indexable
4. **Sitemap parity** — XML sitemap includes A/B only; excludes Tier C combos
5. **Crawl sample** — no mass soft-404; location pages show rewritten bodies (no star-table doorway)
6. **GSC** — coverage/indexing spot-check (optional same week; required before any merge/delete)

## Explicitly not claimed

- ❌ Production crawl completed
- ❌ Live ranking uplift
- ❌ GSC validated deletions/merges
- ❌ 100% Strong scores on every model page

## When complete

Update this file: set Status → **DONE**, date, deployer, and attach crawl notes or GSC screenshots paths.
