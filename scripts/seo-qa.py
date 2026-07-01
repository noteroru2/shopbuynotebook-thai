"""Final SEO smoke tests before commit."""
import re
import pathlib
import urllib.parse
import sys

sys.stdout.reconfigure(encoding='utf-8')

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
SRC = ROOT / 'src'

HUB_THAI = 'https://ร้านรับซื้อโน๊ตบุ๊ค.com/รับซื้อโน๊ตบุ๊ค/'
HUB_PUNY = (
    'https://xn--42cn4aobed0eb6hubj4es0m5dhvd.com/'
    '%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B9%82%E0%B8%99%E0%B9%8A%E0%B8%95%E0%B8%9A%E0%B8%B8%E0%B9%8A%E0%B8%84/'
)
HOME_CANON = 'https://ร้านรับซื้อโน๊ตบุ๊ค.com/'
errors: list[str] = []


def is_hub_url(url: str) -> bool:
    decoded = urllib.parse.unquote(url).rstrip('/')
    return decoded in (HUB_THAI.rstrip('/'), HUB_PUNY.rstrip('/'))


def test_sitemap_no_hub():
    print('1. Sitemap must not list /รับซื้อโน๊ตบุ๊ค/ hub')
    sitemap_files = list(DIST.glob('sitemap*.xml'))
    if not sitemap_files:
        errors.append('no sitemap files found in dist')
        return
    hub_urls = []
    child_count = 0
    for sf in sitemap_files:
        text = sf.read_text(encoding='utf-8')
        for m in re.finditer(r'<loc>(.*?)</loc>', text):
            loc = m.group(1)
            if is_hub_url(loc):
                hub_urls.append(loc)
            decoded = urllib.parse.unquote(loc)
            if '/รับซื้อโน๊ตบุ๊ค/' in decoded and not is_hub_url(loc):
                child_count += 1
    if hub_urls:
        errors.append(f'hub URL found in sitemap: {hub_urls}')
    print(f'   hub entries: {len(hub_urls)} (want 0)')
    print(f'   child routes under hub: {child_count} (want > 0)')
    if child_count == 0:
        errors.append('no child routes under /รับซื้อโน๊ตบุ๊ค/ in sitemap')


def test_internal_links():
    print('2. Anchor "รับซื้อโน๊ตบุ๊ค" must link to /')
    bad = []
    patterns = [
        re.compile(r'href="/รับซื้อโน๊ตบุ๊ค/"[^>]*>รับซื้อโน๊ตบุ๊ค</a>'),
        re.compile(r"href='/รับซื้อโน๊ตบุ๊ค/'[^>]*>รับซื้อโน๊ตบุ๊ค</a>"),
        re.compile(r"href: '/รับซื้อโน๊ตบุ๊ค/'.*label: 'รับซื้อโน๊ตบุ๊ค'"),
        re.compile(r"href: \"/รับซื้อโน๊ตบุ๊ค/\".*label: 'รับซื้อโน๊ตบุ๊ค'"),
    ]
    for path in SRC.rglob('*'):
        if path.suffix not in {'.astro', '.ts', '.tsx', '.md', '.mdx'}:
            continue
        text = path.read_text(encoding='utf-8')
        for pat in patterns:
            if pat.search(text):
                bad.append(str(path.relative_to(ROOT)))
                break
    if bad:
        errors.append(f'bad internal links: {bad}')
    print(f'   bad files: {len(bad)}')


def test_home_canonical():
    print('3. Homepage canonical self-references /')
    home = (DIST / 'index.html').read_text(encoding='utf-8')
    m = re.search(r'<link rel="canonical" href="([^"]+)"', home)
    canon = m.group(1) if m else None
    print(f'   canonical: {canon}')
    if canon != HOME_CANON:
        errors.append(f'homepage canonical mismatch: {canon}')


