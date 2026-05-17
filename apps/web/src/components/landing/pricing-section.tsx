"use client";

import { CheckoutLink } from "@convex-dev/polar/react";
import { api } from "@convex-hub/backend/convex/_generated/api";
import { LocalizedLink } from "@/components/localized-link";
import { useAction, useQuery } from "convex/react";
import { Check } from "lucide-react";
import { useState } from "react";

import { Badge } from "@convex-hub/ui/components/badge";
import { Button } from "@convex-hub/ui/components/button";
import { ToggleGroup, ToggleGroupItem } from "@convex-hub/ui/components/toggle-group";

import { authClient } from "@/lib/auth-client";
import {
  formatPlanPrice,
  getPlanProduct,
  getSubscriptionInterval,
  getSubscriptionPlanId,
  type BillingPlan,
  type CurrentSubscription,
  type PlanInterval,
} from "@/lib/billing";
import { cn } from "@/lib/utils";

export function PricingSection() {
  const [interval, setInterval] = useState<PlanInterval>("month");
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const plans = useQuery(api.polar.listBillingPlans);
  const subscription = useQuery(api.polar.getCurrentSubscription) as
    | CurrentSubscription
    | undefined;
  const switchSubscription = useAction(api.polar.switchCurrentSubscription);
  const session = authClient.useSession();
  const isAuthenticated = !!session.data;

  return (
    <section id="pricing" className="bg-muted/40 py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            Pricing Plans
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Choose your plan</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Simple pricing for solo builders and growing products. Upgrade when you need more limits
            and support.
          </p>

          <div className="mb-2 flex items-center justify-center">
            <ToggleGroup
              type="single"
              value={interval}
              onValueChange={(value) => {
                if (value === "month" || value === "year") {
                  setInterval(value);
                }
              }}
              className="bg-secondary text-secondary-foreground rounded-full border-none p-1 shadow-none"
            >
              <ToggleGroupItem
                value="month"
                className="data-[state=on]:bg-background data-[state=on]:border-border !rounded-full border border-transparent px-6 data-[state=on]:text-foreground"
              >
                Monthly
              </ToggleGroupItem>
              <ToggleGroupItem
                value="year"
                className="data-[state=on]:bg-background data-[state=on]:border-border !rounded-full border border-transparent px-6 data-[state=on]:text-foreground"
              >
                Annually
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="mx-auto max-w-6xl rounded-xl border">
          <div className="grid lg:grid-cols-3">
            {(plans ?? []).map((plan: BillingPlan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                interval={interval}
                isAuthenticated={isAuthenticated}
                subscription={subscription ?? null}
                pending={pendingPlan === `${plan.id}:${interval}`}
                onSwitch={async () => {
                  setPendingPlan(`${plan.id}:${interval}`);
                  try {
                    await switchSubscription({ plan: plan.id, interval });
                  } finally {
                    setPendingPlan(null);
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Need custom billing setup?{" "}
            <Button variant="link" className="h-auto cursor-pointer p-0" asChild>
              <a href="#contact">Contact us</a>
            </Button>
          </p>
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  interval,
  isAuthenticated,
  subscription,
  pending,
  onSwitch,
}: {
  plan: BillingPlan;
  interval: PlanInterval;
  isAuthenticated: boolean;
  subscription: CurrentSubscription;
  pending: boolean;
  onSwitch: () => Promise<void>;
}) {
  const product = getPlanProduct(plan, interval);
  const price = formatPlanPrice(product, interval);
  const currentPlanId = getSubscriptionPlanId(subscription);
  const currentInterval = getSubscriptionInterval(subscription);
  const isCurrentSelection = currentPlanId === plan.id && currentInterval === interval;

  return (
    <article
      className={cn(
        "grid row-span-4 grid-rows-subgrid gap-6 p-8",
        plan.badge &&
          "mx-4 my-2 rounded-xl bg-card shadow-xl ring-1 ring-foreground/10 backdrop-blur",
      )}
    >
      <div>
        <div className="mb-2 text-lg font-medium tracking-tight">{plan.name}</div>
        <div className="text-sm text-muted-foreground">{plan.description}</div>
      </div>

      <div>
        <div className="mb-1 text-4xl font-bold">{price.amount}</div>
        <div className="text-sm text-muted-foreground">{price.cadence}</div>
      </div>

      <div>
        {renderPlanAction({
          plan,
          interval,
          product,
          isAuthenticated,
          subscription,
          isCurrentSelection,
          pending,
          onSwitch,
        })}
      </div>

      <div>
        <ul role="list" className="space-y-3 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <Check className="size-4 flex-shrink-0 text-muted-foreground" strokeWidth={2.5} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function renderPlanAction({
  plan,
  interval,
  product,
  isAuthenticated,
  subscription,
  isCurrentSelection,
  pending,
  onSwitch,
}: {
  plan: BillingPlan;
  interval: PlanInterval;
  product: BillingPlan["monthlyProduct"];
  isAuthenticated: boolean;
  subscription: CurrentSubscription;
  isCurrentSelection: boolean;
  pending: boolean;
  onSwitch: () => Promise<void>;
}) {
  const className = cn(
    "my-2 w-full cursor-pointer",
    plan.badge
      ? "border-[0.5px] border-white/25 bg-primary text-primary-foreground shadow-md shadow-black/20 ring-1 ring-primary/15 hover:bg-primary/90"
      : "border border-transparent bg-background shadow-sm shadow-black/15 ring-1 ring-foreground/10 hover:bg-muted/50",
  );
  const variant = plan.badge ? "default" : "secondary";

  if (!isAuthenticated) {
    return (
      <Button className={className} variant={variant} size="lg" asChild>
        <LocalizedLink to="/sign-in">Sign in</LocalizedLink>
      </Button>
    );
  }

  if (!subscription) {
    if (plan.id === "free") {
      return (
        <Button className={className} variant={variant} size="lg" asChild>
          <LocalizedLink to="/dashboard">Start free</LocalizedLink>
        </Button>
      );
    }

    if (!product) {
      return (
        <Button className={className} variant={variant} size="lg" disabled>
          Missing Polar product
        </Button>
      );
    }

    return (
      <CheckoutLink className={className} polarApi={api.polar} productIds={[product.id]} lazy>
        {plan.id === "pro"
          ? interval === "year"
            ? "Upgrade to Pro annual"
            : "Upgrade to Pro monthly"
          : interval === "year"
            ? "Upgrade to Business annual"
            : "Upgrade to Business monthly"}
      </CheckoutLink>
    );
  }

  if (isCurrentSelection) {
    return (
      <Button className={className} variant={variant} size="lg" disabled>
        Current plan
      </Button>
    );
  }

  if (!product) {
    return (
      <Button className={className} variant={variant} size="lg" disabled>
        Missing Polar product
      </Button>
    );
  }

  return (
    <Button
      className={className}
      variant={variant}
      size="lg"
      disabled={pending}
      onClick={() => void onSwitch()}
    >
      {pending
        ? "Switching..."
        : plan.id === "pro"
          ? `Switch to Pro ${interval === "year" ? "annual" : "monthly"}`
          : `Switch to Business ${interval === "year" ? "annual" : "monthly"}`}
    </Button>
  );
}
