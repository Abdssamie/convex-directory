import { Polar } from "@convex-dev/polar";
import { subscriptionsUpdate } from "@polar-sh/sdk/funcs/subscriptionsUpdate.js";
import { v } from "convex/values";

import { components } from "./_generated/api";
import { action, query, type ActionCtx, type QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";

const PLAN_IDS = ["free", "pro", "business"] as const;
const PLAN_INTERVALS = ["month", "year"] as const;
const PRORATION_BEHAVIORS = ["invoice", "prorate", "next_period"] as const;

type BillingPlanId = (typeof PLAN_IDS)[number];
type BillingPlanInterval = (typeof PLAN_INTERVALS)[number];
type ProrationBehavior = (typeof PRORATION_BEHAVIORS)[number];

type PolarUserInfo = {
  userKey: string;
  email: string;
};

type ProductMetadata = Record<string, unknown> | null | undefined;

const PLAN_CONTENT: Record<
  BillingPlanId,
  {
    name: string;
    badge?: string;
    description: string;
    features: string[];
  }
> = {
  free: {
    name: "Free",
    description: "Start free with core product access.",
    features: ["Core workspace access", "Basic usage limits", "Community support"],
  },
  pro: {
    name: "Pro",
    badge: "Most popular",
    description: "For power users shipping faster with higher limits.",
    features: ["Everything in Free", "Higher limits", "Priority support"],
  },
  business: {
    name: "Business",
    description: "For advanced usage, higher limits, and priority support.",
    features: ["Everything in Pro", "Advanced workflows", "Priority support"],
  },
};

async function getAuthUserInfo(ctx: QueryCtx | ActionCtx): Promise<PolarUserInfo | null> {
  const authUser = await authComponent.safeGetAuthUser(ctx as never);
  if (!authUser?.email) {
    return null;
  }

  return {
    userKey: authUser._id,
    email: authUser.email,
  };
}

export const polar: Polar = new Polar(components.polar, {
  getUserInfo: async (ctx) => {
    const authUser = await getAuthUserInfo(ctx as QueryCtx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return {
      userId: authUser.userKey,
      email: authUser.email,
    };
  },
});

type PolarProducts = Awaited<ReturnType<typeof polar.listProducts>>;
type PolarProduct = PolarProducts[number];
type PolarSubscription = NonNullable<Awaited<ReturnType<typeof polar.getCurrentSubscription>>>;
type PolarSubscriptionProduct = PolarSubscription["product"];

export const {
  changeCurrentSubscription,
  cancelCurrentSubscription,
  getConfiguredProducts,
  listAllProducts,
  listAllSubscriptions,
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.api();

export const getCurrentSubscription = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await getAuthUserInfo(ctx);
    if (!authUser) {
      return null;
    }

    return await polar.getCurrentSubscription(ctx, { userId: authUser.userKey });
  },
});

export const listBillingPlans = query({
  args: {},
  handler: async (ctx) => {
    const products = await polar.listProducts(ctx, { includeArchived: false });
    return buildBillingPlans(products);
  },
});

export const debugPolarProducts = query({
  args: {},
  handler: async (ctx) => {
    return await polar.listProducts(ctx, { includeArchived: true });
  },
});

export const syncPolarProducts = action({
  args: {},
  handler: async (ctx) => {
    await polar.syncProducts(ctx);
    const products = await polar.listProducts(ctx, { includeArchived: false });
    return {
      count: products.length,
    };
  },
});

