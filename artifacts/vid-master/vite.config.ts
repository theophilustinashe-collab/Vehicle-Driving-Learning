import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const port = 3001;
const basePath = "./";

// Custom plugin to convert <script type="module"> to <script defer> and remove crossorigin for 100% Android WebView file:// compatibility
function removeCrossoriginPlugin() {
  return {
    name: "remove-crossorigin",
    transformIndexHtml(html: string) {
      return html
        .replace(/ type="module"/g, " defer")
        .replace(/ crossorigin/g, "")
        .replace(/crossorigin=""/g, "")
        .replace(/crossorigin/g, "");
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    removeCrossoriginPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    modulePreload: false,
    target: "es2015",
    rollupOptions: {
      output: {
        entryFileNames: "assets/app.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/app.[ext]",
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
