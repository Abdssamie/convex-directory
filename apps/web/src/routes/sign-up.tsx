import { createFileRoute, redirect } from "@tanstack/react-router";

import AuthLayout from "@/components/auth-layout";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/sign-up")({
  validateSearch: (search: Record<string, unknown>): { redirectTo?: string } => ({
    redirectTo: typeof search.redirectTo === "string" ? search.redirectTo : undefined,
  }),
  beforeLoad: ({ context, search }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: search.redirectTo ?? "/onboarding/organization" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { redirectTo } = Route.useSearch();

  return (
    <AuthLayout title="Create account" description="Start with email and password.">
      <SignUpForm redirectTo={redirectTo ?? "/onboarding/organization"} />
    </AuthLayout>
  );
}
