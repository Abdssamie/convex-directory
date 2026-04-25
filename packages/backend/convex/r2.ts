import { R2 } from "@convex-dev/r2";
import { v } from "convex/values";

import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { authComponent } from "./auth";

async function requireAuthUser(ctx: Parameters<typeof authComponent.safeGetAuthUser>[0]) {
  const authUser = await authComponent.safeGetAuthUser(ctx as never);
  if (!authUser) {
    throw new Error("Not authenticated");
  }

  return authUser;
}

export const r2 = new R2(components.r2);

const normalizePublicBaseUrl = (value: string | undefined) => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) {
    return undefined;
  }

  return trimmedValue.replace(/\/+$/, "");
};

export const getPublicObjectUrl = (key: string) => {
  const publicBaseUrl = normalizePublicBaseUrl(process.env.R2_PUBLIC_BASE_URL);
  if (!publicBaseUrl) {
    return undefined;
  }

  const normalizedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${publicBaseUrl}/${normalizedKey}`;
};

export const { generateUploadUrl, syncMetadata, getMetadata, listMetadata, deleteObject } =
  r2.clientApi<DataModel>({
    checkReadBucket: async (ctx) => {
      await requireAuthUser(ctx);
    },
    checkUpload: async (ctx) => {
      await requireAuthUser(ctx);
    },
    checkDelete: async (ctx) => {
      await requireAuthUser(ctx);
    },
  });

export const getFileUrl = query({
  args: {
    key: v.string(),
    expiresIn: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAuthUser(ctx);
    return await r2.getUrl(args.key, { expiresIn: args.expiresIn });
  },
});

export const getPublicFileUrl = query({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuthUser(ctx);
    const publicUrl = getPublicObjectUrl(args.key);
    if (!publicUrl) {
      throw new Error("R2_PUBLIC_BASE_URL is not configured");
    }

    return publicUrl;
  },
});
