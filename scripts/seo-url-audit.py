"""Audit all URLs in the repo and export seo-url-audit.csv"""
import csv
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
SITE = 'https://ร้านรับซื้อโน๊ตบุ๊ค.com'

BRAND_HUBS = {
    'asus', 'acer', 'lenovo', 'hp', 'dell', 'msi', 'macbook', 'surface', 'gaming',
    'samsung', 'huawei', 'lg', 'honor', 'razer', 'gigabyte', 'office',
}
TOP_SYMPTOMS = {
    'จอแตก', 'เปิดไม่ติด', 'เครื่องเสีย', 'แบตเสื่อม', 'ไม่มีที่ชาร์จ',
    'macbook-mdm', 'macbook-battery-health', 'ร้อนจัดดับเอง',
}
TOP_AREAS = {
    'กรุงเทพ', 'เชียงใหม่', 'ภาคอีสาน', 'ภาคเหนือ', 'ภาคใต้', 'ภาคตะวันออก',
    'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'ชลบุรี',
}
TOP_BRANDS_COMBO = ['asus', 'acer', 'lenovo', 'hp', 'dell', 'msi', 'macbook', 'surface', 'gaming']
TOP_CONDITIONS_COMBO = [
    'จอแตก', 'เปิดไม่ติด', 'เครื่องเสีย', 'แบตเสื่อม', 'เมนบอร์ดเสีย',
    'โดนน้ำ', 'ตกรุ่น', 'เครื่องเก่า', 'ไม่มีที่ชาร์จ', 'ใช้งานปกติ',
    'ไฟไม่เข้า', 'บานพับแตก', 'ฮาร์ดดิสก์เสีย', 'คีย์บอร์ดเสีย', 'ทัชสกรีนเสีย',
]

MONEY_PAGES = {
    '/': ('homepage', 'index.astro'),
    '/รับซื้อโน๊ตบุ๊คมือสอง/': ('money', 'รับซื้อโน๊ตบุ๊คมือสอง.astro'),
    '/รับซื้อ-notebook/': ('money', 'รับซื้อ-notebook.astro'),
    '/เช็คราคาโน๊ตบุ๊ค/': ('money', 'เช็คราคาโน๊ตบุ๊ค.astro'),
    '/ขายโน๊ตบุ๊ค/': ('money', 'ขายโน๊ตบุ๊ค.astro'),
    '/รับซื้อโน๊ตบุ๊ค/macbook/': ('money', 'brands/macbook.md'),
}

UTILITY_PAGES = [
    '/เกี่ยวกับเรา/', '/ติดต่อเรา/', '/คำถามที่พบบ่อย/', '/พื้นที่ให้บริการ/',
    '/วิธีขายโน๊ตบุ๊ค/', '/ขั้นตอนและเงื่อนไขการให้บริการ/', '/นโยบายความเป็นส่วนตัว/',
    '/sitemap/', '/blog/', '/เว็บไซต์ในเครือ/',
]

RISKY = [
    'รับทุกยี่ห้อ', 'รับทุกสภาพ', 'ราคาดีที่สุด', 'ราคาสูงสุด', 'ให้ราคาสูง',
    'ไม่กดราคา', 'รับประกันราคา', 'จ่ายเงินทันที', '24 ชม', '5-10 นาที',
    '5–10 นาที', 'อันดับ 1',
]


def parse_frontmatter(path: pathlib.Path) -> dict:
    text = path.read_text(encoding='utf-8')
    if not text.startswith('---'):
        return {}
    end = text.find('---', 3)
    if end < 0:
        return {}
    block = text[3:end]
    result: dict = {}
    for line in block.splitlines():
        m = re.match(r'^(\w+):\s*(.+)$', line.strip())
        if m:
            val = m.group(2).strip().strip('"').strip("'")
            result[m.group(1)] = val
    return result


def thai_word_count(text: str) -> int:
    thai = re.findall(r'[\u0E00-\u0E7F]+', text)
    return sum(len(w) for w in thai)


def classify_brand(slug: str) -> str:
    if slug in BRAND_HUBS:
        return 'brand'
    parts = slug.split('-')
    if len(parts) >= 3 or re.search(r'm\d|rtx|gen', slug, re.I):
        return 'model'
    return 'series'


def get_tier(url_type: str, slug: str = '') -> str:
    if url_type == 'homepage':
        return 'A'
    if url_type == 'money':
        return 'A'
    if url_type == 'utility':
        return 'A'
    if url_type == 'blog':
        return 'B'
    if url_type == 'case':
        return 'A'
    if url_type == 'brand':
        return 'A' if slug in BRAND_HUBS else 'B'
    if url_type == 'series':
        return 'B'
    if url_type == 'model':
        return 'B'
    if url_type == 'symptom':
        return 'A' if slug in TOP_SYMPTOMS else 'B'
    if url_type == 'area':
        return 'A' if slug in TOP_AREAS else 'B'
    if url_type == 'area_combo':
        return 'C'
    return 'B'


