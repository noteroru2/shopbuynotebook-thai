// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { EnumChangefreq } from 'sitemap';
import mdx from '@astrojs/mdx';

const r6Triage = JSON.parse(
  fs.readFileSync(new URL('./src/data/rebuild-v2-model-series-triage.json', import.meta.url), 'utf8'),
);
const r13ModelSupplement = JSON.parse(
  fs.readFileSync(new URL('./src/data/rebuild-v2-model-series-r13-supplement.json', import.meta.url), 'utf8'),
);
const R6_SITEMAP_INCLUDED = new Set(
  [...r6Triage.items, ...r13ModelSupplement.items]
    .filter((item) => item.action === 'KEEP_CURRENT_URL' || item.action === 'MIGRATE_LATER')
    .map((item) => item.slug),
);
const r7ConditionTriage = JSON.parse(
  fs.readFileSync(new URL('./src/data/rebuild-v2-condition-triage.json', import.meta.url), 'utf8'),
);
const R7_CONDITION_SITEMAP_INCLUDED = new Set(
  r7ConditionTriage.items
    .filter((item) => item.action === 'KEEP_CURRENT_URL' || item.action === 'MIGRATE_LATER')
    .map((item) => item.slug),
);
const r8LocationTriage = JSON.parse(
  fs.readFileSync(new URL('./src/data/rebuild-v2-location-triage.json', import.meta.url), 'utf8'),
);
const R8_LOCATION_SLUGS = new Set(
  fs.readdirSync(new URL('./src/content/locations/', import.meta.url))
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.replace(/\.md$/, '')),
);
const R8_LOCATION_SITEMAP_INCLUDED = new Set(
  r8LocationTriage.items
    .filter((item) => item.action === 'KEEP_CURRENT_URL' || item.action === 'MIGRATE_LATER')
    .map((item) => item.slug),
);
const r9BlogTriage = JSON.parse(
  fs.readFileSync(new URL('./src/data/rebuild-v2-blog-triage.json', import.meta.url), 'utf8'),
);
const R9_BLOG_SITEMAP_INCLUDED = new Set(
  r9BlogTriage.items
    .filter((item) => item.action === 'KEEP_INFORMATIONAL')
    .map((item) => item.slug),
);
const r13Budget = JSON.parse(
  fs.readFileSync(new URL('./src/data/rebuild-v2-index-budget.json', import.meta.url), 'utf8'),
);
const redirectManifest = JSON.parse(
  fs.readFileSync(new URL('./src/data/rebuild-v2-production-redirects.json', import.meta.url), 'utf8'),
);
const R13_CORE_PATHS = new Set(r13Budget.corePaths);
const R13_RELEASED_BRAND_PATHS = new Set(r13Budget.releasedV2BrandPaths);
const R13_STAGING_PREFIXES = r13Budget.alwaysExcludedPrefixes;
const R13_REDIRECT_SOURCES = new Set(redirectManifest.redirects.map((item) => item.source));
const R5_LEGACY_BRANDS = new Set(['asus', 'acer', 'lenovo', 'hp', 'dell', 'msi', 'macbook', 'surface']);

export default defineConfig({
  site: 'https://ร้านรับซื้อโน๊ตบุ๊ค.com/',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter(page) {
        try {
          const pathname = page.startsWith('http')
            ? decodeURIComponent(new URL(page).pathname)
            : decodeURIComponent(page);

          if (pathname === '/admin' || pathname.startsWith('/admin/')) return false;
          if (R13_REDIRECT_SOURCES.has(pathname)) return false;
          if (R13_STAGING_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))) return false;
          if (R13_RELEASED_BRAND_PATHS.has(pathname)) return true;
          if (pathname.startsWith('/แบรนด์/')) return false;

          if (pathname.startsWith('/blog/') && pathname !== '/blog/') {
            const blogSlug = pathname.slice('/blog/'.length).split('/').filter(Boolean)[0];
            return R9_BLOG_SITEMAP_INCLUDED.has(blogSlug);
          }

          const hubPrefix = '/รับซื้อโน๊ตบุ๊ค/';
          if (pathname.startsWith(hubPrefix)) {
            if (pathname === hubPrefix) return false;
            const rest = pathname.slice(hubPrefix.length);
            const segments = rest.split('/').filter(Boolean);
            if (segments.length >= 2) return false;

            if (segments.length === 1) {
              const slug = segments[0];
              if (R5_LEGACY_BRANDS.has(slug)) return false;
              if (R8_LOCATION_SLUGS.has(slug)) return R8_LOCATION_SITEMAP_INCLUDED.has(slug);
              if (R7_CONDITION_SITEMAP_INCLUDED.has(slug)) return true;
              if (R6_SITEMAP_INCLUDED.has(slug)) return true;
              return false;
            }
          }

          return R13_CORE_PATHS.has(pathname);
        } catch {
          return false;
        }
      },
      serialize(item) {
        if (item.url === 'https://ร้านรับซื้อโน๊ตบุ๊ค.com/') {
          item.changefreq = EnumChangefreq.DAILY;
          item.priority = 1.0;
        } else if (item.url.includes('/ประเมินราคา/') || item.url.includes('/แบรนด์/')) {
          item.changefreq = EnumChangefreq.WEEKLY;
          item.priority = 0.9;
        } else if (item.url.includes('/รับเหมาโน๊ตบุ๊ค/') || item.url.includes('/รับเหมาคอมพิวเตอร์/') || item.url.includes('/รับประมูลคอม/')) {
          item.changefreq = EnumChangefreq.DAILY;
          item.priority = 0.9;
        } else if (item.url.includes('/รับซื้อโน๊ตบุ๊ค/')) {
          item.changefreq = EnumChangefreq.WEEKLY;
          item.priority = 0.8;
        } else if (item.url.includes('/blog/')) {
          item.changefreq = EnumChangefreq.MONTHLY;
          item.priority = 0.7;
        } else {
          item.changefreq = EnumChangefreq.MONTHLY;
          item.priority = 0.6;
        }
        return item;
      },
    }),
    mdx(),
  ],
  build: { inlineStylesheets: 'auto' },
  vite: {
    plugins: [tailwindcss()],
    build: { assetsInlineLimit: 20480 },
  },
});
