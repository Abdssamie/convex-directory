import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./lib/rateLimiter";

export const get = query({
  handler: async () => {
    return "OK";
  },
});

export const checkRateLimit = mutation({
  handler: async (ctx) => {
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "healthCheck", {
      key: "test-user",
    });

    if (!ok) {
      throw new ConvexError(`Rate limited! Try again in ${Math.ceil(retryAfter / 1000)}s`);
    }
    return "Success!";
  },
});
