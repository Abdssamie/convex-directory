import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

async function isAdminUser(email: string | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = email?.trim().toLowerCase();
  return Boolean(adminEmail && userEmail && userEmail === adminEmail);
}

function normalizeText(value: string, minLength: number, maxLength: number, label: string) {
  const trimmedValue = value.trim();
  if (trimmedValue.length < minLength || trimmedValue.length > maxLength) {
    throw new ConvexError(`${label} must be between ${minLength} and ${maxLength} characters`);
  }
  return trimmedValue;
}

export const submitProjectReport = mutation({
  args: {
    projectId: v.id("projects"),
    reason: v.string(),
    details: v.optional(v.string()),
  },
  returns: v.id("projectReports"),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project || project.status !== "approved") {
      throw new ConvexError("Project not found");
    }

    const authUser = await authComponent.safeGetAuthUser(ctx);
    const user = authUser
      ? await ctx.db
          .query("users")
          .withIndex("by_authId", (q) => q.eq("authId", authUser._id))
          .unique()
      : null;

    return await ctx.db.insert("projectReports", {
      projectId: args.projectId,
      userId: user?._id,
      reason: normalizeText(args.reason, 3, 120, "Report reason"),
      details: args.details ? normalizeText(args.details, 1, 2000, "Report details") : undefined,
      status: "open",
      createdAt: Date.now(),
    });
  },
});

export const getOpenProjectReports = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("projectReports"),
      projectId: v.id("projects"),
      projectTitle: v.string(),
      projectUrl: v.string(),
      userId: v.optional(v.id("users")),
      reason: v.string(),
      details: v.optional(v.string()),
      status: v.union(v.literal("open"), v.literal("resolved"), v.literal("dismissed")),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!(await isAdminUser(authUser?.email))) {
      throw new ConvexError("Unauthorized");
    }

    const reports = await ctx.db
      .query("projectReports")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
    const enrichedReports = [];

    for (const report of reports) {
      const project = await ctx.db.get(report.projectId);
      if (!project) continue;
      enrichedReports.push({
        _id: report._id,
        projectId: report.projectId,
        projectTitle: project.title,
        projectUrl: project.url,
        userId: report.userId,
        reason: report.reason,
        details: report.details,
        status: report.status,
        createdAt: report.createdAt,
      });
    }

    return enrichedReports;
  },
});

export const resolveProjectReport = mutation({
  args: {
    reportId: v.id("projectReports"),
    status: v.union(v.literal("resolved"), v.literal("dismissed")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!(await isAdminUser(authUser?.email))) {
      throw new ConvexError("Unauthorized");
    }

    const report = await ctx.db.get(args.reportId);
    if (!report) throw new ConvexError("Report not found");

    await ctx.db.patch(args.reportId, {
      status: args.status,
      resolvedAt: Date.now(),
    });

    return null;
  },
});
