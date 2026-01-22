import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          entryFileNames: "assets/ofg-premium.js",
          chunkFileNames: "assets/ofg-chunk.js",
          assetFileNames: ({ name }) => {
            if (name && name.endsWith(".css")) {
              return "assets/ofg-premium.css";
            }
            return "assets/[name][extname]";
          },
        },
      },
    },
  };
});
