"""QA for Weak Specialist Pages Round 1."""
import re
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
SRC = ROOT / 'src'

PAGES = {
    'รับซื้อโน๊ตบุ๊คเสีย': {
        'dist': 'รับซื้อโน๊ตบุ๊ค/เครื่องเสีย/index.html',
        'source': 'content/conditions/เครื่องเสีย.md',
        'canonical': 'https://ร้านรับซื้อโน๊ตบุ๊ค.com/รับซื้อโน๊ตบุ๊ค/เครื่องเสีย/',
        'h1_contains': 'รับซื้อโน๊ตบุ๊คเสีย',
    },
    'เช็คราคาโน๊ตบุ๊คมือสอง': {
        'dist': 'เช็คราคาโน๊ตบุ๊คมือสอง/index.html',
        'source': 'pages/เช็คราคาโน๊ตบุ๊คมือสอง.astro',
        'canonical': 'https://ร้านรับซื้อโน๊ตบุ๊ค.com/เช็คราคาโน๊ตบุ๊คมือสอง/',
        'h1_contains': 'เช็คราคาโน๊ตบุ๊คมือสอง',
    },
    'รับซื้อโน๊ตบุ๊ค Gaming': {
        'dist': 'รับซื้อโน๊ตบุ๊ค/gaming/index.html',
        'source': 'content/brands/gaming.md',
        'canonical': 'https://ร้านรับซื้อโน๊ตบุ๊ค.com/รับซื้อโน๊ตบุ๊ค/gaming/',
        'h1_contains': 'รับซื้อโน๊ตบุ๊ค Gaming',
    },
    'รับซื้อโน๊ตบุ๊คบริษัท': {
        'dist': 'รับซื้อโน๊ตบุ๊คบริษัท/index.html',
        'source': 'pages/รับซื้อโน๊ตบุ๊คบริษัท.astro',
        'canonical': 'https://ร้านรับซื้อโน๊ตบุ๊ค.com/รับซื้อโน๊ตบุ๊คบริษัท/',
        'h1_contains': 'รับซื้อโน๊ตบุ๊คบริษัท',
    },
}

OTHER_LINKS = [
    '/รับซื้อโน๊ตบุ๊ค/เครื่องเสีย/',
    '/เช็คราคาโน๊ตบุ๊คมือสอง/',
    '/รับซื้อโน๊ตบุ๊ค/gaming/',
    '/รับซื้อโน๊ตบุ๊คบริษัท/',
    '/',
]

FORBIDDEN = ['อันดับ 1', 'ราคาสูงสุด', 'ดีที่สุด', 'รับทุกรุ่น', 'รับทุกสภาพ']
FAKE_PRICE = re.compile(r'\d{1,3}[,.]?\d{3}\s*บาท')
errors: list[str] = []


def thai_word_count(text: str) -> int:
    plain = re.sub(r'<[^>]+>', ' ', text)
    plain = re.sub(r'[{}\[\]`]', ' ', plain)
    plain = re.sub(r'\s+', ' ', plain).strip()
    return len(plain.split()) if plain else 0


def faq_answer_words(rel_path: str) -> int:
    text = (SRC / rel_path).read_text(encoding='utf-8')
    total = 0
    if rel_path.endswith('.md'):
        try:
            import yaml

            fm = yaml.safe_load(text.split('---', 2)[1])
            for item in (fm or {}).get('faqs') or []:
                total += thai_word_count(str(item.get('answer', '')))
        except Exception:
            pass
    else:
        for ans in re.findall(r"answer:\s*'([^']*)'", text):
            total += thai_word_count(ans)
    return total


def source_word_count(rel_path: str) -> int:
    text = (SRC / rel_path).read_text(encoding='utf-8')
    if rel_path.endswith('.md'):
        body = text.split('---', 2)[2] if text.startswith('---') else text
        body_wc = thai_word_count(body)
        try:
            import yaml

            fm = yaml.safe_load(text.split('---', 2)[1])
            for key in ('ctaText', 'description'):
                if fm and fm.get(key):
                    body_wc += thai_word_count(str(fm[key]))
        except Exception:
            pass
    else:
        # astro: count slot content inside ServicePageShell
        marker = '<ServicePageShell'
        idx = text.find(marker)
        if idx >= 0:
            open_end = text.find('>', idx)
            close_start = text.rfind('</ServicePageShell>')
            slot = text[open_end + 1 : close_start] if open_end >= 0 and close_start >= 0 else text
        else:
            slot = text
        body_wc = thai_word_count(slot)
        for prop in ('heroSubtitle', 'h1Accent'):
            m = re.search(rf'{prop}="([^"]*)"', text)
            if m:
                body_wc += thai_word_count(m.group(1))
        desc_m = re.search(r"const description\s*=\s*\n?\s*'([^']+)'", text, re.S)
        if desc_m:
            body_wc += thai_word_count(desc_m.group(1))
    return body_wc + faq_answer_words(rel_path)


