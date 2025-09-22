import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [webExtension()],
  build: {
    outDir: "dist",
    manifest: "manifest.json",
  },
});
