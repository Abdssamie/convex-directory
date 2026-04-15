import { createFileRoute, redirect } from "@tanstack/react-router";

import AuthLayout from "@/components/auth-layout";
import ForgotPasswordForm from "@/components/forgot-password-form";

export const Route = createFileRoute("/forgot-password")({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthLayout title="Forgot password" description="Enter your email and we'll send a reset link.">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
