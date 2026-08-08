/**
 * Patch models.json + provenance.json with Batch 2 official research overlays.
 * Usage: node scripts/spec-data/patch-batch2-research.mjs
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
  'macbook-pro-m1': {
    category: 'creator',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://support.apple.com/en-us/111893',
    generation: 'M1',
    cpuOptions: [
      'Apple M1 8-core CPU (13-inch 2020)',
      'Apple M1 Pro 8-core CPU (14/16 2021)',
      'Apple M1 Pro 10-core CPU (14/16 2021)',
      'Apple M1 Max 10-core CPU (14/16 2021)',
    ],
    gpuOptions: [
      'Apple M1 8-core GPU (13-inch 2020)',
      'Apple M1 Pro 14-core GPU',
      'Apple M1 Pro 16-core GPU',
      'Apple M1 Max 24-core GPU',
      'Apple M1 Max 32-core GPU',
    ],
    memory: {
      ramType: 'Unified memory',
      ramSpeed: null,
      ramSlots: 0,
      ramSoldered: true,
      ramMax: '64GB (M1 Max)',
      ramConfigurations: ['8GB', '16GB', '32GB', '64GB'],
    },
    storage: {
      storageInterface: 'Apple SSD',
      storageSlots: null,
      storageOptions: ['256GB', '512GB', '1TB', '2TB', '4TB', '8TB'],
    },
    display: {
      displaySizes: ['13.3-inch', '14.2-inch', '16.2-inch'],
      resolutions: ['2560x1600', '3024x1964'],
      panelTypes: ['Retina (13-inch M1)', 'Liquid Retina XDR (14/16)'],
      refreshRates: ['60Hz', '120Hz'],
    },
    wifi: 'Wi-Fi 6',
    bluetooth: 'Bluetooth 5.0',
    ports: [
      '2x Thunderbolt / USB 4 (13-inch M1)',
      'MagSafe 3 (14/16)',
      'Thunderbolt 4 (14/16)',
      'HDMI (14/16)',
      'SDXC (14/16)',
      '3.5mm headphone',
    ],
    batteryCapacity: '58.2Wh (13-inch M1) / 70Wh class (14-inch M1 Pro/Max reference)',
    chargerWattageOptions: ['61W USB-C', '67W USB-C', '96W USB-C'],
    knownModelFamilies: [
      'MacBook Pro 13-inch M1 (2020)',
      'MacBook Pro 14/16-inch M1 Pro/Max (2021)',
    ],
    notes: 'Marketing family slug. Verified from Apple Tech Specs 13-inch M1 2020 + 14-inch 2021 M1 Pro/Max. Confirm chip and screen size on About This Mac; do not treat as one Exact SKU.',
    sources: [
      { url: 'https://support.apple.com/en-us/111893', sourceType: 'official_support', title: 'MacBook Pro (13-inch, M1, 2020) Tech Specs', verificationStatus: 'VERIFIED' },
      { url: 'https://support.apple.com/en-us/111902', sourceType: 'official_support', title: 'MacBook Pro (14-inch, 2021) Tech Specs', verificationStatus: 'VERIFIED' },
      { url: 'https://support.apple.com/en-us/108052', sourceType: 'official_support', title: 'Identify your MacBook Pro model', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://support.apple.com/en-us/111893',
      gpuOptions: 'https://support.apple.com/en-us/111902',
      'memory.ramConfigurations': 'https://support.apple.com/en-us/111893',
      'storage.storageOptions': 'https://support.apple.com/en-us/111902',
      chargerWattageOptions: 'https://support.apple.com/en-us/111893',
      batteryCapacity: 'https://support.apple.com/en-us/111893',
      'display.refreshRates': 'https://support.apple.com/en-us/111902',
      knownModelFamilies: 'https://support.apple.com/en-us/108052',
    },
  },
  'macbook-pro-m2': {
    category: 'creator',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://support.apple.com/en-us/111340',
    generation: 'M2',
    cpuOptions: [
      'Apple M2 8-core CPU (13-inch class)',
      'Apple M2 Pro 10-core CPU (14/16 2023)',
      'Apple M2 Pro 12-core CPU (14/16 2023)',
      'Apple M2 Max 12-core CPU (14/16 2023)',
    ],
    gpuOptions: [
      'Apple M2 10-core GPU (13-inch class)',
      'Apple M2 Pro 16-core GPU',
      'Apple M2 Pro 19-core GPU',
      'Apple M2 Max 30-core GPU',
      'Apple M2 Max 38-core GPU',
    ],
    memory: {
      ramType: 'Unified memory',
      ramSpeed: null,
      ramSlots: 0,
      ramSoldered: true,
      ramMax: '96GB (M2 Max CTO)',
      ramConfigurations: ['8GB', '16GB', '24GB', '32GB', '64GB', '96GB'],
    },
    storage: {
      storageInterface: 'Apple SSD',
      storageSlots: null,
      storageOptions: ['256GB', '512GB', '1TB', '2TB', '4TB', '8TB'],
    },
    display: {
      displaySizes: ['13.3-inch', '14.2-inch', '16.2-inch'],
      resolutions: ['2560x1600', '3024x1964'],
      panelTypes: ['Liquid Retina (13-inch M2)', 'Liquid Retina XDR (14/16)'],
      refreshRates: ['60Hz', '120Hz'],
    },
    wifi: 'Wi-Fi 6 / Wi-Fi 6E (varies by 13 vs 14/16 class pages)',
    bluetooth: null,
    ports: [
      'MagSafe 3',
      'Thunderbolt / USB-C family ports',
      'HDMI (14/16)',
      'SDXC (14/16)',
      'Touch Bar (13-inch M2 class)',
    ],
    chargerWattageOptions: ['67W USB-C', '96W USB-C'],
    knownModelFamilies: [
      'MacBook Pro 13-inch M2',
      'MacBook Pro 14/16-inch M2 Pro/Max (2023)',
    ],
    notes: 'Marketing family slug spanning 13-inch M2 and 14/16 M2 Pro/Max. Primary numeric matrix from Apple 14-inch 2023 Tech Specs; confirm chip/size on About This Mac.',
    sources: [
      { url: 'https://support.apple.com/en-us/111340', sourceType: 'official_support', title: 'MacBook Pro (14-inch, 2023) Tech Specs', verificationStatus: 'VERIFIED' },
      { url: 'https://support.apple.com/en-us/108052', sourceType: 'official_support', title: 'Identify your MacBook Pro model', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://support.apple.com/en-us/111340',
      gpuOptions: 'https://support.apple.com/en-us/111340',
      'memory.ramConfigurations': 'https://support.apple.com/en-us/111340',
      'storage.storageOptions': 'https://support.apple.com/en-us/111340',
      chargerWattageOptions: 'https://support.apple.com/en-us/111340',
      knownModelFamilies: 'https://support.apple.com/en-us/108052',
    },
  },
  'acer-nitro-17': {
    category: 'gaming',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://www.acer.com/us-en/laptops/nitro/nitro-17-intel/pdp/NH.QK6AA.001',
    modelCode: 'AN17-51 / AN17-42 families',
    cpuOptions: [
      'Intel Core i7-14700HX class (AN17-51 family marketing/PDP)',
      'AMD Ryzen 5 (AN17-42 AMD PDP sample)',
    ],
    gpuOptions: [
      'NVIDIA GeForce RTX 4050 Laptop GPU',
      'NVIDIA GeForce RTX 4060 Laptop GPU',
    ],
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
      displaySizes: ['17.3-inch'],
      resolutions: ['2560x1440'],
      panelTypes: [],
      refreshRates: [],
    },
    notes: 'Verified from Acer.com Nitro 17 Intel AN17-51 and AMD AN17-42 PDPs. Family has multiple SKUs; do not collapse to one Exact CPU/GPU. RTX 4070+ not asserted from sampled official PDPs.',
    sources: [
      { url: 'https://www.acer.com/us-en/laptops/nitro/nitro-17-intel/pdp/NH.QK6AA.001', sourceType: 'official_product', title: 'Nitro 17 AN17-51-70XP', verificationStatus: 'VERIFIED' },
      { url: 'https://www.acer.com/us-en/laptops/nitro/nitro-17-amd/pdp/NH.QPBAA.001', sourceType: 'official_product', title: 'Nitro 17 AN17-42-R61S', verificationStatus: 'VERIFIED' },
      { url: 'https://www.acer.com/gb-en/laptops/nitro/nitro-17-intel/pdp/NH.QK6EK.001', sourceType: 'official_product', title: 'Nitro 17 AN17-51-781V', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      gpuOptions: 'https://www.acer.com/us-en/laptops/nitro/nitro-17-intel/pdp/NH.QK6AA.001',
      cpuOptions: 'https://www.acer.com/us-en/laptops/nitro/nitro-17-amd/pdp/NH.QPBAA.001',
      'display.displaySizes': 'https://www.acer.com/gb-en/laptops/nitro/nitro-17-intel/pdp/NH.QK6EK.001',
      'display.resolutions': 'https://www.acer.com/gb-en/laptops/nitro/nitro-17-intel/pdp/NH.QK6EK.001',
    },
  },
  'acer-nitro-v': {
    category: 'gaming',
    configurationScope: 'SERIES',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://www.acer.com/us-en/laptops/nitro/nitro-v-15/pdp/NH.QN8AA.004',
    modelCode: 'ANV15 / ANV16 families',
    knownModelFamilies: ['Nitro V 15 (ANV15)', 'Nitro V 16 (ANV16)'],
    cpuOptions: [
      'Intel Core i5-13420H',
      'Intel Core i7-13620H',
      'Intel Core 7 240H (ANV15-52 store/PDP class)',
      'AMD Ryzen 5 8645HS (ANV16)',
      'AMD Ryzen 7 8845HS (ANV16)',
    ],
    gpuOptions: [
      'NVIDIA GeForce RTX 3050',
      'NVIDIA GeForce RTX 4050',
      'NVIDIA GeForce RTX 5060',
    ],
    memory: {
      ramType: 'DDR5 / DDR4 (varies by ANV15 SKU listing)',
      ramSpeed: null,
      ramSlots: null,
      ramSoldered: null,
      ramMax: '32GB (some ANV15 listings)',
      ramConfigurations: ['16GB', '32GB'],
    },
    storage: {
      storageInterface: 'PCIe NVMe',
      storageSlots: null,
      storageOptions: ['512GB', '1TB'],
    },
    display: {
      displaySizes: ['15.6-inch', '16-inch'],
      resolutions: ['1920x1080'],
      panelTypes: ['IPS'],
      refreshRates: ['144Hz', '165Hz', '180Hz'],
    },
    batteryCapacity: '57Wh / 76Wh (ANV15 PDP samples)',
    chargerWattageOptions: ['135W'],
    notes: 'Site slug spans Nitro V 15 and Nitro V 16. Verified from Acer.com ANV15 and ANV16 official pages. Confirm 15 vs 16 and machine code before Exact SKU claims. RTX 2050/4060 not asserted from sampled official PDPs.',
    sources: [
      { url: 'https://www.acer.com/us-en/laptops/nitro/nitro-v-15/pdp/NH.QN8AA.004', sourceType: 'official_product', title: 'Nitro V 15 ANV15-51-515P', verificationStatus: 'VERIFIED' },
      { url: 'https://www.acer.com/us-en/laptops/nitro/nitro-v-15/pdp/NH.QN9AA.002', sourceType: 'official_product', title: 'Nitro V 15 ANV15-51-54UL', verificationStatus: 'VERIFIED' },
      { url: 'https://www.acer.com/gb-en/laptops/nitro/nitro-v-15/pdp/NH.QZAEK.004', sourceType: 'official_product', title: 'Nitro V 15 ANV15-52-76VD', verificationStatus: 'VERIFIED' },
      { url: 'https://www.acer.com/us-en/laptops/nitro/nitro-v-16-amd/pdp/NH.QP0AA.001', sourceType: 'official_product', title: 'Nitro V 16 ANV16-41-R5J0', verificationStatus: 'VERIFIED' },
      { url: 'https://www.acer.com/us-en/laptops/nitro/nitro-v-16-amd', sourceType: 'official_product', title: 'Nitro V 16 AMD family hub', verificationStatus: 'PARTIAL' },
    ],
    fieldSources: {
      cpuOptions: 'https://www.acer.com/us-en/laptops/nitro/nitro-v-16-amd/pdp/NH.QP0AA.001',
      gpuOptions: 'https://www.acer.com/us-en/laptops/nitro/nitro-v-15/pdp/NH.QN8AA.004',
      'display.displaySizes': 'https://www.acer.com/us-en/laptops/nitro/nitro-v-16-amd',
      'display.refreshRates': 'https://www.acer.com/gb-en/laptops/nitro/nitro-v-15/pdp/NH.QZAEK.004',
      chargerWattageOptions: 'https://www.acer.com/us-en/laptops/nitro/nitro-v-15/pdp/NH.QN8AA.004',
      batteryCapacity: 'https://www.acer.com/us-en/laptops/nitro/nitro-v-15/pdp/NH.QN8AA.004',
      knownModelFamilies: 'https://www.acer.com/us-en/laptops/nitro/nitro-v-16-amd',
    },
  },
  'asus-zephyrus-g16': {
    category: 'gaming',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://rog.asus.com/us/laptops/rog-zephyrus/rog-zephyrus-g16-2024-ga605/spec/',
    modelCode: 'GA605 / GU605 (2024) multi-year family',
    cpuOptions: [
      'AMD Ryzen AI 9 HX 370 (GA605 2024)',
      'Intel Core Ultra 9 185H (GU605 2024)',
    ],
    gpuOptions: [
      'NVIDIA GeForce RTX 4060 Laptop GPU',
      'NVIDIA GeForce RTX 4070 Laptop GPU',
      'NVIDIA GeForce RTX 4080 Laptop GPU',
      'NVIDIA GeForce RTX 4090 Laptop GPU',
    ],
    memory: {
      ramType: 'LPDDR5X onboard',
      ramSpeed: null,
      ramSlots: 0,
      ramSoldered: true,
      ramMax: '32GB',
      ramConfigurations: ['16GB', '32GB'],
    },
    storage: {
      storageInterface: 'PCIe 4.0 NVMe M.2',
      storageSlots: null,
      storageOptions: ['1TB', '2TB'],
    },
    display: {
      displaySizes: ['16-inch'],
      resolutions: ['2560x1600'],
      panelTypes: ['OLED Nebula Display options'],
      refreshRates: ['240Hz'],
    },
    batteryCapacity: '90Wh (2024 GA605 listing)',
    chargerWattageOptions: ['200W'],
    weightRange: '1.85 kg (GA605 listing)',
    notes: 'Official ROG pages show AMD GA605 and Intel GU605 2024 lines under Zephyrus G16 marketing name. Multi-year family — confirm year/code before Exact SKU claims.',
    sources: [
      { url: 'https://rog.asus.com/us/laptops/rog-zephyrus/rog-zephyrus-g16-2024-ga605/spec/', sourceType: 'official_product', title: 'ROG Zephyrus G16 (2024) GA605 Spec', verificationStatus: 'VERIFIED' },
      { url: 'https://rog.asus.com/us/laptops/rog-zephyrus/rog-zephyrus-g16-2024/spec/', sourceType: 'official_product', title: 'ROG Zephyrus G16 (2024) GU605 Spec', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://rog.asus.com/us/laptops/rog-zephyrus/rog-zephyrus-g16-2024-ga605/spec/',
      gpuOptions: 'https://rog.asus.com/us/laptops/rog-zephyrus/rog-zephyrus-g16-2024/spec/',
      batteryCapacity: 'https://rog.asus.com/us/laptops/rog-zephyrus/rog-zephyrus-g16-2024-ga605/spec/',
      chargerWattageOptions: 'https://rog.asus.com/us/laptops/rog-zephyrus/rog-zephyrus-g16-2024-ga605/spec/',
      'display.refreshRates': 'https://rog.asus.com/us/laptops/rog-zephyrus/rog-zephyrus-g16-2024-ga605/spec/',
      'memory.ramConfigurations': 'https://rog.asus.com/us/laptops/rog-zephyrus/rog-zephyrus-g16-2024-ga605/spec/',
    },
  },
  'hp-victus-16': {
    category: 'gaming',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7911438_en-US-1.pdf',
    modelCode: '16-s0xxx family (sample MSG)',
    cpuOptions: [
      'AMD Ryzen 7 PRO 7840HS',
      'AMD Ryzen 7 PRO 7840H',
      'AMD Ryzen 5 PRO 7640HS',
      'AMD Ryzen 5 PRO 7640H',
    ],
    gpuOptions: [
      'NVIDIA GeForce RTX 3050',
      'NVIDIA GeForce RTX 4050',
      'NVIDIA GeForce RTX 4060',
      'NVIDIA GeForce RTX 4070',
    ],
    memory: {
      ramType: 'DDR5-5600',
      ramSpeed: 'DDR5-5600',
      ramSlots: 2,
      ramSoldered: false,
      ramMax: null,
      ramConfigurations: ['8GB', '16GB'],
    },
    storage: {
      storageInterface: 'PCIe NVMe',
      storageSlots: null,
      storageOptions: ['1TB'],
    },
    display: {
      displaySizes: ['16.1-inch'],
      resolutions: ['1920x1080', '2560x1440'],
      panelTypes: ['antiglare WLED'],
      refreshRates: ['144Hz', '165Hz'],
    },
    batteryCapacity: '70Wh / 83Wh (MSG options)',
    notes: 'Verified from official HP Victus 16-s0xxx Maintenance and Service Guide. Other Victus 16 letter families (d/r/e) exist — treat site slug as MODEL_FAMILY, confirm exact model number.',
    sources: [
      { url: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7911438_en-US-1.pdf', sourceType: 'official_pdf', title: 'Victus 16-s0xxx Maintenance and Service Guide', verificationStatus: 'VERIFIED' },
      { url: 'https://support.hp.com/us-en/product/troubleshooting/victus-by-hp-16.1-inch-gaming-laptop-pc-16-e0000/2100371512', sourceType: 'official_support', title: 'Victus 16.1 support hub example', verificationStatus: 'PARTIAL' },
    ],
    fieldSources: {
      cpuOptions: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7911438_en-US-1.pdf',
      gpuOptions: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7911438_en-US-1.pdf',
      'memory.ramSlots': 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7911438_en-US-1.pdf',
      'display.displaySizes': 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7911438_en-US-1.pdf',
      'display.refreshRates': 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7911438_en-US-1.pdf',
      batteryCapacity: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_7911438_en-US-1.pdf',
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

  // replace provenance for this model
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
      notes: fieldSources[field] ? 'batch2_official_research' : 'Inherited from model official/primary source',
    });
    addedFields += 1;
  }
}

doc.retrievedDate = retrievedDate;
provDoc.retrievedDate = retrievedDate;
fs.writeFileSync(modelsPath, JSON.stringify(doc, null, 2));
fs.writeFileSync(provPath, JSON.stringify(provDoc, null, 2));
console.log(JSON.stringify({ patched: Object.keys(OVERLAYS), provenance_fields_written: addedFields, provenance_total: provDoc.records.length }, null, 2));
