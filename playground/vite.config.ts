import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  root: __dirname,
  base: mode === "production" ? "/tiancaixiaoxiongmao/" : "/",
  resolve: {
    alias: {
      "@": resolve(__dirname, "../src")
    }
  },
  build: {
    outDir: resolve(__dirname, "../dist-playground")
  },
  server: {
    port: 3100,
    open: true
  }
}));
