import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: {
    port: 5173,
    // Browser calls to /api go to the Express server, so no CORS setup is needed in dev
    proxy: { "/api": process.env.VITE_API_PROXY || "http://localhost:8000" },
  },
});
