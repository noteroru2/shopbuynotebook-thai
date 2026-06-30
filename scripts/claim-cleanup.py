"""Replace risky marketing claims across the repo."""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent

REPLACEMENTS = [
    ('รับทุกยี่ห้อ', 'หลายยี่ห้อ / รุ่นยอดนิยมหลายกลุ่ม'),
    ('ทุกยี่ห้อ', 'หลายยี่ห้อ'),
    ('รับทุกสภาพ', 'หลายสภาพตามเงื่อนไข'),
    ('ทุกสภาพ', 'หลายสภาพตามเงื่อนไข'),
    ('จ่ายเงินทันที', 'จ่ายเงินหลังตรวจรับและตกลงราคา'),
    ('รับเงินทันที 100%', 'จ่ายเงินหลังตรวจรับและตกลงราคา'),
    ('รับเงินทันที', 'จ่ายเงินหลังตรวจรับและตกลงราคา'),
    ('จ่ายเงินสดทันที', 'จ่ายเงินหลังตรวจรับและตกลงราคา'),
    ('ไม่กดราคา', 'แจ้งเงื่อนไขชัดเจน'),
    ('ราคาดีที่สุด', 'ประเมินตามรุ่น สเปก และสภาพจริง'),
    ('ราคาสูงสุด', 'ประเมินตามรุ่น สเปก และสภาพจริง'),
    ('ให้ราคาสูง', 'ประเมินตามรุ่น สเปก และสภาพจริง'),
    ('รับประกันราคา', 'แจ้งราคาก่อนตัดสินใจ'),
    ('5-10 นาที', 'เร็วขึ้นเมื่อข้อมูลครบ'),
    ('5–10 นาที', 'เร็วขึ้นเมื่อข้อมูลครบ'),
    ('24 ชม.', 'ติดต่อผ่าน LINE/โทรตามช่องทางที่ระบุ'),
    ('24 ชม', 'ติดต่อผ่าน LINE/โทรตามช่องทางที่ระบุ'),
    ('อันดับ 1', 'บริการรับซื้อโน๊ตบุ๊ค'),
    ('ราคาดี ', 'ประเมินตามสภาพ '),
]

# Location template paragraph — unique per area
LOCATION_OLD = re.compile(
    r'เราพร้อมรับซื้อคอมพิวเตอร์และโน๊ตบุ๊คทุกรุ่น ทุกยี่ห้อ ไม่ว่าจะเป็น Gaming Notebook สเปกแรง, MacBook สำหรับคนทำงาน, หรือโน๊ตบุ๊คสำหรับนักเรียน/นักศึกษาทั่วไป'
)
LOCATION_NEW = 'เรารับซื้อโน๊ตบุ๊คหลายยี่ห้อและหลายสภาพตามเงื่อนไข เช่น Gaming Notebook MacBook และเครื่องทำงานทั่วไป'

PAYMENT_OLD = re.compile(
    r'รับเงินทันที 100% รวดเร็วและปลอดภัยไร้กังวล'
)
PAYMENT_NEW = 'จ่ายเงินหลังตรวจรับและตกลงราคาตามขั้นตอนที่ตกลงกัน'

EXTENSIONS = {'.astro', '.md', '.ts', '.tsx', '.py', '.mjs'}

changed_files: list[str] = []

for path in ROOT.rglob('*'):
    if path.suffix not in EXTENSIONS:
        continue
    if 'node_modules' in path.parts or 'dist' in path.parts or '.git' in path.parts:
        continue
    if path.name == 'claim-cleanup.py':
        continue
    text = path.read_text(encoding='utf-8')
    original = text
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    text = LOCATION_OLD.sub(LOCATION_NEW, text)
    text = PAYMENT_OLD.sub(PAYMENT_NEW, text)
    # Fix "ทุกรุ่น" in H1 defaults only in specific contexts
  # Keep "ทุกรุ่น" in MacBook context but fix generic brand H1
    text = text.replace('มือสอง ทุกรุ่น', 'มือสอง หลายรุ่นยอดนิยม')
    text = text.replace('MacBook ทุกรุ่น', 'MacBook หลายรุ่นยอดนิยม')
    if text != original:
        path.write_text(text, encoding='utf-8')
        changed_files.append(str(path.relative_to(ROOT)))

print(f'Updated {len(changed_files)} files')
for f in changed_files[:30]:
    print(' -', f)
if len(changed_files) > 30:
    print(f' ... and {len(changed_files) - 30} more')
