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
    name: 'Samsung',
    displayLogo: 'Samsung',
    slug: 'samsung',
    href: '/รับซื้อโน๊ตบุ๊ค/samsung/',
    models: ['Galaxy Book', 'Galaxy Book Pro', 'Galaxy Book 3'],
    alt: 'รับซื้อโน๊ตบุ๊ค Samsung มือสอง',
    color: 'violet',
  },
  {
    name: 'Huawei',
    displayLogo: 'HUAWEI',
    slug: 'huawei',
    href: '/รับซื้อโน๊ตบุ๊ค/huawei/',
    models: ['MateBook D', 'MateBook 14', 'MateBook X Pro'],
    alt: 'รับซื้อโน๊ตบุ๊ค Huawei มือสอง',
    color: 'amber',
  },
  {
    name: 'LG',
    displayLogo: 'LG',
    slug: 'lg',
    href: '/รับซื้อโน๊ตบุ๊ค/lg/',
    models: ['Gram 14', 'Gram 16', 'Gram 17'],
    alt: 'รับซื้อโน๊ตบุ๊ค LG มือสอง',
    color: 'rose',
  },
  {
    name: 'Honor',
    displayLogo: 'HONOR',
    slug: 'honor',
    href: '/รับซื้อโน๊ตบุ๊ค/honor/',
    models: ['MagicBook 14', 'MagicBook 15', 'MagicBook X'],
    alt: 'รับซื้อโน๊ตบุ๊ค Honor มือสอง',
    color: 'amber',
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
    name: 'Razer',
    displayLogo: 'RAZER',
    slug: 'razer',
    href: '/รับซื้อโน๊ตบุ๊ค/razer/',
    models: ['Razer Blade 14', 'Razer Blade 15', 'Razer Blade 16'],
    alt: 'รับซื้อโน๊ตบุ๊ค Razer มือสอง',
    color: 'emerald',
  },
  {
    name: 'Gigabyte',
    displayLogo: 'GIGABYTE',
    slug: 'gigabyte',
    href: '/รับซื้อโน๊ตบุ๊ค/gigabyte/',
    models: ['Aorus 15', 'Aorus 17', 'Aero 16'],
    alt: 'รับซื้อโน๊ตบุ๊ค Gigabyte มือสอง',
    color: 'violet',
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
