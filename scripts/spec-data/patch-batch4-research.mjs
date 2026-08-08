/**
 * Patch models.json + provenance.json with Batch 4 official research overlays.
 * Usage: node scripts/spec-data/patch-batch4-research.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const modelsPath = path.join(root, 'data/notebook-specs/models.json');
const provPath = path.join(root, 'data/notebook-specs/provenance.json');
const retrievedDate = '2026-08-08';

const HARDWARE_FIELDS = [
  'cpuOptions', 'gpuOptions', 'wifi', 'bluetooth', 'batteryCapacity', 'weightRange', 'dimensions',
  'generation', 'chargerWattageOptions', 'ports', 'operatingSystemOptions', 'knownModelFamilies',
  'memory.ramType', 'memory.ramSpeed', 'memory.ramSlots', 'memory.ramSoldered', 'memory.ramMax',
  'memory.ramConfigurations', 'storage.storageInterface', 'storage.storageSlots', 'storage.storageOptions',
  'display.displaySizes', 'display.resolutions', 'display.panelTypes', 'display.refreshRates',
];

function getPath(obj, dotted) {
  return dotted.split('.').reduce((a, k) => (a == null ? a : a[k]), obj);
}
function nonempty(v) {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'string') return v.trim().length > 0;
  return true;
}

const OVERLAYS = {
  'asus-rog-strix': {
    category: 'gaming',
    configurationScope: 'SERIES',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://rog.asus.com/us/laptops/rog-strix/rog-strix-g16-2024/spec/',
    modelCode: 'ROG Strix G16 2024 G614 sample (series page spans wider Strix G)',
    knownModelFamilies: [
      'ROG Strix G16 (2024) G614',
      'ROG Strix G line (G15/G16/G17/G18 marketing sizes — confirm chassis code)',
    ],
    cpuOptions: [
      'Intel Core i9-14900HX (G16 2024 G614 official listing)',
    ],
    gpuOptions: [
      'NVIDIA GeForce RTX 4060 Laptop GPU (G16 2024 G614)',
      'NVIDIA GeForce RTX 4070 Laptop GPU (G16 2024 G614)',
      'NVIDIA GeForce RTX 4080 Laptop GPU (up to; G16 2024 official product page)',
    ],
    memory: {
      ramType: 'DDR5',
      ramSpeed: 'DDR5-5600',
      ramSlots: 2,
      ramSoldered: false,
      ramMax: '32GB (G16 2024 G614 official max)',
      ramConfigurations: ['8GB', '16GB', '32GB'],
    },
    storage: {
      storageInterface: 'PCIe 4.0 NVMe M.2',
      storageSlots: 2,
      storageOptions: ['512GB', '1TB', '2TB'],
    },
    display: {
      displaySizes: ['16-inch'],
      resolutions: ['2560x1600'],
      panelTypes: ['IPS-level antiglare'],
      refreshRates: ['165Hz', '240Hz'],
    },
    batteryCapacity: '90Wh (G16 2024 G614)',
    chargerWattageOptions: ['280W (G16 2024 G614 AC adapter listing)'],
    weightRange: '2.50 kg (G16 2024 G614 listing)',
    wifi: 'Wi-Fi 6E (G16 2024 G614)',
    bluetooth: 'Bluetooth 5.3 (G16 2024 G614; OS-dependent)',
    notes: 'Site slug is SERIES across ROG Strix G sizes/years and may mention Scar. Verified hardware matrix is from official ROG Strix G16 2024 G614 pages only. Scar is a separate ROG premium line — not merged into this GPU matrix. Confirm chassis code (e.g. G614) before Exact SKU claims.',
    sources: [
      { url: 'https://rog.asus.com/us/laptops/rog-strix/rog-strix-g16-2024/spec/', sourceType: 'official_product', title: 'ROG Strix G16 (2024) G614 Spec (ROG USA)', verificationStatus: 'VERIFIED' },
      { url: 'https://rog.asus.com/laptops/rog-strix/rog-strix-g16-2024/', sourceType: 'official_product', title: 'ROG Strix G16 (2024) product page (RTX 4080 / display claims)', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://rog.asus.com/us/laptops/rog-strix/rog-strix-g16-2024/spec/',
      gpuOptions: 'https://rog.asus.com/laptops/rog-strix/rog-strix-g16-2024/',
      'memory.ramSlots': 'https://rog.asus.com/us/laptops/rog-strix/rog-strix-g16-2024/spec/',
      'display.refreshRates': 'https://rog.asus.com/laptops/rog-strix/rog-strix-g16-2024/',
      batteryCapacity: 'https://rog.asus.com/us/laptops/rog-strix/rog-strix-g16-2024/spec/',
      chargerWattageOptions: 'https://rog.asus.com/us/laptops/rog-strix/rog-strix-g16-2024/spec/',
      knownModelFamilies: 'https://rog.asus.com/us/laptops/rog-strix/rog-strix-g16-2024/spec/',
    },
  },
  'hp-omen-17': {
    category: 'gaming',
    configurationScope: 'SERIES',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_3798373_en-US-1.pdf',
    modelCode: 'OMEN 17-ck0xxx MSG sample; later 17-db / 17-ck2 / 17-cm2 in GPU matrix',
    knownModelFamilies: [
      'OMEN 17-ck0xxx (MSG)',
      'OMEN 17-db0xxx (GPU performance matrix)',
      'OMEN 17-ck2xxx (GPU performance matrix)',
      'OMEN 17-cm2xxx (GPU performance matrix)',
    ],
    cpuOptions: [
      'Intel Core i9-11900H (17-ck0xxx MSG)',
      'Intel Core i7-11800H (17-ck0xxx MSG)',
      'Intel Core i5-11400H (17-ck0xxx MSG)',
    ],
    gpuOptions: [
      'NVIDIA GeForce RTX 3060 (17-ck0xxx MSG)',
      'NVIDIA GeForce RTX 3070 (17-ck0xxx MSG)',
      'NVIDIA GeForce RTX 3080 (17-ck0xxx MSG)',
      'NVIDIA GeForce RTX 4050 (17-db0xxx GPU matrix)',
      'NVIDIA GeForce RTX 4060 (17-db0xxx / 17-cm2xxx GPU matrix)',
      'NVIDIA GeForce RTX 4070 (17-db0xxx / 17-cm2xxx GPU matrix)',
      'NVIDIA GeForce RTX 4080 (17-ck2xxx GPU matrix)',
      'NVIDIA GeForce RTX 4090 (17-ck2xxx GPU matrix)',
    ],
    memory: {
      ramType: 'DDR4 (17-ck0xxx MSG sample)',
      ramSpeed: 'DDR4-3200 / DDR4-2933 (17-ck0xxx MSG)',
      ramSlots: 2,
      ramSoldered: false,
      ramMax: '32GB-class dual-SODIMM (17-ck0xxx MSG configurations)',
      ramConfigurations: ['8GB', '16GB', '32GB'],
    },
    storage: {
      storageInterface: 'PCIe NVMe M.2',
      storageSlots: null,
      storageOptions: ['512GB', '1TB'],
    },
    display: {
      displaySizes: ['17.3-inch'],
      resolutions: ['1920x1080', '2560x1440'],
      panelTypes: ['antiglare UWVA'],
      refreshRates: ['60Hz', '144Hz', '165Hz'],
    },
    batteryCapacity: '70Wh / 83Wh (17-ck0xxx MSG)',
    chargerWattageOptions: ['330W (17-ck0xxx MSG Smart AC adapter)'],
    notes: 'Marketing name OMEN 17 spans multiple letter families/generations. CPU matrix verified from 17-ck0xxx MSG; GPU options combine MSG + official HP NVIDIA GPU performance matrix for 17-db/ck2/cm2. Later AMD or Intel Ultra families not asserted here. Confirm model number on service label.',
    sources: [
      { url: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_3798373_en-US-1.pdf', sourceType: 'official_pdf', title: 'OMEN 17 Laptop PC Maintenance and Service Guide (17-ck0xxx)', verificationStatus: 'VERIFIED' },
      { url: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_8109204_en-US-1.pdf', sourceType: 'official_pdf', title: 'OMEN by HP and Victus by HP — Performance specifications for NVIDIA GPUs', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_3798373_en-US-1.pdf',
      gpuOptions: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_8109204_en-US-1.pdf',
      'memory.ramType': 'https://kaas.hpcloud.hp.com/pdf-public/pdf_3798373_en-US-1.pdf',
      'display.displaySizes': 'https://kaas.hpcloud.hp.com/pdf-public/pdf_3798373_en-US-1.pdf',
      batteryCapacity: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_3798373_en-US-1.pdf',
      chargerWattageOptions: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_3798373_en-US-1.pdf',
      knownModelFamilies: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_8109204_en-US-1.pdf',
    },
  },
  'dell-g15-g16': {
    category: 'gaming',
    configurationScope: 'SERIES',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://dl.dell.com/content/manual6783340-dell-g16-7620-setup-and-specifications.pdf?language=en-us',
    modelCode: 'G15 5530 + G16 7620 official samples (merged site slug)',
    knownModelFamilies: [
      'Dell G15 5530',
      'Dell G16 7620',
      'Dell G15 earlier class (5510/5520 — confirm service tag)',
      'Dell G16 later class (7630 — confirm service tag)',
    ],
    cpuOptions: [
      '13th Generation Intel Core i5 / i7 / i9 (G15 5530 Dell KB)',
      '12th Generation Intel Core i7-12700H (G16 7620 Setup and Specs)',
      '12th Generation Intel Core i9-12900H (G16 7620 Setup and Specs)',
    ],
    gpuOptions: [
      'NVIDIA GeForce RTX 3050 (G15 5530 Owner\'s Manual port note)',
      'NVIDIA GeForce RTX 4050 (G15 5530 Owner\'s Manual port note)',
      'NVIDIA GeForce RTX 4060 (G15 5530 Owner\'s Manual port note)',
      'NVIDIA GeForce RTX 3050 Ti (G16 7620 Setup and Specs)',
      'NVIDIA GeForce RTX 3060 (G16 7620 Setup and Specs / port notes)',
      'NVIDIA GeForce RTX 3070 (G16 7620 Setup and Specs / port notes)',
      'NVIDIA GeForce RTX 3070 Ti (G16 7620 Setup and Specs)',
    ],
    memory: {
      ramType: 'DDR5',
      ramSpeed: 'DDR5-4800',
      ramSlots: 2,
      ramSoldered: false,
      ramMax: '32GB (G15 5530 / G16 7620 official)',
      ramConfigurations: ['8GB', '16GB', '32GB'],
    },
    storage: {
      storageInterface: 'PCIe NVMe M.2',
      storageSlots: 2,
      storageOptions: ['512GB', '1TB', '2TB'],
    },
    display: {
      displaySizes: ['15.6-inch', '16-inch'],
      resolutions: ['2560x1600'],
      panelTypes: ['WVA antiglare'],
      refreshRates: ['165Hz'],
    },
    batteryCapacity: '56Wh / 86Wh (G16 7620 Setup and Specs); confirm G15 capacity on service label',
    chargerWattageOptions: ['180W', '240W (G16 7620 Setup and Specs)'],
    notes: 'Site slug MERGES Dell G15 and G16. They are separate subfamilies with separate official manuals. Verified fields combine G15 5530 Owner\'s Manual/KB and G16 7620 Setup and Specifications. Do not treat as one Exact SKU. Older/newer platform codes (5510/5520/7630) need service-tag confirmation.',
    sources: [
      { url: 'https://dl.dell.com/content/manual6783340-dell-g16-7620-setup-and-specifications.pdf?language=en-us', sourceType: 'official_pdf', title: 'Dell G16 7620 Setup and Specifications', verificationStatus: 'VERIFIED' },
      { url: 'https://www.dell.com/support/kbdoc/en-us/000211027/dell-g-series-15-5530-usage-and-troubleshooting-guide', sourceType: 'official_support', title: 'Dell G-Series 15 5530 Usage and Troubleshooting Guide', verificationStatus: 'VERIFIED' },
      { url: 'https://www.dell.com/support/manuals/en-us/g-series-15-5530-laptop/dell-g15-5530-owners-manual/back?guid=guid-f2dda353-ba5a-44c0-b85f-6bf1b8c70d15&lang=en-us', sourceType: 'official_support', title: 'Dell G15 5530 Owner\'s Manual — back/ports (RTX 3050/4050/4060 note)', verificationStatus: 'VERIFIED' },
      { url: 'https://www.dell.com/support/manuals/en-us/g-series-15-5530-laptop/dell-g15-5530-owners-manual/storage?guid=guid-a00459e0-2a64-449c-9f02-581bf2e3c2cf&lang=en-us', sourceType: 'official_support', title: 'Dell G15 5530 Owner\'s Manual — storage', verificationStatus: 'VERIFIED' },
      { url: 'https://www.dell.com/support/manuals/en-us/g-series-15-5530-laptop/dell-g15-5530-owners-manual/memory?guid=guid-e9d2ea83-38a4-431d-803c-96d63c1dbc34&lang=en-us', sourceType: 'official_support', title: 'Dell G15 5530 Owner\'s Manual — memory', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://www.dell.com/support/kbdoc/en-us/000211027/dell-g-series-15-5530-usage-and-troubleshooting-guide',
      gpuOptions: 'https://dl.dell.com/content/manual6783340-dell-g16-7620-setup-and-specifications.pdf?language=en-us',
      'memory.ramSlots': 'https://www.dell.com/support/manuals/en-us/g-series-15-5530-laptop/dell-g15-5530-owners-manual/memory?guid=guid-e9d2ea83-38a4-431d-803c-96d63c1dbc34&lang=en-us',
      'storage.storageOptions': 'https://www.dell.com/support/manuals/en-us/g-series-15-5530-laptop/dell-g15-5530-owners-manual/storage?guid=guid-a00459e0-2a64-449c-9f02-581bf2e3c2cf&lang=en-us',
      'display.displaySizes': 'https://dl.dell.com/content/manual6783340-dell-g16-7620-setup-and-specifications.pdf?language=en-us',
      batteryCapacity: 'https://dl.dell.com/content/manual6783340-dell-g16-7620-setup-and-specifications.pdf?language=en-us',
      chargerWattageOptions: 'https://dl.dell.com/content/manual6783340-dell-g16-7620-setup-and-specifications.pdf?language=en-us',
      knownModelFamilies: 'https://dl.dell.com/content/manual6783340-dell-g16-7620-setup-and-specifications.pdf?language=en-us',
    },
  },
  'lenovo-legion-pro': {
    category: 'gaming',
    configurationScope: 'SERIES',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_Pro_7_16IRX8H/Legion_Pro_7_16IRX8H_Spec.pdf',
    modelCode: 'Legion Pro 5 16IRX10 / Legion Pro 7 16IRX8H PSREF samples',
    knownModelFamilies: [
      'Legion Pro 5 16IRX10',
      'Legion Pro 7 16IRX8H',
      'Legion Pro 5i / 7i (Intel naming — confirm machine type)',
      'Legion Pro 5 / 7 AMD variants (not asserted from these two PSREF PDFs)',
    ],
    cpuOptions: [
      'Intel Core i7-14650HX (Pro 5 16IRX10)',
      'Intel Core i7-14700HX (Pro 5 16IRX10)',
      'Intel Core i9-14900HX (Pro 5 16IRX10)',
      'Intel Core i9-13900HX (Pro 7 16IRX8H)',
    ],
    gpuOptions: [
      'NVIDIA GeForce RTX 5050 Laptop GPU (Pro 5 16IRX10)',
      'NVIDIA GeForce RTX 5060 Laptop GPU (Pro 5 16IRX10)',
      'NVIDIA GeForce RTX 5070 Laptop GPU (Pro 5 16IRX10)',
      'NVIDIA GeForce RTX 4080 Laptop GPU (Pro 7 16IRX8H)',
      'NVIDIA GeForce RTX 4090 Laptop GPU (Pro 7 16IRX8H)',
    ],
    memory: {
      ramType: 'DDR5',
      ramSpeed: 'DDR5-4800 / DDR5-5600',
      ramSlots: 2,
      ramSoldered: false,
      ramMax: '32GB (PSREF offerings on sampled models)',
      ramConfigurations: ['16GB', '32GB'],
    },
    storage: {
      storageInterface: 'PCIe 4.0 NVMe M.2',
      storageSlots: 2,
      storageOptions: ['512GB', '1TB'],
    },
    display: {
      displaySizes: ['16-inch'],
      resolutions: ['2560x1600'],
      panelTypes: ['IPS'],
      refreshRates: ['240Hz'],
    },
    batteryCapacity: '80Wh (Pro 5 16IRX10 / Pro 7 option) / 99.9Wh (Pro 7 16IRX8H option)',
    chargerWattageOptions: ['245W (Pro 5 16IRX10)', '330W (Pro 7 16IRX8H)'],
    weightRange: '~2.4 kg (Pro 5 16IRX10) / <2.8 kg (Pro 7 16IRX8H)',
    notes: 'Site slug is SERIES across Legion Pro 5/5i/7/7i. Verified options come from Lenovo PSREF for Pro 5 16IRX10 and Pro 7 16IRX8H only. Do not apply Pro 7 RTX 4080/4090 to every Legion Pro. AMD Pro SKUs and older RTX 30/40 mid-tier Pro 5 gens not asserted from these two PDFs.',
    sources: [
      { url: 'https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_Pro_5_16IRX10/Legion_Pro_5_16IRX10_Spec.pdf', sourceType: 'official_pdf', title: 'Lenovo Legion Pro 5 16IRX10 Spec (PSREF)', verificationStatus: 'VERIFIED' },
      { url: 'https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_Pro_7_16IRX8H/Legion_Pro_7_16IRX8H_Spec.pdf', sourceType: 'official_pdf', title: 'Lenovo Legion Pro 7 16IRX8H Spec (PSREF)', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_Pro_5_16IRX10/Legion_Pro_5_16IRX10_Spec.pdf',
      gpuOptions: 'https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_Pro_7_16IRX8H/Legion_Pro_7_16IRX8H_Spec.pdf',
      'memory.ramSlots': 'https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_Pro_5_16IRX10/Legion_Pro_5_16IRX10_Spec.pdf',
      batteryCapacity: 'https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_Pro_7_16IRX8H/Legion_Pro_7_16IRX8H_Spec.pdf',
      chargerWattageOptions: 'https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_Pro_7_16IRX8H/Legion_Pro_7_16IRX8H_Spec.pdf',
      'display.refreshRates': 'https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_Pro_5_16IRX10/Legion_Pro_5_16IRX10_Spec.pdf',
      knownModelFamilies: 'https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_Pro_5_16IRX10/Legion_Pro_5_16IRX10_Spec.pdf',
    },
  },
};

const doc = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));
const provDoc = JSON.parse(fs.readFileSync(provPath, 'utf8'));
let addedFields = 0;

for (const [slug, overlay] of Object.entries(OVERLAYS)) {
  const idx = doc.models.findIndex((m) => m.slug === slug);
  if (idx < 0) throw new Error(`Missing model ${slug}`);
  const { fieldSources = {}, ...rest } = overlay;
  const base = doc.models[idx];
  const next = {
    ...base,
    ...rest,
    memory: { ...base.memory, ...(rest.memory || {}) },
    storage: { ...base.storage, ...(rest.storage || {}) },
    display: { ...base.display, ...(rest.display || {}) },
    retrievedDate,
  };
  doc.models[idx] = next;

  provDoc.records = provDoc.records.filter((r) => r.model !== slug);
  const fallback = next.officialUrl || next.sources?.[0]?.url;
  for (const field of HARDWARE_FIELDS) {
    const value = getPath(next, field);
    if (!nonempty(value)) continue;
    const url = fieldSources[field] || fallback;
    if (!url) throw new Error(`No provenance for ${slug}.${field}`);
    const src = (next.sources || []).find((s) => s.url === url) || {
      url,
      sourceType: 'official_product',
      title: '',
      verificationStatus: 'VERIFIED',
    };
    provDoc.records.push({
      brand: next.brand,
      model: slug,
      field,
      value: Array.isArray(value) ? value.join(' | ') : String(value),
      source_url: url,
      source_type: src.sourceType,
      source_title: src.title || '',
      retrieved_date: retrievedDate,
      verification_status: src.verificationStatus,
      scope: next.configurationScope,
      notes: fieldSources[field] ? 'batch4_official_research' : 'Inherited from model official/primary source',
    });
    addedFields += 1;
  }
}

doc.retrievedDate = retrievedDate;
provDoc.retrievedDate = retrievedDate;
fs.writeFileSync(modelsPath, JSON.stringify(doc, null, 2));
fs.writeFileSync(provPath, JSON.stringify(provDoc, null, 2));
console.log(JSON.stringify({
  patched: Object.keys(OVERLAYS),
  ready: Object.entries(OVERLAYS).filter(([, o]) => String(o.eligibility).startsWith('READY')).map(([s]) => s),
  deferred: Object.entries(OVERLAYS).filter(([, o]) => !String(o.eligibility).startsWith('READY')).map(([s, o]) => `${s}:${o.eligibility}`),
  provenance_fields_written: addedFields,
  provenance_total: provDoc.records.length,
}, null, 2));
