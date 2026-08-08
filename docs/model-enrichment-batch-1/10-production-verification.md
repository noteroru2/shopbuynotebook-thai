# Production Verification — Batch 1

## Local pre-deploy evidence

- Build pages: **2460**
- Sitemap URLs: **371**
- Dist check `acer-nitro-16`: unsupported `RTX 4080` = **0**
- Dist includes `data-verified-spec="acer-nitro-16"` panel

## Post-deploy checklist

1. Confirm GitHub Actions deploy success and record Deployment ID / Checkout SHA
2. Crawl all 371 sitemap URLs (HTTP/canonical/robots/title/H1/assets)
3. Manually open all 10 enriched model URLs on production
4. Re-confirm Nitro 16 has no unsupported RTX 4080 claim
5. Append crawl results to `09-production-crawl.csv` and finalize verdict

Status at commit time: **pending deploy**
