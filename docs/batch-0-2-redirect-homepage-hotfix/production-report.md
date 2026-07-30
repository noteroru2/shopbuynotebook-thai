# Batch 0.2 Production Report

## Status

**NOT DEPLOYED — BLOCKED BY REQUIRED CLOUDFLARE WWW RULE**

This report intentionally records the production gate without claiming deployment success.

## Production state

- Current implementation SHA: `2c351744adad1415854a5d47fd118e7a69db9e74`
- Current deployment ID: `a3257653-c97b-4d37-8168-4eb095749668`
- Current Worker version: `9721267c-41a2-4392-99e3-6839cbbccf97`
- Hotfix branch SHA: `490d101`
- Hotfix merge SHA: not created
- Hotfix production SHA: not deployed
- New deployment ID/version: not created
- Rollback version: `9721267c-41a2-4392-99e3-6839cbbccf97`

## Production observations before hotfix

- Legacy `/รับซื้อโน๊ตบุ๊ค/`: HTTP 200, meta refresh to `/`, no HTTP `Location`
- `www` homepage: HTTP 200
- `www /robots.txt`: HTTP 200
- `www` nested path with query: HTTP 200
- Non-`www` homepage canonical: unchanged and self-referencing

## Local release-candidate verification

- Native `_redirects` mapping parsed by Wrangler local runtime
- Legacy encoded path: HTTP 301
- Final destination: `/`, HTTP 200, one redirect
- Legacy HTML artifact: absent
- Legacy URL in sitemap: absent
- Homepage H1/process sections/process cards: 1/1/4
- Sitemap: 371 URLs, identical to detached baseline and release builds
- SEO validation: 0 errors

## Deployment decision

No merge or deploy was performed because the OAuth token does not authorize Zone Redirect Rules changes and production `www` still returns 200. Deploying only the repository half would violate the instruction to deploy only after all redirect tests pass.

Once the documented zone-level 301 rule is configured and verified, rerun the final validation, merge the branch, deploy using the existing `shopbuynotebook-thai` Wrangler target, and replace this blocked report with actual deployment and post-deploy QA evidence.

No temporary account was used. `seo-url-audit.csv` was not staged or committed. No other URL, canonical, robots or noindex policy was changed, and no content page was added.
