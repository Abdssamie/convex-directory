import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  emailEvents: defineTable({
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
  })
    .index("by_email", ["email"])
    .index("by_messageId", ["messageId"])
    .index("by_event", ["event"])
    .index("by_ts", ["ts"]),
  users: defineTable({
    authId: v.string(),
    name: v.string(),
    email: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_authId", ["authId"])
    .index("by_email", ["email"]),
  projects: defineTable({
    title: v.string(),
    description: v.string(),
    url: v.string(),
    type: v.union(
      v.literal("saas"),
      v.literal("tool"),
      v.literal("open-source"),
      v.literal("component"),
    ),
    categorySlug: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    ownerId: v.optional(v.string()),
    createdBy: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    createdAt: v.number(),
    updatedAt: v.number(),
    productLogoKey: v.optional(v.string()),
    screenshotKey: v.optional(v.string()),
    searchableText: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_ownerId", ["ownerId"])
    .index("by_createdBy", ["createdBy"])
    .searchIndex("search_all", {
      searchField: "searchableText",
      filterFields: ["status"],
    })
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status"],
    })
    .searchIndex("search_description", {
      searchField: "description",
      filterFields: ["status"],
    }),
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
  }).index("by_slug", ["slug"]),
  claims: defineTable({
    projectId: v.id("projects"),
    userId: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    reason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_projectId_and_userId", ["projectId", "userId"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),
};

export default defineSchema(tables);
