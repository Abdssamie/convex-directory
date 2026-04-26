import { createFileRoute, redirect } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";

import AuthLayout from "@/components/auth-layout";
import SignInForm from "@/components/sign-in-form";

export const Route = createFileRoute("/{-$locale}/sign-in")({
  validateSearch: (search: Record<string, unknown>): { redirectTo?: string } => ({
    redirectTo: typeof search.redirectTo === "string" ? search.redirectTo : undefined,
  }),
  beforeLoad: ({ context, search, params }) => {
    if (context.isAuthenticated) {
      throw redirect({
        to: "/{-$locale}/dashboard",
        params: { locale: params.locale ?? "" },
        search: search.redirectTo ? { redirectTo: search.redirectTo } : undefined,
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { redirectTo } = Route.useSearch();
  const content = useIntlayer("sign-in-form");

  return (
    <AuthLayout title={content.title.value} description={content.description?.value}>
      <SignInForm redirectTo={redirectTo ?? "/dashboard"} />
    </AuthLayout>
  );
}
