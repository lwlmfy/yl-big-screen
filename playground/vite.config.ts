import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

const DEV_ORIGIN = "http://localhost:3100";
const APP_BASE = "/yl-big-screen/";

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  root: __dirname,
  // 开发用完整 URL，避免微前端嵌套时资源按主应用域名解析导致背景图 404
  // 生产构建仍用相对前缀（GitHub Pages / 静态部署）
  base: command === "serve" ? `${DEV_ORIGIN}${APP_BASE}` : APP_BASE,
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
    strictPort: true,
    open: true,
    cors: true,
    origin: DEV_ORIGIN,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }
}));
