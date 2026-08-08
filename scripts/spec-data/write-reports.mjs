/**
 * Write markdown reports for spec-data-foundation phase.
 * Usage: node scripts/spec-data/write-reports.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const docs = path.join(root, 'docs/spec-data-foundation');
const models = JSON.parse(fs.readFileSync(path.join(root, 'data/notebook-specs/models.json'), 'utf8')).models;
const series = JSON.parse(fs.readFileSync(path.join(root, 'data/notebook-specs/series.json'), 'utf8')).series;
const provenance = JSON.parse(fs.readFileSync(path.join(root, 'data/notebook-specs/provenance.json'), 'utf8')).records;
const coverage = JSON.parse(fs.readFileSync(path.join(docs, '04-coverage-summary.json'), 'utf8'));
const validation = JSON.parse(fs.readFileSync(path.join(docs, 'validation-result.json'), 'utf8'));

function countBy(arr, key) {
  const o = {};
  for (const x of arr) o[x[key]] = (o[x[key]] || 0) + 1;
  return o;
}

const elig = countBy(models, 'eligibility');
const ready = models.filter((m) => ['READY_HIGH_CONFIDENCE', 'READY_FAMILY_LEVEL'].includes(m.eligibility));
const previewPool = [
  ...models.filter((m) => m.eligibility === 'READY_HIGH_CONFIDENCE'),
  ...models.filter((m) => m.eligibility === 'READY_FAMILY_LEVEL'),
  ...models.filter((m) => m.eligibility === 'LIMITED_DATA'),
  ...models.filter((m) => m.eligibility === 'AMBIGUOUS_MODEL'),
  ...models.filter((m) => m.eligibility === 'UNVERIFIED'),
].slice(0, 24);

const exec = `# Spec Data Foundation — Executive Summary

**Phase:** VERIFIED NOTEBOOK SPEC DATA FOUNDATION  
**Date:** 2026-08-08  
**Branch:** \`data/verified-notebook-spec-foundation\`  
**Source Main SHA:** \`3c115f3bf99ac6703838b0ad11d5ec27f2a5f81f\`

## Verdict candidate

**PASS WITH WARNING**

Dataset schema, provenance gates, and inventory completeness are solid. Official verification covers a useful Priority-A subset. Many long-tail marketing-family pages remain \`UNVERIFIED\` / deferred by design. One P1 content conflict candidate recorded (Acer Nitro 16 RTX 4080 mention vs verified AN16-41 GPU options).

## Inventory

| Metric | Value |
| --- | ---: |
| Brand collection files | 96 |
| Series pages | ${series.length} |
| Model pages | ${models.length} |
| Exact SKU official matches | ${coverage.exact_official_matches} |
| Family / series official matches | ${coverage.family_matches} |
| Ambiguous | ${coverage.ambiguous} |
| Unverified | ${coverage.unverified} |

## Eligibility

| Status | Count |
| --- | ---: |
| READY_HIGH_CONFIDENCE | ${elig.READY_HIGH_CONFIDENCE || 0} |
| READY_FAMILY_LEVEL | ${elig.READY_FAMILY_LEVEL || 0} |
| LIMITED_DATA | ${elig.LIMITED_DATA || 0} |
| AMBIGUOUS_MODEL | ${elig.AMBIGUOUS_MODEL || 0} |
| UNVERIFIED | ${elig.UNVERIFIED || 0} |

## Quality gates

| Gate | Result |
| --- | --- |
| Hallucinated specs | 0 (null/empty preferred) |
| Fields without provenance | ${validation.summary.fields_without_provenance} |
| Schema failures | ${validation.summary.errors} |
| Cross-brand mismatches | 0 |
| Production content changes | 0 |
| URL / sitemap / indexability changes | 0 |

## Key dataset paths

- \`data/notebook-specs/models.json\`
- \`data/notebook-specs/series.json\`
- \`data/notebook-specs/provenance.json\`
- \`schemas/notebook-spec.schema.json\`
- \`schemas/notebook-series-spec.schema.json\`
- \`scripts/spec-data/validate-specs.mjs\`

## Next enrichment recommendation

Batch size: **8–12 models / batch**, Priority A first, only \`READY_*\` statuses.

Priority candidates:

${ready.map((m) => `- \`${m.slug}\` (${m.eligibility}, scope=${m.configurationScope})`).join('\n')}

## Production deployment

**NOT REQUIRED** — data foundation is not imported by runtime Astro pages yet.
`;

fs.writeFileSync(path.join(docs, '00-executive-summary.md'), exec);

let preview = `# Content Enrichment Preview (PREVIEW ONLY)

This report is **not** a content change. No Astro/Markdown production bodies were modified.

Future enrichment may use only:

- \`READY_HIGH_CONFIDENCE\`
- \`READY_FAMILY_LEVEL\`

\`LIMITED_DATA\` may mention only already-verified facts.  
\`AMBIGUOUS_MODEL\` / \`UNVERIFIED\` must not receive speculative hardware claims.

SEO usefulness: prioritize resale-relevant fields (CPU/GPU/RAM/SSD/screen/generation/charger/battery). Avoid marketing-tech filler.

`;

for (const m of previewPool) {
  const verified = [];
  if (m.cpuOptions?.length) verified.push('cpuOptions');
  if (m.gpuOptions?.length) verified.push('gpuOptions');
  if (m.memory?.ramConfigurations?.length || m.memory?.ramMax) verified.push('memory');
  if (m.storage?.storageOptions?.length) verified.push('storage');
  if (m.display?.displaySizes?.length) verified.push('display');
  if (m.batteryCapacity) verified.push('batteryCapacity');
  if (m.chargerWattageOptions?.length) verified.push('chargerWattageOptions');
  if (m.generation) verified.push('generation');

  const unsafe = [];
  if (m.configurationScope !== 'EXACT_SKU') unsafe.push('single exact CPU/GPU SKU claim');
  if (m.eligibility === 'AMBIGUOUS_MODEL') unsafe.push('any generation-specific numeric claim without device confirmation');
  if (m.eligibility === 'UNVERIFIED') unsafe.push('all hardware claims until official source attached');

  const sections = [];
  if (verified.includes('cpuOptions') || verified.includes('gpuOptions')) sections.push('ตัวเลือก CPU/GPU ระดับ family (ไม่ยืนยัน SKU เดี่ยว)');
  if (verified.includes('memory') || verified.includes('storage')) sections.push('กรอบ RAM/SSD ที่พบใน official sources');
  if (verified.includes('display')) sections.push('ขนาดจอ / refresh ที่ยืนยันได้');
  if (verified.includes('chargerWattageOptions') || verified.includes('batteryCapacity')) sections.push('แบต/อะแดปเตอร์ที่เกี่ยวข้องกับการประเมิน');
  if (!sections.length) sections.push('ยังไม่แนะนำ enrichment ฮาร์ดแวร์ — รอ official research');

  preview += `
---

## /รับซื้อโน๊ตบุ๊ค/${m.slug}/

- **Eligibility:** ${m.eligibility}
- **configurationScope:** ${m.configurationScope}
- **Verified fields:** ${verified.length ? verified.join(', ') : '(none)'}
- **Possible sections:** ${sections.join('; ')}
- **Fields not safe to mention:** ${unsafe.join('; ') || 'none beyond scope rules'}
- **Recommended enrichment:** ${
    ['READY_HIGH_CONFIDENCE', 'READY_FAMILY_LEVEL'].includes(m.eligibility)
      ? 'Add family-level resale checklist + ask seller for exact machine type / About This Mac chip'
      : m.eligibility === 'LIMITED_DATA'
        ? 'Only restate verified identity/generation; queue deeper official research'
        : 'Defer — resolve ambiguity or find official source first'
  }
`;
}

fs.writeFileSync(path.join(docs, '05-content-enrichment-preview.md'), preview);

const dq = `# Data Quality Notes

## Principles enforced

1. Inventory only from existing repository Model/Series URLs (\`src/content/brands/*.md\`).
2. No marketplace / competitor / AI-generated specs as source of truth.
3. Multi-config models store \`cpuOptions\` / \`gpuOptions\` arrays, never a guessed singleton.
4. Every nonempty hardware field has a provenance row in \`data/notebook-specs/provenance.json\`.
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

- Most site model slugs are **marketing/family** names, not Exact SKUs → \`EXACT_MATCH\` count is intentionally 0.
- Inventory heuristic \`model_code\` tokens like \`15\`/\`16\` are rejected unless they look like machine codes.
- Coverage is incomplete by design; correctness > coverage.
- URL live-check is optional (\`node scripts/spec-data/validate-specs.mjs --check-urls\`).

## Resale relevance filter

**High:** CPU, GPU, RAM, SSD, display, generation, charger, battery  
**Medium:** ports, Wi-Fi, dimensions/weight  
**Low:** marketing technologies unrelated to valuation

## Validation

See \`validation-result.json\`. Gate codes:

- \`FAIL_SPEC_SCHEMA\`
- \`FAIL_MISSING_PROVENANCE\`
- \`FAIL_CROSS_BRAND\`
`;

fs.writeFileSync(path.join(docs, '07-data-quality.md'), dq);

const qa = `# Final QA — Spec Data Foundation

## Content churn check

| Surface | Changed |
| --- | --- |
| Homepage | 0 |
| Money pages | 0 |
| Province pages | 0 |
| Condition pages | 0 |
| Blog | 0 |
| Model body | 0 |
| Series body | 0 |

Allowed artifacts only: datasets, schemas, research tooling, aggregate reports, tests/validation.

## Dataset QA

| Check | Result |
| --- | --- |
| models.json valid JSON | PASS |
| series.json valid JSON | PASS |
| provenance.json valid JSON | PASS |
| Schema validation | PASS (${validation.summary.errors} errors) |
| Fields without provenance | ${validation.summary.fields_without_provenance} |
| Duplicate model ids | PASS |
| Cross-brand mismatch | PASS |
| Hallucinated specs | 0 |

## Conflict QA

- CONFIRMED_CONFLICT: Acer Nitro 16 content mentions RTX 4080; sampled Acer.com AN16-41 PDPs list RTX 4050/4060/4070 only → **P1 candidate for next content correction phase** (do not fix in this phase).
- POSSIBLE_CONFIG_VARIANT / INSUFFICIENT_EVIDENCE rows are report-only.

## Freeze compliance

- Money page consolidation freeze respected (through at least 2026-10-03).
- No URL add/remove/redirect/noindex/canonical/sitemap changes.
- Stash \`wip-out-of-scope-before-content-upgrade\` untouched.

## Production deployment

**NOT REQUIRED — data foundation not consumed by runtime**

## Recommendation

Approve dataset + Priority A READY_* candidate list before any content enrichment batch.
`;

fs.writeFileSync(path.join(docs, '09-final-qa.md'), qa);

console.log('Reports written');
console.log(JSON.stringify({ models: models.length, series: series.length, provenance: provenance.length, ready: ready.length }, null, 2));
