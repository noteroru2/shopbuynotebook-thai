# 10 — Final QA (local)

## Commands run

```text
npm run check   → 0 errors, 85 hints
npm run build   → 2460 pages Complete
python scripts/seo-qa.py → ALL SMOKE TESTS PASSED
python scripts/seo-final-qa.py → sitemap 372, combos 0, claims 0, dup titles 0
python scripts/check-broken-links.py → broken_count 0 (73909 links)
```

## Spot checks

| URL / check | Result |
|-------------|--------|
| `/` canonical | self OK |
| Money pages titles/H1 | OK |
| `/admin/` noindex | yes (dist) |
| admin in sitemap | no |
| exact hub hrefs in dist | 0 |
| condition titles จอแตก/เปิดไม่ติด | updated |
| combo noindex sample | true |

## Gate
Local remediation QA: **PASS**
