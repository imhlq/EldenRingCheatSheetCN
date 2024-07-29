import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import compressor from "astro-compressor";

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), partytown(), compressor({ gzip: true, brotli: false })],
  vite: {
    ssr: {
      noExternal: ["beercss"]
    }
  }
});