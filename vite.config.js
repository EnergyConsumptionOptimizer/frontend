import { fileURLToPath, URL } from "node:url";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import svgLoader from "vite-svg-loader";

export default defineConfig({
  optimizeDeps: {
    include: ["socket.io-client", "debug"],
  },
  server: {
    allowedHosts: true,
    host: true,
    port: 80,
    hmr: {
      clientPort: 8080,
    },
    watch: {
      usePolling: true,
    },
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
