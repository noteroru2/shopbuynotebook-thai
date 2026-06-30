import pathlib, re
combo = None
for p in pathlib.Path('dist/รับซื้อโน๊ตบุ๊ค').rglob('index.html'):
    rel = p.relative_to(pathlib.Path('dist/รับซื้อโน๊ตบุ๊ค'))
    if len(rel.parts) >= 3:
        combo = p
        break
html = combo.read_text(encoding='utf-8') if combo else ''
pathlib.Path('qa-combo-check.txt').write_text(
    f'combo={combo}\nnoindex={"noindex" in html}\nrobots={re.search(r"name=.robots.", html).group(0) if re.search(r"robots", html) else "none"}',
    encoding='utf-8',
)
