# 18 — Deployment release

**Date:** 2026-08-05  
**Verdict:** **PASS WITH WARNING**

Official Actions/Wrangler deploy succeeded. Production gates passed. Remaining deferred items: Cloudflare Managed AI Bot Policy, GSC money-page decisions, GBP hours confirmation.

## SHAs

| Item | SHA |
|------|-----|
| Remediation merge | `1a021e3` |
| Secrets environment bind | `69eb245` |
| Pre-final docs | `e99dc25` |
| Wrangler pin attempt | `6b4127e` |
| **Deployed / Current main** | `bd848c401805d08bfe07a85a4e4bb813e4553148` |
| Checkout SHA (Actions) | `bd848c401805d08bfe07a85a4e4bb813e4553148` |
| Production matches Main | **YES** (Wrangler deploy of checkout SHA + live gates) |

## Secret existence (names only)

| Secret name | Present on Environment `Production` |
|-------------|-------------------------------------|
| `CLOUDFLARE_API_TOKEN` | yes (updated 2026-08-05T11:13:53Z) |
| `CLOUDFLARE_ACCOUNT_ID` | yes (updated 2026-08-05T11:19:06Z) |

Values never logged or printed. Workflow “Verify required secrets” step: **success**.

## Successful deployment

| Item | Value |
|------|-------|
| Workflow | Deploy Cloudflare Production |
| Run ID | `31002172236` |
| Event | `push` to `main` |
| Status | **success** |
| Started | 2026-08-05T11:37:02Z |
| Completed | 2026-08-05T11:38:34Z |
| HTML | https://github.com/noteroru2/shopbuynotebook-thai/actions/runs/31002172236 |
| GitHub Deployment ID | `5760849528` (environment Production, state success) |
| Artifact | `production-qa-31002172236` |
| Wrangler Authentication | PASS (secrets resolved) |
| Wrangler Deployment step | PASS |
| Production HTTP QA step | PASS |

## Failure path resolved before success

| Run | Result | Cause |
|-----|--------|-------|
| `30901148649` | secrets missing | Environment not bound / secrets absent |
| `31001179719` / `31001307742` / `31001349883` | secrets OK; deploy FAIL | `wrangler deploy --message` → `Unknown argument: message` |
| `31001794220` | deploy FAIL | same `--message` rejection on Wrangler 4.28.0 |
| `31002172236` | **success** | `command: deploy` + `wranglerVersion: "4.28.0"` |

## Live Production gates (post-deploy)

See `19-production-final-verification.csv` (48 URLs, **0 FAIL**).

| Gate | Result |
|------|--------|
| Root 200 + canonical `/` | PASS |
| Admin meta `noindex, nofollow` | PASS |
| Admin `X-Robots-Tag: noindex, nofollow` | PASS |
| Admin not in sitemap | PASS |
| Hub 301 one-hop → `/` | PASS |
| Internal hub href on home | PASS (0) |
| Condition titles 18/18 | PASS |
| Sitemap XML | PASS (371 locs in child) |
| Googlebot / Bingbot | not CF-blocked (fall-through Allow) |
| CF Managed AI Disallow | still present (deferred; not a fail) |
| WebP 200 / PNG 404 | PASS |
| Broken links / assets (sampled) | 0 |

## Deferred

- Cloudflare Managed AI Bot Policy (requires Cloudflare dashboard auth; not changed)
- GSC money-page merge / mass location noindex decisions
- GBP opening hours confirmation

## Out-of-scope files untouched

`seo-url-audit.csv`, `docs/seo-aeo-geo-audit/`, lighthouse/pagespeed JSON, helper/probe scripts.
