# 18 — Deployment release

**Date:** 2026-08-04  
**Verdict:** **FAIL** — `BLOCKED: DEPLOYMENT CREDENTIALS UNAVAILABLE`  
(Official Actions/Wrangler deploy path.) Live apex HTTP checks for remediation currently **PASS** via an unverified non-Actions channel — see below; do not treat that as SHA-attested CI deploy success.

## SHAs

| Item | SHA |
|------|-----|
| Initial remediation merge | `1a021e3` |
| Pre-fix main (docs gate) | `e45596d` |
| Workflow fix commit | `8368e27` |
| Workflow fix merge | `69eb245` |
| Current `origin/main` | `69eb245` |
| Production | **not updated** (still pre-remediation) |

## Workflow fix applied

| Change | Detail |
|--------|--------|
| Branch | `fix/production-deployment-secrets` |
| Job binding | `environment: Production` |
| Secret check messages | Point to Production environment / repository secrets (names only) |
| Artifact upload | `if: success()` (avoid secondary fail when secrets missing) |

## Deploy attempts

| Run ID | SHA | Result |
|--------|-----|--------|
| `30821416833` | `1a021e3` | FAIL — token missing (no environment binding) |
| `30901148649` | `69eb245` | FAIL — token still missing **after** `environment: Production` |

Post-fix annotation (names only):

> Required secret CLOUDFLARE_API_TOKEN is missing in the Production environment (or repository secrets).

Conclusion: config mismatch was real and fixed; **credential values are still absent** from both Environment and Repository scopes reachable by Actions.

## Pre-deploy QA (local, SHA with remediation)

| Gate | Result |
|------|--------|
| `npm ci` | PASS |
| `npm run check` | PASS — 0 errors, 85 hints |
| `npm run build` | PASS — 2460 pages |
| `npm run validate:seo` | PASS — 0 errors |
| Dist admin noindex | yes |
| Dist robots Disallow `/admin/` | yes |
| Dist sitemap excludes admin | yes |
| Condition titles 18/18 | yes |
| WebP present | yes |
| Hub exact href on home | 0 |

## GitHub configuration required (human admin)

Create these **secret names** (paste values only in GitHub UI; never in chat/repo):

```text
Environment: Production  (preferred)
  - CLOUDFLARE_API_TOKEN
  - CLOUDFLARE_ACCOUNT_ID

OR Repository secrets with the same names
```

Token needs Wrangler deploy permission for Worker `shopbuynotebook-thai` on the correct Cloudflare account.

Then either:

1. Actions → Deploy Cloudflare Production → `workflow_dispatch` on `main`, or  
2. Re-run failed job `30901148649` after secrets exist.

Local agent has **no** Wrangler login and **no** `CLOUDFLARE_*` env vars.

## Production status after recovery attempt

### Official GitHub Actions / Wrangler path

| Item | Result |
|------|--------|
| Run `30901148649` | **failure** |
| GitHub Deployment `5742164300` | state **failure** (environment Production created by job binding) |
| Wrangler deploy step | **skipped** (secrets gate) |
| Attested Production SHA from Actions | **none** |

### Live apex content (HTTP verification 2026-08-04)

Despite Actions failure, the public apex **now serves remediation content** (channel is **not** a successful Wrangler Actions deploy; do not treat as CI attestation):

| Gate | Live result |
|------|-------------|
| `/admin/` meta `noindex, nofollow` | PASS |
| `/admin/` `X-Robots-Tag: noindex, nofollow` | PASS |
| `robots.txt` `Disallow: /admin/` | PASS |
| Condition titles 18/18 | PASS |
| WebP 200 / legacy PNG 404 | PASS |
| Hub 301 one-hop → `/` | PASS |
| Root canonical | PASS |
| Admin absent from sitemap | PASS |

See `19-production-final-verification.csv`.

**Release gate for this recovery task:** **FAIL** — `BLOCKED: DEPLOYMENT CREDENTIALS UNAVAILABLE` for the intended workflow. Live content may have been published by a non-Actions path; operators must still provision secrets so future main deploys are controlled and SHA-attested.

## Out-of-scope files untouched

Left unstaged/untracked: `seo-url-audit.csv`, `docs/seo-aeo-geo-audit/`, lighthouse/pagespeed JSON, helper scripts, probe temps.
