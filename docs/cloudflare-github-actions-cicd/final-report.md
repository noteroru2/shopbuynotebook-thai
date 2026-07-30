# Cloudflare GitHub Actions CI/CD

## Executive summary

The repository now has a proposed GitHub-hosted production deployment workflow that validates, builds, deploys, and verifies the Cloudflare Worker without requiring Cloudflare credentials in a local Codex process.

The workflow remains isolated on `codex/cloudflare-github-actions-cicd` until the two required GitHub Actions secret names can be confirmed.

## Workflow

- Path: `.github/workflows/deploy-cloudflare-production.yml`
- Runner: GitHub-hosted `ubuntu-latest`
- Node.js: `22.12.0`, matching the project engine requirement
- Deployment method: official `cloudflare/wrangler-action@v3`
- Deployment message: `github-actions <GitHub commit SHA>`
- Timeout: 30 minutes
- Concurrent production runs: serialized with `cloudflare-production`
- In-progress production deployment cancellation: disabled

## Triggers and path filters

Automatic deployment runs only for pushes to `main` that change source, public assets, Worker code, scripts, dependency manifests, Astro configuration, Wrangler configuration, or the deployment workflow itself.

Changes confined to `docs/` do not trigger deployment. `workflow_dispatch` supports deliberate manual re-runs. Pull requests and forks do not have a deployment trigger.

## Permissions

The workflow grants `GITHUB_TOKEN` only `contents: read`. Checkout does not persist repository credentials, and the workflow cannot write back to the repository.

## Required secret names

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The workflow checks that both names resolve to non-empty values without printing them. No secret value is stored in the repository, configuration, report, QA artifact, or command arguments.

## Build and release gates

1. Checkout the exact triggering commit.
2. Install locked dependencies with `npm ci`.
3. Run `npm run check`.
4. Run `npm run build`.
5. Run `npm run validate:seo`.
6. Require zero `ยอดนิยมยอดนิยม` occurrences in source and `dist`.
7. Deploy with the official Wrangler action.
8. Run production HTTP and Batch 2A.2 verification.

Any failed gate prevents a successful release result.

## Production QA gates

The reusable `scripts/production-qa.mjs` verifies:

- Homepage, robots, sitemap, legacy redirect, query preservation, 404 control, and WWW canonical behavior
- CSS and image HTTP status and content type. JavaScript is recorded as not applicable when the tested static page emits no first-party script asset.
- All 28 built pages identified by the Batch 2A.2 audit
- HTTP 200, duplicate phrase count zero, title, meta description, exactly one H1, canonical, and robots/indexability
- No HTML error page or wrong-page redirect

The known `WWW RETURNS 200 WITH NON-WWW CANONICAL` condition is recorded without failing when the canonical correctly targets Non-WWW.

## Evidence and security guardrails

The workflow writes only non-sensitive QA CSVs and a validation summary to `qa-artifacts/`, then uploads them with 30-day retention. Raw environment data, Wrangler authentication output, authorization headers, credential files, and secret values are never included.

The protected user files and local temporary files are outside the workflow change set and must remain unstaged.

## Rollback

Cloudflare Worker versions remain the rollback unit. A rollback should select the immediate prior 100% production Worker version after reviewing its deployment message and QA status. The workflow does not perform automatic rollback.

## Existing CI/CD

No existing files were present under `.github/workflows/`; this proposal does not duplicate another deployment workflow.

## Current readiness

GitHub CLI is unavailable in the Codex environment, so repository secret names cannot be inspected. The workflow must not be merged or dispatched until both required GitHub Actions secrets are confirmed through GitHub.

## Merge recommendation

Hold the branch for one-time GitHub secret setup. After both secret names are present, merge the branch to `main`, monitor the triggered run, and use its QA artifacts to close the pending Batch 2A.2 production report.
