import { createFileRoute, redirect } from "@tanstack/react-router";

import AuthLayout from "@/components/auth-layout";
import MagicLinkForm from "@/components/magic-link-form";

export const Route = createFileRoute("/{-$locale}/magic-link")({
  beforeLoad: ({ context, params }) => {
    if (context.isAuthenticated) {
      throw redirect({ 
        to: "/{-$locale}/dashboard",
        params: { locale: params.locale ?? "" }
      });
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
