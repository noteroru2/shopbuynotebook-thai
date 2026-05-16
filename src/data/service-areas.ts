export type ServiceAreaGroup = {
  group: string;
  areas: string[];
};

export const serviceAreaGroups: ServiceAreaGroup[] = [
  {
    group: 'กรุงเทพและปริมณฑล',
    areas: ['กรุงเทพ', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'นครปฐม', 'สมุทรสาคร'],
  },
  {
    group: 'ภาคอีสาน',
    areas: [
      'นครราชสีมา',
      'บุรีรัมย์',
      'สุรินทร์',
      'ศรีสะเกษ',
      'อุบลราชธานี',
      'ยโสธร',
      'ชัยภูมิ',
      'อำนาจเจริญ',
      'บึงกาฬ',
      'หนองบัวลำภู',
      'ขอนแก่น',
      'อุดรธานี',
      'เลย',
      'หนองคาย',
      'มหาสารคาม',
      'ร้อยเอ็ด',
      'กาฬสินธุ์',
      'สกลนคร',
      'นครพนม',
      'มุกดาหาร',
    ],
  },
  {
    group: 'ภาคตะวันออก',
    areas: ['สระแก้ว', 'จันทบุรี', 'ตราด'],
  },
  {
    group: 'ภาคใต้',
    areas: ['พัทลุง', 'ภูเก็ต', 'หาดใหญ่', 'สงขลา'],
  },
];

export function flattenServiceAreas(groups: ServiceAreaGroup[] = serviceAreaGroups) {
  const out: string[] = [];
  for (const g of groups) out.push(...g.areas);
  return Array.from(new Set(out));
}
