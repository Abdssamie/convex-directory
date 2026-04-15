import { Badge } from "@convex-zen/ui/components/badge";
import { Button } from "@convex-zen/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@convex-zen/ui/components/card";
import { Input } from "@convex-zen/ui/components/input";
import { Label } from "@convex-zen/ui/components/label";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import AuthLayout from "@/components/auth-layout";
import { authClient } from "@/lib/auth-client";
import { slugifyOrganizationName, useOrganizationState } from "@/lib/organization";

export const Route = createFileRoute("/onboarding/organization")({
  beforeLoad: ({ context, location }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        to: "/sign-in",
        search: { redirectTo: location.href },
      });
    }
  },
  component: RouteComponent,
});

function getAuthErrorMessage(error: { error: { message?: string; statusText?: string } }) {
  return error.error.message || error.error.statusText || "Organization action failed";
}

type InvitationSummary = {
  id: string;
  email: string;
  role: string;
  status: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
};

function RouteComponent() {
  const navigate = useNavigate();
  const { organizations, isLoading } = useOrganizationState();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState("");
  const [invitations, setInvitations] = useState<InvitationSummary[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadInvitations() {
      const result = await authClient.organization.listUserInvitations({ query: {} });

      if (cancelled) {
        return;
      }

      if (!result.error && result.data) {
        setInvitations(
          (result.data as unknown as InvitationSummary[]).filter((inv) => inv.status === "pending"),
        );
      }
      setInvitationsLoading(false);
    }

    void loadInvitations();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !invitationsLoading && (organizations.length > 0 || invitations.length > 0)) {
      navigate({ to: "/dashboard" });
    }
  }, [isLoading, invitationsLoading, navigate, organizations.length, invitations.length]);

  return (
    <AuthLayout
      title="Create your workspace"
      description="One step left. Create an organization to unlock dashboard, members, and invitations."
    >
      <div className="space-y-6">
        {invitations.length > 0 && !invitationsLoading ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending invitations</CardTitle>
              <CardDescription>
                You have invitations waiting. Accept them to join those workspaces.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{invitation.organizationName}</span>
                      <Badge variant="outline">{invitation.organizationSlug}</Badge>
                      <Badge variant="secondary">{invitation.role}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Invited as {invitation.role} · {invitation.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" asChild>
                      <Link to="/invite/$invitationId" params={{ invitationId: invitation.id }}>
                        Accept
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Organization setup</CardTitle>
            <CardDescription>
              Better Auth will make you owner. Future invites go through Brevo email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="onboarding-org-name">Organization name</Label>
              <Input
                id="onboarding-org-name"
                value={name}
                onChange={(event) => {
                  const nextName = event.target.value;
                  setName(nextName);
                  if (!slug || slug === slugifyOrganizationName(name)) {
                    setSlug(slugifyOrganizationName(nextName));
                  }
                }}
                placeholder="Acme Labs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboarding-org-slug">Slug</Label>
              <Input
                id="onboarding-org-slug"
                value={slug}
                onChange={(event) => setSlug(slugifyOrganizationName(event.target.value))}
                placeholder="acme-labs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboarding-org-logo">Logo URL</Label>
              <Input
                id="onboarding-org-logo"
                value={logo}
                onChange={(event) => setLogo(event.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={isLoading || invitationsLoading || !name.trim() || !slug.trim()}
                onClick={() => {
                  authClient.organization.create(
                    {
                      name: name.trim(),
                      slug: slug.trim(),
                      logo: logo.trim() || undefined,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Workspace created");
                        navigate({ to: "/dashboard" });
                      },
                      onError: (error) => {
                        toast.error(getAuthErrorMessage(error));
                      },
                    },
                  );
                }}
              >
                Create workspace
              </Button>
              <Button variant="outline" disabled={isLoading || invitationsLoading} asChild>
                <Link to="/dashboard">I will do this later</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
