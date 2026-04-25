import { v, ConvexError } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { authComponent } from "./auth";
import { getPublicObjectUrl } from "./r2";

// Helper to check if user is admin
const isAdmin = async (user: { email: string }) => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = user.email?.trim().toLowerCase();
  return Boolean(adminEmail && userEmail && userEmail === adminEmail);
};

const categorySlugValidator = v.string();

const legacyCategorySlugByName: Record<string, string> = {
  saas: "saas",
  tools: "developer-tools",
  "open source": "open-source",
  components: "components",
};

const getCurrentAppUser = async (ctx: QueryCtx | MutationCtx) => {
  const authUser = await authComponent.getAuthUser(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_authId", (q) => q.eq("authId", authUser._id))
    .unique();
  if (!user) throw new ConvexError("Mirrored user not found");

  return { authUser, user };
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
  categorySlug: categorySlugValidator,
  ownerId: v.optional(v.string()),
  createdBy: v.string(),
  status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  createdAt: v.number(),
  updatedAt: v.number(),
  productLogoUrl: v.optional(v.string()),
  productLogoKey: v.optional(v.string()),
  screenshotUrl: v.optional(v.string()),
  screenshotKey: v.optional(v.string()),
});

type StoredProject = {
  _id: Id<"projects">;
  _creationTime: number;
  title: string;
  description: string;
  url: string;
  type: "saas" | "tool" | "open-source" | "component";
  categorySlug?: string;
  categoryId?: Id<"categories">;
  ownerId?: string;
  createdBy: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  updatedAt: number;
  productLogoKey?: string;
  screenshotKey?: string;
};

const resolveLegacyCategorySlug = async (
  ctx: QueryCtx,
  categoryId: Id<"categories"> | undefined,
) => {
  if (!categoryId) {
    return undefined;
  }

  const category = await ctx.db.get(categoryId);
  if (!category) {
    return undefined;
  }

  return legacyCategorySlugByName[category.name.trim().toLowerCase()] ?? category.slug;
};

const normalizeProject = async (ctx: QueryCtx, project: StoredProject) => {
  const categorySlug =
    project.categorySlug ?? (await resolveLegacyCategorySlug(ctx, project.categoryId));
  const productLogoUrl = project.productLogoKey
    ? getPublicObjectUrl(project.productLogoKey)
    : undefined;
  const screenshotUrl = project.screenshotKey
    ? getPublicObjectUrl(project.screenshotKey)
    : undefined;

  return {
    _id: project._id,
    _creationTime: project._creationTime,
    title: project.title,
    description: project.description,
    url: project.url,
    type: project.type,
    categorySlug: categorySlug ?? "uncategorized",
    ownerId: project.ownerId,
    createdBy: project.createdBy,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    productLogoUrl,
    productLogoKey: project.productLogoKey,
    screenshotUrl,
    screenshotKey: project.screenshotKey,
  };
};

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
    const normalizedProjects = await Promise.all(
      projects.map((project) => normalizeProject(ctx, project as StoredProject)),
    );

    if (args.type) {
      return normalizedProjects.filter((p) => p.type === args.type);
    }

    return normalizedProjects;
  },
});

export const getProjectById = query({
  args: { id: v.id("projects") },
  returns: v.union(projectValidator, v.null()),
  handler: async (ctx, args) => {
    const project = await ctx.db.get("projects", args.id);
    if (!project) {
      return null;
    }

    return await normalizeProject(ctx, project as StoredProject);
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
    categorySlug: categorySlugValidator,
    productLogoKey: v.optional(v.string()),
    screenshotKey: v.optional(v.string()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const { user } = await getCurrentAppUser(ctx);

    return await ctx.db.insert("projects", {
      ...args,
      createdBy: user._id,
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
        categorySlug: categorySlugValidator,
        productLogoKey: v.optional(v.string()),
        screenshotKey: v.optional(v.string()),
      }),
    ),
  },
  returns: v.array(v.id("projects")),
  handler: async (ctx, args) => {
    const { authUser, user } = await getCurrentAppUser(ctx);

    const isUserAdmin = await isAdmin(authUser);

    if (!isUserAdmin) {
      console.error("bulkCreateProjectsByAdmin unauthorized", {
        userId: authUser._id ?? null,
        userEmail: authUser.email?.trim().toLowerCase() ?? null,
        adminEmail: process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? null,
      });
      throw new ConvexError("Unauthorized");
    }
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

    const now = Date.now();
    const createdIds: Id<"projects">[] = [];

    for (const project of args.projects) {
      const createdId = await ctx.db.insert("projects", {
        ...project,
        createdBy: user._id,
        ownerId: user._id,
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
    const { authUser } = await getCurrentAppUser(ctx);
    if (!(await isAdmin(authUser))) throw new ConvexError("Unauthorized");

    const project = await ctx.db.get("projects", args.id);
    if (!project) throw new ConvexError("Project not found");

    await ctx.db.patch("projects", args.id, {
      status: "approved",
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const migrateProjectMediaFields = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const { authUser } = await getCurrentAppUser(ctx);
    if (!(await isAdmin(authUser))) throw new ConvexError("Unauthorized");

    const projects = await ctx.db.query("projects").collect();
    let migratedCount = 0;

    for (const project of projects) {
      if (
        "image" in project ||
        "logo" in project ||
        "imageKey" in project ||
        "logoKey" in project
      ) {
        await ctx.db.patch("projects", project._id, {
          image: undefined,
          logo: undefined,
          imageKey: undefined,
          logoKey: undefined,
        } as Record<string, undefined>);
        migratedCount += 1;
      }
    }

    return migratedCount;
  },
});

export const rejectProject = mutation({
  args: { id: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { authUser } = await getCurrentAppUser(ctx);
    if (!(await isAdmin(authUser))) throw new ConvexError("Unauthorized");

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
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      return false;
    }
    return await isAdmin(authUser);
  },
});
