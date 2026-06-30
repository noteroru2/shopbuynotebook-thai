"""Final SEO QA checks for the fix report."""
import csv
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
AUDIT = ROOT / 'seo-url-audit.csv'

RISKY = [
    'รับทุกยี่ห้อ', 'รับทุกสภาพ', 'ราคาดีที่สุด', 'ราคาสูงสุด', 'ให้ราคาสูง',
    'ไม่กดราคา', 'รับประกันราคา', 'จ่ายเงินทันที', 'อันดับ 1',
]

results: dict = {}


def check_sitemap():
    locs = []
    for sf in DIST.glob('sitemap*.xml'):
        locs.extend(re.findall(r'<loc>(.*?)</loc>', sf.read_text(encoding='utf-8')))
    combo_re = re.compile(r'/รับซื้อโน๊ตบุ๊ค/[^/]+/[^/]+/$')
    combos = [u for u in locs if combo_re.search(u)]
    results['sitemap_total'] = len(locs)
    results['sitemap_combos'] = len(combos)
    results['sitemap_ok'] = len(combos) == 0


def check_noindex_combos():
    combo = None
    for p in (DIST / 'รับซื้อโน๊ตบุ๊ค').rglob('index.html'):
        rel = p.relative_to(DIST / 'รับซื้อโน๊ตบุ๊ค')
        if len(rel.parts) >= 3:
            combo = p
            break
    if not combo:
        results['combo_noindex_ok'] = False
        results['combo_sample'] = 'not found'
        return
    html = combo.read_text(encoding='utf-8')
    results['combo_sample'] = str(combo.relative_to(DIST))
    results['combo_noindex_ok'] = 'noindex,nofollow' in html


def check_claims():
    hits = []
    for p in DIST.rglob('*.html'):
        text = p.read_text(encoding='utf-8')
        for phrase in RISKY:
            if phrase in text:
                hits.append((str(p.relative_to(DIST)), phrase))
    results['claim_hits'] = len(hits)
    results['claim_samples'] = hits[:10]


def check_duplicates():
    titles: dict[str, list] = {}
    for p in DIST.rglob('index.html'):
        html = p.read_text(encoding='utf-8')
        m = re.search(r'<title>(.*?)</title>', html)
        if m:
            titles.setdefault(m.group(1), []).append(str(p.relative_to(DIST)))
    dups = {t: urls for t, urls in titles.items() if len(urls) > 1}
    results['duplicate_titles'] = len(dups)
    results['duplicate_title_samples'] = list(dups.items())[:5]


def check_money_pages():
    pages = {
        '/': DIST / 'index.html',
        '/รับซื้อโน๊ตบุ๊คมือสอง/': DIST / 'รับซื้อโน๊ตบุ๊คมือสอง' / 'index.html',
        '/รับซื้อ-notebook/': DIST / 'รับซื้อ-notebook' / 'index.html',
        '/เช็คราคาโน๊ตบุ๊ค/': DIST / 'เช็คราคาโน๊ตบุ๊ค' / 'index.html',
        '/ขายโน๊ตบุ๊ค/': DIST / 'ขายโน๊ตบุ๊ค' / 'index.html',
        '/รับซื้อโน๊ตบุ๊ค/macbook/': DIST / 'รับซื้อโน๊ตบุ๊ค' / 'macbook' / 'index.html',
    }
    money = {}
    for path, f in pages.items():
        if not f.exists():
            money[path] = {'error': 'missing'}
            continue
        html = f.read_text(encoding='utf-8')
        title = re.search(r'<title>(.*?)</title>', html)
        h1s = re.findall(r'<h1[^>]*>(.*?)</h1>', html, re.S)
        canon = re.search(r'<link rel="canonical" href="([^"]+)"', html)
        money[path] = {
            'title': title.group(1) if title else '',
            'h1': re.sub(r'<[^>]+>', '', h1s[0]).strip() if h1s else '',
            'canonical': canon.group(1) if canon else '',
        }
    results['money_pages'] = money


def audit_summary():
    if not AUDIT.exists():
        return
    with AUDIT.open(encoding='utf-8-sig') as f:
        rows = list(csv.DictReader(f))
    from collections import Counter
    results['audit_total'] = len(rows)
    results['audit_by_tier'] = dict(Counter(r['tier'] for r in rows))
    results['audit_flagged'] = sum(1 for r in rows if r.get('flags'))


def main():
    if not DIST.exists():
        print('Run npm run build first')
        sys.exit(1)
    check_sitemap()
    check_noindex_combos()
    check_claims()
    check_duplicates()
    check_money_pages()
    audit_summary()
    import json
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
