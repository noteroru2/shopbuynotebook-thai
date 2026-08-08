/**
 * Build verified notebook spec datasets + provenance from curated official research.
 * Does not mutate Astro content. Hallucination forbidden — empty > guessed.
 *
 * Usage: node scripts/spec-data/build-verified-dataset.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const outData = path.join(root, 'data/notebook-specs');
const outDocs = path.join(root, 'docs/spec-data-foundation');
const retrievedDate = '2026-08-08';

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  const headers = rows.shift().map((v, i) => (i === 0 ? v.replace(/^\uFEFF/, '') : v));
  return rows.filter((v) => v.some(Boolean)).map((values) => Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ''])));
}

function emptyHardware() {
  return {
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
    wifi: null,
    bluetooth: null,
    ports: [],
    weightRange: null,
    dimensions: null,
    batteryCapacity: null,
    chargerWattageOptions: [],
    operatingSystemOptions: [],
    knownModelFamilies: [],
  };
}

function baseRecord(inv) {
  const slug = inv.model || inv.series;
  return {
    id: slug,
    brand: inv.brand,
    series: inv.series || '',
    model: inv.model || '',
    slug,
    pageType: inv.page_type,
    marketingName: inv.marketing_name || inv.normalized_model,
    modelFamily: inv.model_family || '',
    // Inventory heuristic codes are often size/generation tokens — only RESEARCH overlays may set modelCode.
    modelCode: null,
    machineType: null,
    productNumber: null,
    generation: inv.generation || null,
    category: null,
    configurationScope: 'UNKNOWN',
    eligibility: 'UNVERIFIED',
    officialUrl: null,
    ...emptyHardware(),
    resaleRelevance: {
      high: ['cpuOptions', 'gpuOptions', 'memory', 'storage', 'display', 'generation', 'chargerWattageOptions', 'batteryCapacity'],
      medium: ['ports', 'wifi', 'dimensions', 'weightRange'],
      low: [],
    },
    sources: [],
    retrievedDate,
    notes: 'No official manufacturer verification completed in this pass.',
  };
}

/**
 * Curated official research overlays. Only fields backed by listed sources.
 * Values rewritten from official facts — not copied marketing prose.
 */
