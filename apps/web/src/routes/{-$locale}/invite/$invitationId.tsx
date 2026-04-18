import { Badge } from "@convex-zen/ui/components/badge";
import { Button } from "@convex-zen/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@convex-zen/ui/components/card";
import { LocalizedLink } from "@/components/localized-link";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import {  createFileRoute } from "@tanstack/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import AuthLayout from "@/components/auth-layout";
import { authClient } from "@/lib/auth-client";

type InvitationDetails = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date | string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  inviterEmail: string;
};

export const Route = createFileRoute("/{-$locale}/invite/$invitationId")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useLocalizedNavigate();
  const { invitationId } = Route.useParams();
  const session = authClient.useSession();
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInvitation() {
      setIsLoading(true);
      setError(null);

      const result = await authClient.organization.getInvitation({ query: { id: invitationId } });

      if (cancelled) {
        return;
      }

      if (result.error) {
        setError(result.error.message || result.error.statusText || "Failed to load invitation");
        setInvitation(null);
        setIsLoading(false);
        return;
      }

      setInvitation((result.data ?? null) as InvitationDetails | null);
      setIsLoading(false);
    }

    void loadInvitation();

    return () => {
      cancelled = true;
    };
  }, [invitationId]);

  const invitationExpiresAt = invitation ? new Date(invitation.expiresAt).toLocaleString() : null;
  const signedInEmail = session.data?.user.email?.toLowerCase();
  const invitedEmail = invitation?.email.toLowerCase();
  const emailMatches = signedInEmail && invitedEmail ? signedInEmail === invitedEmail : true;

  return (
    <AuthLayout
      title="Organization invitation"
      description="Accept the invitation after signing in with the invited account."
    >
      <div className="space-y-4 text-sm text-muted-foreground">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invitation details</CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading organization details."
                : invitation
                  ? `Join ${invitation.organizationName} as ${invitation.role}.`
                  : "Invitation details unavailable."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invitation ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge>{invitation.organizationName}</Badge>
                  <Badge variant="outline">{invitation.organizationSlug}</Badge>
                  <Badge variant="secondary">{invitation.role}</Badge>
                  <Badge variant={invitation.status === "pending" ? "default" : "secondary"}>
                    {invitation.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    Invited email: <span className="text-foreground">{invitation.email}</span>
                  </p>
                  <p>
                    Invited by: <span className="text-foreground">{invitation.inviterEmail}</span>
                  </p>
                  <p>
                    Expires: <span className="text-foreground">{invitationExpiresAt}</span>
                  </p>
                </div>
              </>
            ) : error ? (
              <p>{error}</p>
            ) : null}
          </CardContent>
        </Card>

        <Authenticated>
          <div className="space-y-3">
            <p>
              Signed in as <span className="text-foreground">{session.data?.user.email}</span>.
            </p>
            {!emailMatches ? (
              <p className="text-destructive">
                This invite targets {invitation?.email}. Sign in with that address to accept.
              </p>
            ) : null}
            <Button
              disabled={
                isLoading || !invitation || invitation.status !== "pending" || !emailMatches
              }
              onClick={() => {
                authClient.organization.acceptInvitation(
                  {
                    invitationId,
                  },
                  {
                    onSuccess: async (result) => {
                      const organizationId =
                        result.data?.member.organizationId ??
                        result.data?.invitation.organizationId;

                      if (organizationId) {
                        const setActiveResult = await authClient.organization.setActive({
                          organizationId,
                        });

                        if (setActiveResult.error) {
                          toast.error(
                            setActiveResult.error.message ||
                              setActiveResult.error.statusText ||
                              "Invitation accepted, but failed to switch workspace",
                          );
                          navigate({ to: "/settings/organization" });
                          return;
                        }
                      }

                      toast.success("Invitation accepted. Workspace is now active.");
                      navigate({ to: "/dashboard" });
                    },
                    onError: (error) => {
                      toast.error(error.error.message || error.error.statusText);
                    },
                  },
                );
              }}
            >
              Accept invitation and switch workspace
            </Button>
          </div>
        </Authenticated>

        <Unauthenticated>
          <p>
            Sign in or create an account with the invited email, then return to accept the
            invitation.
          </p>
          <div className="flex gap-4">
            <LocalizedLink
              to="/sign-in"
              search={{ redirectTo: `/invite/${invitationId}` }}
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </LocalizedLink>
            <LocalizedLink
              to="/sign-up"
              search={{ redirectTo: `/invite/${invitationId}` }}
              className="text-primary underline-offset-4 hover:underline"
            >
              Create account
            </LocalizedLink>
          </div>
        </Unauthenticated>
      </div>
    </AuthLayout>
  );
}
