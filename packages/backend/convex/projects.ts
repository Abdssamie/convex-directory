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
const allowedCategorySlugs = new Set([
  "developer-tools",
  "productivity",
  "finance",
  "health",
  "ai",
  "analytics",
  "marketing",
  "sales",
  "customer-support",
  "design",
  "collaboration",
  "education",
  "e-commerce",
  "security",
  "infrastructure",
  "operations",
  "hr",
  "legal",
  "real-estate",
  "travel",
  "media",
  "open-source",
  "components",
]);

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
  featured: v.optional(v.boolean()),
  staffPick: v.optional(v.boolean()),
  createdAt: v.number(),
  updatedAt: v.number(),
  productLogoUrl: v.optional(v.string()),
  productLogoKey: v.optional(v.string()),
  screenshotUrl: v.optional(v.string()),
  screenshotKey: v.optional(v.string()),
});

const adminOwnershipProjectValidator = v.object({
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
  claimState: v.union(v.literal("unclaimed"), v.literal("pending"), v.literal("claimed")),
  pendingClaimsCount: v.number(),
  approvedClaimsCount: v.number(),
  rejectedClaimsCount: v.number(),
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
  featured?: boolean;
  staffPick?: boolean;
  createdAt: number;
  updatedAt: number;
  productLogoKey?: string;
  screenshotKey?: string;
};

type ProjectInput = {
  title: string;
  description: string;
  url: string;
  type: StoredProject["type"];
  categorySlug: string;
  productLogoKey?: string;
  screenshotKey?: string;
};

function normalizeUrl(value: string) {
  const trimmedUrl = value.trim();
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    throw new ConvexError("Project URL must be a valid absolute URL");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new ConvexError("Project URL must use http or https");
  }

  parsedUrl.hash = "";
  parsedUrl.hostname = parsedUrl.hostname.toLowerCase();
  if (parsedUrl.pathname === "/" && !parsedUrl.search) {
    parsedUrl.pathname = "";
  }
  return parsedUrl.toString();
}

function normalizeOptionalKey(value: string | undefined) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function normalizeProjectInput(input: ProjectInput) {
  const title = input.title.trim();
  const description = input.description.trim();
  const categorySlug = input.categorySlug.trim().toLowerCase();

  if (title.length < 2 || title.length > 120) {
    throw new ConvexError("Project title must be between 2 and 120 characters");
  }

  if (description.length < 10 || description.length > 1000) {
    throw new ConvexError("Project description must be between 10 and 1000 characters");
  }

  if (!allowedCategorySlugs.has(categorySlug)) {
    throw new ConvexError("Project category is not supported");
  }

  return {
    title,
    description,
    url: normalizeUrl(input.url),
    type: input.type,
    categorySlug,
    productLogoKey: normalizeOptionalKey(input.productLogoKey),
    screenshotKey: normalizeOptionalKey(input.screenshotKey),
  };
}

async function ensureUrlIsUnique(
  ctx: QueryCtx | MutationCtx,
  url: string,
  exceptProjectId?: Id<"projects">,
) {
  const existingProject = await ctx.db
    .query("projects")
    .withIndex("by_url", (q) => q.eq("url", url))
    .first();

  if (existingProject && existingProject._id !== exceptProjectId) {
    throw new ConvexError("A project with this URL already exists");
  }
}

