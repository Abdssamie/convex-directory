import { createHead as createServerHead } from "@unhead/react/server";

export const head = createServerHead({
  plugins: [],
  script: [
    {
      defer: true,
      src: "https://basic-goshawk-557.convex.site/script.js?key=acfef8f1-2886-4f03-9b8b-98e261f0992b",
    },
  ],
});
