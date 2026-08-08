/**
 * Runtime helper for verified notebook specs.
 * Only READY_* records are exposed to page rendering.
 */
import modelsDoc from '../../data/notebook-specs/models.json';

export type SpecEligibility =
  | 'READY_HIGH_CONFIDENCE'
  | 'READY_FAMILY_LEVEL'
  | 'LIMITED_DATA'
  | 'AMBIGUOUS_MODEL'
  | 'UNVERIFIED';

export type ConfigurationScope = 'EXACT_SKU' | 'MODEL_FAMILY' | 'SERIES' | 'UNKNOWN';

export type VerifiedModelSpec = {
  id: string;
  brand: string;
  series: string;
  model: string;
  slug: string;
  category: string | null;
  configurationScope: ConfigurationScope;
  eligibility: SpecEligibility;
  officialUrl: string | null;
  modelCode: string | null;
  generation: string | null;
  cpuOptions: string[];
  gpuOptions: string[];
  memory: {
    ramType: string | null;
    ramSpeed: string | null;
    ramSlots: number | null;
    ramSoldered: boolean | null;
    ramMax: string | null;
    ramConfigurations: string[];
  };
  storage: {
    storageInterface: string | null;
    storageSlots: number | null;
    storageOptions: string[];
  };
  display: {
    displaySizes: string[];
    resolutions: string[];
    panelTypes: string[];
    refreshRates: string[];
  };
  wifi: string | null;
  bluetooth: string | null;
  ports: string[];
  weightRange: string | null;
  dimensions: string | null;
  batteryCapacity: string | null;
  chargerWattageOptions: string[];
  operatingSystemOptions: string[];
  knownModelFamilies: string[];
  notes: string;
  sources: Array<{
    url: string;
    sourceType: string;
    title?: string;
    verificationStatus: string;
  }>;
};

const READY = new Set<SpecEligibility>(['READY_HIGH_CONFIDENCE', 'READY_FAMILY_LEVEL']);

const catalog = (modelsDoc as { models: VerifiedModelSpec[] }).models;

export function getVerifiedModelSpec(slug: string): VerifiedModelSpec | null {
  const hit = catalog.find((m) => m.slug === slug);
  if (!hit) return null;
  if (!READY.has(hit.eligibility)) return null;
  return hit;
}

export function hasRenderableVerifiedFacts(spec: VerifiedModelSpec | null): boolean {
  if (!spec) return false;
  return Boolean(
    spec.cpuOptions?.length ||
      spec.gpuOptions?.length ||
      spec.memory?.ramConfigurations?.length ||
      spec.memory?.ramMax ||
      spec.storage?.storageOptions?.length ||
      spec.display?.displaySizes?.length ||
      spec.batteryCapacity ||
      spec.chargerWattageOptions?.length ||
      spec.knownModelFamilies?.length ||
      spec.generation,
  );
}

export function scopeLabelTh(scope: ConfigurationScope): string {
  switch (scope) {
    case 'EXACT_SKU':
      return 'ระดับรหัสเครื่องเฉพาะ (Exact SKU)';
    case 'MODEL_FAMILY':
      return 'ระดับตระกูลรุ่น (มีหลายสเปกย่อย)';
    case 'SERIES':
      return 'ระดับซีรีส์ (หลายรุ่นย่อย/หลายเจเนอเรชัน)';
    default:
      return 'ยังไม่ระบุขอบเขตสเปก';
  }
}
