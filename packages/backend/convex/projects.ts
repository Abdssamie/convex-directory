import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { type Id } from "./_generated/dataModel";

// Helper to check if user is admin
const isAdmin = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  return identity.email === process.env.ADMIN_EMAIL;
};

const projectValidator = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  title: v.string(),
  description: v.string(),
  url: v.string(),
  type: v.union(
    v.literal("saas"),
    v.literal("tool"),
    v.literal("open-source"),
    v.literal("component"),
  ),
  categoryId: v.id("categories"),
  ownerId: v.optional(v.id("user")),
  createdBy: v.id("user"),
  status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  createdAt: v.number(),
  updatedAt: v.number(),
  image: v.optional(v.string()),
});

export const getProjects = query({
  args: {
    status: v.optional(v.union(v.literal("approved"), v.literal("pending"), v.literal("rejected"))),
    type: v.optional(
      v.union(
        v.literal("saas"),
        v.literal("tool"),
        v.literal("open-source"),
        v.literal("component"),
      ),
    ),
  },
  returns: v.array(projectValidator),
  handler: async (ctx, args) => {
    const status = args.status ?? "approved";
    let q = ctx.db.query("projects").withIndex("by_status", (j) => j.eq("status", status));

    const projects = await q.collect();

    if (args.type) {
      return projects.filter((p) => p.type === args.type);
    }

    return projects;
  },
});

export const getProjectById = query({
  args: { id: v.id("projects") },
  returns: v.union(projectValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get("projects", args.id);
  },
});

export const submitProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    url: v.string(),
    type: v.union(
      v.literal("saas"),
      v.literal("tool"),
      v.literal("open-source"),
      v.literal("component"),
    ),
    categoryId: v.id("categories"),
    image: v.optional(v.string()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const userId = identity.subject as Id<"user">;

    return await ctx.db.insert("projects", {
      ...args,
      createdBy: userId,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const bulkCreateProjectsByAdmin = mutation({
  args: {
    projects: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        url: v.string(),
        type: v.union(
          v.literal("saas"),
          v.literal("tool"),
          v.literal("open-source"),
          v.literal("component"),
        ),
        categoryId: v.id("categories"),
        image: v.optional(v.string()),
      }),
    ),
  },
  returns: v.array(v.id("projects")),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");
    if (!(await isAdmin(ctx))) throw new ConvexError("Unauthorized");
    if (args.projects.length === 0) throw new ConvexError("No projects provided");
    if (args.projects.length > 100) throw new ConvexError("Too many projects in one batch");

    const duplicateUrls = new Set<string>();
    const seenUrls = new Set<string>();

    for (const project of args.projects) {
      const normalizedUrl = project.url.trim().toLowerCase();
      if (seenUrls.has(normalizedUrl)) {
        duplicateUrls.add(project.url);
      }
      seenUrls.add(normalizedUrl);
    }

    if (duplicateUrls.size > 0) {
      throw new ConvexError(`Duplicate URLs in batch: ${Array.from(duplicateUrls).join(", ")}`);
    }

    const adminUserId = identity.subject as Id<"user">;
    const now = Date.now();
    const createdIds: Id<"projects">[] = [];

    for (const project of args.projects) {
      const createdId = await ctx.db.insert("projects", {
        ...project,
        createdBy: adminUserId,
        ownerId: adminUserId,
        status: "approved",
        createdAt: now,
        updatedAt: now,
      });
      createdIds.push(createdId);
    }

    return createdIds;
  },
});

export const approveProject = mutation({
  args: { id: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) throw new ConvexError("Unauthorized");

    const project = await ctx.db.get("projects", args.id);
    if (!project) throw new ConvexError("Project not found");

    await ctx.db.patch("projects", args.id, {
      status: "approved",
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const rejectProject = mutation({
  args: { id: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) throw new ConvexError("Unauthorized");

    const project = await ctx.db.get("projects", args.id);
    if (!project) throw new ConvexError("Project not found");

    await ctx.db.patch("projects", args.id, {
      status: "rejected",
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const isAdminQuery = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    return await isAdmin(ctx);
  },
});

export const getCategories = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("categories"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

export const seedCategories = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) throw new ConvexError("Unauthorized");

    const categories = [
      { name: "Developer Tools", slug: "developer-tools" },
      { name: "Productivity", slug: "productivity" },
      { name: "Finance", slug: "finance" },
      { name: "Health", slug: "health" },
      { name: "AI", slug: "ai" },
      { name: "Analytics", slug: "analytics" },
      { name: "Marketing", slug: "marketing" },
      { name: "Sales", slug: "sales" },
      { name: "Customer Support", slug: "customer-support" },
      { name: "Design", slug: "design" },
      { name: "Collaboration", slug: "collaboration" },
      { name: "Education", slug: "education" },
      { name: "E-commerce", slug: "e-commerce" },
      { name: "Security", slug: "security" },
      { name: "Infrastructure", slug: "infrastructure" },
      { name: "Operations", slug: "operations" },
      { name: "HR", slug: "hr" },
      { name: "Legal", slug: "legal" },
      { name: "Real Estate", slug: "real-estate" },
      { name: "Travel", slug: "travel" },
      { name: "Media", slug: "media" },
      { name: "Open Source", slug: "open-source" },
      { name: "Components", slug: "components" },
    ];

    for (const cat of categories) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", cat.slug))
        .unique();
      if (!existing) {
        await ctx.db.insert("categories", cat);
      }
    }
    return null;
  },
});
