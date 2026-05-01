/** เว็บไซต์ในเครือ — ใช้ punycode ใน url; ชื่อแบรนด์/ไทยใช้ใน UI */
export type PartnerCategory =
  | 'corporate'
  | 'broad-it'
  | 'it-specialist'
  | 'camera'
  | 'local-pawn'
  | 'broad-buying';

export interface PartnerSite {
  id: string;
  brand: string;
  url: string;
  description: string;
  category: PartnerCategory;
  /** ลำดับแนะนำสำหรับ anchor text (brand / service) — ห้ามใช้รับซื้อโน๊ตบุ๊คเป็น anchor ออกไปเว็บอื่น */
  recommendedAnchors: string[];
}

/** ลำดับรวม: เน้นเว็บหลักและบริการหลากหลายก่อน ก่อนรายการเฉพาะทาง */
export const partnerSites: PartnerSite[] = [
  {
    id: 'amphon-trading',
    brand: 'AMPHON TRADING',
    url: 'https://amphontd.com/',
    description: 'เว็บไซต์บริษัทแม่และศูนย์รวมบริการรับซื้อสินค้าไอทีมือสอง',
    category: 'corporate',
    recommendedAnchors: ['AMPHON TRADING', 'อำพล เทรดดิ้ง', 'เว็บไซต์บริษัทแม่'],
  },
  {
    id: 'wortrub',
    brand: 'เรารับซื้อ.com',
    url: 'https://xn--c3c3a0aa6cvaf8b9dze.com/',
    description:
      'เว็บไซต์รับซื้อสินค้าไอทีหลายประเภท เช่น โน๊ตบุ๊ค คอมพิวเตอร์ iPhone iPad MacBook กล้อง และอุปกรณ์มือสอง',
    category: 'broad-buying',
    recommendedAnchors: ['เรารับซื้อ.com', 'เว็บรับซื้อสินค้าไอทีหลายประเภท', 'บริการรับซื้อของมือสองในเครือ'],
  },
  {
    id: 'webuy-hub',
    brand: 'WEBUY HUB',
    url: 'https://webuy.in.th/',
    description: 'บริการรับซื้ออุปกรณ์ไอทีมือสองและประเมินราคาผ่านช่องทางออนไลน์',
    category: 'broad-it',
    recommendedAnchors: ['WEBUY HUB', 'บริการรับซื้ออุปกรณ์ไอที', 'เว็บรับซื้อสินค้าไอที'],
  },
  {
    id: 'winner-it',
    brand: 'Winner IT',
    url: 'https://winnerit.in.th/',
    description: 'บริการรับซื้อคอมพิวเตอร์ โน๊ตบุ๊ค และอุปกรณ์ IT มือสอง',
    category: 'it-specialist',
    recommendedAnchors: ['Winner IT', 'บริการรับซื้อคอมและอุปกรณ์ IT', 'เว็บรับซื้ออุปกรณ์ IT'],
  },
  {
    id: 'rubsoo-camera',
    brand: 'รับซื้อกล้องมือสอง.com',
    url: 'https://xn--12cman8e0bjt1czaccb9b1fg31ad.com/',
    description: 'บริการรับซื้อกล้อง เลนส์ และอุปกรณ์ถ่ายภาพมือสอง',
    category: 'camera',
    recommendedAnchors: ['รับซื้อกล้องมือสอง.com', 'บริการรับซื้อกล้องมือสอง', 'เว็บรับซื้อกล้องและเลนส์'],
  },
  {
    id: 'jomnam-iphone-ubon',
    brand: 'จำนำไอโฟนอุบล.com',
    url: 'https://xn--82c8aaex2b0cc4bb4e0fya6jc.com/',
    description: 'บริการจำนำและรับซื้อ iPhone ในพื้นที่อุบลราชธานี',
    category: 'local-pawn',
    recommendedAnchors: ['จำนำไอโฟนอุบล.com', 'บริการจำนำ iPhone อุบล', 'จำนำไอโฟนในอุบล'],
  },
  {
    id: 'rub-jomnam-ubon',
    brand: 'รับจำนำอุบล.com',
    url: 'https://xn--82c8abc5bq8c2alb1e0nc.com/',
    description: 'บริการรับจำนำสินค้าไอทีและอุปกรณ์อิเล็กทรอนิกส์ในพื้นที่อุบลราชธานี',
    category: 'local-pawn',
    recommendedAnchors: ['รับจำนำอุบล.com', 'บริการรับจำนำสินค้าไอทีอุบล', 'รับจำนำอุปกรณ์ไอทีอุบล'],
  },
];

/** ลำดับแสดงใน footer (brand anchor) */
export const partnerFooterIds = ['amphon-trading', 'wortrub', 'webuy-hub', 'rubsoo-camera'] as const;

export const partnerCategoryThai: Record<PartnerCategory, string> = {
  corporate: 'บริษัท',
  'broad-it': 'รับซื้ออุปกรณ์ไอที',
  'it-specialist': 'คอมพิวเตอร์และอุปกรณ์ IT',
  camera: 'กล้องและอุปกรณ์ถ่ายภาพ',
  'local-pawn': 'จำนำในพื้นที่',
  'broad-buying': 'รับซื้อหลายประเภท',
};

export function getPartnerById(id: string): PartnerSite | undefined {
  return partnerSites.find((p) => p.id === id);
}

export function getFooterPartners(): PartnerSite[] {
  return partnerFooterIds.map((id) => getPartnerById(id)).filter((p): p is PartnerSite => Boolean(p));
}

export function filterPartners(opts: { categories?: PartnerCategory[]; limit?: number }): PartnerSite[] {
  let list = [...partnerSites];
  if (opts.categories?.length) {
    const set = new Set(opts.categories);
    list = list.filter((p) => set.has(p.category));
  }
  if (opts.limit != null && opts.limit > 0) {
    list = list.slice(0, opts.limit);
  }
  return list;
}

/** กลุ่มสำหรับ variant full */
export const partnerFullGroups: { title: string; categories: PartnerCategory[] }[] = [
  { title: 'กลุ่มเว็บไซต์บริษัทและบริการรวม', categories: ['corporate', 'broad-buying'] },
  { title: 'กลุ่มรับซื้อสินค้าไอที', categories: ['broad-it', 'it-specialist'] },
  { title: 'กลุ่มรับซื้อกล้องและอุปกรณ์ถ่ายภาพ', categories: ['camera'] },
  { title: 'กลุ่มบริการจำนำสินค้าไอทีในพื้นที่', categories: ['local-pawn'] },
];
