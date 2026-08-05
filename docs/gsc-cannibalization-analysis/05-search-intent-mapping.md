# 05 — Search intent mapping

## Intended targets (source / prior SEO policy)

| Keyword intent | Intended URL | GSC confirmation |
|----------------|--------------|------------------|
| รับซื้อโน๊ตบุ๊ค (bare) | `/` | **Unconfirmed** — query absent from export |
| รับซื้อ notebook | `/รับซื้อ-notebook/` | Query exists (2 imps @95); **page unknown** |
| รับซื้อโน๊ตบุ๊คมือสอง | `/รับซื้อโน๊ตบุ๊คมือสอง/` | Page has 3 imps @3; **queries unknown** |
| เช็คราคา / ประเมินราคา | `/เช็คราคาโน๊ตบุ๊ค/` | Page 1 imp; valuation query exists without page |
| ตีราคา | `/ตีราคาโน๊ตบุ๊ค/` | Page 2 imps @7.5; no matching query row |
| Brand/model | `/รับซื้อโน๊ตบุ๊ค/{brand|model}/` | Clicks landed on model pages (Pages sheet) |
| Local + province | `/รับซื้อโน๊ตบุ๊ค/{province}/` | Ubon page has 1 click / 2 imps |
| Condition | `/รับซื้อโน๊ตบุ๊ค/{condition}/` | Sparse; no join |

## Content signals (source, not GSC)

Money pages already differentiate Title/H1/intro to some degree after prior remediation (`/` vs notebook vs มือสอง vs เช็คราคา). That reduces *content* sameness risk but **does not prove** Google selection.

| URL | Current target (source) | Actual GSC queries | Actual intent (data) | Overlap page | Recommended target | Action |
|-----|-------------------------|--------------------|----------------------|--------------|--------------------|--------|
| `/` | Core TH transactional | Unknown (37 page imps) | Unknown | notebook / มือสอง (hyp.) | `/` until proven otherwise | KEEP |
| `/รับซื้อ-notebook/` | EN notebook transactional | Unknown (query รับซื้อ notebook unjoined) | Unknown | `/` | Keep separate | KEEP / wait |
| `/รับซื้อโน๊ตบุ๊คมือสอง/` | Secondhand modifier | Unknown | Unknown | `/` | Keep separate | KEEP / wait |
| `/เช็คราคาโน๊ตบุ๊ค/` | Valuation | Unknown | Unknown | `/ตีราคา…` | Keep separate | KEEP / wait |
| `/ตีราคาโน๊ตบุ๊ค/` | Valuation synonym | Unknown | Unknown | `/เช็คราคา…` | Keep separate | KEEP / wait |
| Model pages e.g. asus-rog-flow | Brand/model | Likely brand queries | Brand/model | — | Keep | KEEP |