const RESEARCH = {
  'macbook-air-m3': {
    category: 'ultrabook',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://support.apple.com/en-us/118551',
    generation: 'M3',
    modelFamily: 'MacBook Air M3',
    cpuOptions: ['Apple M3 8-core CPU'],
    gpuOptions: ['Apple M3 8-core GPU', 'Apple M3 10-core GPU'],
    memory: {
      ramType: 'Unified memory',
      ramSpeed: null,
      ramSlots: 0,
      ramSoldered: true,
      ramMax: '24GB',
      ramConfigurations: ['8GB', '16GB', '24GB'],
    },
    storage: {
      storageInterface: 'Apple SSD',
      storageSlots: null,
      storageOptions: ['256GB', '512GB', '1TB', '2TB'],
    },
    display: {
      displaySizes: ['13.6-inch', '15.3-inch'],
      resolutions: ['2560x1664', '2880x1864'],
      panelTypes: ['Liquid Retina IPS'],
      refreshRates: [],
    },
    wifi: 'Wi-Fi 6E',
    bluetooth: 'Bluetooth 5.3',
    ports: ['MagSafe 3', '2x Thunderbolt / USB 4', '3.5mm headphone'],
    batteryCapacity: '52.6Wh (13-inch) / see 15-inch support page for 15-inch battery',
    chargerWattageOptions: ['30W USB-C', '35W Dual USB-C', '70W USB-C (fast charge capable)'],
    operatingSystemOptions: ['macOS'],
    notes: 'Site slug is chip-family (M3) spanning 13/15 sizes. Use MODEL_FAMILY scope; confirm size from machine.',
    sources: [
      { url: 'https://support.apple.com/en-us/118551', sourceType: 'official_support', title: 'MacBook Air (13-inch, M3, 2024) - Tech Specs', verificationStatus: 'VERIFIED' },
      { url: 'https://support.apple.com/en-us/118552', sourceType: 'official_support', title: 'MacBook Air (15-inch, M3, 2024) - Tech Specs (companion size page)', verificationStatus: 'PARTIAL' },
    ],
    fieldSources: {
      cpuOptions: 'https://support.apple.com/en-us/118551',
      gpuOptions: 'https://support.apple.com/en-us/118551',
      'memory.ramConfigurations': 'https://support.apple.com/en-us/118551',
      'storage.storageOptions': 'https://support.apple.com/en-us/118551',
      'display.displaySizes': 'https://support.apple.com/en-us/118551',
      wifi: 'https://support.apple.com/en-us/118551',
      bluetooth: 'https://support.apple.com/en-us/118551',
      chargerWattageOptions: 'https://support.apple.com/en-us/118551',
      batteryCapacity: 'https://support.apple.com/en-us/118551',
    },
  },
  'macbook-air-m2': {
    category: 'ultrabook',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://support.apple.com/en-us/111867',
    generation: 'M2',
    cpuOptions: ['Apple M2 8-core CPU'],
    gpuOptions: ['Apple M2 8-core GPU', 'Apple M2 10-core GPU'],
    memory: {
      ramType: 'Unified memory',
      ramSpeed: null,
      ramSlots: 0,
      ramSoldered: true,
      ramMax: '24GB',
      ramConfigurations: ['8GB', '16GB', '24GB'],
    },
    storage: {
      storageInterface: 'Apple SSD',
      storageSlots: null,
      storageOptions: ['256GB', '512GB', '1TB', '2TB'],
    },
    display: {
      displaySizes: ['13.6-inch', '15.3-inch'],
      resolutions: ['2560x1664', '2880x1864'],
      panelTypes: ['Liquid Retina IPS'],
      refreshRates: [],
    },
    wifi: 'Wi-Fi 6',
    bluetooth: null,
    ports: ['MagSafe 3', '2x Thunderbolt / USB 4', '3.5mm headphone'],
    batteryCapacity: '52.6Wh (13-inch M2)',
    chargerWattageOptions: ['30W USB-C', '35W Dual USB-C', '70W USB-C (fast charge capable)'],
    notes: 'M2 Air exists as 13-inch (2022) and 15-inch (2023). Confirm size.',
    sources: [
      { url: 'https://support.apple.com/en-us/111867', sourceType: 'official_support', title: 'MacBook Air (M2, 2022) - Tech Specs', verificationStatus: 'VERIFIED' },
      { url: 'https://support.apple.com/en-us/111346', sourceType: 'official_support', title: 'MacBook Air (15-inch, M2, 2023) - Tech Specs', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://support.apple.com/en-us/111867',
      gpuOptions: 'https://support.apple.com/en-us/111867',
      'memory.ramConfigurations': 'https://support.apple.com/en-us/111867',
      'storage.storageOptions': 'https://support.apple.com/en-us/111867',
      chargerWattageOptions: 'https://support.apple.com/en-us/111867',
    },
  },
  'macbook-air-m4': {
    category: 'ultrabook',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://support.apple.com/en-gb/122210',
    generation: 'M4',
    cpuOptions: ['Apple M4 10-core CPU'],
    gpuOptions: ['Apple M4 8-core GPU', 'Apple M4 10-core GPU'],
    memory: {
      ramType: 'Unified memory',
      ramSpeed: null,
      ramSlots: 0,
      ramSoldered: true,
      ramMax: '32GB',
      ramConfigurations: ['16GB', '24GB', '32GB'],
    },
    storage: {
      storageInterface: 'Apple SSD',
      storageSlots: null,
      storageOptions: ['256GB', '512GB', '1TB', '2TB'],
    },
    display: {
      displaySizes: ['13.6-inch', '15.3-inch'],
      resolutions: ['2880x1864'],
      panelTypes: ['Liquid Retina IPS'],
      refreshRates: [],
    },
    wifi: 'Wi-Fi 6E',
    bluetooth: 'Bluetooth 5.3',
    ports: ['MagSafe 3', 'Thunderbolt / USB-C', '3.5mm headphone'],
    batteryCapacity: '66.5Wh (15-inch reference)',
    chargerWattageOptions: ['35W Dual USB-C', '70W USB-C (fast charge capable)'],
    notes: 'Official 15-inch M4 tech specs page used; 13-inch sibling exists per Apple identify-your-Mac page.',
    sources: [
      { url: 'https://support.apple.com/en-gb/122210', sourceType: 'official_support', title: 'MacBook Air (15-inch, M4, 2025) - Tech Specs', verificationStatus: 'VERIFIED' },
      { url: 'https://support.apple.com/en-us/102869', sourceType: 'official_support', title: 'Identify your MacBook Air model', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://support.apple.com/en-gb/122210',
      gpuOptions: 'https://support.apple.com/en-gb/122210',
      'memory.ramConfigurations': 'https://support.apple.com/en-gb/122210',
      'storage.storageOptions': 'https://support.apple.com/en-gb/122210',
      wifi: 'https://support.apple.com/en-gb/122210',
      bluetooth: 'https://support.apple.com/en-gb/122210',
    },
  },
  'macbook-air-m5': {
    category: 'ultrabook',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://support.apple.com/en-us/126321',
    generation: 'M5',
    cpuOptions: ['Apple M5 10-core CPU'],
    gpuOptions: ['Apple M5 8-core GPU', 'Apple M5 10-core GPU'],
    memory: {
      ramType: 'Unified memory',
      ramSpeed: null,
      ramSlots: 0,
      ramSoldered: true,
      ramMax: '32GB',
      ramConfigurations: ['16GB', '24GB', '32GB'],
    },
    storage: {
      storageInterface: 'Apple SSD',
      storageSlots: null,
      storageOptions: ['512GB', '1TB', '2TB', '4TB'],
    },
    display: {
      displaySizes: ['13.6-inch', '15.3-inch'],
      resolutions: ['2880x1864'],
      panelTypes: ['Liquid Retina IPS'],
      refreshRates: [],
    },
    wifi: 'Wi-Fi 7',
    bluetooth: 'Bluetooth 6',
    ports: ['MagSafe 3', '2x Thunderbolt 4', '3.5mm headphone'],
    batteryCapacity: '66.5Wh (15-inch)',
    chargerWattageOptions: ['40W Dynamic Power Adapter (60W Max)', '35W Dual USB-C', '70W USB-C'],
    notes: 'Official Apple Support + Newsroom 2026-03. Confirm 13 vs 15 size on device.',
    sources: [
      { url: 'https://support.apple.com/en-us/126321', sourceType: 'official_support', title: 'MacBook Air (15-inch, M5) - Tech Specs', verificationStatus: 'VERIFIED' },
      { url: 'https://www.apple.com/newsroom/2026/03/apple-introduces-the-new-macbook-air-with-m5/', sourceType: 'official_product', title: 'Apple introduces the new MacBook Air with M5', verificationStatus: 'VERIFIED' },
      { url: 'https://www.apple.com/macbook-air/specs/', sourceType: 'official_product', title: 'MacBook Air Technical Specifications', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://support.apple.com/en-us/126321',
      gpuOptions: 'https://www.apple.com/macbook-air/specs/',
      'memory.ramConfigurations': 'https://support.apple.com/en-us/126321',
      'storage.storageOptions': 'https://support.apple.com/en-us/126321',
      wifi: 'https://support.apple.com/en-us/126321',
      bluetooth: 'https://support.apple.com/en-us/126321',
      chargerWattageOptions: 'https://support.apple.com/en-us/126321',
      batteryCapacity: 'https://support.apple.com/en-us/126321',
    },
  },
  'macbook-air-m1': {
    category: 'ultrabook',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://support.apple.com/en-us/102869',
    generation: 'M1',
    cpuOptions: ['Apple M1 8-core CPU'],
    gpuOptions: ['Apple M1 7-core GPU', 'Apple M1 8-core GPU'],
    memory: {
      ramType: 'Unified memory',
      ramSpeed: null,
      ramSlots: 0,
      ramSoldered: true,
      ramMax: '16GB',
      ramConfigurations: ['8GB', '16GB'],
    },
    storage: {
      storageInterface: 'Apple SSD',
      storageSlots: null,
      storageOptions: ['256GB', '512GB', '1TB', '2TB'],
    },
    display: {
      displaySizes: ['13.3-inch'],
      resolutions: [],
      panelTypes: ['Retina'],
      refreshRates: [],
    },
    notes: 'Identity confirmed via Apple identify-your-Mac; detailed numeric fields kept conservative.',
    sources: [
      { url: 'https://support.apple.com/en-us/102869', sourceType: 'official_support', title: 'Identify your MacBook Air model', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://support.apple.com/en-us/102869',
      gpuOptions: 'https://support.apple.com/en-us/102869',
      generation: 'https://support.apple.com/en-us/102869',
    },
  },
  'macbook-air-13': {
    category: 'ultrabook',
    configurationScope: 'SERIES',
    eligibility: 'AMBIGUOUS_MODEL',
    officialUrl: 'https://support.apple.com/en-us/102869',
    notes: 'URL is size-based marketing page spanning M1–M5 generations. Not an Exact SKU. Require chip generation from About This Mac before enrichment.',
    sources: [
      { url: 'https://support.apple.com/en-us/102869', sourceType: 'official_support', title: 'Identify your MacBook Air model', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {},
  },
  'macbook-air-15': {
    category: 'ultrabook',
    configurationScope: 'SERIES',
    eligibility: 'AMBIGUOUS_MODEL',
    officialUrl: 'https://support.apple.com/en-us/102869',
    notes: 'Size page spanning M2/M3/M4/M5 15-inch Air. Ambiguous without chip generation.',
    sources: [
      { url: 'https://support.apple.com/en-us/102869', sourceType: 'official_support', title: 'Identify your MacBook Air model', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {},
  },
  'macbook-pro-14': {
    category: 'creator',
    configurationScope: 'SERIES',
    eligibility: 'AMBIGUOUS_MODEL',
    officialUrl: 'https://support.apple.com/en-us/108052',
    notes: '14-inch Pro spans multiple Apple silicon generations (M1 Pro/Max through newer). Ambiguous without chip/SKU.',
    sources: [
      { url: 'https://support.apple.com/en-us/108052', sourceType: 'official_support', title: 'Identify your MacBook Pro model', verificationStatus: 'PARTIAL' },
    ],
    fieldSources: {},
  },
  'macbook-pro-16': {
    category: 'creator',
    configurationScope: 'SERIES',
    eligibility: 'AMBIGUOUS_MODEL',
    officialUrl: 'https://support.apple.com/en-us/108052',
    notes: '16-inch Pro spans multiple generations. Ambiguous without chip/SKU.',
    sources: [
      { url: 'https://support.apple.com/en-us/108052', sourceType: 'official_support', title: 'Identify your MacBook Pro model', verificationStatus: 'PARTIAL' },
    ],
    fieldSources: {},
  },
  'asus-zephyrus-g14': {
    category: 'gaming',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://rog.asus.com/laptops/rog-zephyrus/rog-zephyrus-g14-2024/spec/',
    modelCode: 'GA403 (2024 reference) / multi-year GA402 family also exists',
    cpuOptions: ['AMD Ryzen 9 8945HS', 'AMD Ryzen 9 7940HS', 'AMD Ryzen 7 7735HS'],
    gpuOptions: ['NVIDIA GeForce RTX 4050 Laptop GPU', 'NVIDIA GeForce RTX 4060 Laptop GPU', 'NVIDIA GeForce RTX 4070 Laptop GPU'],
    memory: {
      ramType: 'LPDDR5X / DDR5 (varies by year)',
      ramSpeed: null,
      ramSlots: null,
      ramSoldered: null,
      ramMax: null,
      ramConfigurations: ['16GB', '32GB'],
    },
    storage: {
      storageInterface: 'PCIe 4.0 NVMe',
      storageSlots: null,
      storageOptions: ['1TB PCIe 4.0 NVMe (common 2024 SKU listing)'],
    },
    display: {
      displaySizes: ['14-inch'],
      resolutions: ['2880x1800'],
      panelTypes: ['OLED (Nebula Display options on 2024)'],
      refreshRates: [],
    },
    batteryCapacity: '73Wh (2024 GA403 listing)',
    chargerWattageOptions: ['180W'],
    notes: 'Official ROG pages show multiple years (2022–2024) under G14 marketing name. Do not treat as Exact SKU.',
    sources: [
      { url: 'https://rog.asus.com/laptops/rog-zephyrus/rog-zephyrus-g14-2024/spec/', sourceType: 'official_product', title: 'ROG Zephyrus G14 (2024) GA403 Spec', verificationStatus: 'VERIFIED' },
      { url: 'https://rog.asus.com/us/laptops/rog-zephyrus/rog-zephyrus-g14-2023-series/spec/', sourceType: 'official_product', title: 'ROG Zephyrus G14 (2023) Spec', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://rog.asus.com/us/laptops/rog-zephyrus/rog-zephyrus-g14-2023-series/spec/',
      gpuOptions: 'https://rog.asus.com/pe/laptops/rog-zephyrus/rog-zephyrus-g14-2024/spec/',
      batteryCapacity: 'https://rog.asus.com/pe/laptops/rog-zephyrus/rog-zephyrus-g14-2024/spec/',
      chargerWattageOptions: 'https://rog.asus.com/pe/laptops/rog-zephyrus/rog-zephyrus-g14-2024/spec/',
      'display.displaySizes': 'https://rog.asus.com/pe/laptops/rog-zephyrus/rog-zephyrus-g14-2024/spec/',
    },
  },
  'asus-zephyrus': {
    category: 'gaming',
    configurationScope: 'SERIES',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://rog.asus.com/laptops/rog-zephyrus/',
    knownModelFamilies: ['ROG Zephyrus G14', 'ROG Zephyrus G16', 'ROG Zephyrus Duo'],
    notes: 'Series hub only. Specs vary widely by model year and SKU — do not flatten to single CPU/GPU.',
    sources: [
      { url: 'https://rog.asus.com/laptops/rog-zephyrus/', sourceType: 'official_product', title: 'ROG Zephyrus series', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      knownModelFamilies: 'https://rog.asus.com/laptops/rog-zephyrus/',
    },
  },
  'lenovo-legion-5': {
    category: 'gaming',
    configurationScope: 'SERIES',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://psref.lenovo.com/',
    notes: 'Legion 5 is a multi-generation family on Lenovo PSREF (many machine types). Site slug is family-level. Exact SKU research required per unit (e.g. 15ACH6 / 15IRX9 / 15AKP10).',
    knownModelFamilies: ['Legion 5 15', 'Legion 5 16', 'Legion 5i'],
    memory: {
      ramType: 'DDR5 SODIMM (recent gens)',
      ramSpeed: null,
      ramSlots: 2,
      ramSoldered: false,
      ramMax: 'up to 64GB (recent PSREF gens)',
      ramConfigurations: [],
    },
    storage: {
      storageInterface: 'PCIe NVMe',
      storageSlots: 2,
      storageOptions: [],
    },
    sources: [
      { url: 'https://psref.lenovo.com/', sourceType: 'official_spec_db', title: 'Lenovo PSREF', verificationStatus: 'VERIFIED' },
      { url: 'https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_5_15AKP10/Legion_5_15AKP10_Spec.pdf', sourceType: 'official_pdf', title: 'Legion 5 15AKP10 Spec PDF', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      'memory.ramSlots': 'https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_5_15AKP10/Legion_5_15AKP10_Spec.pdf',
      'storage.storageSlots': 'https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_5_15AKP10/Legion_5_15AKP10_Spec.pdf',
      knownModelFamilies: 'https://psref.lenovo.com/',
    },
  },
  'hp-victus-15': {
    category: 'gaming',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_11551834_en-US-1.pdf',
    modelCode: '15-fb3xxx / 15-fa2xxx / 15-fa3xxx families',
    cpuOptions: [
      'AMD Ryzen 5 8645HS',
      'AMD Ryzen 7 8845HS',
      'AMD Ryzen 9 8945HS',
      'Intel Core i5-13420H class options (fa series MSG)',
      'Intel Core i7-13620H class options (fa series MSG)',
    ],
    gpuOptions: [
      'NVIDIA GeForce RTX 2050',
      'NVIDIA GeForce RTX 3050',
      'NVIDIA GeForce RTX 4050',
      'NVIDIA GeForce RTX 4060',
      'NVIDIA GeForce RTX 5050',
      'NVIDIA GeForce RTX 5060',
    ],
    memory: {
      ramType: 'DDR5',
      ramSpeed: 'DDR5-5600 (fb3xxx MSG)',
      ramSlots: 2,
      ramSoldered: false,
      ramMax: '16GB (per cited MSG listing — verify newer CTO)',
      ramConfigurations: ['8GB', '16GB'],
    },
    storage: {
      storageInterface: 'M.2 NVMe',
      storageSlots: null,
      storageOptions: ['512GB', '1TB'],
    },
    display: {
      displaySizes: ['15.6-inch'],
      resolutions: ['1920x1080'],
      panelTypes: ['FHD anti-glare LCD'],
      refreshRates: ['144Hz'],
    },
    notes: 'Verified from official HP Maintenance and Service Guides (family-level). Exact SKU still required for a single config claim.',
    sources: [
      { url: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_11551834_en-US-1.pdf', sourceType: 'official_pdf', title: 'Victus 15-fb3xxx Maintenance and Service Guide', verificationStatus: 'VERIFIED' },
      { url: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_11551870_en-US-1.pdf', sourceType: 'official_pdf', title: 'Victus 15-fa2xxx/fa3xxx Maintenance and Service Guide', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_11551834_en-US-1.pdf',
      gpuOptions: 'https://kaas.hpcloud.hp.com/pdf-public/pdf_11551870_en-US-1.pdf',
      'memory.ramSlots': 'https://kaas.hpcloud.hp.com/pdf-public/pdf_11551834_en-US-1.pdf',
      'display.displaySizes': 'https://kaas.hpcloud.hp.com/pdf-public/pdf_11551834_en-US-1.pdf',
      'display.refreshRates': 'https://kaas.hpcloud.hp.com/pdf-public/pdf_11551870_en-US-1.pdf',
    },
  },
  'msi-katana-15': {
    category: 'gaming',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'LIMITED_DATA',
    officialUrl: 'https://in.msi.com/Laptop/Katana-15-B13UX/Gallery',
    notes: 'Official MSI pages confirm Katana 15 as a multi-SKU family (B13U/B14/HX/A15 AI variants). Exact CPU/GPU cannot be collapsed. Regional store SKUs exist but are SKU-specific — not applied as universal family defaults.',
    display: {
      displaySizes: ['15.6-inch'],
      resolutions: [],
      panelTypes: [],
      refreshRates: [],
    },
    sources: [
      { url: 'https://in.msi.com/Laptop/Katana-15-B13UX/Gallery', sourceType: 'official_product', title: 'MSI Katana 15 B13U', verificationStatus: 'PARTIAL' },
    ],
    fieldSources: {
      'display.displaySizes': 'https://in.msi.com/Laptop/Katana-15-B13UX/Gallery',
    },
  },
  'acer-nitro-16': {
    category: 'gaming',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://www.acer.com/us-en/laptops/nitro/nitro-16-amd/pdp/NH.QLJAA.001',
    modelCode: 'AN16-41 / AN16-51 families',
    cpuOptions: [
      'AMD Ryzen 5 7640HS',
      'AMD Ryzen 7 7735HS',
      'AMD Ryzen 9 7940HS',
    ],
    gpuOptions: [
      'NVIDIA GeForce RTX 4050 Laptop GPU',
      'NVIDIA GeForce RTX 4060 Laptop GPU',
      'NVIDIA GeForce RTX 4070 Laptop GPU',
    ],
    memory: {
      ramType: 'DDR5 SDRAM',
      ramSpeed: null,
      ramSlots: 2,
      ramSoldered: false,
      ramMax: null,
      ramConfigurations: ['8GB', '16GB', '32GB'],
    },
    storage: {
      storageInterface: 'PCIe NVMe M.2',
      storageSlots: null,
      storageOptions: ['512GB', '1TB'],
    },
    display: {
      displaySizes: ['16-inch'],
      resolutions: ['1920x1200', '2560x1600'],
      panelTypes: ['IPS'],
      refreshRates: ['165Hz'],
    },
    batteryCapacity: '90Wh (AN16-41 official PDP listings)',
    chargerWattageOptions: ['230W', '330W'],
    notes: 'Verified from Acer.com Nitro 16 AN16-41 PDPs (multiple SKUs). RTX 4080 not present on sampled official AN16-41 pages — treat content claims of RTX 4080 as conflict candidates until another official machine type is verified.',
    sources: [
      { url: 'https://www.acer.com/us-en/laptops/nitro/nitro-16-amd/pdp/NH.QLJAA.001', sourceType: 'official_product', title: 'Nitro 16 AN16-41-R5KC', verificationStatus: 'VERIFIED' },
      { url: 'https://www.acer.com/us-en/laptops/nitro/nitro-16-amd/pdp/NH.QLKAA.002', sourceType: 'official_product', title: 'Nitro 16 AN16-41-R148', verificationStatus: 'VERIFIED' },
      { url: 'https://www.acer.com/gb-en/laptops/nitro/nitro-16-intel/pdp/NH.QKCEK.001', sourceType: 'official_product', title: 'Nitro 16 AN16-41-R8P9', verificationStatus: 'VERIFIED' },
      { url: 'https://store.acer.com/en-gb/acer-acer-nitro-16-gaming-laptop-an16-41-black-nh-qkdek-005', sourceType: 'official_product', title: 'Acer Store UK Nitro 16 AN16-41', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://www.acer.com/us-en/laptops/nitro/nitro-16-amd/pdp/NH.QLJAA.001',
      gpuOptions: 'https://www.acer.com/us-en/laptops/nitro/nitro-16-amd/pdp/NH.QLKAA.002',
      'display.refreshRates': 'https://www.acer.com/us-en/laptops/nitro/nitro-16-amd/pdp/NH.QLJAA.001',
      batteryCapacity: 'https://www.acer.com/us-en/laptops/nitro/nitro-16-amd/pdp/NH.QLJAA.001',
      chargerWattageOptions: 'https://www.acer.com/us-en/laptops/nitro/nitro-16-amd/pdp/NH.QLKAA.002',
      'memory.ramSlots': 'https://store.acer.com/en-gb/acer-acer-nitro-16-gaming-laptop-an16-41-black-nh-qkdek-005',
    },
  },
  'asus-rog-ally-x': {
    category: 'handheld',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_HIGH_CONFIDENCE',
    officialUrl: 'https://rog.asus.com/us/gaming-handhelds/rog-ally/rog-ally-x-2024/spec/',
    modelCode: 'RC72LA',
    generation: '2024',
    cpuOptions: ['AMD Ryzen Z1 Extreme'],
    gpuOptions: ['AMD Radeon Graphics (RDNA 3, 12 CU)'],
    memory: {
      ramType: 'LPDDR5X',
      ramSpeed: '7500',
      ramSlots: 0,
      ramSoldered: true,
      ramMax: '24GB',
      ramConfigurations: ['24GB'],
    },
    storage: {
      storageInterface: 'PCIe 4.0 NVMe M.2 2280',
      storageSlots: 1,
      storageOptions: ['1TB', '2TB'],
    },
    display: {
      displaySizes: ['7-inch'],
      resolutions: ['1920x1080'],
      panelTypes: ['IPS-level touch'],
      refreshRates: ['120Hz'],
    },
    wifi: 'Wi-Fi 6E',
    bluetooth: 'Bluetooth 5.4',
    ports: ['USB-C with DisplayPort/PD', 'USB4 / Thunderbolt 4 capable Type-C', '3.5mm combo', 'UHS-II microSD'],
    weightRange: '678 g',
    dimensions: '28.0 x 11.1 x 2.47-3.69 cm',
    batteryCapacity: '80Wh',
    chargerWattageOptions: ['65W USB-C'],
    operatingSystemOptions: ['Windows 11 Home'],
    notes: 'Official ROG Ally X (2024) RC72LA spec page. Narrow config surface (storage variants) — high confidence for resale enrichment.',
    sources: [
      { url: 'https://rog.asus.com/us/gaming-handhelds/rog-ally/rog-ally-x-2024/spec/', sourceType: 'official_product', title: 'ROG Ally X (2024) RC72LA Spec', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://rog.asus.com/us/gaming-handhelds/rog-ally/rog-ally-x-2024/spec/',
      gpuOptions: 'https://rog.asus.com/us/gaming-handhelds/rog-ally/rog-ally-x-2024/spec/',
      'memory.ramConfigurations': 'https://rog.asus.com/us/gaming-handhelds/rog-ally/rog-ally-x-2024/spec/',
      'storage.storageOptions': 'https://rog.asus.com/us/gaming-handhelds/rog-ally/rog-ally-x-2024/spec/',
      'display.refreshRates': 'https://rog.asus.com/us/gaming-handhelds/rog-ally/rog-ally-x-2024/spec/',
      batteryCapacity: 'https://rog.asus.com/us/gaming-handhelds/rog-ally/rog-ally-x-2024/spec/',
      chargerWattageOptions: 'https://rog.asus.com/us/gaming-handhelds/rog-ally/rog-ally-x-2024/spec/',
      weightRange: 'https://rog.asus.com/us/gaming-handhelds/rog-ally/rog-ally-x-2024/spec/',
    },
  },
  'macbook-pro-m3': {
    category: 'creator',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://support.apple.com/en-us/117735',
    generation: 'M3',
    cpuOptions: [
      'Apple M3 8-core CPU',
      'Apple M3 Pro 11-core CPU',
      'Apple M3 Pro 12-core CPU',
      'Apple M3 Max 14-core CPU',
      'Apple M3 Max 16-core CPU',
    ],
    gpuOptions: [
      'Apple M3 10-core GPU',
      'Apple M3 Pro 14-core GPU',
      'Apple M3 Pro 18-core GPU',
      'Apple M3 Max 30-core GPU',
      'Apple M3 Max 40-core GPU',
    ],
    memory: {
      ramType: 'Unified memory',
      ramSpeed: null,
      ramSlots: 0,
      ramSoldered: true,
      ramMax: '128GB (M3 Max CTO)',
      ramConfigurations: ['8GB', '16GB', '18GB', '24GB', '36GB', '48GB', '64GB', '96GB', '128GB'],
    },
    storage: {
      storageInterface: 'Apple SSD',
      storageSlots: null,
      storageOptions: ['512GB', '1TB', '2TB', '4TB', '8TB'],
    },
    display: {
      displaySizes: ['14.2-inch', '16.2-inch'],
      resolutions: ['3024x1964', '3456x2234'],
      panelTypes: ['Liquid Retina XDR'],
      refreshRates: ['ProMotion up to 120Hz'],
    },
    wifi: 'Wi-Fi 6E',
    bluetooth: 'Bluetooth 5.3',
    chargerWattageOptions: ['70W USB-C', '96W USB-C'],
    batteryCapacity: '70Wh class (14-inch M3) / larger on 16-inch — confirm size',
    notes: 'Chip-family page spanning base M3 / M3 Pro / M3 Max and 14/16 sizes. Confirm chip + size from About This Mac.',
    sources: [
      { url: 'https://support.apple.com/en-us/117735', sourceType: 'official_support', title: 'MacBook Pro (14-inch, M3, Nov 2023) Tech Specs', verificationStatus: 'VERIFIED' },
      { url: 'https://support.apple.com/en-us/117736', sourceType: 'official_support', title: 'MacBook Pro (14-inch, M3 Pro or M3 Max, Nov 2023) Tech Specs', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      cpuOptions: 'https://support.apple.com/en-us/117736',
      gpuOptions: 'https://support.apple.com/en-us/117736',
      'memory.ramConfigurations': 'https://support.apple.com/en-us/117736',
      'storage.storageOptions': 'https://support.apple.com/en-us/117736',
      'display.refreshRates': 'https://support.apple.com/en-us/117735',
      chargerWattageOptions: 'https://support.apple.com/en-us/117736',
    },
  },
  'macbook-pro-m1': {
    category: 'creator',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://support.apple.com/en-us/108052',
    generation: 'M1',
    cpuOptions: ['Apple M1 Pro', 'Apple M1 Max'],
    gpuOptions: ['Apple M1 Pro GPU options', 'Apple M1 Max GPU options'],
    notes: 'Identity via Apple identify-your-Mac. 13-inch M1 Pro and 14/16 M1 Pro/Max exist — confirm exact machine before numeric claims.',
    sources: [
      { url: 'https://support.apple.com/en-us/108052', sourceType: 'official_support', title: 'Identify your MacBook Pro model', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      generation: 'https://support.apple.com/en-us/108052',
      cpuOptions: 'https://support.apple.com/en-us/108052',
    },
  },
  'macbook-pro-m2': {
    category: 'creator',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://support.apple.com/en-us/108052',
    generation: 'M2',
    cpuOptions: ['Apple M2', 'Apple M2 Pro', 'Apple M2 Max'],
    gpuOptions: ['Apple M2 GPU options', 'Apple M2 Pro GPU options', 'Apple M2 Max GPU options'],
    notes: 'Chip family spans multiple sizes. Confirm chip/size before enrichment of exact numeric specs.',
    sources: [
      { url: 'https://support.apple.com/en-us/108052', sourceType: 'official_support', title: 'Identify your MacBook Pro model', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      generation: 'https://support.apple.com/en-us/108052',
      cpuOptions: 'https://support.apple.com/en-us/108052',
    },
  },
  'macbook-pro-m4': {
    category: 'creator',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'LIMITED_DATA',
    officialUrl: 'https://support.apple.com/en-us/108052',
    generation: 'M4',
    notes: 'Official identify-your-Mac confirms M4 Pro lineage exists; detailed CTO matrix not fully ingested this pass. Defer numeric hardware until Support tech-spec pages are attached per size/chip.',
    sources: [
      { url: 'https://support.apple.com/en-us/108052', sourceType: 'official_support', title: 'Identify your MacBook Pro model', verificationStatus: 'PARTIAL' },
    ],
    fieldSources: {
      generation: 'https://support.apple.com/en-us/108052',
    },
  },
  'macbook-pro-m5': {
    category: 'creator',
    configurationScope: 'MODEL_FAMILY',
    eligibility: 'LIMITED_DATA',
    officialUrl: 'https://support.apple.com/en-us/108052',
    generation: 'M5',
    notes: 'Repository has MacBook Pro M5 page; official Support identify page is the safe identity anchor. Full tech-spec matrix deferred to next research batch.',
    sources: [
      { url: 'https://support.apple.com/en-us/108052', sourceType: 'official_support', title: 'Identify your MacBook Pro model', verificationStatus: 'PARTIAL' },
    ],
    fieldSources: {
      generation: 'https://support.apple.com/en-us/108052',
    },
  },
  'dell-xps-13-15': {
    category: 'ultrabook',
    configurationScope: 'SERIES',
    eligibility: 'AMBIGUOUS_MODEL',
    officialUrl: 'https://www.dell.com/en-us/shop/dell-laptops/xps-13-laptop-2024/spd/xps-13-9350-intel-laptop',
    notes: 'Repository slug merges XPS 13 and XPS 15 across many generations/processors (Intel Core Ultra, Snapdragon X, older XPS 15 discrete GPU gens). Ambiguous — do not enrich with a single CPU/GPU claim.',
    sources: [
      { url: 'https://www.dell.com/en-us/shop/dell-laptops/xps-13-laptop-2024/spd/xps-13-9350-intel-laptop', sourceType: 'official_product', title: 'Dell XPS 13 (9350) product page', verificationStatus: 'PARTIAL' },
    ],
    fieldSources: {},
  },
  'thinkpad-x1-carbon': {
    category: 'business',
    configurationScope: 'SERIES',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://psref.lenovo.com/syspool/Sys/PDF/ThinkPad/ThinkPad_X1_Carbon_Gen_12/ThinkPad_X1_Carbon_Gen_12_Spec.pdf',
    knownModelFamilies: ['X1 Carbon Gen 12 (21KC/21KD)', 'prior X1 Carbon generations'],
    memory: {
      ramType: 'LPDDR5x soldered',
      ramSpeed: null,
      ramSlots: 0,
      ramSoldered: true,
      ramMax: '64GB (Gen 12 PSREF/datasheet class)',
      ramConfigurations: ['16GB', '32GB', '64GB'],
    },
    display: {
      displaySizes: ['14-inch'],
      resolutions: [],
      panelTypes: [],
      refreshRates: [],
    },
    notes: 'Multi-generation ThinkPad X1 Carbon family. Gen 12 PSREF used as verified generation sample; do not flatten all gens to one CPU list.',
    sources: [
      { url: 'https://psref.lenovo.com/syspool/Sys/PDF/ThinkPad/ThinkPad_X1_Carbon_Gen_12/ThinkPad_X1_Carbon_Gen_12_Spec.pdf', sourceType: 'official_pdf', title: 'ThinkPad X1 Carbon Gen 12 Spec PDF', verificationStatus: 'VERIFIED' },
      { url: 'https://pcsupport.lenovo.com/products/laptops-and-netbooks/thinkpad-x-series-laptops/thinkpad-x1-carbon-12th-gen-type-21kc-21kd/21kc', sourceType: 'official_support', title: 'X1 Carbon Gen 12 support', verificationStatus: 'VERIFIED' },
    ],
    fieldSources: {
      'memory.ramConfigurations': 'https://psref.lenovo.com/syspool/Sys/PDF/ThinkPad/ThinkPad_X1_Carbon_Gen_12/ThinkPad_X1_Carbon_Gen_12_Spec.pdf',
      'display.displaySizes': 'https://psref.lenovo.com/syspool/Sys/PDF/ThinkPad/ThinkPad_X1_Carbon_Gen_12/ThinkPad_X1_Carbon_Gen_12_Spec.pdf',
      knownModelFamilies: 'https://pcsupport.lenovo.com/products/laptops-and-netbooks/thinkpad-x-series-laptops/thinkpad-x1-carbon-12th-gen-type-21kc-21kd/21kc',
    },
  },
};

const SERIES_RESEARCH = {
  'asus-zephyrus': {
    category: 'gaming',
    eligibility: 'READY_FAMILY_LEVEL',
    officialUrl: 'https://rog.asus.com/laptops/rog-zephyrus/',
    knownModelFamilies: ['G14', 'G16', 'Duo'],
    generationRange: 'multi-year',
    sources: [
      { url: 'https://rog.asus.com/laptops/rog-zephyrus/', sourceType: 'official_product', title: 'ROG Zephyrus', verificationStatus: 'VERIFIED' },
    ],
  },
  'dell-latitude': {
    category: 'business',
    eligibility: 'LIMITED_DATA',
    officialUrl: 'https://www.dell.com/en-us/shop/dell-laptops/scrrel/latitude-laptops',
    knownModelFamilies: ['Latitude 3000/5000/7000/9000 families'],
    notes: 'Official Dell Latitude hub confirms series existence; SKU-level PS not ingested this pass.',
    sources: [
      { url: 'https://www.dell.com/en-us/shop/dell-laptops/scrrel/latitude-laptops', sourceType: 'official_product', title: 'Dell Latitude laptops', verificationStatus: 'PARTIAL' },
    ],
  },
  'hp-elitebook': {
    category: 'business',
    eligibility: 'LIMITED_DATA',
    officialUrl: 'https://www.hp.com/us-en/shop/vwa/laptops/EliteBook',
    knownModelFamilies: ['EliteBook'],
    sources: [
      { url: 'https://www.hp.com/us-en/shop/vwa/laptops/EliteBook', sourceType: 'official_product', title: 'HP EliteBook', verificationStatus: 'PARTIAL' },
    ],
  },
};

function applyOverlay(rec, overlay) {
  const { fieldSources, ...rest } = overlay;
  Object.assign(rec, rest);
  if (!rec.cpuOptions) rec.cpuOptions = [];
  return { fieldSources: fieldSources || {} };
}

const HARDWARE_FIELDS = [
  'cpuOptions',
  'gpuOptions',
  'wifi',
  'bluetooth',
  'batteryCapacity',
  'weightRange',
  'dimensions',
  'generation',
  'chargerWattageOptions',
  'ports',
  'operatingSystemOptions',
  'knownModelFamilies',
  'memory.ramType',
  'memory.ramSpeed',
  'memory.ramSlots',
  'memory.ramSoldered',
  'memory.ramMax',
  'memory.ramConfigurations',
  'storage.storageInterface',
  'storage.storageSlots',
  'storage.storageOptions',
  'display.displaySizes',
  'display.resolutions',
  'display.panelTypes',
  'display.refreshRates',
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

function provenanceEntries(rec, fieldSources) {
  const out = [];
  const fallbackUrl = fieldSources._default
    || rec.officialUrl
    || (rec.sources || []).find((s) => s.verificationStatus === 'VERIFIED')?.url
    || (rec.sources || [])[0]?.url;
  for (const field of HARDWARE_FIELDS) {
    const value = getPath(rec, field);
    if (!nonempty(value)) continue;
    const url = fieldSources[field] || fallbackUrl;
    if (!url) {
      throw new Error(`Missing provenance URL for ${rec.slug}.${field}`);
    }
    const src = (rec.sources || []).find((s) => s.url === url) || {
      url,
      sourceType: 'official_product',
      title: '',
      verificationStatus: 'VERIFIED',
    };
    out.push({
      brand: rec.brand,
      model: rec.slug,
      field,
      value: Array.isArray(value) ? value.join(' | ') : String(value),
      source_url: url,
      source_type: src.sourceType,
      source_title: src.title || '',
      retrieved_date: retrievedDate,
      verification_status: src.verificationStatus,
      scope: rec.configurationScope,
      notes: fieldSources[field] ? '' : 'Inherited from model official/primary source (same document family)',
    });
  }
  return out;
}

function matchStatus(rec) {
  if (rec.eligibility === 'AMBIGUOUS_MODEL') return 'AMBIGUOUS';
  if (rec.eligibility === 'UNVERIFIED') return 'NO_OFFICIAL_MATCH';
  if (rec.configurationScope === 'EXACT_SKU') return 'EXACT_MATCH';
  if (['MODEL_FAMILY', 'SERIES'].includes(rec.configurationScope) && rec.sources.length) return 'FAMILY_MATCH';
  if (rec.sources.some((s) => s.verificationStatus === 'PARTIAL')) return 'FAMILY_MATCH';
  return 'NO_OFFICIAL_MATCH';
}

function csvEscape(v) {
  const t = String(v ?? '');
  return /[",\r\n]/.test(t) ? `"${t.replaceAll('"', '""')}"` : t;
}

function writeCsv(file, headers, rows) {
  fs.writeFileSync(file, [headers.join(','), ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join('\r\n') + '\r\n');
}

// --- main ---
fs.mkdirSync(outData, { recursive: true });
fs.mkdirSync(outDocs, { recursive: true });

const inventory = parseCsv(fs.readFileSync(path.join(outDocs, '01-existing-model-inventory.csv'), 'utf8'));
const modelsInv = inventory.filter((r) => r.page_type === 'Model');
const seriesInv = inventory.filter((r) => r.page_type === 'Series');

const models = [];
const provenance = [];
const researchLog = [];

for (const inv of modelsInv) {
  const rec = baseRecord(inv);
  const overlay = RESEARCH[inv.model];
  let fieldSources = {};
  if (overlay) {
    fieldSources = applyOverlay(rec, overlay).fieldSources;
    researchLog.push({
      slug: inv.model,
      action: 'official_research_applied',
      priority: inv.research_priority,
      eligibility: rec.eligibility,
      official_url: rec.officialUrl || '',
      notes: rec.notes || '',
    });
  } else {
    researchLog.push({
      slug: inv.model,
      action: 'deferred_unverified',
      priority: inv.research_priority,
      eligibility: 'UNVERIFIED',
      official_url: '',
      notes: 'No official source captured in this foundation pass',
    });
  }
  provenance.push(...provenanceEntries(rec, fieldSources));
  // strip helper
  delete rec.fieldSources;
  models.push(rec);
}

const series = [];
for (const inv of seriesInv) {
  const rec = {
    id: inv.series,
    brand: inv.brand,
    series: inv.series,
    slug: inv.series,
    pageType: 'Series',
    category: SERIES_RESEARCH[inv.series]?.category || null,
    knownModelFamilies: SERIES_RESEARCH[inv.series]?.knownModelFamilies || [],
    verifiedGenerationRange: SERIES_RESEARCH[inv.series]?.generationRange || null,
    configurationScope: 'SERIES',
    eligibility: SERIES_RESEARCH[inv.series]?.eligibility || 'UNVERIFIED',
    officialUrl: SERIES_RESEARCH[inv.series]?.officialUrl || null,
    sources: SERIES_RESEARCH[inv.series]?.sources || [],
    retrievedDate,
    notes: SERIES_RESEARCH[inv.series]?.notes || 'Series identity from repository URL inventory; SKU flattening forbidden.',
  };
  // child models from inventory
  const children = modelsInv.filter((m) => m.series === inv.series).map((m) => m.model);
  if (children.length) rec.knownModelFamilies = [...new Set([...(rec.knownModelFamilies || []), ...children])];
  series.push(rec);
  researchLog.push({
    slug: inv.series,
    action: SERIES_RESEARCH[inv.series] ? 'series_official_partial' : 'series_deferred',
    priority: inv.research_priority,
    eligibility: rec.eligibility,
    official_url: rec.officialUrl || '',
    notes: rec.notes,
  });
}

fs.writeFileSync(path.join(outData, 'models.json'), JSON.stringify({ version: 1, retrievedDate, models }, null, 2));
fs.writeFileSync(path.join(outData, 'series.json'), JSON.stringify({ version: 1, retrievedDate, series }, null, 2));
fs.writeFileSync(path.join(outData, 'provenance.json'), JSON.stringify({ version: 1, retrievedDate, records: provenance }, null, 2));

// Match CSV
const matchRows = models.map((m) => ({
  slug: m.slug,
  URL: `/รับซื้อโน๊ตบุ๊ค/${m.slug}/`,
  brand: m.brand,
  match_status: matchStatus(m),
  configuration_scope: m.configurationScope,
  eligibility: m.eligibility,
  official_url: m.officialUrl || '',
  notes: m.notes || '',
}));
writeCsv(path.join(outDocs, '02-model-url-match.csv'), Object.keys(matchRows[0]), matchRows);

// Conflicts: compare repo popularModels/mentions vs verified options
const conflictRows = [];
for (const inv of modelsInv) {
  const rec = models.find((m) => m.slug === inv.model);
  const mentions = (inv.current_spec_mentions || '').split('|').map((s) => s.trim()).filter(Boolean);
  const popular = (inv.popularModels || '').split('|').map((s) => s.trim()).filter(Boolean);
  const repoTokens = [...mentions, ...popular].join(' ');
  const gpuMentions = [...repoTokens.matchAll(/RTX\s?\d{3,4}/gi)].map((m) => m[0].replace(/\s+/g, ' ').toUpperCase());
  const normalizeGpu = (s) => s.toUpperCase().replace(/\s+/g, '');
  const officialGpus = (rec.gpuOptions || []).map(normalizeGpu);
  if (!gpuMentions.length) {
    conflictRows.push({
      URL: inv.URL,
      slug: inv.model,
      conflict_type: 'NO_CONFLICT',
      detail: 'No discrete GPU token in repository mentions',
      severity: 'none',
    });
    continue;
  }
  if (rec.eligibility === 'UNVERIFIED' || !officialGpus.length) {
    conflictRows.push({
      URL: inv.URL,
      slug: inv.model,
      conflict_type: 'INSUFFICIENT_EVIDENCE',
      detail: `Repo mentions ${gpuMentions.join(',')}; official GPU options not verified yet`,
      severity: 'monitor',
    });
    continue;
  }
  const stillBad = gpuMentions.filter((g) => !officialGpus.some((o) => o.includes(normalizeGpu(g))));
  if (stillBad.length) {
    // Family pages with incomplete SKU matrix → POSSIBLE; otherwise CONFIRMED when official sample set excludes token.
    const conflictType = stillBad.some((g) => /4080|4090|5090/.test(g)) && rec.slug === 'acer-nitro-16'
      ? 'CONFIRMED_CONFLICT'
      : 'POSSIBLE_CONFIG_VARIANT';
    conflictRows.push({
      URL: inv.URL,
      slug: inv.model,
      conflict_type: conflictType,
      detail: `Repo GPU tokens ${stillBad.join(',')} not present in verified gpuOptions [${rec.gpuOptions.join('; ')}]`,
      severity: conflictType === 'CONFIRMED_CONFLICT' ? 'P1' : 'P2',
    });
  } else {
    conflictRows.push({
      URL: inv.URL,
      slug: inv.model,
      conflict_type: 'NO_CONFLICT',
      detail: 'Repo GPU tokens covered by verified options or naming variants',
      severity: 'none',
    });
  }
}
writeCsv(path.join(outDocs, '03-existing-content-spec-conflicts.csv'), Object.keys(conflictRows[0]), conflictRows);

// Coverage
function fieldCovered(m, pred) {
  return pred(m) ? 1 : 0;
}
const total = models.length;
const coverage = {
  total_model_urls: total,
  exact_official_matches: matchRows.filter((r) => r.match_status === 'EXACT_MATCH').length,
  family_matches: matchRows.filter((r) => r.match_status === 'FAMILY_MATCH').length,
  ambiguous: matchRows.filter((r) => r.match_status === 'AMBIGUOUS').length,
  unverified: matchRows.filter((r) => r.match_status === 'NO_OFFICIAL_MATCH').length,
  READY_HIGH_CONFIDENCE: models.filter((m) => m.eligibility === 'READY_HIGH_CONFIDENCE').length,
  READY_FAMILY_LEVEL: models.filter((m) => m.eligibility === 'READY_FAMILY_LEVEL').length,
  LIMITED_DATA: models.filter((m) => m.eligibility === 'LIMITED_DATA').length,
  AMBIGUOUS_MODEL: models.filter((m) => m.eligibility === 'AMBIGUOUS_MODEL').length,
  UNVERIFIED: models.filter((m) => m.eligibility === 'UNVERIFIED').length,
  cpu_coverage: models.filter((m) => m.cpuOptions?.length).length,
  gpu_coverage: models.filter((m) => m.gpuOptions?.length).length,
  ram_coverage: models.filter((m) => m.memory?.ramConfigurations?.length || m.memory?.ramMax).length,
  storage_coverage: models.filter((m) => m.storage?.storageOptions?.length).length,
  display_coverage: models.filter((m) => m.display?.displaySizes?.length).length,
  battery_coverage: models.filter((m) => m.batteryCapacity).length,
  charger_coverage: models.filter((m) => m.chargerWattageOptions?.length).length,
  provenance_records: provenance.length,
};
const covRows = Object.entries(coverage).map(([metric, value]) => ({
  metric,
  value,
  percent: typeof value === 'number' && metric !== 'provenance_records' && metric !== 'total_model_urls'
    ? `${((value / total) * 100).toFixed(1)}%`
    : '',
}));
writeCsv(path.join(outDocs, '04-spec-coverage.csv'), ['metric', 'value', 'percent'], covRows);

writeCsv(path.join(outDocs, '06-research-log.csv'), Object.keys(researchLog[0]), researchLog);

const deferred = models
  .filter((m) => ['UNVERIFIED', 'AMBIGUOUS_MODEL', 'LIMITED_DATA'].includes(m.eligibility))
  .map((m) => ({
    slug: m.slug,
    eligibility: m.eligibility,
    priority: inventory.find((i) => i.model === m.slug)?.research_priority || '',
    reason: m.notes || m.eligibility,
    next_action: m.eligibility === 'AMBIGUOUS_MODEL' ? 'require_chip_or_sku_from_device' : 'official_source_research',
  }));
writeCsv(path.join(outDocs, '08-deferred-models.csv'), Object.keys(deferred[0]), deferred);

fs.writeFileSync(path.join(outDocs, '04-coverage-summary.json'), JSON.stringify(coverage, null, 2));
console.log(JSON.stringify(coverage, null, 2));
console.log('Wrote datasets to', outData);
