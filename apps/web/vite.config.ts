import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { Unhead } from "@unhead/react/vite";
import viteReact from "@vitejs/plugin-react";
import alchemy from "alchemy/cloudflare/tanstack-start";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), tailwindcss(), Unhead(), tanstackStart(), viteReact(), alchemy()],
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
    noExternal: ["@convex-dev/better-auth"],
  },
});
