# 11 — Production verification

**Status: FAIL — MERGE DONE, PRODUCTION DEPLOY BLOCKED**

**Checked:** 2026-08-03T14:16:00Z (approx)  
**Main SHA (merged):** `1a021e350f3b5657fdc11e7597b1ef918eee96f9`  
**Source branch tip:** `677e0c000d116c5cc910c4c824cbe12cf27355a6`  
**Production SHA:** **NOT UPDATED** — still pre-remediation assets  
**Production matches Main:** **NO**

## Deployment attempt

| Item | Result |
|------|--------|
| Merge to `main` | SUCCESS (`1a021e3`) |
| GitHub Actions | [run 30821416833](https://github.com/noteroru2/shopbuynotebook-thai/actions/runs/30821416833) |
| Workflow | `Deploy Cloudflare Production` |
| Conclusion | **failure** |
| Failed step | `Verify required secrets` |
| Reason | `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` unavailable in Actions |
| Local Wrangler | not authenticated |
| Verdict code | `BLOCKED: DEPLOYMENT AUTHENTICATION UNAVAILABLE` |

## Live apex checks (pre-new-deploy)

| Check | URL | Status | Result |
|-------|-----|--------|--------|
| Root | `/` | 200 | PASS — canonical self `/`, indexable |
| Hub unicode | `/รับซื้อโน๊ตบุ๊ค/` | 301 → `/` | PASS — one-hop |
| Hub encoded | percent-encoded hub `/` | 301 → `/` | PASS — one-hop |
| Notebook variant | `/รับซื้อ-notebook/` | 200 | PASS — distinct title/H1 intent |
| Admin HTML | `/admin/` | 200 | **FAIL** — title `Content Manager…`, **no** meta `noindex` |
| Admin header | `/admin/` | 200 | **FAIL** — no `X-Robots-Tag` |
| Robots Disallow admin | `/robots.txt` | 200 | **FAIL** — no `Disallow: /admin/` (CF Managed AI block present) |
| Sitemap | `/sitemap-index.xml`, `/sitemap-0.xml` | 200 | PASS structure; **no `/admin/`** observed |
| Condition titles (18) | e.g. `/รับซื้อโน๊ตบุ๊ค/จอแตก/` | 200 | **FAIL** — still weak `จอแตก \| …` (old build) |
| WebP cover | `/images/blog/cpu-specs-notebook-price.webp` | 404 | **FAIL** — not on Production |
| Legacy PNG | `…cpu-specs-notebook-price.png` | 200 | Expected until deploy |
| Internal hub href on `/` | view-source | — | PASS — no exact `href="/รับซื้อโน๊ตบุ๊ค/"` |

## Cloudflare Managed robots (live)

Injected block (not from repo failure): GPTBot, ClaudeBot, Google-Extended, CCBot, Bytespider, Amazonbot, Applebot-Extended, meta-externalagent, CloudflareBrowserRenderingCrawler → `Disallow: /`.

Search crawlers without dedicated CF Disallow section fall through to site `User-agent: * Allow: /`.

**BLOCKED BY CLOUDFLARE AUTHENTICATION** for Managed Bot Policy edits.

## Gate

Do **not** mark Production PASS until secrets are configured, workflow succeeds, and `/admin/` + condition titles + WebP verify on apex against Main SHA.
