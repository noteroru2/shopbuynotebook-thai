#!/usr/bin/env python3
"""
live-seo-smoke.py
-----------------
Crawl live production URLs from sitemap.
Checks: status, title, h1, canonical, meta-robots, claim terms, duplicates.
Exports: live-seo-audit.csv
Prints: JSON summary to stdout
"""

import csv
import json
import re
import sys
import time
import urllib.request
import urllib.parse
import pathlib
from html.parser import HTMLParser
from collections import Counter

sys.stdout.reconfigure(encoding="utf-8")

# ── Config ────────────────────────────────────────────────────────────────────
SITEMAP_INDEX = "https://xn--12cab9bbfm3a2afe3kaa1f6bza0af2b5h.com/sitemap-index.xml"
SITE_ROOT = "https://xn--12cab9bbfm3a2afe3kaa1f6bza0af2b5h.com"
# Fallback: try Thai domain directly
SITEMAP_INDEX_THAI = "https://ร้านรับซื้อโน๊ตบุ๊ค.com/sitemap-index.xml"

OUTPUT_CSV = pathlib.Path(__file__).resolve().parent.parent / "live-seo-audit.csv"

CLAIM_TERMS = [
    "ราคาสูงสุด", "ราคาดีที่สุด", "อันดับ 1", "รับทุกสภาพ", "รับทุกยี่ห้อ",
    "จ่ายเงินทันที", "รับเงินทันที", "ไม่กดราคา", "รับประกันราคา", "100%",
    "24 ชม", "24 ชั่วโมง", "5-10 นาที", "5–10 นาที", "ชัวร์", "แน่นอน",
    "ยุติธรรมที่สุด", "Big Data", "Real-time", "กว่าพันรายการ",
    "ลบข้อมูลถาวร", "รับประกันการลบ", "ราคาสูง", "ไม่มีหักลีลา",
    "ร้อนเงิน", "ฉุกเฉินทางการเงิน", "ปฏิวัติวงการ",
]

COMBO_RE = re.compile(r"/รับซื้อโน๊ตบุ๊ค/[^/]+/[^/]+/$")

REQUEST_DELAY = 0.3   # seconds between requests (be polite)
MAX_URLS = 500        # safety cap


# ── HTML Parser ───────────────────────────────────────────────────────────────
class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.h1s: list[str] = []
        self.canonical = ""
        self.robots = ""
        self._in_title = False
        self._in_h1 = False
        self._h1_buf = ""

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "h1":
            self._in_h1 = True
            self._h1_buf = ""
        elif tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href", "")
        elif tag == "meta" and a.get("name", "").lower() == "robots":
            self.robots = a.get("content", "")

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "h1":
            self._in_h1 = False
            self.h1s.append(re.sub(r"<[^>]+>", "", self._h1_buf).strip())

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_h1:
            self._h1_buf += data


# ── Helpers ───────────────────────────────────────────────────────────────────
def fetch(url: str, timeout: int = 15) -> tuple[int, str]:
    """Return (status_code, body_text). On error returns (0, '')."""
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "SEO-SmokeBot/1.0 (+https://ร้านรับซื้อโน๊ตบุ๊ค.com/)",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Charset": "utf-8",
            },
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read()
            # try utf-8 first, then fallback
            try:
                text = raw.decode("utf-8")
            except UnicodeDecodeError:
                text = raw.decode("latin-1")
            return resp.status, text
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception:
        return 0, ""


def extract_locs(xml: str) -> list[str]:
    return re.findall(r"<loc>(.*?)</loc>", xml, re.S)


def get_all_sitemap_urls() -> list[str]:
    """Fetch sitemap index → individual sitemaps → all <loc> URLs."""
    # Try encoded domain first, then Thai domain
    for sitemap_url in [SITEMAP_INDEX, SITEMAP_INDEX_THAI]:
        status, body = fetch(sitemap_url)
        if status == 200 and body:
            break
    else:
        print(f"[ERROR] Cannot reach sitemap: {SITEMAP_INDEX}", file=sys.stderr)
        return []

    child_maps = extract_locs(body)
    if not child_maps:
        # Single sitemap
        child_maps = [sitemap_url]

    all_urls: list[str] = []
    for sm in child_maps:
        s, b = fetch(sm)
        if s == 200:
            all_urls.extend(extract_locs(b))
        time.sleep(REQUEST_DELAY)

    return all_urls[:MAX_URLS]


