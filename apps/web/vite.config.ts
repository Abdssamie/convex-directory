import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { Unhead } from "@unhead/react/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    cloudflare({
      config: {
        name: "convex-zen-web-abdssamie",
        compatibility_date: "2026-04-17",
        compatibility_flags: ["nodejs_compat"],
      },
    }),
    tsconfigPaths(),
    tailwindcss(),
    Unhead(),
    tanstackStart(),
    viteReact(),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  environments: {
    ssr: {
      optimizeDeps: {
        include: ["react", "react-dom", "react-dom/server"],
      },
    },
  },
  server: {
    port: 3001,
  },
  ssr: {
    noExternal: [
      "@convex-dev/better-auth",
      "@tanstack/react-query",
      "@tanstack/react-router",
      "@tanstack/react-router-ssr-query",
    ],
  },
});
