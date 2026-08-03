# AI Crawler Policy (Batch 4)

**Status:** Repository policy documented. **Cloudflare Managed robots on production is NOT fully editable from this repo** — owner must confirm in Cloudflare dashboard.

**Severity note:** Audit ISS-002 was labeled P1 for GEO impact. Per remediation brief, AI-bot blocking is **reclassified to P2 / policy** until owner confirms which bots matter for *AI Search/Citation* vs *training*. It is **not** an automatic ranking P1 for classic Google Search (Googlebot remains allowed in site `robots.txt`).

## Current evidence

### Repo `public/robots.txt`
- `User-agent: *` → `Allow: /`
- `Disallow: /admin/`
- Sitemap declaration present
- **Does not** Disallow GPTBot / Google-Extended / ClaudeBot in-repo

### Live production (fetched 2026-08-03 audit)
Cloudflare Managed Content prepends Disallow for among others:
GPTBot, ClaudeBot, Google-Extended, Amazonbot, Bytespider, CCBot, Applebot-Extended, meta-externalagent
Plus `Content-Signal: search=yes,ai-train=no,use=reference`

## Decision table (proposed)

| Bot / Token | Owner | Purpose | Search index | AI search/citation | Training | Current (live CF) | Proposed |
|-------------|-------|---------|--------------|--------------------|----------|-------------------|----------|
| Googlebot | Google | Web search | Yes | Indirect | N/A | Allow (site) | **Allow** |
| Google-Extended | Google | Gemini / AI features grounding | No classic SERP | Yes | Separate from Googlebot | **Disallow (CF)** | **Allow if citation desired**; keep train=no via Content-Signal |
| Bingbot | Microsoft | Bing search | Yes | Related | N/A | Allow (default) | **Allow** |
| GPTBot | OpenAI | Model training crawl | No | Limited | Yes | Disallow (CF) | **Keep Disallow** (training) |
| OAI-SearchBot | OpenAI | ChatGPT search | No | Yes | No | Unknown/CF | **Allow** if product documents support citation |
| ChatGPT-User | OpenAI | User-initiated fetch | No | Yes | No | Unknown/CF | **Allow** public pages |
| ClaudeBot | Anthropic | Training-oriented | No | Limited | Yes | Disallow (CF) | **Keep Disallow** |
| Claude-SearchBot | Anthropic | Search (if present in latest docs) | No | Yes | No | Unknown | **Allow** only if documented & desired |
| PerplexityBot | Perplexity | Answer engine | No | Yes | Mixed | Unknown | **Owner decide**; default allow public if citation goal |
| Applebot | Apple | Spotlight/Siri | Partial | Partial | N/A | Allow default | **Allow** |
| Applebot-Extended | Apple | AI extensions | No | Partial | Yes | Disallow (CF) | Owner decide |
| Amazonbot | Amazon | Index/AI | Mixed | Mixed | Mixed | Disallow (CF) | Keep Disallow unless needed |

## Principles applied

1. Do **not** block Googlebot / Bingbot on public pages.
2. Separate **training** bots (keep blocked) from **search/citation** bots (consider allow).
3. Keep `/admin/` disallowed regardless of AI policy.
4. Do **not** weaken WAF/Bot Fight Mode globally for SEO.
5. Opening training bots is **not** claimed to improve Google rankings.

## Cloudflare checklist (BLOCKED without dashboard auth)

- [ ] AI Crawl Control / robots managed rules
- [ ] Bot Fight Mode exceptions (if any)
- [ ] WAF custom rules affecting bot UAs
- [ ] Workers must continue attaching `X-Robots-Tag` for `/admin/`
- [ ] Confirm Content-Signal `ai-train=no` remains if that is legal preference

**Production status for Batch 4:** `BLOCKED BY CLOUDFLARE AUTHENTICATION` for managed robots changes. Repo robots + docs updated only.
