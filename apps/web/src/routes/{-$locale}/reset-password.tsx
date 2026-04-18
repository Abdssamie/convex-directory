import { LocalizedLink } from "@/components/localized-link";
import {  createFileRoute } from "@tanstack/react-router";

import AuthLayout from "@/components/auth-layout";
import ResetPasswordForm from "@/components/reset-password-form";

export const Route = createFileRoute("/{-$locale}/reset-password")({
  validateSearch: (search: Record<string, unknown>): { token?: string; error?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { token, error } = Route.useSearch();

  if (!token || error) {
    return (
      <AuthLayout
        title="Reset link unavailable"
        description="This reset link is missing or expired. Request a fresh one."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          {error ? <p>Reason: {error}</p> : null}
          <LocalizedLink to="/forgot-password" className="text-primary underline-offset-4 hover:underline">
            Request another reset link
          </LocalizedLink>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset password" description="Choose a new password for your account.">
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
