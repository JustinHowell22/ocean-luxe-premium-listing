import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/ofg-premium.js",
        chunkFileNames: "assets/ofg-chunk.js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "assets/ofg-premium.css";
          }
          return "assets/[name][extname]";
        },
      },
    },
  },
});
