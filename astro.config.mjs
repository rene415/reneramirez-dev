import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://reneramirez.dev',
  integrations: [
    svelte(),
    tailwind({
      applyBaseStyles: false, // we ship our own resets in global.css
    }),
  ],
  vite: {
    ssr: {
      noExternal: ['gsap'],
    },
  },
});
