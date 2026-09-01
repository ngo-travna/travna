// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  image: {
    domains: ['zxnrevcjthhzeczrkhtf.supabase.co'],
  },
  vite: {
    optimizeDeps: {
      exclude: ['maplibre-gl'],
    },
  },
});
