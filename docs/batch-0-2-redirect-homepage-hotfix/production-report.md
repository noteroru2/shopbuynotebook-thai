# Batch 0.2.2 Production Report

## Verdict

**PASS WITH WARNING — SELECTIVE LEGACY REDIRECT DEPLOYED AND VERIFIED**

The selective Worker is deployed at 100% traffic and Production HTTP QA passed. The remaining WWW canonical-host redirect is a known, non-blocking infrastructure warning.

## Production deployment

- Batch: `Batch 0.2.2 — Selective Legacy Redirect Worker`
- Worker target: `shopbuynotebook-thai` (unchanged)
- Implementation commit: `d05efb3ed37e17ed48f17457fe20ad5001d9db5c`
- Production implementation/merge SHA: `a0bbf70d0b7b69de11d3801bf17aee1e2ad11e04`
- Deployment ID: `2866bbea-91eb-4954-b37f-4a03b7fce4e4`
- Worker Version ID: `4799fe33-415a-4c8c-bedc-f893c2779cfc`
- Worker version number: `55`
- Traffic: `100%`
- Deployment strategy: `percentage`
- Deployment source: `wrangler`
- Deployment message: `batch 0.2.2 selective legacy redirect a0bbf70d0b7b69de11d3801bf17aee1e2ad11e04`
- Version created UTC: `2026-07-30T08:58:10.734426Z`
- Deployment created UTC: `2026-07-30T08:58:12.049393Z`
- Deployment time Asia/Bangkok: `2026-07-30 15:58:12`

## Immediate rollback reference

- Previous Deployment ID: `eff48f97-44fe-4200-bc92-0cadde728631`
- Previous Worker Version ID: `2083cbaa-fa6c-46a3-9533-73c335a87c81`
- Previous version number: `54`
- Previous traffic: `100%`
- Previous deployment created UTC: `2026-07-30T08:24:32.908462Z`
- Previous deployment time Asia/Bangkok: `2026-07-30 15:24:32`

Version 54 is the immediate rollback reference, but it predates the production fix for the Legacy Thai redirect. Use it only if Version 55 causes a serious regression in Static Assets or core pages.

## Selective routing configuration

The Worker-first scope contains only two exact Unicode route patterns:

```toml
run_worker_first = [
  "/รับซื้อโน๊ตบุ๊ค",
  "/รับซื้อโน๊ตบุ๊ค/"
]
```

- `run_worker_first = true` is not used.
- No wildcard is configured.
- No WWW, core-page, or asset-extension route is configured.
- The Worker does not run before every Static Asset request.
- Percent-encoded legacy requests are normalized by routing and match the exact Unicode patterns.
- All non-target requests retain asset-first behavior.

The Worker matches the production apex hostname and legacy path only, redirects to the HTTPS non-WWW homepage with status 301, preserves the query string, and forwards every non-target request unchanged to the Static Assets binding.

## Validation

- `npm ci`: passed
- Astro check: 0 errors, 0 warnings, 85 hints
- Build: 2,460 generated pages
- HTML artifacts: 2,461
- Sitemap/indexable: 371/371
- Noindex: 2,089
- Broken internal links: 0
- Duplicate titles/descriptions: 0/0
- LocalBusiness pages: 4
- SEO validator: 0 errors, 1 known warning
- Worker unit/config validation: 8 request cases passed
- Homepage H1/process section/process cards: 1/1/4
- Legacy redirect HTML artifact: absent
- Legacy URL in sitemap: absent
- Native `_redirects` legacy owner: removed
- Known HOLD orphans: `/รับประมูลคอม/`, `/รับเหมาคอมพิวเตอร์/`

## Production HTTP QA

### Legacy redirect

All target forms return `301 Moved Permanently` to:

```text
https://xn--42cn4aobed0eb6hubj4es0m5dhvd.com/
```

Verified:

- `/รับซื้อโน๊ตบุ๊ค/`: 301
- `/รับซื้อโน๊ตบุ๊ค`: 301
- Percent-encoded legacy URL: 301
- `?source=test`: preserved in `Location`
- Redirect chain: `301 → 200`
- Redirect loop: absent
- Meta Refresh: absent
- Redirect HTML artifact: absent

Before Version 55, the legacy URL returned 404. After Version 55, Unicode, no-trailing-slash, percent-encoded, and query-string requests all pass.

### Regression controls

- Homepage: 200
- `/รับซื้อ-notebook/`: 200
- `/robots.txt`: 200
- `/sitemap-index.xml`: 200
- Missing-page control: 404
- Non-target redirects: none observed
- Static Assets behavior: no regression observed
- Homepage process hotfix: unchanged
- Canonical, sitemap, robots, and indexability: unchanged

## Known warning

**KNOWN WARNING: WWW RETURNS 200 WITH NON-WWW CANONICAL**

The WWW response retains a canonical link to the non-WWW production homepage. WWW HTTP redirection remains deferred infrastructure work and does not invalidate this Batch 0.2.2 release.

## Safety confirmations

- `seo-url-audit.csv` remains the user's modified file and was not staged or committed.
- User-owned Lighthouse, PageSpeed, and analysis files were not changed, staged, or committed.
- No source code or Wrangler configuration was changed while closing this report.
- No DNS, custom domain, Zone Rule, Worker name, canonical, sitemap, robots, URL, or index/noindex policy was changed.
- No temporary Cloudflare account was used.
- The Cloudflare token was not read back, written to a file, logged in this report, staged, or committed.
