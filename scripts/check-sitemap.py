import re, pathlib
locs = []
for sf in pathlib.Path('dist').glob('sitemap*.xml'):
    locs.extend(re.findall(r'<loc>(.*?)</loc>', sf.read_text(encoding='utf-8')))
# decode and sample
import urllib.parse
decoded = [urllib.parse.unquote(u) for u in locs]
hub_child = [u for u in decoded if '/รับซื้อโน๊ตบุ๊ค/' in u]
# count path depth after hub
depths = {}
for u in hub_child:
    path = u.split('.com')[-1]
    segs = [s for s in path.strip('/').split('/') if s]
    # segs[0] = รับซื้อโน๊ตบุ๊ค
    depth = len(segs) - 1 if segs and segs[0] == 'รับซื้อโน๊ตบุ๊ค' else 0
    depths[depth] = depths.get(depth, 0) + 1
lines = [f'total={len(locs)}', f'hub_children={len(hub_child)}', 'depths=' + str(depths), 'samples:']
lines += decoded[:8]
pathlib.Path('qa-sitemap-check.txt').write_text('\n'.join(lines), encoding='utf-8')
