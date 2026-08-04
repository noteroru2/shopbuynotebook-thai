# 17 — Deployment failure analysis

**Date:** 2026-08-04  
**Remediation merge SHA:** `1a021e3`  
**Docs gate SHA:** `e45596d`  
**Failed production deploy SHA:** `1a021e3`

## Failure table

| Item | Value |
|------|-------|
| Workflow | `.github/workflows/deploy-cloudflare-production.yml` (`Deploy Cloudflare Production`) |
| Run ID | `30821416833` |
| Prior identical failure | `30548908701` (SHA `a19bfca`, first workflow push) |
| Trigger | `push` to `main` |
| SHA | `1a021e350f3b5657fdc11e7597b1ef918eee96f9` |
| Failed job | Validate, deploy, and verify production |
| Failed step | Verify required secrets |
| Error class | Missing / unresolved GitHub Actions secret |
| Missing secret name | `CLOUDFLARE_API_TOKEN` (annotation: “Required GitHub Actions secret CLOUDFLARE_API_TOKEN is missing.”) |
| Also required | `CLOUDFLARE_ACCOUNT_ID` (checked next if token present) |
| Secret scope expected | Job previously used **repository** `secrets.*` only; GitHub **Environment `Production`** exists and was used by historical deployments |
| Environment protection | `Production` / `Preview` present; no protection rules / no approval gate observed |
| Recommended fix | Bind job `environment: Production` so Environment-scoped secrets can resolve; if still empty, admin must create the two secret **names** under Environment or Repository secrets (values never logged) |

## Root cause

1. Workflow referenced `${{ secrets.CLOUDFLARE_API_TOKEN }}` / `${{ secrets.CLOUDFLARE_ACCOUNT_ID }}` without `jobs.deploy.environment`.
2. Public GitHub API shows Environments `Production` and `Preview` (created ~2026-05 with prior Production deployments).
3. Without environment binding, Environment secrets are not injected → token resolves empty → gate exits 1.
4. Secondary noise: `Upload production QA evidence` used `if: always()` + `if-no-files-found: error`, failing again when secrets blocked earlier steps.

Local Wrangler / `CLOUDFLARE_*` env vars: **not present** in this agent session. No temporary accounts or tokens created.

## Workflow config consistency

| Check | Result |
|-------|--------|
| Secret names in workflow | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` |
| Deploy action | `cloudflare/wrangler-action@v3` |
| Worker name | `shopbuynotebook-thai` (`wrangler.toml`) |
| Assets dir | `dist` |
| Node | `22.12.0` |
| Package manager | `npm ci` |
| Permissions | `contents: read` |
| PR/fork deploy trigger | none (push `main` + `workflow_dispatch` only) |
| Docs-only pushes | correctly excluded by path filters |

## Required secret names (no values)

```text
Required GitHub Environment (preferred) or Repository Secrets:

- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
```

Preferred location: **Environment `Production`**, matching historical deployment environment and the workflow fix.

## Out of scope

No Cloudflare Managed AI Bot Policy changes. No SEO content/URL changes in this recovery.
