import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";

/**
 * General purpose rate limiter for the Convex backend.
 *
 * Usage in mutations:
 * ```ts
 * import { rateLimiter } from "./lib/rateLimiter";
 *
 * export const myMutation = mutation({
 *   handler: async (ctx, args) => {
 *     const { ok, retryAfter } = await rateLimiter.limit(ctx, "apiRequests", { key: ctx.auth.userId });
 *     if (!ok) {
 *       throw new ConvexError(`Rate limited! Try again in ${Math.ceil(retryAfter / 1000)}s`);
 *     }
 *     // ... handle mutation logic
 *   }
 * });
 * ```
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Global limit for auth operations (e.g. signups)
  authSignUps: { kind: "fixed window", rate: 50, period: HOUR },

  // Password reset limit: 3 per hour per user/email
  passwordReset: { kind: "fixed window", rate: 3, period: HOUR },

  // Per-user limit for general API requests
  apiRequests: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 10 },

  // Limit for expensive LLM operations
  llmTokens: { kind: "token bucket", rate: 10000, period: MINUTE, shards: 5 },

  // Health check limit to prevent spam
  healthCheck: { kind: "fixed window", rate: 10, period: MINUTE },
});
