// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://ร้านรับซื้อโน๊ตบุ๊ค.com/',
  trailingSlash: 'always',
  redirects: {
    '/รับซื้อโน๊ตบุ๊ค/': '/',
  },
  integrations: [
    sitemap({
      filter(page) {
        try {
          const pathname = page.startsWith('http')
            ? decodeURIComponent(new URL(page).pathname)
            : decodeURIComponent(page);
          const hubPrefix = '/รับซื้อโน๊ตบุ๊ค/';
          if (pathname.startsWith(hubPrefix)) {
            const rest = pathname.slice(hubPrefix.length);
            const segments = rest.split('/').filter(Boolean);
            if (segments.length >= 2) return false;
          }
        } catch {
          /* keep page if URL parsing fails */
        }
        return true;
      },
      serialize(item) {
        if (item.url === 'https://ร้านรับซื้อโน๊ตบุ๊ค.com/') {
          item.changefreq = 'daily';
          item.priority = 1.0;
        } else if (item.url.includes('/ขายโน๊ตบุ๊คด่วน/') || item.url.includes('/รับเหมาโน๊ตบุ๊ค/') || item.url.includes('/รับเหมาคอมพิวเตอร์/') || item.url.includes('/รับประมูลคอม/')) {
          item.changefreq = 'daily';
          item.priority = 0.9;
        } else if (item.url.includes('/รับซื้อโน๊ตบุ๊ค/')) {
          item.changefreq = 'weekly';
          item.priority = 0.8;
        } else if (item.url.includes('/blog/')) {
          item.changefreq = 'monthly';
          item.priority = 0.7;
        } else {
          item.changefreq = 'monthly';
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