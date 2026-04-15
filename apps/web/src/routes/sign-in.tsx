import { createFileRoute, redirect } from "@tanstack/react-router";

import AuthLayout from "@/components/auth-layout";
import SignInForm from "@/components/sign-in-form";

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search: Record<string, unknown>): { redirectTo?: string } => ({
    redirectTo: typeof search.redirectTo === "string" ? search.redirectTo : undefined,
  }),
  beforeLoad: ({ context, search }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: search.redirectTo ?? "/dashboard" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { redirectTo } = Route.useSearch();

  return (
    <AuthLayout title="Sign in" description="Use your password to access your account.">
      <SignInForm redirectTo={redirectTo ?? "/dashboard"} />
    </AuthLayout>
  );
}
