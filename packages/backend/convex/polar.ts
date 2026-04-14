import { Polar } from "@convex-dev/polar";

import { components } from "./_generated/api";
import { query, type QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";

type PolarUserInfo = {
  userId: string;
  email: string;
};

async function getAuthUserInfo(ctx: QueryCtx): Promise<PolarUserInfo | null> {
  const authUser = await authComponent.safeGetAuthUser(ctx as never);
  if (!authUser?.email) {
    return null;
  }

  return {
    userId: authUser._id,
    email: authUser.email,
  };
}

export const polar: Polar = new Polar(components.polar, {
  getUserInfo: async (ctx) => {
    const authUser = await getAuthUserInfo(ctx as QueryCtx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return authUser;
  },
});

export const {
  listAllProducts,
  listAllSubscriptions,
  generateCheckoutLink,
  generateCustomerPortalUrl,
  changeCurrentSubscription,
  cancelCurrentSubscription,
} = polar.api();

export const getCurrentSubscription = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await getAuthUserInfo(ctx);
    if (!authUser) {
      return null;
    }

    return await polar.getCurrentSubscription(ctx, { userId: authUser.userId });
  },
});
