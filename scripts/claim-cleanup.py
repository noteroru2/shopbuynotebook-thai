"""Replace risky marketing claims across the repo."""
import pathlib
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

ROOT = pathlib.Path(__file__).resolve().parent.parent

REPLACEMENTS = [
    ('รับทุกยี่ห้อ', 'แบรนด์หลักหลากหลายซีรีส์'),
    ('ทุกยี่ห้อ', 'หลายยี่ห้อ'),
    ('รับทุกสภาพ', 'หลากหลายสภาพการใช้งาน'),
    ('ทุกสภาพ', 'หลากหลายสภาพการใช้งาน'),
    ('จ่ายเงินทันที', 'ชำระเงินหลังตรวจรับและตกลงราคา'),
    ('รับเงินทันที 100%', 'ชำระเงินหลังตรวจรับและตกลงราคา'),
    ('รับเงินทันที', 'ชำระเงินหลังตรวจรับและตกลงราคา'),
    ('จ่ายเงินสดทันที', 'ชำระเงินหลังตรวจรับและตกลงราคา'),
    ('ไม่กดราคา', 'แจ้งเงื่อนไขชัดเจน'),
    ('ราคาดีที่สุด', 'อิงราคาจากสภาพจริงของเครื่อง'),
    ('ราคาสูงสุด', 'อิงราคาจากสภาพจริงของเครื่อง'),
    ('ให้ราคาสูง', 'อิงราคาจากสภาพจริงของเครื่อง'),
    ('รับประกันราคา', 'แจ้งราคาก่อนตัดสินใจ'),
    ('5-10 นาที', 'เร็วขึ้นเมื่อข้อมูลครบ'),
    ('5–10 นาที', 'เร็วขึ้นเมื่อข้อมูลครบ'),
    ('24 ชม.', 'ติดต่อผ่าน LINE/โทรตามช่องทางที่ระบุ'),
    ('24 ชม', 'ติดต่อผ่าน LINE/โทรตามช่องทางที่ระบุ'),
    ('อันดับ 1', 'บริการรับซื้อโน๊ตบุ๊ค'),
    ('ราคาดี ', 'ประเมินตามสภาพ '),
    ('ราคากลางอ้างอิงสภาพตลาดมือสอง', 'ราคาประเมินอ้างอิงตามสภาพตลาด'),
    ('ราคากลางอ้างอิงสภาพตลาด', 'ราคาประเมินอ้างอิงตามสภาพตลาด'),
    ('ราคากลางอ้างอิง', 'ราคาประเมินอ้างอิง'),
    ('ราคากลาง', 'ราคาประเมินอ้างอิง'),
    ('ราคาตลาด', 'ราคาประเมินอ้างอิง'),
    ('ทุกรุ่น', 'หลายรุ่นยอดนิยม'),
    ('ส่งรูปประเมินเบื้องต้นได้ทันที', 'ส่งรูปประเมินเบื้องต้นได้รวดเร็ว'),
    ('ส่งประเมินราคาได้ทันที', 'ส่งประเมินราคาได้รวดเร็ว'),
    ('ส่งรูปเช็คราคากลางผ่าน LINE @webuy ได้ทันที', 'ส่งรูปเช็คราคาประเมินผ่าน LINE @webuy ได้รวดเร็ว'),
]

# Location template paragraph — unique per area
LOCATION_OLD = re.compile(
    r'เราพร้อมรับซื้อคอมพิวเตอร์และโน๊ตบุ๊คทุกรุ่น ทุกยี่ห้อ ไม่ว่าจะเป็น Gaming Notebook สเปกแรง, MacBook สำหรับคนทำงาน, หรือโน๊ตบุ๊คสำหรับนักเรียน/นักศึกษาทั่วไป'
)
LOCATION_NEW = 'เรารับซื้อโน๊ตบุ๊คหลากหลายยี่ห้อและหลากหลายสภาพการใช้งาน เช่น Gaming Notebook MacBook และเครื่องทำงานทั่วไป'

PAYMENT_OLD = re.compile(
    r'รับเงินทันที 100% รวดเร็วและปลอดภัยไร้กังวล'
)
PAYMENT_NEW = 'ชำระเงินหลังตรวจรับและตกลงราคาตามขั้นตอนที่ตกลงกัน'

EXTENSIONS = {'.astro', '.md', '.ts', '.tsx', '.py', '.mjs'}

changed_files: list[str] = []

for path in ROOT.rglob('*'):
    if path.suffix not in EXTENSIONS:
        continue
    if 'node_modules' in path.parts or 'dist' in path.parts or '.git' in path.parts or 'scripts' in path.parts:
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
