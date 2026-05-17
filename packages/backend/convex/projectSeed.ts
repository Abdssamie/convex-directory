import { R2 } from "@convex-dev/r2";
import { ConvexError, v } from "convex/values";
import { components, internal } from "./_generated/api";
import { action, internalMutation, type ActionCtx, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const r2 = new R2(components.r2);

const projectTypeValidator = v.union(
  v.literal("saas"),
  v.literal("tool"),
  v.literal("open-source"),
  v.literal("component"),
);

const categorySlugValidator = v.union(
  v.literal("developer-tools"),
  v.literal("productivity"),
  v.literal("finance"),
  v.literal("health"),
  v.literal("ai"),
  v.literal("analytics"),
  v.literal("marketing"),
  v.literal("sales"),
  v.literal("customer-support"),
  v.literal("design"),
  v.literal("collaboration"),
  v.literal("education"),
  v.literal("e-commerce"),
  v.literal("security"),
  v.literal("infrastructure"),
  v.literal("operations"),
  v.literal("hr"),
  v.literal("legal"),
  v.literal("real-estate"),
  v.literal("travel"),
  v.literal("media"),
  v.literal("open-source"),
  v.literal("components"),
);

const seedProjectValidator = v.object({
  url: v.string(),
  title: v.string(),
  description: v.string(),
  categorySlug: v.optional(categorySlugValidator),
  categorySlugs: v.optional(v.array(categorySlugValidator)),
  type: projectTypeValidator,
});

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

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

function extractFaviconUrl(html: string, baseUrl: string) {
  const linkMatches = html.matchAll(
    /<link[^>]+rel=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
  );

  for (const match of linkMatches) {
    const rel = match[1]?.toLowerCase() ?? "";
    const href = match[2];
    if (!href) continue;

    if (rel.includes("icon") || rel.includes("apple-touch-icon") || rel.includes("mask-icon")) {
      try {
        return new URL(href, baseUrl).toString();
      } catch {
        continue;
      }
    }
  }

  try {
    return new URL("/favicon.ico", baseUrl).toString();
  } catch {
    return undefined;
  }
}

function normalizeProjectInput(input: {
  title: string;
  description: string;
  url: string;
  type: "saas" | "tool" | "open-source" | "component";
  categorySlug?:
    | "developer-tools"
    | "productivity"
    | "finance"
    | "health"
    | "ai"
    | "analytics"
    | "marketing"
    | "sales"
    | "customer-support"
    | "design"
    | "collaboration"
    | "education"
    | "e-commerce"
    | "security"
    | "infrastructure"
    | "operations"
    | "hr"
    | "legal"
    | "real-estate"
    | "travel"
    | "media"
    | "open-source"
    | "components";
  categorySlugs?: Array<
    | "developer-tools"
    | "productivity"
    | "finance"
    | "health"
    | "ai"
    | "analytics"
    | "marketing"
    | "sales"
    | "customer-support"
    | "design"
    | "collaboration"
    | "education"
    | "e-commerce"
    | "security"
    | "infrastructure"
    | "operations"
    | "hr"
    | "legal"
    | "real-estate"
    | "travel"
    | "media"
    | "open-source"
    | "components"
  >;
  productLogoKey?: string;
}) {
  const title = input.title.trim();
  const description = normalizeWhitespace(input.description);
  const categorySlugs = [
    ...new Set(
      [input.categorySlug, ...(input.categorySlugs ?? [])]
        .map((categorySlug) => categorySlug?.trim().toLowerCase())
        .filter((categorySlug): categorySlug is string => Boolean(categorySlug)),
    ),
  ];
  const categorySlug = categorySlugs[0];

  if (title.length < 2 || title.length > 120) {
    throw new ConvexError("Project title must be between 2 and 120 characters");
  }

  if (description.length < 10 || description.length > 1000) {
    throw new ConvexError("Project description must be between 10 and 1000 characters");
  }

  if (input.type !== "open-source" && categorySlugs.length === 0) {
    throw new ConvexError("Project must have at least one category");
  }

  return {
    title,
    description,
    url: normalizeUrl(input.url),
    type: input.type,
    ...(categorySlug ? { categorySlug } : {}),
    categorySlugs,
    productLogoKey: normalizeOptionalKey(input.productLogoKey),
  };
}

async function ensureUrlIsUnique(ctx: MutationCtx, url: string) {
  const existingProject = await ctx.db
    .query("projects")
    .withIndex("by_url", (q) => q.eq("url", url))
    .first();

  if (existingProject) {
    throw new ConvexError("A project with this URL already exists");
  }
}

async function fetchSiteMetadata(url: string) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; ConvexDirectorySeeder/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();
  const resolvedUrl = response.url || url;
  const faviconUrl = extractFaviconUrl(html, resolvedUrl);

  return { faviconUrl };
}