function normalizeProjectPatch(project: StoredProject, patch: Partial<ProjectInput>) {
  const normalizedPatch: Partial<ProjectInput> = {};

  if (patch.title !== undefined) {
    normalizedPatch.title = patch.title.trim();
    if (normalizedPatch.title.length < 2 || normalizedPatch.title.length > 120) {
      throw new ConvexError("Project title must be between 2 and 120 characters");
    }
  }

  if (patch.description !== undefined) {
    normalizedPatch.description = patch.description.trim();
    if (normalizedPatch.description.length < 10 || normalizedPatch.description.length > 1000) {
      throw new ConvexError("Project description must be between 10 and 1000 characters");
    }
  }

  if (patch.url !== undefined) {
    normalizedPatch.url = normalizeUrl(patch.url);
  }

  if (patch.type !== undefined) {
    normalizedPatch.type = patch.type;
  }

  if (patch.categorySlug !== undefined) {
    normalizedPatch.categorySlug = patch.categorySlug.trim().toLowerCase();
    if (!allowedCategorySlugs.has(normalizedPatch.categorySlug)) {
      throw new ConvexError("Project category is not supported");
    }
  }

  if (patch.productLogoKey !== undefined) {
    normalizedPatch.productLogoKey = normalizeOptionalKey(patch.productLogoKey);
  }

  if (patch.screenshotKey !== undefined) {
    normalizedPatch.screenshotKey = normalizeOptionalKey(patch.screenshotKey);
  }

  const nextTitle = normalizedPatch.title ?? project.title;
  const nextDescription = normalizedPatch.description ?? project.description;

  return {
    patch: normalizedPatch,
    searchableText:
      normalizedPatch.title !== undefined || normalizedPatch.description !== undefined
        ? `${nextTitle} ${nextDescription}`.toLowerCase()
        : undefined,
  };
}

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
    featured: project.featured,
    staffPick: project.staffPick,
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
    type: v.optional(
      v.union(
        v.literal("saas"),
        v.literal("tool"),
        v.literal("open-source"),
        v.literal("component"),
      ),
    ),
    categorySlug: v.optional(v.string()),
  },
  returns: v.array(projectValidator),
  handler: async (ctx, args) => {
    const q = ctx.db.query("projects").withIndex("by_status", (j) => j.eq("status", "approved"));

    const projects = await q.collect();
    let normalizedProjects = await Promise.all(
      projects.map((project) => normalizeProject(ctx, project as StoredProject)),
    );

    if (args.type) {
      normalizedProjects = normalizedProjects.filter((p) => p.type === args.type);
    }

    if (args.categorySlug) {
      const normalizedCategorySlug = args.categorySlug.trim().toLowerCase();
      normalizedProjects = normalizedProjects.filter(
        (project) => project.categorySlug === normalizedCategorySlug,
      );
    }

    return normalizedProjects;
  },
});

export const getProjectsForAdmin = query({
  args: {
    status: v.union(v.literal("approved"), v.literal("pending"), v.literal("rejected")),
  },
  returns: v.array(projectValidator),
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser || !(await isAdmin(authUser))) {
      throw new ConvexError("Unauthorized");
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();

    return await Promise.all(
      projects.map((project) => normalizeProject(ctx, project as StoredProject)),
    );
  },
});

export const getUserProjects = query({
  args: {},
  returns: v.array(projectValidator),
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", authUser._id))
      .unique();

    if (!user) {
      return [];
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", user._id))
      .collect();

    return await Promise.all(
      projects.map((project) => normalizeProject(ctx, project as StoredProject)),
    );
  },
});

