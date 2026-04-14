import { Button } from "@convex-zen/ui/components/button";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { toast } from "sonner";

import AuthLayout from "@/components/auth-layout";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/invite/$invitationId")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { invitationId } = Route.useParams();

  return (
    <AuthLayout
      title="Organization invitation"
      description="Accept the invitation after signing in with the invited account."
    >
      <div className="space-y-4 text-sm text-muted-foreground">
        <Authenticated>
          <Button
            onClick={() => {
              authClient.organization.acceptInvitation(
                {
                  invitationId,
                },
                {
                  onSuccess: () => {
                    toast.success("Invitation accepted");
                    navigate({ to: "/dashboard" });
                  },
                  onError: (error) => {
                    toast.error(error.error.message || error.error.statusText);
                  },
                },
              );
            }}
          >
            Accept invitation
          </Button>
        </Authenticated>

        <Unauthenticated>
          <p>
            Sign in or create an account with the invited email, then return to accept the
            invitation.
          </p>
          <div className="flex gap-4">
            <Link to="/sign-in" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
            <Link to="/sign-up" className="text-primary underline-offset-4 hover:underline">
              Create account
            </Link>
          </div>
        </Unauthenticated>
      </div>
    </AuthLayout>
  );
}