def test_child_routes_unaffected():
    print('4. Redirect must not break child routes')
    redirect = DIST / 'รับซื้อโน๊ตบุ๊ค' / 'index.html'
    children = [
        DIST / 'รับซื้อโน๊ตบุ๊ค' / 'macbook' / 'index.html',
        DIST / 'รับซื้อโน๊ตบุ๊ค' / 'gaming' / 'index.html',
        DIST / 'รับซื้อโน๊ตบุ๊ค' / 'กรุงเทพ' / 'index.html',
    ]
    if not redirect.exists():
        errors.append('redirect page missing at /รับซื้อโน๊ตบุ๊ค/index.html')
    else:
        rhtml = redirect.read_text(encoding='utf-8')
        if 'url=/' not in rhtml and 'href="/"' not in rhtml:
            errors.append('redirect page does not point to /')
        if 'noindex' not in rhtml:
            errors.append('redirect page missing noindex')
    for child in children:
        if not child.exists():
            errors.append(f'missing child route: {child.relative_to(DIST)}')
        else:
            html = child.read_text(encoding='utf-8')
            if '<h1' not in html:
                errors.append(f'child route has no H1: {child.relative_to(DIST)}')
    print(f'   redirect ok: {redirect.exists()}')
    print(f'   children ok: {sum(1 for c in children if c.exists())}/{len(children)}')


def test_page_qa():
    print('5. Page-level SEO QA')
    pages = {
        '/': 'index.html',
        '/รับซื้อ-notebook/': 'รับซื้อ-notebook/index.html',
        '/รับซื้อโน๊ตบุ๊คมือสอง/': 'รับซื้อโน๊ตบุ๊คมือสอง/index.html',
        '/เช็คราคาโน๊ตบุ๊ค/': 'เช็คราคาโน๊ตบุ๊ค/index.html',
        '/ขายโน๊ตบุ๊ค/': 'ขายโน๊ตบุ๊ค/index.html',
    }
    banned = [
        'ให้ราคาสูงสุด',
        'ราคาดีที่สุด',
        'รับทุกยี่ห้อ',
        'รับทุกสภาพ',
        'จ่ายเงินทันที',
        'ยุติธรรมที่สุดในตลาด',
        'Big Data',
        'Real-time',
        'กว่าพันรายการ',
    ]
    titles = {}
    for path_key, rel in pages.items():
        html = (DIST / rel).read_text(encoding='utf-8')
        title_m = re.search(r'<title>(.*?)</title>', html)
        canon_m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
        h1s = re.findall(r'<h1[^>]*>(.*?)</h1>', html, re.S)
        title = title_m.group(1) if title_m else None
        titles[path_key] = title
        expected = f'https://ร้านรับซื้อโน๊ตบุ๊ค.com{path_key}'
        if len(h1s) != 1:
            errors.append(f'{path_key}: expected 1 H1, got {len(h1s)}')
        if canon_m and canon_m.group(1) != expected:
            errors.append(f'{path_key}: canonical {canon_m.group(1)} != {expected}')
        if any(b in html for b in banned):
            errors.append(f'{path_key}: banned phrase found')
        if path_key != '/' and 'href="/">รับซื้อโน๊ตบุ๊ค</a>' not in html and f'href="{HOME_CANON}">รับซื้อโน๊ตบุ๊ค</a>' not in html:
            errors.append(f'{path_key}: missing home anchor link')
    dup = {v: [k for k, t in titles.items() if t == v] for v in set(titles.values())}
    dup = {v: ks for v, ks in dup.items() if len(ks) > 1}
    if dup:
        errors.append(f'duplicate titles: {dup}')
    print(f'   pages checked: {len(pages)}')


def main():
    if not DIST.exists():
        print('dist/ missing — run npm run build first')
        sys.exit(1)
    test_sitemap_no_hub()
    test_internal_links()
    test_home_canonical()
    test_child_routes_unaffected()
    test_page_qa()
    print()
    if errors:
        print('SMOKE TEST FAILED:')
        for e in errors:
            print(' -', e)
        sys.exit(1)
    print('ALL SMOKE TESTS PASSED')


if __name__ == '__main__':
    main()
