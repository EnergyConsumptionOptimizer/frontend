import { fileURLToPath, URL } from "node:url";

import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import svgLoader from "vite-svg-loader";

export default defineConfig({
  optimizeDeps: {
    noDiscovery: true,
  },
  plugins: [
    vue(),
    svgLoader(),
    tailwindcss(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
