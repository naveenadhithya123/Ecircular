import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Node's server (node/index.js) serves static files from the repo-root
// "dist" folder, so the build output is placed one level above "react/".
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../dist",
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
});
