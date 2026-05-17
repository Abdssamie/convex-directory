import { CheckoutLink, CustomerPortalLink } from "@convex-dev/polar/react";
import { api } from "@convex-hub/backend/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@convex-hub/ui/components/button";

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

export default function Billing() {
  const [interval, setInterval] = useState<PlanInterval>("month");
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const plans = useQuery(api.polar.listBillingPlans);
  const subscription = useQuery(api.polar.getCurrentSubscription) as
    | CurrentSubscription
    | undefined;
  const switchSubscription = useAction(api.polar.switchCurrentSubscription);

  return (
    <section className="rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-medium">Billing</h2>
          <p className="text-sm text-muted-foreground">
            Plans, checkout, and subscription changes all read from Polar product metadata.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <IntervalButton active={interval === "month"} onClick={() => setInterval("month")}>
            Monthly
          </IntervalButton>
          <IntervalButton active={interval === "year"} onClick={() => setInterval("year")}>
            Annual
          </IntervalButton>
          <CustomerPortalLink
            className="rounded-md border px-3 py-2 text-sm"
            polarApi={{ generateCustomerPortalUrl: api.polar.generateCustomerPortalUrl }}
          >
            Manage subscription
          </CustomerPortalLink>
        </div>
      </div>

      <div className="mb-4 rounded-md border border-dashed p-3 text-sm">
        <div className="font-medium">Current subscription</div>
        <div className="mt-1 text-muted-foreground">
          {subscription === undefined
            ? "Loading..."
            : subscription
              ? `${subscription.product.name} (${subscription.status})`
              : "No active subscription"}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {(plans ?? []).map((plan: BillingPlan) => (
          <article key={plan.id} className="rounded-md border p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>
              {plan.badge ? (
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {plan.badge}
                </span>
              ) : null}
            </div>

            <div className="mb-4">
              <div className="text-2xl font-semibold">
                {formatPlanPrice(getPlanProduct(plan, interval), interval).amount}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatPlanPrice(getPlanProduct(plan, interval), interval).cadence}
              </div>
            </div>

            <PlanAction
              plan={plan}
              interval={interval}
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

            <ul className="mt-4 space-y-2 text-sm">
              {plan.features.map((feature: string) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="size-4 flex-shrink-0 text-muted-foreground" strokeWidth={2.5} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {plans !== undefined && plans.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No billing plans found. Add Polar product metadata `plan` and `interval`, then sync
          products.
        </div>
      ) : null}
    </section>
  );
}

function PlanAction({
  plan,
  interval,
  subscription,
  pending,
  onSwitch,
}: {
  plan: BillingPlan;
  interval: PlanInterval;
  subscription: CurrentSubscription;
  pending: boolean;
  onSwitch: () => Promise<void>;
}) {
  const product = getPlanProduct(plan, interval);
  const currentPlanId = getSubscriptionPlanId(subscription);
  const currentInterval = getSubscriptionInterval(subscription);
  const isCurrentSelection = currentPlanId === plan.id && currentInterval === interval;
  const className = cn(
    "inline-flex w-full items-center justify-center rounded-md border px-3 py-2 text-sm",
    plan.badge && "border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90",
  );

  if (!subscription) {
    if (plan.id === "free") {
      return (
        <Button className={className} variant="secondary" disabled>
          Current plan
        </Button>
      );
    }

    if (!product) {
      return (
        <Button className={className} variant="secondary" disabled>
          Missing Polar product
        </Button>
      );
    }

    return (
      <CheckoutLink className={className} polarApi={api.polar} productIds={[product.id]} lazy>
        {interval === "year" ? `Choose ${plan.name} annual` : `Choose ${plan.name} monthly`}
      </CheckoutLink>
    );
  }

  if (isCurrentSelection) {
    return (
      <Button className={className} variant="secondary" disabled>
        Current plan
      </Button>
    );
  }

  if (!product) {
    return (
      <Button className={className} variant="secondary" disabled>
        Missing Polar product
      </Button>
    );
  }

  return (
    <Button
      className={className}
      variant="secondary"
      disabled={pending}
      onClick={() => void onSwitch()}
    >
      {pending
        ? "Switching..."
        : `Switch to ${plan.name} ${interval === "year" ? "annual" : "monthly"}`}
    </Button>
  );
}

function IntervalButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        active && "bg-foreground text-background",
      )}
    >
      {children}
    </button>
  );
}
