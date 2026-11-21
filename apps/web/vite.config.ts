import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.FOURD_WEB_BASE ?? "/",
  envDir: "../..",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          icons: ["lucide-react"]
        }
      }
    }
  },
  server: {
    port: 5173
  }
});
