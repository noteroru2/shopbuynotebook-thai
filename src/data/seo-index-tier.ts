/** Index tier plan — used by sitemap filter and noindex logic */

export type IndexTier = 'A' | 'B' | 'C' | 'MERGE' | 'REDIRECT';

/** Brand hub slugs (single-segment, no hyphen) */
export const BRAND_HUB_SLUGS = new Set([
  'asus', 'acer', 'lenovo', 'hp', 'dell', 'msi', 'macbook', 'surface', 'gaming',
  'samsung', 'huawei', 'lg', 'honor', 'razer', 'gigabyte', 'office',
]);

/** Top symptom slugs for Tier A */
export const TOP_SYMPTOM_SLUGS = new Set([
  'จอแตก', 'เปิดไม่ติด', 'เครื่องเสีย', 'แบตเสื่อม', 'ไม่มีที่ชาร์จ',
  'macbook-mdm', 'macbook-battery-health', 'ร้อนจัดดับเอง',
]);

/** Top area slugs for Tier A */
export const TOP_AREA_SLUGS = new Set([
  'กรุงเทพ', 'เชียงใหม่', 'ภาคอีสาน', 'ภาคเหนือ', 'ภาคใต้', 'ภาคตะวันออก',
  'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'ชลบุรี',
]);

export const TOP_BRANDS_FOR_COMBO = [
  'asus', 'acer', 'lenovo', 'hp', 'dell', 'msi', 'macbook', 'surface', 'gaming',
] as const;

export const TOP_CONDITIONS_FOR_COMBO = [
  'จอแตก', 'เปิดไม่ติด', 'เครื่องเสีย', 'แบตเสื่อม', 'เมนบอร์ดเสีย',
  'โดนน้ำ', 'ตกรุ่น', 'เครื่องเก่า', 'ไม่มีที่ชาร์จ', 'ใช้งานปกติ',
  'ไฟไม่เข้า', 'บานพับแตก', 'ฮาร์ดดิสก์เสีย', 'คีย์บอร์ดเสีย', 'ทัชสกรีนเสีย',
] as const;

export function isBrandHub(slug: string): boolean {
  return BRAND_HUB_SLUGS.has(slug);
}

export function isSeriesOrModel(slug: string): boolean {
  return slug.includes('-') && !BRAND_HUB_SLUGS.has(slug);
}

export function getBrandPageTier(slug: string): IndexTier {
  if (BRAND_HUB_SLUGS.has(slug)) return 'A';
  return 'B';
}

export function getSymptomTier(slug: string): IndexTier {
  if (TOP_SYMPTOM_SLUGS.has(slug)) return 'A';
  return 'B';
}

export function getAreaTier(slug: string): IndexTier {
  if (TOP_AREA_SLUGS.has(slug)) return 'A';
  return 'B';
}

/** Location × topic combo pages are Tier C */
export function getLocationComboTier(): IndexTier {
  return 'C';
}

export function shouldNoindex(tier: IndexTier): boolean {
  return tier === 'C';
}

export function shouldIncludeInSitemap(tier: IndexTier): boolean {
  return tier === 'A' || tier === 'B';
}
