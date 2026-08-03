# 11 — Production verification

**Status: PRE-DEPLOY / NOT FULLY VERIFIED FOR THIS BRANCH**

Production SHA currently still older than `fix/seo-aeo-geo-remediation` tip (`f5cc1b8`).

## Checks performed against live apex (2026-08-03)

| Check | Result |
|-------|--------|
| `GET /` | 200 |
| `GET /รับซื้อโน๊ตบุ๊ค/` (encoded) | **301 → /** one-hop |
| `GET /admin/` | 200, **meta noindex absent** (old asset) |
| `X-Robots-Tag` on live admin | not observed (worker change not deployed) |
| Live robots CF Managed AI Disallows | still present (unchanged; expected) |

## After deploy checklist

1. Confirm `/admin/` HTML contains `noindex,nofollow`
2. Confirm response header `X-Robots-Tag: noindex, nofollow`
3. Confirm `robots.txt` Disallow `/admin/`
4. Confirm sample condition titles updated
5. Confirm blog hub links point to `/` (view-source)
6. Re-run `scripts/live-seo-smoke.py` / `production-qa.mjs` if available
7. Cloudflare AI Crawl Control decisions (Batch 4)

**Do not mark Production PASS until the above are green.**