def strip_scripts_styles(html: str) -> str:
    html = re.sub(r'<script[\s\S]*?</script>', ' ', html, flags=re.I)
    html = re.sub(r'<style[\s\S]*?</style>', ' ', html, flags=re.I)
    return html


def built_word_count(html: str) -> int:
    body = strip_scripts_styles(html)
    plain = re.sub(r'<[^>]+>', ' ', body)
    return thai_word_count(plain)


def main():
    if not DIST.exists():
        print('dist/ missing — run npm run build first')
        sys.exit(1)

    for name, cfg in PAGES.items():
        path = DIST / cfg['dist']
        print(f'=== {name} ===')
        if not path.exists():
            errors.append(f'{name}: missing built page {cfg["dist"]}')
            continue
        html = path.read_text(encoding='utf-8')
        body = strip_scripts_styles(html)

        title_m = re.search(r'<title>(.*?)</title>', html)
        canon_m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
        h1s = re.findall(r'<h1[^>]*>(.*?)</h1>', html, re.S)
        h1_text = ' '.join(re.sub(r'<[^>]+>', '', h).strip() for h in h1s)

        src_wc = source_word_count(cfg['source'])
        built_wc = built_word_count(html)
        print('  title:', title_m.group(1) if title_m else 'MISSING')
        print('  canonical:', canon_m.group(1) if canon_m else 'MISSING')
        print('  h1:', h1_text[:100])
        print('  source word count:', src_wc)
        print('  built word count:', built_wc)

        if canon_m and canon_m.group(1) != cfg['canonical']:
            errors.append(f'{name}: canonical mismatch')
        if cfg['h1_contains'] not in h1_text:
            errors.append(f'{name}: H1 missing "{cfg["h1_contains"]}"')
        if len(h1s) != 1:
            errors.append(f'{name}: expected 1 H1, got {len(h1s)}')

        found_forbidden = [w for w in FORBIDDEN if w in body]
        if found_forbidden:
            errors.append(f'{name}: forbidden words {found_forbidden}')

        if FAKE_PRICE.search(body):
            errors.append(f'{name}: possible fake price in body')

        if 'แอดไลน์ @webuy' not in body and '@webuy' not in body:
            errors.append(f'{name}: missing LINE @webuy CTA')

        faq_count = len(re.findall(r'"@type"\s*:\s*"Question"', html))
        print('  faq schema questions:', faq_count)
        if faq_count < 5:
            errors.append(f'{name}: expected >=5 FAQ, got {faq_count}')

        if built_wc < 900:
            errors.append(f'{name}: page content too short ({built_wc} words, target 900-1400)')
        if built_wc > 2000:
            errors.append(f'{name}: page content too long ({built_wc} words, target 900-1400)')

        if 'href="/">รับซื้อโน๊ตบุ๊ค</a>' not in body:
            errors.append(f'{name}: missing home link with anchor รับซื้อโน๊ตบุ๊ค')

        for link in OTHER_LINKS:
            if link == cfg['canonical'].replace('https://ร้านรับซื้อโน๊ตบุ๊ค.com', ''):
                continue
            if f'href="{link}"' not in body:
                errors.append(f'{name}: missing cross-link to {link}')

        print()

    b2b = (DIST / 'รับซื้อโน๊ตบุ๊คบริษัท' / 'index.html').read_text(encoding='utf-8')
    if 'AMPHON TRADING' not in b2b or 'amphontd.com' not in b2b:
        errors.append('B2B page: missing AMPHON TRADING brand link')

    if errors:
        print('SPECIALIST QA FAILED:')
        for e in errors:
            print(' -', e)
        sys.exit(1)
    print('SPECIALIST PAGES QA PASSED')


if __name__ == '__main__':
    main()
