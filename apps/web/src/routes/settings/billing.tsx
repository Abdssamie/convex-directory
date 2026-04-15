import { createFileRoute, redirect } from "@tanstack/react-router";

import Billing from "@/components/billing";
import { BaseLayout } from "@/components/layouts/base-layout";

export const Route = createFileRoute("/settings/billing")({
  beforeLoad: ({ context, location }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        to: "/sign-in",
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
