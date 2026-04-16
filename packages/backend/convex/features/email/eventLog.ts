import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";

export const logEvent = internalMutation({
  args: {
    event: v.string(),
    email: v.string(),
    messageId: v.string(),
    ts: v.number(),
    subject: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    link: v.optional(v.string()),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailEvents", args);
  },
});