async function uploadFaviconFromUrl(ctx: ActionCtx, faviconUrl: string, sourceUrl: string) {
  const parsedFaviconUrl = new URL(faviconUrl);
  if (!["http:", "https:"].includes(parsedFaviconUrl.protocol)) {
    return undefined;
  }

  const response = await fetch(faviconUrl, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; ConvexDirectorySeeder/1.0)",
    },
  });

  if (!response.ok) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "image/x-icon";
  if (!contentType.startsWith("image/")) {
    return undefined;
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength === 0 || arrayBuffer.byteLength > 2 * 1024 * 1024) {
    return undefined;
  }

  const hostname = new URL(sourceUrl).hostname.replace(/[^a-z0-9.-]/gi, "-");
  const extension =
    contentType === "image/png"
      ? "png"
      : contentType === "image/svg+xml"
        ? "svg"
        : contentType === "image/webp"
          ? "webp"
          : contentType === "image/jpeg"
            ? "jpg"
            : "ico";

  return await r2.store(ctx, new Uint8Array(arrayBuffer), {
    key: `project-favicons/${hostname}-${crypto.randomUUID()}.${extension}`,
    type: contentType,
    cacheControl: "public, max-age=31536000, immutable",
  });
}

export const insertImportedProject = internalMutation({
  args: {
    title: v.string(),
    description: v.string(),
    url: v.string(),
    type: projectTypeValidator,
    categorySlug: v.optional(categorySlugValidator),
    categorySlugs: v.optional(v.array(categorySlugValidator)),
    productLogoKey: v.optional(v.string()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const project = normalizeProjectInput(args);
    await ensureUrlIsUnique(ctx, project.url);
    const now = Date.now();

    return await ctx.db.insert("projects", {
      ...project,
      searchableText:
        `${project.title} ${project.description} ${project.categorySlugs.join(" ")}`.toLowerCase(),
      createdBy: "seed:production-import",
      status: "approved",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const seedProjectsFromRemote = action({
  args: {
    projects: v.array(seedProjectValidator),
  },
  returns: v.array(
    v.object({
      url: v.string(),
      title: v.string(),
      insertedId: v.optional(v.id("projects")),
      skipped: v.boolean(),
      reason: v.optional(v.string()),
      productLogoKey: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const results: {
      url: string;
      title: string;
      insertedId?: Id<"projects">;
      skipped: boolean;
      reason?: string;
      productLogoKey?: string;
    }[] = [];

    for (const item of args.projects) {
      try {
        const metadata = await fetchSiteMetadata(item.url);
        const title = normalizeWhitespace(item.title).slice(0, 120);
        const description = normalizeWhitespace(item.description);
        const productLogoKey = metadata.faviconUrl
          ? await uploadFaviconFromUrl(ctx, metadata.faviconUrl, item.url)
          : undefined;

        const insertedId: Id<"projects"> = await ctx.runMutation(
          internal.projectSeed.insertImportedProject,
          {
            title,
            description,
            url: item.url,
            type: item.type,
            ...(item.categorySlug ? { categorySlug: item.categorySlug } : {}),
            ...(item.categorySlugs ? { categorySlugs: item.categorySlugs } : {}),
            ...(productLogoKey ? { productLogoKey } : {}),
          },
        );

        results.push({
          url: item.url,
          title,
          insertedId,
          skipped: false,
          productLogoKey,
        });
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown error";
        results.push({
          url: item.url,
          title: item.title,
          skipped: true,
          reason,
        });
      }
    }

    return results;
  },
});
