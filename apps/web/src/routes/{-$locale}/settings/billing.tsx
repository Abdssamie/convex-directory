import { createFileRoute, redirect } from "@tanstack/react-router";

import Billing from "@/components/billing";
import { BaseLayout } from "@/components/layouts/base-layout";

export const Route = createFileRoute("/{-$locale}/settings/billing")({
  beforeLoad: ({ context, location }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        to: "/{-$locale}/sign-in",
        params: { locale: location.pathname.split("/")[1] || "en" },
        search: {
          redirectTo: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <BaseLayout title="Billing" description="Manage plans, checkout, and your active subscription.">
      <div className="px-4 lg:px-6">
        <Billing />
      </div>
    </BaseLayout>
  );
}