def extract_astro_seo(path: pathlib.Path) -> dict:
    text = path.read_text(encoding='utf-8')
    title = re.search(r"const title = ['\"](.+?)['\"]", text)
    desc = re.search(r"const description =\s*\n?\s*['\"](.+?)['\"]", text, re.S)
    h1 = re.search(r'h1="([^"]+)"', text)
    return {
        'title': title.group(1) if title else '',
        'description': (desc.group(1).replace('\n', ' ').strip() if desc else ''),
        'h1': h1.group(1) if h1 else '',
    }


rows: list[dict] = []

# Static money + utility pages
for url, (ptype, fname) in MONEY_PAGES.items():
    fpath = SRC / 'pages' / fname if fname.endswith('.astro') else SRC / 'content' / fname
    seo = extract_astro_seo(fpath) if fpath.suffix == '.astro' else {}
    if fpath.suffix == '.md':
        fm = parse_frontmatter(fpath)
        seo = {
            'title': fm.get('seoTitle') or f"{fm.get('title', '')} | ร้านรับซื้อโน๊ตบุ๊ค.com",
            'description': fm.get('description', ''),
            'h1': fm.get('pageH1') or f"รับซื้อโน๊ตบุ๊ค {fm.get('title', '')} มือสอง",
        }
    body = fpath.read_text(encoding='utf-8') if fpath.exists() else ''
    wc = thai_word_count(body)
    tier = get_tier(ptype)
    rows.append({
        'url': url, 'type': ptype, 'slug': '', 'tier': tier,
        'title': seo.get('title', ''), 'description': seo.get('description', ''),
        'h1': seo.get('h1', ''), 'canonical': f'{SITE}{url}',
        'robots': 'index', 'sitemap': 'yes' if tier in ('A', 'B') else 'no',
        'word_count': wc, 'flags': '',
    })

for url in UTILITY_PAGES:
    rows.append({
        'url': url, 'type': 'utility', 'slug': '', 'tier': 'A',
        'title': '', 'description': '', 'h1': '', 'canonical': f'{SITE}{url}',
        'robots': 'index', 'sitemap': 'yes', 'word_count': 0, 'flags': '',
    })

# Brands
for f in sorted((SRC / 'content' / 'brands').glob('*.md')):
    fm = parse_frontmatter(f)
    slug = fm.get('slug', f.stem)
    btype = classify_brand(slug)
    body = f.read_text(encoding='utf-8')
    wc = thai_word_count(body)
    tier = get_tier(btype, slug)
    title = fm.get('seoTitle') or f"{fm.get('title', '')} | ร้านรับซื้อโน๊ตบุ๊ค.com"
    h1 = fm.get('pageH1') or f"รับซื้อโน๊ตบุ๊ค {fm.get('title', '')} มือสอง หลายรุ่นยอดนิยม"
    flags = []
    if wc < 200:
        flags.append('thin_content')
    if any(r in body for r in RISKY):
        flags.append('risky_claim')
    rows.append({
        'url': f'/รับซื้อโน๊ตบุ๊ค/{slug}/', 'type': btype, 'slug': slug, 'tier': tier,
        'title': title, 'description': fm.get('description', ''), 'h1': h1,
        'canonical': f'{SITE}/รับซื้อโน๊ตบุ๊ค/{slug}/',
        'robots': 'index', 'sitemap': 'yes', 'word_count': wc,
        'flags': ';'.join(flags),
    })

# Conditions / symptoms
for f in sorted((SRC / 'content' / 'conditions').glob('*.md')):
    fm = parse_frontmatter(f)
    slug = fm.get('slug', f.stem)
    body = f.read_text(encoding='utf-8')
    wc = thai_word_count(body)
    tier = get_tier('symptom', slug)
    flags = []
    if wc < 150:
        flags.append('thin_content')
    if any(r in body for r in RISKY):
        flags.append('risky_claim')
    rows.append({
        'url': f'/รับซื้อโน๊ตบุ๊ค/{slug}/', 'type': 'symptom', 'slug': slug, 'tier': tier,
        'title': fm.get('seoTitle') or f"{fm.get('title', '')} | ร้านรับซื้อโน๊ตบุ๊ค.com",
        'description': fm.get('description', ''), 'h1': fm.get('pageH1', ''),
        'canonical': f'{SITE}/รับซื้อโน๊ตบุ๊ค/{slug}/',
        'robots': 'index', 'sitemap': 'yes', 'word_count': wc,
        'flags': ';'.join(flags),
    })

