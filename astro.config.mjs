// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://richhacks.blog',

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Explicit, not just relying on Vite's default — esbuild minifies JS,
      // and cssMinify covers the compiled Tailwind bundle.
      minify: 'esbuild',
      cssMinify: true
    }
  },

  integrations: [mdx(), sitemap()]
});