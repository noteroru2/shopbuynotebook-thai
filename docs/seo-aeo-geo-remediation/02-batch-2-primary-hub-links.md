# Batch 2 — Primary hub links

## Scope
Make `/` the sole internal target for hub intent; keep Worker 301 for external/legacy URLs.

## Files changed
- Multiple blog markdown relatedLinks / body links (exact `/รับซื้อโน๊ตบุ๊ค/` → `/`)
- `scripts/seo-qa.py` — Worker-only hub expectation; exact-hub link check; admin noindex check

## Before
- `check-broken-links.py`: 10 broken static links to hub path
- `seo-qa.py` failed expecting static hub HTML

## After
- Source exact hub links: **0**
- Dist exact `href="/รับซื้อโน๊ตบุ๊ค/"`: **0**
- Broken links: **0**
- Live production still 301 hub → `/` (one-hop) for backlinks

## Commit
`a1f69ca`
