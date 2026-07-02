"""Scan dist/ for broken internal links (href/src pointing to missing files)."""
from __future__ import annotations

import json
import pathlib
import re
import sys
import urllib.parse

sys.stdout.reconfigure(encoding='utf-8')

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'

HREF_RE = re.compile(
    r'(?:href|src)=["\']([^"\']+)["\']',
    re.IGNORECASE,
)
SKIP_PREFIXES = ('http://', 'https://', 'mailto:', 'tel:', 'javascript:', 'data:', '#')
SKIP_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.pdf'}


def normalize_href(href: str) -> str | None:
    href = href.strip()
    if not href or any(href.startswith(p) for p in SKIP_PREFIXES):
        return None
    parsed = urllib.parse.urlparse(href)
    path = urllib.parse.unquote(parsed.path)
    if not path.startswith('/'):
        return None
    if any(path.lower().endswith(ext) for ext in SKIP_EXTS):
        return None
    return path


def resolve_path(path: str) -> pathlib.Path | None:
    """Map URL path to dist file."""
    rel = path.lstrip('/')
    if not rel:
        return DIST / 'index.html'
    candidate = DIST / rel
    if candidate.is_file():
        return candidate
    if candidate.is_dir() and (candidate / 'index.html').is_file():
        return candidate / 'index.html'
    if not rel.endswith('/'):
        with_index = DIST / f'{rel}/index.html'
        if with_index.is_file():
            return with_index
    html_file = DIST / f'{rel}.html'
    if html_file.is_file():
        return html_file
    return None


def collect_links() -> tuple[list[tuple[str, str]], set[str]]:
    broken: list[tuple[str, str]] = []
    checked: set[str] = set()
    for html_file in DIST.rglob('*.html'):
        source = str(html_file.relative_to(DIST)).replace('\\', '/')
        text = html_file.read_text(encoding='utf-8', errors='replace')
        for m in HREF_RE.finditer(text):
            path = normalize_href(m.group(1))
            if not path:
                continue
            key = f'{source}|{path}'
            if key in checked:
                continue
            checked.add(key)
            if resolve_path(path) is None:
                broken.append((source, path))
    return broken, checked


def main() -> None:
    if not DIST.exists():
        print('Run npm run build first')
        sys.exit(1)

    broken, checked = collect_links()
    result = {
        'links_checked': len(checked),
        'broken_count': len(broken),
        'broken_samples': [{'from': s, 'href': h} for s, h in broken[:30]],
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if broken:
        sys.exit(1)


if __name__ == '__main__':
    main()
