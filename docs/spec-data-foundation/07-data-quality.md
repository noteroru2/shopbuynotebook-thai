# Data Quality Notes

## Principles enforced

1. Inventory only from existing repository Model/Series URLs (`src/content/brands/*.md`).
2. No marketplace / competitor / AI-generated specs as source of truth.
3. Multi-config models store `cpuOptions` / `gpuOptions` arrays, never a guessed singleton.
4. Every nonempty hardware field has a provenance row in `data/notebook-specs/provenance.json`.
5. Null/empty preferred over guesses.

## Source hierarchy used

| Tier | Type | Examples used |
| --- | --- | --- |
| 1 | Official product pages | acer.com PDP, rog.asus.com, dell.com XPS |
| 2 | Official spec databases | Lenovo PSREF |
| 3 | Official PDF / MSG | HP Victus MSG, Lenovo PSREF PDFs |
| 4 | Official support | Apple Support Tech Specs / Identify your Mac |
| 5 | Repository verified | not used as hardware evidence this pass |

## Known limitations

- Most site model slugs are **marketing/family** names, not Exact SKUs → `EXACT_MATCH` count is intentionally 0.
- Inventory heuristic `model_code` tokens like `15`/`16` are rejected unless they look like machine codes.
- Coverage is incomplete by design; correctness > coverage.
- URL live-check is optional (`node scripts/spec-data/validate-specs.mjs --check-urls`).

## Resale relevance filter

**High:** CPU, GPU, RAM, SSD, display, generation, charger, battery  
**Medium:** ports, Wi-Fi, dimensions/weight  
**Low:** marketing technologies unrelated to valuation

## Validation

See `validation-result.json`. Gate codes:

- `FAIL_SPEC_SCHEMA`
- `FAIL_MISSING_PROVENANCE`
- `FAIL_CROSS_BRAND`