export const switchCurrentSubscription = action({
  args: {
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business")),
    interval: v.union(v.literal("month"), v.literal("year")),
    prorationBehavior: v.optional(
      v.union(v.literal("invoice"), v.literal("prorate"), v.literal("next_period")),
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await getAuthUserInfo(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const subscription = await polar.getCurrentSubscription(ctx as never, {
      userId: authUser.userKey,
    });
    if (!subscription) {
      throw new Error("No active subscription to switch");
    }

    const products = await polar.listProducts(ctx as never, { includeArchived: false });
    const targetProduct = findPlanProduct(products, args.plan, args.interval);
    if (!targetProduct) {
      throw new Error(`Missing Polar product for ${args.plan} ${args.interval}`);
    }

    if (subscription.productId === targetProduct.id) {
      throw new Error("Subscription already on this plan");
    }

    const prorationBehavior =
      args.prorationBehavior ?? getDefaultProrationBehavior(subscription.product, targetProduct);

    const result = await subscriptionsUpdate(polar.polar, {
      id: subscription.id,
      subscriptionUpdate: {
        productId: targetProduct.id,
        prorationBehavior,
      },
    });

    if (!result.ok) {
      throw result.error;
    }

    return {
      productId: targetProduct.id,
      prorationBehavior,
    };
  },
});

function buildBillingPlans(products: PolarProducts) {
  const productsByPlan = new Map<
    BillingPlanId,
    Partial<Record<BillingPlanInterval, PolarProduct>>
  >();

  for (const product of products) {
    const plan = getPlanId(product.metadata);
    if (!plan || product.isArchived) {
      continue;
    }

    const interval = getPlanInterval(product);
    if (!interval) {
      continue;
    }

    const planProducts = productsByPlan.get(plan) ?? {};
    planProducts[interval] = product;
    productsByPlan.set(plan, planProducts);

    if (plan === "free") {
      planProducts.month ??= product;
      planProducts.year ??= product;
    }
  }

  return PLAN_IDS.map((planId) => {
    const defaults = PLAN_CONTENT[planId];
    const planProducts = productsByPlan.get(planId) ?? {};
    const sourceProduct = planProducts.month ?? planProducts.year ?? null;

    return {
      id: planId,
      name: defaults.name,
      badge: defaults.badge ?? null,
      description: sourceProduct?.description ?? defaults.description,
      features: getProductFeatures(sourceProduct, defaults.features),
      monthlyProduct: planProducts.month ?? null,
      yearlyProduct: planProducts.year ?? null,
    };
  });
}

function findPlanProduct(
  products: PolarProducts,
  plan: BillingPlanId,
  interval: BillingPlanInterval,
) {
  const matchingProduct = products.find((product) => {
    return getPlanId(product.metadata) === plan && getPlanInterval(product) === interval;
  });

  if (matchingProduct) {
    return matchingProduct;
  }

  if (plan === "free") {
    return products.find((product) => getPlanId(product.metadata) === "free") ?? null;
  }

  return null;
}

function getDefaultProrationBehavior(
  currentProduct: PolarSubscriptionProduct,
  targetProduct: PolarProduct,
): ProrationBehavior {
  const currentInterval = getPlanInterval(currentProduct);
  const targetInterval = getPlanInterval(targetProduct);

  if (currentInterval && targetInterval && currentInterval !== targetInterval) {
    return "next_period";
  }

  const currentPrice = getPriceAmount(currentProduct);
  const targetPrice = getPriceAmount(targetProduct);

  if (targetPrice > currentPrice) {
    return "invoice";
  }

  return "next_period";
}

function getPlanId(metadata: ProductMetadata): BillingPlanId | null {
  const rawPlan = getMetadataString(metadata, "plan");
  if (!rawPlan) {
    return null;
  }

  return PLAN_IDS.find((plan) => plan === rawPlan) ?? null;
}

function getPlanInterval(
  product: PolarProduct | PolarSubscriptionProduct,
): BillingPlanInterval | null {
  const fromMetadata = getMetadataString(product.metadata, "interval");
  if (fromMetadata === "month" || fromMetadata === "year") {
    return fromMetadata;
  }

  if (product.recurringInterval === "month" || product.recurringInterval === "year") {
    return product.recurringInterval;
  }

  const recurringInterval = product.prices.find(
    (price: PolarProduct["prices"][number]) => price.recurringInterval,
  )?.recurringInterval;
  if (recurringInterval === "month" || recurringInterval === "year") {
    return recurringInterval;
  }

  if (getPlanId(product.metadata) === "free") {
    return "month";
  }

  return null;
}

function getProductFeatures(product: PolarProduct | null, fallbackFeatures: string[]) {
  const features =
    product?.benefits
      ?.map((benefit) => benefit.description?.trim())
      .filter((description): description is string => Boolean(description)) ?? [];

  return features.length > 0 ? features : fallbackFeatures;
}

function getPriceAmount(product: PolarProduct | PolarSubscriptionProduct) {
  return (
    product.prices.find(
      (price: PolarProduct["prices"][number]) => typeof price.priceAmount === "number",
    )?.priceAmount ?? 0
  );
}

function getMetadataString(metadata: ProductMetadata, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" ? value : null;
}
