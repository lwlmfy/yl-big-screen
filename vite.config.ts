import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts", "src/**/*.vue"],
      outDir: "dist"
    })
  ],
  build: {
    assetsInlineLimit: 0,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "YlBigScreen",
      formats: ["es", "cjs"],
      fileName: (format) => `yl-big-screen.${format === "es" ? "mjs" : "cjs"}`
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue"
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && /\.(png|svg|jpe?g|gif|webp)$/i.test(assetInfo.name)) {
            return "assets/[name]-[hash][extname]";
          }
          return "assets/[name][extname]";
        }
      }
    },
    sourcemap: true
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  }
});
