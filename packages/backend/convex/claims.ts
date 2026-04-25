import { v, ConvexError } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";

// Helper to check if user is admin
const isAdmin = async (ctx: QueryCtx | MutationCtx) => {
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
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) throw new ConvexError("Unauthenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", authUser._id))
      .unique();
    if (!user) throw new ConvexError("Mirrored user not found");

    const existingClaim = await ctx.db
      .query("claims")
      .withIndex("by_projectId_and_userId", (q) =>
        q.eq("projectId", args.projectId).eq("userId", user._id),
      )
      .unique();

    if (existingClaim) throw new ConvexError("Claim already exists");

    return await ctx.db.insert("claims", {
      projectId: args.projectId,
      userId: user._id,
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
      ownerId: claim.userId,
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
      .collect();

    for (const c of otherClaims) {
      if (c._id === args.claimId) {
        continue;
      }
      await ctx.db.patch("claims", c._id, { status: "rejected" });
    }
    return null;
  },
});

export const rejectClaim = mutation({
  args: { claimId: v.id("claims") },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) throw new ConvexError("Unauthorized");

    const claim = await ctx.db.get("claims", args.claimId);
    if (!claim) throw new ConvexError("Claim not found");

    await ctx.db.patch("claims", args.claimId, {
      status: "rejected",
    });

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

export const getProjectClaimStatus = query({
  args: { projectId: v.id("projects") },
  returns: v.object({
    isOwner: v.boolean(),
    hasPendingClaim: v.boolean(),
    hasApprovedClaim: v.boolean(),
    hasRejectedClaim: v.boolean(),
    canClaim: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const notAuth = {
      isOwner: false,
      hasPendingClaim: false,
      hasApprovedClaim: false,
      hasRejectedClaim: false,
      canClaim: false,
    };
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) return notAuth;

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", authUser._id))
      .unique();
    if (!user) return notAuth;

    const project = await ctx.db.get(args.projectId);
    if (!project) return notAuth;

    const isOwner = project.ownerId === user._id;

    const claim = await ctx.db
      .query("claims")
      .withIndex("by_projectId_and_userId", (q) =>
        q.eq("projectId", args.projectId).eq("userId", user._id),
      )
      .unique();

    const hasPendingClaim = claim?.status === "pending";
    const hasApprovedClaim = claim?.status === "approved";
    const hasRejectedClaim = claim?.status === "rejected";
    const canClaim = !isOwner && !hasPendingClaim && !hasApprovedClaim;

    return { isOwner, hasPendingClaim, hasApprovedClaim, hasRejectedClaim, canClaim };
  },
});
