import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper to check if user is admin
const isAdmin = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  return identity.email === process.env.ADMIN_EMAIL;
};

export const submitClaim = mutation({
  args: {
    projectId: v.id("projects"),
    reason: v.optional(v.string()),
  },
  returns: v.id("claims"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const userId = identity.subject;

    const existingClaim = await ctx.db
      .query("claims")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();

    if (existingClaim) throw new ConvexError("Claim already exists");

    return await ctx.db.insert("claims", {
      projectId: args.projectId,
      userId: userId,
      status: "pending",
      reason: args.reason,
      createdAt: Date.now(),
    });
  },
});

export const approveClaim = mutation({
  args: { claimId: v.id("claims") },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) throw new ConvexError("Unauthorized");

    const claim = await ctx.db.get("claims", args.claimId);
    if (!claim) throw new ConvexError("Claim not found");

    // Update project owner
    await ctx.db.patch("projects", claim.projectId, {
      ownerId: claim.userId as any,
      updatedAt: Date.now(),
    });

    // Update claim status
    await ctx.db.patch("claims", args.claimId, {
      status: "approved",
    });

    // Reject other claims for same project
    const otherClaims = await ctx.db
      .query("claims")
      .withIndex("by_projectId", (q) => q.eq("projectId", claim.projectId))
      .filter((q) => q.neq(q.field("_id"), args.claimId))
      .collect();

    for (const c of otherClaims) {
      await ctx.db.patch("claims", c._id, { status: "rejected" });
    }
    return null;
  },
});

export const getPendingClaims = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("claims"),
      _creationTime: v.number(),
      projectId: v.id("projects"),
      userId: v.string(),
      status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
      reason: v.optional(v.string()),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) throw new ConvexError("Unauthorized");
    return await ctx.db
      .query("claims")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});
