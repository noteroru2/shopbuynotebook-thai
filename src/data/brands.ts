export type BrandColor =
  | 'slate'
  | 'emerald'
  | 'sky'
  | 'amber'
  | 'rose'
  | 'violet';

export interface BrandItem {
  name: string;
  displayLogo: string;
  slug: string;
  href: string;
  models: string[];
  alt: string;
  color: BrandColor;
  /**
   * Optional local SVG path (no external hotlink).
   * Default UI uses text-logo; set this when you want to show a real logo later.
   */
  logo?: string;
}

export const BRANDS: BrandItem[] = [
  {
    name: 'MacBook',
    displayLogo: ' MacBook',
    slug: 'macbook',
    href: '/รับซื้อโน๊ตบุ๊ค/macbook/',
    models: ['MacBook Air', 'MacBook Pro', 'iMac', 'Mac mini'],
    alt: 'รับซื้อ MacBook มือสอง',
    color: 'slate',
  },
  {
    name: 'Asus',
    displayLogo: 'ASUS',
    slug: 'asus',
    href: '/รับซื้อโน๊ตบุ๊ค/asus/',
    models: ['VivoBook', 'ZenBook', 'TUF', 'ROG'],
    alt: 'รับซื้อโน๊ตบุ๊ค Asus มือสอง',
    color: 'emerald',
  },
  {
    name: 'Acer',
    displayLogo: 'acer',
    slug: 'acer',
    href: '/รับซื้อโน๊ตบุ๊ค/acer/',
    models: ['Aspire', 'Swift', 'Nitro', 'Predator'],
    alt: 'รับซื้อโน๊ตบุ๊ค Acer มือสอง',
    color: 'sky',
  },
  {
    name: 'Lenovo',
    displayLogo: 'Lenovo',
    slug: 'lenovo',
    href: '/รับซื้อโน๊ตบุ๊ค/lenovo/',
    models: ['IdeaPad', 'ThinkPad', 'Legion', 'Yoga'],
    alt: 'รับซื้อโน๊ตบุ๊ค Lenovo มือสอง',
    color: 'rose',
  },
  {
    name: 'Dell',
    displayLogo: 'DELL',
    slug: 'dell',
    href: '/รับซื้อโน๊ตบุ๊ค/dell/',
    models: ['Inspiron', 'XPS', 'Latitude', 'Alienware'],
    alt: 'รับซื้อโน๊ตบุ๊ค Dell มือสอง',
    color: 'violet',
  },
  {
    name: 'HP',
    displayLogo: 'HP',
    slug: 'hp',
    href: '/รับซื้อโน๊ตบุ๊ค/hp/',
    models: ['Pavilion', 'Envy', 'Omen', 'EliteBook'],
    alt: 'รับซื้อโน๊ตบุ๊ค HP มือสอง',
    color: 'amber',
  },
  {
    name: 'MSI',
    displayLogo: 'MSI',
    slug: 'msi',
    href: '/รับซื้อโน๊ตบุ๊ค/msi/',
    models: ['Modern', 'GF', 'Katana', 'Stealth'],
    alt: 'รับซื้อโน๊ตบุ๊ค MSI มือสอง',
    color: 'sky',
  },
  {
    name: 'Microsoft Surface',
    displayLogo: 'Surface',
    slug: 'surface',
    href: '/รับซื้อโน๊ตบุ๊ค/surface/',
    models: ['Surface Pro', 'Surface Laptop', 'Surface Go'],
    alt: 'รับซื้อ Microsoft Surface มือสอง',
    color: 'slate',
  },
  {
    name: 'Gaming Notebook',
    displayLogo: 'Gaming',
    slug: 'gaming',
    href: '/รับซื้อโน๊ตบุ๊ค/gaming/',
    models: ['ROG', 'TUF', 'Nitro', 'Legion', 'MSI Gaming'],
    alt: 'รับซื้อโน๊ตบุ๊ค Gaming มือสอง',
    color: 'emerald',
  },
];

