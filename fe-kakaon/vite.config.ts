import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 80,
    proxy: {
      // /gmsapi 로 시작하는 요청 → gms.ssafy.io 로 프록시 전달
      "/gmsapi": {
        target: "https://gms.ssafy.io",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/gmsapi/, ""),
      },
    },
  },
});
