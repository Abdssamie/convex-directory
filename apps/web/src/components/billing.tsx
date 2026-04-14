import { CheckoutLink, CustomerPortalLink } from "@convex-dev/polar/react";
import { api } from "@convex-zen/backend/convex/_generated/api";
import { useQuery } from "convex/react";

function formatPrice(amount?: number | null, interval?: string | null) {
  if (amount == null) {
    return "Custom pricing";
  }

  const dollars = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);

  return interval ? `${dollars}/${interval}` : dollars;
}

export default function Billing() {
  const products = useQuery(api.polar.listAllProducts);
  const subscription = useQuery(api.polar.getCurrentSubscription);

  return (
    <section className="rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-medium">Billing</h2>
          <p className="text-muted-foreground text-sm">
            Polar checkout, customer portal, subscription state.
          </p>
        </div>
        <CustomerPortalLink
          className="rounded-md border px-3 py-2 text-sm"
          polarApi={{ generateCustomerPortalUrl: api.polar.generateCustomerPortalUrl }}
        >
          Manage subscription
        </CustomerPortalLink>
      </div>

      <div className="mb-4 rounded-md border border-dashed p-3 text-sm">
        <div className="font-medium">Current subscription</div>
        <div className="text-muted-foreground mt-1">
          {subscription === undefined
            ? "Loading..."
            : subscription
              ? `${subscription.product.name} (${subscription.status})`
              : "No active subscription"}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {products?.map((product) => {
          const price = product.prices[0];

          return (
            <article key={product.id} className="rounded-md border p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  {product.description ? (
                    <p className="text-muted-foreground mt-1 text-sm">{product.description}</p>
                  ) : null}
                </div>
                <span className="text-sm font-medium">
                  {formatPrice(price?.priceAmount, price?.recurringInterval)}
                </span>
              </div>

              <CheckoutLink
                className="inline-flex rounded-md border px-3 py-2 text-sm"
                polarApi={api.polar}
                productIds={[product.id]}
                lazy
              >
                Subscribe
              </CheckoutLink>
            </article>
          );
        })}

        {products !== undefined && products.length === 0 ? (
          <div className="text-muted-foreground rounded-md border border-dashed p-4 text-sm md:col-span-2">
            No Polar products synced yet. Create products in Polar, then sync via webhook or
            `polar.syncProducts`.
          </div>
        ) : null}
      </div>
    </section>
  );
}
