import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/hueprint/",
  plugins: [react()],
  build: {
    outDir: "dist",
  },
});