export const getProjectById = query({
  args: { id: v.id("projects") },
  returns: v.union(projectValidator, v.null()),
  handler: async (ctx, args) => {
    const project = await ctx.db.get("projects", args.id);
    if (!project || project.status !== "approved") {
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
    const project = normalizeProjectInput(args);
    await ensureUrlIsUnique(ctx, project.url);

    return await ctx.db.insert("projects", {
      ...project,
      searchableText: `${project.title} ${project.description}`.toLowerCase(),
      createdBy: user._id,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    url: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("saas"),
        v.literal("tool"),
        v.literal("open-source"),
        v.literal("component"),
      ),
    ),
    categorySlug: v.optional(categorySlugValidator),
    productLogoKey: v.optional(v.string()),
    screenshotKey: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { user, authUser } = await getCurrentAppUser(ctx);
    const project = await ctx.db.get(args.id);
    if (!project) throw new ConvexError("Project not found");

    const isUserAdmin = await isAdmin(authUser);
    const isOwner = project.ownerId === user._id || project.createdBy === user._id;

    if (!isUserAdmin && !isOwner) {
      throw new ConvexError("Unauthorized");
    }

    const { id, ...rawPatch } = args;
    const { patch, searchableText } = normalizeProjectPatch(project as StoredProject, rawPatch);

    if (patch.url !== undefined) {
      await ensureUrlIsUnique(ctx, patch.url, id);
    }

    const sensitiveChanged =
      patch.title !== undefined ||
      patch.url !== undefined ||
      patch.type !== undefined ||
      patch.categorySlug !== undefined;
    const nextStatus = !isUserAdmin && sensitiveChanged ? "pending" : project.status;

    await ctx.db.patch(id, {
      ...patch,
      ...(searchableText ? { searchableText } : {}),
      status: nextStatus,
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const setProjectCuration = mutation({
  args: {
    id: v.id("projects"),
    featured: v.optional(v.boolean()),
    staffPick: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { authUser } = await getCurrentAppUser(ctx);
    if (!(await isAdmin(authUser))) throw new ConvexError("Unauthorized");

    const project = await ctx.db.get(args.id);
    if (!project) throw new ConvexError("Project not found");

    await ctx.db.patch(args.id, {
      featured: args.featured,
      staffPick: args.staffPick,
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const trackProjectEvent = mutation({
  args: {
    projectId: v.id("projects"),
    event: v.union(v.literal("view"), v.literal("outbound_click")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project || project.status !== "approved") {
      return null;
    }

    await ctx.db.insert("projectAnalytics", {
      projectId: args.projectId,
      event: args.event,
      ts: Date.now(),
    });

    return null;
  },
});

export const getProjectAnalytics = query({
  args: { projectId: v.id("projects") },
  returns: v.object({
    views: v.number(),
    outboundClicks: v.number(),
  }),
  handler: async (ctx, args) => {
    const { user, authUser } = await getCurrentAppUser(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    const isUserAdmin = await isAdmin(authUser);
    const isOwner = project.ownerId === user._id || project.createdBy === user._id;
    if (!isUserAdmin && !isOwner) throw new ConvexError("Unauthorized");

    const events = await ctx.db
      .query("projectAnalytics")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    return {
      views: events.filter((event) => event.event === "view").length,
      outboundClicks: events.filter((event) => event.event === "outbound_click").length,
    };
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

    const normalizedProjects = args.projects.map((project) => normalizeProjectInput(project));
    const duplicateUrls = new Set<string>();
    const seenUrls = new Set<string>();

    for (const project of normalizedProjects) {
      if (seenUrls.has(project.url)) {
        duplicateUrls.add(project.url);
      }
      seenUrls.add(project.url);
    }

    if (duplicateUrls.size > 0) {
      throw new ConvexError(`Duplicate URLs in batch: ${Array.from(duplicateUrls).join(", ")}`);
    }

    const now = Date.now();
    const createdIds: Id<"projects">[] = [];

    for (const url of seenUrls) {
      await ensureUrlIsUnique(ctx, url);
    }

    for (const project of normalizedProjects) {
      const createdId = await ctx.db.insert("projects", {
        ...project,
        searchableText: `${project.title} ${project.description}`.toLowerCase(),
        createdBy: user._id,
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

export const getApprovedProjectsOwnershipStatus = query({
  args: {},
  returns: v.array(adminOwnershipProjectValidator),
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser || !(await isAdmin(authUser))) {
      throw new ConvexError("Unauthorized");
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    const normalizedProjects = await Promise.all(
      projects.map((project) => normalizeProject(ctx, project as StoredProject)),
    );

    return await Promise.all(
      normalizedProjects.map(async (project) => {
        const claims = await ctx.db
          .query("claims")
          .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
          .collect();

        const pendingClaimsCount = claims.filter((claim) => claim.status === "pending").length;
        const approvedClaimsCount = claims.filter((claim) => claim.status === "approved").length;
        const rejectedClaimsCount = claims.filter((claim) => claim.status === "rejected").length;
        const hasVerifiedOwner =
          approvedClaimsCount > 0 ||
          (project.ownerId !== undefined && project.ownerId !== project.createdBy);
        const claimState: "pending" | "claimed" | "unclaimed" =
          pendingClaimsCount > 0 ? "pending" : hasVerifiedOwner ? "claimed" : "unclaimed";

        return {
          ...project,
          claimState,
          pendingClaimsCount,
          approvedClaimsCount,
          rejectedClaimsCount,
        };
      }),
    );
  },
});

export const searchProjects = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(projectValidator),
  handler: async (ctx, args) => {
    if (!args.query) {
      return [];
    }

    const limit = args.limit ?? 10;

    // Search by combined searchableText index for best results
    const matches = await ctx.db
      .query("projects")
      .withSearchIndex("search_all", (q) =>
        q.search("searchableText", args.query).eq("status", "approved"),
      )
      .take(limit);

    // Normalize and return
    return await Promise.all(
      matches.map((project) => normalizeProject(ctx, project as StoredProject)),
    );
  },
});
