# R11 — Trust / E-E-A-T / Entity Proof

Status: `SOURCE_IMPLEMENTED / EXECUTABLE_GATE_NOT_VERIFIED / BUILD_NOT_VERIFIED / PRODUCTION_BLOCKED`

## Objective
Strengthen trust through verifiable business identity and transparent evaluation/editorial processes. Do not manufacture expertise signals.

## Entity truth used
- Website: ร้านรับซื้อโน๊ตบุ๊ค.com
- Operator: บริษัท อำพล เทรดดิ้ง จำกัด
- Physical storefront: ร้านอำพล เทรดดิ้ง
- Physical storefront location: Ubon Ratchathani
- Contact: phone 0642579353 and LINE @webuy
- Google Maps, Facebook and TikTok continue to come from the shared SITE configuration.

## Implemented
1. Added `src/data/rebuild-v2-trust-proof.json` with machine-readable proof rules, valuation workflow and editorial principles.
2. Added reusable `TrustProof.astro` with legal operator, physical storefront, phone, LINE, Maps and valuation limitations.
3. Rebuilt `/เกี่ยวกับเรา/` around operator transparency, real-store truth, editorial principles and explicit valuation limitations.
4. Replaced promotional `TrustBadges` wording with claims supportable by the site/process.
5. Updated global Footer to expose operator identity and `/เกี่ยวกับเรา/` from every page.
6. Strengthened Organization schema with ContactPoint and changed WebPage/BlogPosting publisher/author references to the single Organization `@id` rather than creating separate organization objects.
7. Added `npm run gate:rebuild-v2:r11`.

## Explicit non-claims
R11 does not invent or claim awards/certifications, years in business, review/customer counts, unverified licenses, nationwide physical branches, named individual expert credentials, or guaranteed final prices from photos alone.

## E-E-A-T interpretation
R11 treats E-E-A-T as evidence and transparency rather than keyword decoration. The website now makes it easier to verify who operates the site, where the physical shop is, how the business can be contacted, how valuation works, where remote valuation is limited, and which entity is responsible for editorial content.

## Safety
- `main` remains unchanged.
- No production redirect or lifecycle release is part of R11.
- No new local entities or branch claims were created.
- Existing R4–R10 ownership/lifecycle decisions remain unchanged.

## Validation gap
The source implementation was inspected through GitHub. Current HEAD has no commit statuses and no PR-triggered workflow runs. The connector environment does not execute Node/Astro commands, so `gate:rebuild-v2:r11`, `astro check`, and full `astro build` still require executable evidence before production merge.