def scan_page(url: str) -> dict:
    status, html = fetch(url)
    row: dict = {
        "url": url,
        "status": status,
        "title": "",
        "h1": "",
        "canonical": "",
        "meta_robots": "",
        "is_noindex": False,
        "is_combo": bool(COMBO_RE.search(url)),
        "claim_hits": "",
        "flags": "",
    }
    if status != 200 or not html:
        row["flags"] = "BROKEN" if status == 0 else f"HTTP_{status}"
        return row

    parser = PageParser()
    try:
        parser.feed(html)
    except Exception:
        pass

    row["title"] = parser.title.strip()
    row["h1"] = " | ".join(h.strip() for h in parser.h1s if h.strip())
    row["canonical"] = parser.canonical
    row["meta_robots"] = parser.robots
    row["is_noindex"] = "noindex" in parser.robots.lower()

    # Scan for claim terms
    hits = [term for term in CLAIM_TERMS if term in html]
    row["claim_hits"] = "; ".join(hits)

    flags = []
    if hits:
        flags.append("CLAIM")
    if not row["title"]:
        flags.append("NO_TITLE")
    if not row["h1"]:
        flags.append("NO_H1")
    if row["canonical"] and not row["canonical"].startswith("http"):
        flags.append("BAD_CANONICAL")
    row["flags"] = "; ".join(flags)

    return row


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("Live SEO Smoke Test")
    print("=" * 60)

    print("Fetching sitemap URLs...", end=" ", flush=True)
    urls = get_all_sitemap_urls()
    print(f"{len(urls)} URLs found")

    if not urls:
        print("[ABORT] No URLs to scan.", file=sys.stderr)
        sys.exit(1)

    # Count combos in sitemap
    combo_urls = [u for u in urls if COMBO_RE.search(urllib.parse.unquote(u))]
    print(f"Combo URLs in sitemap: {len(combo_urls)}")

    rows: list[dict] = []
    title_counter: Counter = Counter()

    print(f"\nCrawling {len(urls)} pages...")
    for i, url in enumerate(urls, 1):
        row = scan_page(url)
        rows.append(row)
        if row["title"]:
            title_counter[row["title"]] += 1
        if row["flags"]:
            print(f"  [{i}/{len(urls)}] ⚠  {row['url'][:60]} → {row['flags']}")
        else:
            print(f"  [{i}/{len(urls)}] ✓  {row['url'][:60]}", end="\r")
        time.sleep(REQUEST_DELAY)

    print("\n")

    # Duplicate title detection
    dup_titles = {t: c for t, c in title_counter.items() if c > 1}
    for row in rows:
        if row["title"] in dup_titles:
            if "DUP_TITLE" not in row["flags"]:
                row["flags"] = (row["flags"] + "; DUP_TITLE").lstrip("; ")

    # Export CSV
    fieldnames = ["url", "status", "title", "h1", "canonical",
                  "meta_robots", "is_noindex", "is_combo", "claim_hits", "flags"]
    with OUTPUT_CSV.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"CSV exported → {OUTPUT_CSV}")

    # Summary
    total = len(rows)
    broken = sum(1 for r in rows if "BROKEN" in r["flags"] or
                 any(r["flags"].startswith(f"HTTP_{c}") for c in ["4", "5"]))
    claim_pages = sum(1 for r in rows if "CLAIM" in r["flags"])
    noindex_pages = sum(1 for r in rows if r["is_noindex"])
    dup_title_count = sum(1 for r in rows if "DUP_TITLE" in r["flags"])

    # Specific claim detail for critical money pages
    critical_slugs = ["/", "/ขายโน๊ตบุ๊คด่วน/", "/ตีราคาโน๊ตบุ๊ค/",
                      "/รับซื้อโน๊ตบุ๊ค/macbook/", "/รับซื้อโน๊ตบุ๊ค/asus/",
                      "/เช็คราคาโน๊ตบุ๊ค/", "/ขายโน๊ตบุ๊ค/", "/รับซื้อโน๊ตบุ๊คมือสอง/"]
    critical_claims = {}
    for r in rows:
        decoded = urllib.parse.unquote(r["url"])
        for slug in critical_slugs:
            if decoded.endswith(slug) or r["url"].endswith(
                urllib.parse.quote(slug, safe="/:@")):
                if r["claim_hits"]:
                    critical_claims[slug] = r["claim_hits"]

    summary = {
        "sitemap_url_count": total,
        "combo_in_sitemap": len(combo_urls),
        "broken_pages": broken,
        "claim_pages_total": claim_pages,
        "noindex_pages": noindex_pages,
        "duplicate_titles": dup_title_count,
        "critical_page_claims": critical_claims,
        "dup_title_samples": list(dup_titles.items())[:5],
        "claim_samples": [
            {"url": r["url"], "hits": r["claim_hits"]}
            for r in rows if "CLAIM" in r["flags"]
        ][:20],
        "csv_path": str(OUTPUT_CSV),
    }

    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
