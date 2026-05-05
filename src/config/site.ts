import { flattenServiceAreas, serviceAreaGroups } from '../data/service-areas';

export const SITE = {
  name: 'ร้านรับซื้อโน๊ตบุ๊ค.com',
  /** นิติบุคคลผู้ดำเนินเว็บไซต์ / ใช้อ้างอิงที่อยู่จดทะเบียน */
  companyLegalName: 'บริษัท อำพล เทรดดิ้ง จำกัด',
  /** ที่อยู่จดทะเบียน (แสดงบนเว็บและ structured data) */
  companyRegisteredAddress:
    '740/8 ถนนชยางกูร ตำบลในเมือง อำเภอเมืองอุบลราชธานี จังหวัดอุบลราชธานี 34000',
  /** แยกฟิลด์สำหรับ Schema.org PostalAddress */
  companyPostalAddress: {
    streetAddress: '740/8 ถนนชยางกูร ตำบลในเมือง',
    addressLocality: 'เมืองอุบลราชธานี',
    addressRegion: 'อุบลราชธานี',
    postalCode: '34000',
    addressCountry: 'TH',
  },
  /** ชื่อหน้าร้านจริงบน Google Maps / Google Business Profile */
  physicalStoreName: 'ร้านอำพล เทรดดิ้ง',
  /** ลิงก์ไปที่หน้าร้านจริง (Google Maps) */
  googleMapsUrl: 'https://maps.app.goo.gl/MRNFJY318DSg2Q22A',
  shortName: 'รับซื้อโน๊ตบุ๊ค',
  url: 'https://ร้านรับซื้อโน๊ตบุ๊ค.com/',
  description:
    'ร้านรับซื้อโน๊ตบุ๊ค รับซื้อโน๊ตบุ๊คมือสองทุกยี่ห้อ รับซื้อ Notebook, MacBook, Gaming Notebook และเครื่องเสียบางอาการ ส่งรูปเช็คราคาโน๊ตบุ๊คฟรีผ่าน LINE @webuy หรือโทร 0642579353',
  mainKeyword: 'รับซื้อโน๊ตบุ๊ค',
  phone: '0642579353',
  telephone: '0642579353',
  lineUrl: 'https://line.me/R/ti/p/@webuy',
  lineId: '@webuy',
  lineHandle: '@webuy',
  logo: '/images/logo-ranrubsue-notebook-black.webp',
  ogImage: '/images/rubsue-notebook-og.webp',
  /** ขนาดรูป OG เริ่มต้น (ใช้ใน meta og:image:width/height) */
  ogImageWidth: 1200,
  ogImageHeight: 630,
  language: 'th-TH',
  localeOg: 'th_TH',
  sameAs: {
    facebook: 'https://www.facebook.com/Amphontrading',
    tiktok: 'https://www.tiktok.com/@amphontrading',
  },
  serviceAreaGroups,
  areaServed: Array.from(new Set(['ภาคอีสาน', ...flattenServiceAreas(serviceAreaGroups)])),
} as const;

