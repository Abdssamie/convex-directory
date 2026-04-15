import { createFileRoute, redirect } from "@tanstack/react-router";

import AuthLayout from "@/components/auth-layout";
import MagicLinkForm from "@/components/magic-link-form";

export const Route = createFileRoute("/magic-link")({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthLayout title="Magic link" description="Send a one-time sign-in link to your email.">
      <MagicLinkForm />
    </AuthLayout>
  );
}
