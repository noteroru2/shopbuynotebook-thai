# Batch 2A.2 — Root-cause Report

## Counts before remediation

- Exact source occurrences: 75
- Source files affected: 40
- Generated URLs mapped: 40
- Built pages containing the phrase: 28

## Root-cause categories

All occurrences are **literal frontmatter duplication** in `src/content/brands/*.md`. No exact phrase exists in `src/pages/`, `src/components/`, `src/layouts/` or `src/data/`. The shared route template reads `pageH1` and `description`; it does not concatenate another `ยอดนิยม`.

## Source of truth and minimal safe fix

The content frontmatter is the wording owner. The minimal safe strategy is to replace only the exact string `ยอดนิยมยอดนิยม` with `ยอดนิยม` in the 40 inventoried files. Shared generation logic must remain unchanged.

## Planned files

The exact files and lines are listed in `occurrence-inventory.csv`; all 75 rows are selected. No file outside that inventory is authorized.

## Risk analysis

- Low semantic risk: the replacement removes only an accidental adjacent duplicate.
- Medium breadth: 40 content files, mitigated by exact-match assertions and word-diff review.
- No intended route, canonical, indexability, sitemap, robots, redirect, Worker or Wrangler impact.
