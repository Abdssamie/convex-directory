import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { Unhead } from "@unhead/react/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const workerVars = Object.fromEntries(
  Object.entries({
    CONVEX_CLOUD_URL: process.env.VITE_CONVEX_URL,
    CONVEX_SITE_URL: process.env.VITE_CONVEX_SITE_URL,
    CONVEX_URL: process.env.VITE_CONVEX_URL,
    SITE_URL: process.env.SITE_URL,
    VITE_CONVEX_SITE_URL: process.env.VITE_CONVEX_SITE_URL,
    VITE_CONVEX_URL: process.env.VITE_CONVEX_URL,
  }).filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0),
);

export default defineConfig({
  plugins: [
    cloudflare({
      config: {
        name: "convex-zen-web-abdssamie",
        compatibility_date: "2026-03-10",
        compatibility_flags: ["nodejs_compat", "nodejs_compat_populate_process_env"],
        keep_vars: true,
        observability: {
          enabled: false,
        },
        vars: workerVars,
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
