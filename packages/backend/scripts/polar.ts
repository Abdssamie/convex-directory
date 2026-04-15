#!/usr/bin/env pnpm tsx
import dotenv from "dotenv";
import path from "path";

import { Polar } from "@polar-sh/sdk";

const envPath = path.join(process.cwd(), ".env.convex");
dotenv.config({ path: envPath });

const POLAR_ORGANIZATION_TOKEN = process.env.POLAR_ORGANIZATION_TOKEN;
const POLAR_SERVER = process.env.POLAR_SERVER === "production" ? "production" : "sandbox";

if (!POLAR_ORGANIZATION_TOKEN) {
  throw new Error("Missing POLAR_ORGANIZATION_TOKEN in .env.convex");
}

const polar = new Polar({
  accessToken: POLAR_ORGANIZATION_TOKEN,
  server: POLAR_SERVER,
});

type PlanId = "free" | "pro" | "team";
type PlanInterval = "month" | "year";

type PlanSpec = {
  key: string;
  plan: PlanId;
  interval: PlanInterval;
  name: string;
  description: string;
  amountType: "free" | "fixed";
  priceAmount?: number;
  benefits: string[];
};

const PLAN_SPECS: PlanSpec[] = [
  {
    key: "free",
    plan: "free",
    interval: "month",
    name: "Convex Zen Free",
    description: "Start free with core Convex Zen boilerplate access.",
    amountType: "free",
    benefits: ["Core workspace access", "Basic usage limits", "Community support"],
  },
  {
    key: "pro-month",
    plan: "pro",
    interval: "month",
    name: "Convex Zen Pro Monthly",
    description: "For power users shipping faster with higher limits.",
    amountType: "fixed",
    priceAmount: 1900,
    benefits: ["Everything in Free", "Higher usage limits", "Priority support"],
  },
  {
    key: "pro-year",
    plan: "pro",
    interval: "year",
    name: "Convex Zen Pro Yearly",
    description: "Annual Pro plan for power users who want better value.",
    amountType: "fixed",
    priceAmount: 19000,
    benefits: ["Everything in Free", "Higher usage limits", "Priority support"],
  },
  {
    key: "team-month",
    plan: "team",
    interval: "month",
    name: "Convex Zen Team Monthly",
    description: "For teams that need collaboration, admin control, and support.",
    amountType: "fixed",
    priceAmount: 4900,
    benefits: ["Everything in Pro", "Team collaboration", "Admin controls"],
  },
  {
    key: "team-year",
    plan: "team",
    interval: "year",
    name: "Convex Zen Team Yearly",
    description: "Annual Team plan for teams standardizing on Convex Zen.",
    amountType: "fixed",
    priceAmount: 49000,
    benefits: ["Everything in Pro", "Team collaboration", "Admin controls"],
  },
];

const commands: Record<string, () => Promise<void>> = {
  sync: syncPlans,
  list: listProducts,
};

async function syncPlans() {
  const organizationId = await getOrganizationId();
  const existingProducts = await getAllProducts(organizationId);
  const existingBenefits = await getAllBenefits(organizationId);
  const benefitIdsByDescription = new Map(
    existingBenefits.map((benefit) => [benefit.description, benefit.id]),
  );

  for (const spec of PLAN_SPECS) {
    const benefitIds = await ensureBenefitIds(spec, organizationId, benefitIdsByDescription);
    const existingProduct = existingProducts.find((product) => product.metadata?.key === spec.key);

    if (existingProduct) {
      const updated = await polar.products.update({
        id: existingProduct.id,
        productUpdate: {
          name: spec.name,
          description: spec.description,
          visibility: "public",
          metadata: {
            key: spec.key,
            plan: spec.plan,
            interval: spec.interval,
          },
          prices: buildUpdatedPrices(existingProduct, spec),
        },
      });
      await polar.products.updateBenefits({
        id: updated.id,
        productBenefitsUpdate: { benefits: benefitIds },
      });
      console.log(`updated ${spec.name} (${updated.id})`);
      continue;
    }

    const created = await polar.products.create({
      name: spec.name,
      description: spec.description,
      recurringInterval: spec.interval,
      prices: [buildCreatePrice(spec)],
      metadata: {
        key: spec.key,
        plan: spec.plan,
        interval: spec.interval,
      },
    });
    await polar.products.updateBenefits({
      id: created.id,
      productBenefitsUpdate: { benefits: benefitIds },
    });
    console.log(`created ${spec.name} (${created.id})`);
  }
}

async function listProducts() {
  const organizationId = await getOrganizationId();
  const products = await getAllProducts(organizationId);
  console.log(
    JSON.stringify(
      products.map((product) => ({
        id: product.id,
        name: product.name,
        recurringInterval: product.recurringInterval,
        metadata: product.metadata,
        prices: product.prices.map((price) => ({
          id: price.id,
          amountType: price.amountType,
          priceAmount: "priceAmount" in price ? price.priceAmount : null,
          priceCurrency: "priceCurrency" in price ? price.priceCurrency : null,
        })),
      })),
      null,
      2,
    ),
  );
}

async function getOrganizationId() {
  const organizations = await polar.organizations.list({});
  for await (const page of organizations) {
    const organization = page.result.items[0];
    if (organization) {
      return organization.id;
    }
  }
  throw new Error("No Polar organization found for token");
}

async function getAllProducts(organizationId: string) {
  const products = await polar.products.list({ organizationId, isArchived: false });
  const allProducts = [] as Array<Awaited<ReturnType<typeof polar.products.create>>>;
  for await (const page of products) {
    allProducts.push(...page.result.items);
  }
  return allProducts;
}

async function getAllBenefits(organizationId: string) {
  const benefits = await polar.benefits.list({ organizationId });
  const allBenefits = [] as Array<Awaited<ReturnType<typeof polar.benefits.create>>>;
  for await (const page of benefits) {
    allBenefits.push(...page.result.items);
  }
  return allBenefits;
}

async function ensureBenefitIds(
  spec: PlanSpec,
  organizationId: string,
  benefitIdsByDescription: Map<string, string>,
) {
  const benefitIds: string[] = [];
  for (const description of spec.benefits) {
    const existingId = benefitIdsByDescription.get(description);
    if (existingId) {
      benefitIds.push(existingId);
      continue;
    }

    const benefit = await polar.benefits.create({
      type: "custom",
      description,
      properties: { note: `${spec.name} benefit` },
      metadata: {
        productKey: spec.key,
      },
    });
    benefitIdsByDescription.set(description, benefit.id);
    benefitIds.push(benefit.id);
  }
  return benefitIds;
}

function buildCreatePrice(spec: PlanSpec) {
  if (spec.amountType === "free") {
    return { amountType: "free" as const };
  }

  return {
    amountType: "fixed" as const,
    priceAmount: spec.priceAmount!,
    priceCurrency: "usd",
  };
}

function buildUpdatedPrices(
  product: Awaited<ReturnType<typeof polar.products.create>>,
  spec: PlanSpec,
) {
  const matchingPrice = product.prices.find((price) => {
    if (spec.amountType === "free") {
      return price.amountType === "free";
    }

    return (
      price.amountType === "fixed" &&
      "priceAmount" in price &&
      price.priceAmount === spec.priceAmount
    );
  });

  if (matchingPrice) {
    return [{ id: matchingPrice.id }];
  }

  return [...product.prices.map((price) => ({ id: price.id })), buildCreatePrice(spec)];
}

async function main() {
  const [command = "sync"] = process.argv.slice(2);
  const run = commands[command];
  if (!run) {
    throw new Error(`Unknown command: ${command}`);
  }
  await run();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
