import { ConvexError } from "convex/values";
import { type QueryCtx, type MutationCtx } from "../_generated/server";
import { authComponent } from "../auth";

/**
 * Validates that the current user is authenticated and has an active organization selected.
 * Verifies membership in the database to prevent cross-tenant data leaks.
 *
 * Throws a ConvexError if no active organization is set or user is not a member.
 */
export async function requireActiveOrg(ctx: QueryCtx | MutationCtx) {
  const authUser = await authComponent.safeGetAuthUser(ctx);

  if (!authUser) {
    throw new ConvexError("Not authenticated");
  }

  const identity = await ctx.auth.getUserIdentity();
  if (!identity || !identity.sessionId) {
    throw new ConvexError("Not authenticated");
  }

  // Fetch session directly from the database to get activeOrganizationId
  const session = await ctx.db
    .query("session")
    .filter((q) => q.eq(q.field("_id"), identity.sessionId))
    .unique();

  if (!session?.activeOrganizationId) {
    throw new ConvexError("No active organization selected");
  }

  // Verify membership
  const membership = await ctx.db
    .query("member")
    .withIndex("organizationId_userId", (q) =>
      q.eq("organizationId", session.activeOrganizationId!).eq("userId", authUser._id),
    )
    .unique();

  if (!membership) {
    throw new ConvexError("Not a member of the active organization");
  }

  return {
    userId: authUser._id,
    orgId: session.activeOrganizationId,
    user: authUser,
    session,
  };
}
