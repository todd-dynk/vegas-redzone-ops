import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Set base path for GitHub Pages: /<repo-name>/
export default defineConfig({
  plugins: [react()],
  base: "/vegas-redzone-ops/",
});
