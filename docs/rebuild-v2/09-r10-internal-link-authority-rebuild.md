# R10 — Internal Link Authority Rebuild

Status: `SOURCE_IMPLEMENTED / EXECUTABLE_GATE_NOT_VERIFIED / BUILD_NOT_VERIFIED / PRODUCTION_BLOCKED`

Date: 2026-09-09

## Goal

Rebuild internal linking after R4–R9 established query ownership. The objective is not to maximize link count. It is to make important navigation and contextual links consistently support the declared owner for each intent.

## Problems found before R10

- Footer still promoted retired R4 money URLs such as `/ขายโน๊ตบุ๊คด่วน/`, `/รับซื้อ-notebook/`, `/เช็คราคาโน๊ตบุ๊ค/` and `/ตีราคาโน๊ตบุ๊ค/`.
- Footer still linked directly to legacy brand hubs even though R5 declared `/แบรนด์/{brand}/` as the future brand owners.
- Footer promoted a Blog URL that R9 classified for merge to `/ขายโน๊ตบุ๊ค/`.
- Primary navigation did not expose the model and condition hubs.
- RelatedLinks accepted old URLs verbatim, allowing frontmatter to keep leaking internal authority to retired owners.
- Staged Brand / Model / Condition / Location pages did not have a consistent child → parent → commercial-owner link pattern.
- Some staged public pages exposed internal rebuild labels such as `Brand Owner`, `Model Owner`, `Condition Owner`, `Local Owner` and R5 implementation notes.

## Implemented

### 1. Machine-readable authority graph

Added `src/data/rebuild-v2-internal-link-authority.json`.

It declares:
- core commercial and taxonomy owners,
- eight priority brand owners,
- rewrite rules from retired money URLs to R4 owners,
- rewrite rules from legacy brand hubs to R5 owners,
- rewrite rules for R9 Blog merge candidates.

### 2. Central rewrite helper

Added `src/lib/internal-links.ts`.

`rewriteAuthorityHref()` normalizes internal paths and rewrites known retired/legacy destinations to the declared owner. External links are unchanged.

### 3. RelatedLinks enforcement

`src/components/RelatedLinks.astro` now routes every internal related link through `rewriteAuthorityHref()` and deduplicates destinations after rewriting.

This prevents old content frontmatter from continuing to promote known retired money pages or legacy brand hubs through the shared RelatedLinks component.

### 4. Primary navigation

Header now exposes:
- ประเมินราคา
- ขายโน๊ตบุ๊ค
- แบรนด์
- รุ่น
- อาการ
- พื้นที่
- บทความ

The LINE CTA remains visible and is not replaced by SEO navigation.

### 5. Footer rebuilt

The old link-heavy footer was replaced with a smaller authority-focused structure:
- declared core owners,
- corporate/bulk service,
- staged brand owners,
- selected KEEP_INFORMATIONAL articles,
- trust / policy / contact links.

Known R4 retired URLs, R5 legacy brand hubs and the R9 Blog merge candidate are no longer promoted by the footer.

### 6. Contextual authority component

Added `src/components/AuthorityLinks.astro`.

Patterns:
- Brand → Model hub + Condition hub + Valuation owner.
- Model → Brand parent + Valuation owner + Condition hub.
- Condition → Valuation owner + Brand hub + Model hub.
- Location → Valuation owner + Seller-flow owner + protected used-notebook owner.
- KEEP_INFORMATIONAL Blog → Valuation owner + Seller-flow owner + Condition hub.

### 7. Blog authority

Only R9 `KEEP_INFORMATIONAL` posts receive the new Blog authority block. HOLD/MERGE pages do not receive that extra curated authority module.

Existing frontmatter RelatedLinks are rewritten through the R10 owner map.

The bottom Blog conversion link now points to `/ขายโน๊ตบุ๊ค/` rather than treating the homepage as the only next step.

### 8. Public-content hygiene

Removed visible implementation labels from staged Brand / Model / Condition / Location pages. Internal terms such as `Brand Owner`, `Model Owner`, `Condition Owner`, `Local Owner`, `R5 Priority` and `Why this brand is in R5` are not user-facing copy.

## Safety

- Production `main` remains untouched.
- R10 does not implement HTTP 301 or 410.
- V2 namespaces remain staging/noindex until the production migration gate.
- Historical legacy model winners remain linked where R5/R6 intentionally protect their current URLs.
- R10 does not mass-edit Blog content files.

## Gate

Added:

`npm run gate:rebuild-v2:r10`

The gate checks owner graph integrity, primary navigation, footer retirement hygiene, RelatedLinks rewrite enforcement, contextual authority modules, Blog KEEP-only behavior, parent links and absence of production HTTP lifecycle code.

## Validation limitation

The connector can inspect and write source but does not execute the repository's Node/Astro toolchain. Therefore this batch does not claim that the R10 gate, `astro check`, or full production build passed.

## Verdict

`R10_SOURCE_IMPLEMENTED / EXECUTABLE_GATE_NOT_VERIFIED / BUILD_NOT_VERIFIED / PRODUCTION_BLOCKED`

## Next

R11 — Trust / E-E-A-T / Entity Proof: strengthen business identity, real-store proof, process transparency, author/reviewer responsibility and reusable trust signals without creating fake local entities or unsupported claims.
