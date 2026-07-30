# Batch 0.2 — Redirect Consolidation and Homepage QA Hotfix

## Verdict

**BLOCKED: CLOUDFLARE WWW RULE REQUIRED**

Repository implementation and static validation passed, but the production gate requires `www` to return HTTP 301. The authenticated Wrangler OAuth token has `zone:read` but no Zone Redirect Rules write permission, so no zone-level rule was created. The branch was not merged and no production deployment was made.

## Release identity

- Starting SHA: `50a5c3cd54ad47e1b85c114b8abb732226eeafd0`
- Implementation production SHA before this batch: `2c351744adad1415854a5d47fd118e7a69db9e74`
- Branch: `codex/batch-0-2-redirect-homepage-hotfix`
- Hotfix implementation SHA: `490d101`
- Merge SHA: not created
- New production SHA: not deployed
- Existing production deployment: `a3257653-c97b-4d37-8168-4eb095749668`
- Existing production Worker version / rollback version: `9721267c-41a2-4392-99e3-6839cbbccf97`

## Files changed

- `astro.config.mjs`
- `public/_redirects`
- `scripts/validate-seo.mjs`
- `src/components/ProcessSteps.astro`
- `src/components/SafetySection.astro`
- `src/pages/index.astro`

No content page was added or removed.

## Legacy redirect implementation

Root cause: the redirect in `astro.config.mjs` was rendered by Astro as a static HTML document. Cloudflare Workers Static Assets therefore returned HTTP 200 with a meta-refresh document and no `Location` header.

The Astro redirect was removed and replaced with the native Workers Static Assets rule:

```text
/รับซื้อโน๊ตบุ๊ค/ / 301
```

Wrangler local runtime parsed one valid redirect rule. Encoded legacy-path requests returned `301 Moved Permanently`, followed once to `/` with HTTP 200. The build contains `dist/_redirects`, contains no legacy redirect HTML artifact, and the legacy source is absent from the sitemap.

Production before hotfix remains HTTP 200 because this branch has deliberately not been deployed while the `www` gate is blocked.

## Homepage QA

- Process section moved directly below the Hero.
- Process section marker count: 1
- Process card marker count: 4
- H1 count: 1
- The supporting checklist is now “เตรียมข้อมูลก่อนประเมิน”, uses a non-sequential list, and no longer looks like a second sales process.
- The safety heading was clarified to “ขายโน๊ตบุ๊คอย่างปลอดภัย” so it is not classified as another process heading.
- Homepage title, description and canonical are protected by exact regression assertions and did not change.

## Sitemap reconciliation

Detached builds were made for `f755135` and `2c35174`, then compared with the hotfix build. Only page URLs from `sitemap-N.xml` files were normalized and counted.

| Build | Page URLs |
|---|---:|
| Audit baseline `f755135` | 371 |
| Production implementation `2c35174` | 371 |
| Batch 0.2 hotfix | 371 |

- Baseline → release added: 0
- Baseline → release removed: 0
- Release → hotfix added: 0
- Release → hotfix removed: 0

The historical 372 measurement counted the `<loc>` in `sitemap-index.xml` that points to the child sitemap as though it were a page URL. This is a counting difference, not a lost Money, Brand, Condition, Location, Blog, Trust or Policy page.

## Validation results

- `npm ci`: passed
- Astro check: 0 errors, 0 warnings, 85 hints
- Build: passed; Astro reported 2,460 generated pages
- HTML artifacts: 2,461
- Indexable: 371
- Noindex: 2,089
- Sitemap: 371
- Broken links: 0
- Duplicate titles/descriptions: 0/0
- LocalBusiness: 4 pages
- Homepage process sections/cards: 1/4
- Redirect mapping: exactly one 301 rule
- Redirect source HTML artifact: absent
- Redirect source in sitemap: absent
- SEO validator: 0 errors, 1 known warning

Noindex decreased from 2,090 to 2,089 only because the old noindex meta-refresh HTML artifact was removed; no actual content page changed indexability.

## KNOWN HOLD ORPHANS

`/รับประมูลคอม/` and `/รับเหมาคอมพิวเตอร์/` remain:

- HTTP-equivalent built pages with indexable robots policy
- Included in the sitemap
- Self-canonical
- Absent from Header and service Footer links
- Zero built inbound HTML links
- Classified by the repository audit as broad desktop/organization scope outside the notebook-specialist focus
- Preserved for a later GSC/conversion decision

The repository contains no verified external-backlink dataset for these URLs. No GSC action, noindex, redirect, deletion or navigation restoration was performed.

## WWW rule required before merge/deploy

Current production responses are HTTP 200 for the `www` homepage, `robots.txt`, and a nested path. Native static `_redirects` rules do not support domain-level redirects.

Create this Cloudflare **Single Redirect** in the production zone:

- Match: wildcard `http*://www.xn--42cn4aobed0eb6hubj4es0m5dhvd.com/*`
- Target: `https://xn--42cn4aobed0eb6hubj4es0m5dhvd.com/${2}`
- Status: 301
- Preserve query string: enabled

This preserves the original path and query string and does not redirect every request to `/`.

After the rule is active, verify the homepage, `robots.txt`, sitemap, a nested Unicode path and a query-string request. Only then may this branch be merged and deployed.

## Safety confirmations

- `seo-url-audit.csv` remains the user's pre-existing modified file and was not edited, staged or committed.
- No other URL, canonical, robots or noindex policy changed.
- No additional redirect was added beyond the legacy-path rule.
- No temporary Cloudflare account was used.
- No temporary worktree or Wrangler runtime artifact remains in the repository.
- GSC indexing, coverage, performance and orphan-page disposition remain HOLD items.
