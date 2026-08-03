# Batch 1 — Admin indexability

## Scope
Stop `/admin/` from being indexed without breaking Decap CMS shell.

## Files changed
- `public/admin/index.html` — `meta robots noindex,nofollow`
- `public/robots.txt` — `Disallow: /admin/`
- `public/_headers` — `X-Robots-Tag: noindex, nofollow`
- `astro.config.mjs` — sitemap filter excludes `/admin`
- `worker/index.js` — attach `X-Robots-Tag` for admin paths

## Before
- Live + dist: title `Content Manager`, no robots meta, HTTP 200
- Not in sitemap historically, but crawlable

## After (local dist)
- `admin_noindex True`
- `admin_in_sitemap False`
- CMS script still loads (behavior unchanged)

## Security finding (separate)
Decap CMS remains a public shell without enforced auth in-repo. **Do not invent auth.** Owner should configure backend auth before enabling CMS in production.

## Commit
`a6e40da`
