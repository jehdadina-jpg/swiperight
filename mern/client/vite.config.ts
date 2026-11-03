import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: {
    port: 5173,
    // Browser calls to /api go to the Express server, so no CORS setup is needed in dev
    proxy: { "/api": process.env.VITE_API_PROXY || "http://localhost:8000" },
  },
});
