import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      disable: mode === "native",
      registerType: "prompt",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Spritual — a little wisdom, every day",
        short_name: "Spritual",
        description:
          "A quiet place to read, understand and practise. Local demonstration.",
        theme_color: "#123d3a",
        background_color: "#f6f3eb",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2,webp}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: { outDir: mode === "native" ? "dist-native" : "dist" },
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
}));
