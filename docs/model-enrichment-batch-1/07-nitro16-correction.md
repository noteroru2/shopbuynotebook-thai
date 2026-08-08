# Acer Nitro 16 — P1 CONTENT DATA CORRECTION

## Issue

Existing content claimed `RTX 4080` for Acer Nitro 16.

## Dataset / Provenance re-check

Verified `gpuOptions` for `acer-nitro-16`:

- NVIDIA GeForce RTX 4050 Laptop GPU
- NVIDIA GeForce RTX 4060 Laptop GPU
- NVIDIA GeForce RTX 4070 Laptop GPU

Sources: Acer.com AN16-41 official PDP pages (see `data/notebook-specs/models.json` + `provenance.json`).

## Action

- Removed unsupported RTX 4080 claim from model page body and claims list
- Replaced with family-level options that have provenance
- Did not invent replacement Exact SKU specs
- Left unrelated RTX 4080 mentions on other models/blogs untouched

## Regression

Script check: `acer-nitro-16.md` must not match `RTX\s*4080`.

Current unsupported RTX 4080 mentions in Nitro 16 page: **0**
