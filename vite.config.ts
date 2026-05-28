import { defineConfig, Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { resolve } from "path";

function injectCssPlugin(): Plugin {
  let cssCode: string | null = null;

  return {
    name: "inject-css",
    apply: "build",
    enforce: "post",
    generateBundle(_opts, bundle) {
      for (const [key, chunk] of Object.entries(bundle)) {
        if (chunk.type === "asset" && key.endsWith(".css")) {
          cssCode = (chunk as any).source;
          delete bundle[key];
        }
      }

      if (!cssCode) return;

      const injectionCode = `(function(){var s=document.createElement("style");s.textContent=${JSON.stringify(cssCode)};document.head.appendChild(s)})();\n`;

      for (const [, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk") {
          chunk.code = injectionCode + chunk.code;
        }
      }
    }
  };
}

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts", "src/**/*.vue"],
      outDir: "dist"
    }),
    injectCssPlugin()
  ],
  build: {
    cssCodeSplit: false,
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
