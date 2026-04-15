import { createApi } from "@convex-dev/better-auth";
import { getBetterAuthConfig } from "../../auth";
import schema from "./schema";

export const { create, findOne, findMany, updateOne, updateMany, deleteOne, deleteMany } =
  createApi(schema, getBetterAuthConfig);
