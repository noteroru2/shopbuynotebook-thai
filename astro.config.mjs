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
const R6_SITEMAP_EXCLUDED = new Set(
  r6Triage.items
    .filter((item) => item.action === 'HOLD_NOINDEX' || item.action === 'MERGE')
    .map((item) => item.slug),
);
const R5_LEGACY_BRANDS = new Set(['asus', 'acer', 'lenovo', 'hp', 'dell', 'msi', 'macbook', 'surface']);
const V2_STAGING_PREFIXES = ['/แบรนด์/', '/รุ่น/', '/อาการ/', '/พื้นที่/', '/ประเมินราคา/'];

// https://astro.build/config
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

          // V2 namespaces stay noindex and out of sitemap until migration release.
          if (V2_STAGING_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return false;

          const hubPrefix = '/รับซื้อโน๊ตบุ๊ค/';
          if (pathname.startsWith(hubPrefix)) {
            const rest = pathname.slice(hubPrefix.length);
            const segments = rest.split('/').filter(Boolean);
            if (segments.length >= 2) return false;

            if (segments.length === 1) {
              const slug = segments[0];
              if (R5_LEGACY_BRANDS.has(slug)) return false;
              if (R6_SITEMAP_EXCLUDED.has(slug)) return false;
            }
          }
        } catch {
          /* keep page if URL parsing fails */
        }
        return true;
      },
      serialize(item) {
        if (item.url === 'https://ร้านรับซื้อโน๊ตบุ๊ค.com/') {
          item.changefreq = EnumChangefreq.DAILY;
          item.priority = 1.0;
        } else if (item.url.includes('/ขายโน๊ตบุ๊คด่วน/') || item.url.includes('/รับเหมาโน๊ตบุ๊ค/') || item.url.includes('/รับเหมาคอมพิวเตอร์/') || item.url.includes('/รับประมูลคอม/')) {
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

  /** ลด render-blocking: อินไลน์ CSS ชุดหลักถ้าเล็กกว่า assetsInlineLimit */
  build: {
    inlineStylesheets: 'auto',
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      assetsInlineLimit: 20480,
    },
  },
});