# Locations / areas
for f in sorted((SRC / 'content' / 'locations').glob('*.md')):
    fm = parse_frontmatter(f)
    slug = fm.get('slug', f.stem)
    body = f.read_text(encoding='utf-8')
    wc = thai_word_count(body)
    tier = get_tier('area', slug)
    flags = []
    if 'ทุกรุ่น หลายยี่ห้อ' in body:
        flags.append('near_duplicate_template')
    if any(r in body for r in RISKY):
        flags.append('risky_claim')
    rows.append({
        'url': f'/รับซื้อโน๊ตบุ๊ค/{slug}/', 'type': 'area', 'slug': slug, 'tier': tier,
        'title': fm.get('seoTitle', ''), 'description': fm.get('description', ''),
        'h1': fm.get('h1', ''), 'canonical': f'{SITE}/รับซื้อโน๊ตบุ๊ค/{slug}/',
        'robots': 'index', 'sitemap': 'yes', 'word_count': wc,
        'flags': ';'.join(flags),
    })

# Location combos
for loc_f in sorted((SRC / 'content' / 'locations').glob('*.md')):
    loc_fm = parse_frontmatter(loc_f)
    loc_slug = loc_fm.get('slug', loc_f.stem)
    for brand_slug in TOP_BRANDS_COMBO:
        rows.append({
            'url': f'/รับซื้อโน๊ตบุ๊ค/{loc_slug}/{brand_slug}/',
            'type': 'area_combo', 'slug': f'{loc_slug}/{brand_slug}', 'tier': 'C',
            'title': f'รับซื้อโน๊ตบุ๊ค {brand_slug} {loc_slug}',
            'description': '', 'h1': '', 'canonical': f'{SITE}/รับซื้อโน๊ตบุ๊ค/{loc_slug}/{brand_slug}/',
            'robots': 'noindex', 'sitemap': 'no', 'word_count': 0,
            'flags': 'near_duplicate_template',
        })
    for cond_slug in TOP_CONDITIONS_COMBO:
        rows.append({
            'url': f'/รับซื้อโน๊ตบุ๊ค/{loc_slug}/{cond_slug}/',
            'type': 'area_combo', 'slug': f'{loc_slug}/{cond_slug}', 'tier': 'C',
            'title': f'รับซื้อโน๊ตบุ๊ค {cond_slug} {loc_slug}',
            'description': '', 'h1': '', 'canonical': f'{SITE}/รับซื้อโน๊ตบุ๊ค/{loc_slug}/{cond_slug}/',
            'robots': 'noindex', 'sitemap': 'no', 'word_count': 0,
            'flags': 'near_duplicate_template',
        })

# Blog
for f in sorted((SRC / 'content' / 'blog').glob('*.md')):
    fm = parse_frontmatter(f)
    slug = fm.get('slug', f.stem)
    body = f.read_text(encoding='utf-8')
    wc = thai_word_count(body)
    is_case = fm.get('category') == 'กรณีศึกษา'
    ptype = 'case' if is_case else 'blog'
    tier = 'A' if is_case else 'B'
    flags = []
    if wc < 300:
        flags.append('thin_content')
    if any(r in body for r in RISKY):
        flags.append('risky_claim')
    rows.append({
        'url': f'/blog/{slug}/', 'type': ptype, 'slug': slug, 'tier': tier,
        'title': f"{fm.get('title', '')} | ร้านรับซื้อโน๊ตบุ๊ค.com",
        'description': fm.get('description', ''), 'h1': fm.get('title', ''),
        'canonical': f'{SITE}/blog/{slug}/',
        'robots': 'index', 'sitemap': 'yes', 'word_count': wc,
        'flags': ';'.join(flags),
    })

# Duplicate detection
title_map: dict[str, list[str]] = {}
desc_map: dict[str, list[str]] = {}
h1_map: dict[str, list[str]] = {}
for r in rows:
    if r['title']:
        title_map.setdefault(r['title'], []).append(r['url'])
    if r['description']:
        desc_map.setdefault(r['description'], []).append(r['url'])
    if r['h1']:
        h1_map.setdefault(r['h1'], []).append(r['url'])

for r in rows:
    extra = []
    if r['title'] and len(title_map.get(r['title'], [])) > 1:
        extra.append('duplicate_title')
    if r['description'] and len(desc_map.get(r['description'], [])) > 1:
        extra.append('duplicate_meta')
    if r['h1'] and len(h1_map.get(r['h1'], [])) > 1:
        extra.append('duplicate_h1')
    if extra:
        r['flags'] = ';'.join(filter(None, [r['flags'], *extra]))

out = ROOT / 'seo-url-audit.csv'
fieldnames = [
    'url', 'type', 'slug', 'tier', 'title', 'description', 'h1',
    'canonical', 'robots', 'sitemap', 'word_count', 'flags',
]
with out.open('w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    w.writerows(rows)

# Summary
from collections import Counter
types = Counter(r['type'] for r in rows)
tiers = Counter(r['tier'] for r in rows)
flagged = sum(1 for r in rows if r['flags'])
print(f'Exported {len(rows)} URLs to {out}')
print('By type:', dict(types))
print('By tier:', dict(tiers))
print(f'Flagged rows: {flagged}')
