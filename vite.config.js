import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/ofg-premium.js",
        chunkFileNames: "assets/ofg-chunk.js",
        assetFileNames: "assets/ofg-premium.css",
      },
    },
  },
});
