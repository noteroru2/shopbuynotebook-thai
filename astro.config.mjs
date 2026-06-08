// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import mdx from '@astrojs/mdx';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://ร้านรับซื้อโน๊ตบุ๊ค.com/',
  trailingSlash: 'always',
  integrations: [sitemap(), mdx()],

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

  adapter: cloudflare(),
});