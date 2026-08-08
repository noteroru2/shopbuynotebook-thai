/**
 * Patch models.json + provenance.json with Batch 3 official research overlays.
 * Usage: node scripts/spec-data/patch-batch3-research.mjs
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
  'hp-omen-16': {
    category: 'gaming',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7768944_en-US-1.pdf',
    modelCode: '16-wf0xxx / 16-wd0xxx class (MSG sample)',
    cpuOptions: [
      'Intel Core i9-13900HX',
      'Intel Core i7-13700HX',
      'Intel Core i5-13500HX',
      'Intel Core i7-13700H',
      'Intel Core i7-13620H',
      'Intel Core i5-13500H',
      'Intel Core i5-13420H',
    ],
    gpuOptions: [
      'NVIDIA GeForce RTX 3050',
      'NVIDIA GeForce RTX 4050',
      'NVIDIA GeForce RTX 4060',
      'NVIDIA GeForce RTX 4070',
      'NVIDIA GeForce RTX 4080',
    ],
    memory: {
      ramType: 'DDR5',
      ramSpeed: 'DDR5-4800 / DDR5-5200 / DDR5-5600',
      ramSlots: 2,
      ramSoldered: false,
      ramMax: '32GB (MSG dual-slot support note)',
      ramConfigurations: ['8GB', '16GB', '32GB'],
    },
    storage: {
      storageInterface: 'PCIe NVMe',
      storageSlots: null,
      storageOptions: ['512GB', '1TB', '2TB'],
    },
    display: {
      displaySizes: ['16.1-inch'],
      resolutions: ['1920x1080', '2560x1440'],
      panelTypes: ['antiglare WLED UWVA'],
      refreshRates: ['144Hz', '165Hz', '240Hz'],
    },
    batteryCapacity: '70Wh / 83Wh (MSG options)',
    knownModelFamilies: ['OMEN 16-wf0xxx', 'OMEN 16-wd0xxx (shared MSG lineage)'],
    notes: 'Verified from HP OMEN 16.1 MSG for 16-wf/wd class. Other letter families (xf/am/an) exist — confirm model number on service label. Do not treat as Exact SKU.',
    sources: [
      { url: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7768944_en-US-1.pdf', sourceType: 'official_pdf', title: 'OMEN 16.1 inch Gaming Laptop PC Maintenance and Service Guide (16-wf/wd)', verificationStatus: 'VERIFIED' },
      { url: 'https://support.hp.com/us-en/product/setup-user-guides/omen-by-hp-16.1-inch-gaming-laptop-pc-16-wf0000/model/2101572115', sourceType: 'official_support', title: 'OMEN 16-wf0000 manuals hub', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7768944_en-US-1.pdf',
      gpuOptions: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7768944_en-US-1.pdf',
      'memory.ramSlots': 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7768944_en-US-1.pdf',
      'display.displaySizes': 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7768944_en-US-1.pdf',
      batteryCapacity: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7768944_en-US-1.pdf',
      knownModelFamilies: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7768944_en-US-1.pdf',
    },
  },
  'asus-tuf-a15-f15': {
    category: 'gaming',
    configurationScope: 'SERIES',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2024/techspec/',
    modelCode: 'FA507 (A15 2024) / FX507 (F15 2023) sample families',
    knownModelFamilies: ['TUF Gaming A15 FA507 (2024)', 'TUF Gaming F15 FX507 (2023)'],
    cpuOptions: [
      'AMD Ryzen 9 8945H (A15 2024)',
      'AMD Ryzen 7 8845HS / 8845H (A15 2024)',
      'Intel Core i9-13900H (F15 2023)',
      'Intel Core i7-13620H (F15 2023)',
      'Intel Core i7-12700H (F15 2023 sample)',
    ],
    gpuOptions: [
      'NVIDIA GeForce RTX 4050 Laptop GPU',
      'NVIDIA GeForce RTX 4060 Laptop GPU',
      'NVIDIA GeForce RTX 4070 Laptop GPU',
    ],
    memory: {
      ramType: 'DDR5 / DDR4 (varies by F15 SKU)',
      ramSpeed: 'DDR5-5600 (A15) / DDR5-4800 or DDR4-3200 (F15)',
      ramSlots: 2,
      ramSoldered: false,
      ramMax: '64GB (official techspec max on sampled pages)',
      ramConfigurations: ['8GB', '16GB', '32GB'],
    },
    storage: {
      storageInterface: 'PCIe 4.0 NVMe M.2',
      storageSlots: 2,
      storageOptions: ['512GB', '1TB', '2TB'],
    },
    display: {
      displaySizes: ['15.6-inch'],
      resolutions: ['1920x1080', '2560x1440'],
      panelTypes: ['IPS-level antiglare'],
      refreshRates: ['144Hz', '165Hz'],
    },
    batteryCapacity: '90Wh (A15 2024 / F15 2023 listings)',
    chargerWattageOptions: ['240W', '100W USB-C (select A15 bundles)'],
    weightRange: '2.20 kg (A15/F15 techspec listings)',
    notes: 'Site slug merges A15 (AMD) and F15 (Intel). Verified from official ASUS techspec pages for A15 2024 and F15 2023 samples. Older GTX/RTX 20-series not asserted from these official pages.',
    sources: [
      { url: 'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2024/techspec/', sourceType: 'official_product', title: 'ASUS TUF Gaming A15 (2024) Tech Specs', verificationStatus: 'VERIFIED' },
      { url: 'https://www.asus.com/us/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-f15-2023/techspec/', sourceType: 'official_product', title: 'ASUS TUF Gaming F15 (2023) Tech Specs', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2024/techspec/',
      gpuOptions: 'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2024/techspec/',
      chargerWattageOptions: 'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2024/techspec/',
      batteryCapacity: 'https://www.asus.com/us/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-f15-2023/techspec/',
      knownModelFamilies: 'https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2024/techspec/',
    },
  },
  'lenovo-loq-15-16': {
    category: 'gaming',
    configurationScope: 'SERIES',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://psref.lenovo.com/syspool/Sys/PDF/LOQ/LOQ_16APH8/LOQ_16APH8_Spec.pdf',
    modelCode: 'LOQ 15APH8 / 15IRH8 / 16APH8 sample families',
    knownModelFamilies: ['LOQ 15APH8', 'LOQ 15IRH8', 'LOQ 16APH8'],
    cpuOptions: [
      'AMD Ryzen 5 7640HS',
      'AMD Ryzen 7 7840HS',
      'Intel Core i5-12450H class (15IRH8)',
      'Intel Core i5-13420H class (15IRH8)',
      'Intel Core i7-13620H class (15IRH8)',
      'Intel Core i7-13700H class (15IRH8)',
    ],
    gpuOptions: [
      'NVIDIA GeForce RTX 3050 Laptop GPU',
      'NVIDIA GeForce RTX 4050 Laptop GPU',
      'NVIDIA GeForce RTX 4060 Laptop GPU',
    ],
    memory: {
      ramType: 'DDR5',
      ramSpeed: 'DDR5-4800 / DDR5-5200 / DDR5-5600 (varies by platform)',
      ramSlots: 2,
      ramSoldered: false,
      ramMax: '32GB',
      ramConfigurations: ['8GB', '16GB', '32GB'],
    },
    storage: {
      storageInterface: 'PCIe 4.0 NVMe M.2',
      storageSlots: 2,
      storageOptions: ['512GB', '1TB', '2TB'],
    },
    display: {
      displaySizes: ['15.6-inch', '16-inch'],
      resolutions: ['1920x1080', '1920x1200', '2560x1600'],
      panelTypes: ['IPS'],
      refreshRates: ['144Hz', '165Hz'],
    },
    batteryCapacity: '60Wh / 80Wh (16APH8 options; 15IRH8 60Wh sample)',
    chargerWattageOptions: ['135W', '170W', '230W'],
    weightRange: 'from ~2.4 kg (15) / ~2.6 kg (16) PSREF starting weights',
    notes: 'Site slug spans LOQ 15 and LOQ 16. Verified from Lenovo PSREF PDFs for 15APH8/15IRH8/16APH8 samples. Confirm machine type before Exact SKU claims.',
    sources: [
      { url: 'https://psref.lenovo.com/syspool/Sys/PDF/LOQ/LOQ_16APH8/LOQ_16APH8_Spec.pdf', sourceType: 'official_pdf', title: 'Lenovo LOQ 16APH8 Spec (PSREF)', verificationStatus: 'VERIFIED' },
      { url: 'https://psref.lenovo.com/syspool/Sys/PDF/LOQ/LOQ_15IRH8/LOQ_15IRH8_Spec.pdf', sourceType: 'official_pdf', title: 'Lenovo LOQ 15IRH8 Spec (PSREF)', verificationStatus: 'VERIFIED' },
      { url: 'https://psref.lenovo.com/syspool/Sys/PDF/LOQ/LOQ_15APH8/LOQ_15APH8_Spec.html', sourceType: 'official_product', title: 'Lenovo LOQ 15APH8 Spec (PSREF HTML)', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://psref.lenovo.com/syspool/Sys/PDF/LOQ/LOQ_16APH8/LOQ_16APH8_Spec.pdf',
      gpuOptions: 'https://psref.lenovo.com/syspool/Sys/PDF/LOQ/LOQ_16APH8/LOQ_16APH8_Spec.pdf',
      chargerWattageOptions: 'https://psref.lenovo.com/syspool/Sys/PDF/LOQ/LOQ_16APH8/LOQ_16APH8_Spec.pdf',
      batteryCapacity: 'https://psref.lenovo.com/syspool/Sys/PDF/LOQ/LOQ_16APH8/LOQ_16APH8_Spec.pdf',
      'display.displaySizes': 'https://psref.lenovo.com/syspool/Sys/PDF/LOQ/LOQ_15IRH8/LOQ_15IRH8_Spec.pdf',
      knownModelFamilies: 'https://psref.lenovo.com/syspool/Sys/PDF/LOQ/LOQ_15APH8/LOQ_15APH8_Spec.html',
    },
  },
  'hp-victus-17': {
    category: 'gaming',
    configurationScope: 'UNKNOWN',
    eligibility: 'AMBIGUOUS_MODEL',
    officialUrl: null,
    modelCode: null,
    cpuOptions: [],
    gpuOptions: [],
    memory: {
      ramType: null,
      ramSpeed: null,
      ramSlots: null,
      ramSoldered: null,
      ramMax: null,
      ramConfigurations: [],
    },
    storage: {
      storageInterface: null,
      storageSlots: null,
      storageOptions: [],
    },
    display: {
      displaySizes: [],
      resolutions: [],
      panelTypes: [],
      refreshRates: [],
    },
    batteryCapacity: null,
    chargerWattageOptions: [],
    knownModelFamilies: [],
    notes: 'DEFERRED Batch 3: no official HP Maintenance and Service Guide or product-spec matrix found for a Victus 17 laptop family. Current HP Victus official docs cover 15.6 and 16.1 inch lines; 17-inch gaming docs found under OMEN 17 instead. Do not enrich until official identity is verified.',
    sources: [
      { url: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7911438_en-US-1.pdf', sourceType: 'official_pdf', title: 'Victus 16.1 MSG (not Victus 17)', verificationStatus: 'PARTIAL' },
      { url: 'https://support.hp.com/us-en/document/ish_11270215-11270239-16', sourceType: 'official_support', title: 'HP product list shows Victus 15/16 laptop families', verificationStatus: 'PARTIAL' },
    ],
    fieldSources: {},
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
      notes: fieldSources[field] ? 'batch3_official_research' : 'Inherited from model official/primary source',
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
