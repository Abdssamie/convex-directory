import { createFileRoute, redirect } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";

import SignUpForm from "@/components/sign-up-form";
import AuthLayout from "@/components/auth-layout";

export const Route = createFileRoute("/{-$locale}/sign-up")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirectTo: search.redirectTo as string | undefined,
  }),
  beforeLoad: ({ context, params }) => {
    if (context.isAuthenticated) {
      throw redirect({
        to: "/{-$locale}/dashboard",
        params: { locale: params.locale ?? "" },
      });
    }
  },
  component: SignUpPage,
});

function SignUpPage() {
  const { redirectTo } = Route.useSearch();
  const content = useIntlayer("sign-up-form");

  return (
    <AuthLayout title={content.title.value} description={content.description.value}>
      <SignUpForm redirectTo={redirectTo ?? "/dashboard"} />
    </AuthLayout>
  );
}
