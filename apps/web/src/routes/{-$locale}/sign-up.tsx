import { createFileRoute, redirect } from "@tanstack/react-router";
import SignUpForm from "@/components/sign-up-form";

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

  return (
    <div className="flex min-h-svh items-center justify-center">
      <SignUpForm redirectTo={redirectTo ?? "/dashboard"} />
    </div>
  );
}
