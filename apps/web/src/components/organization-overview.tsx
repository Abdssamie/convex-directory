"use client";

import { Building2, MailPlus, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@convex-zen/ui/components/card";
import { Button } from "@convex-zen/ui/components/button";
import { Badge } from "@convex-zen/ui/components/badge";
import { LocalizedLink } from "@/components/localized-link";

import { useOrganizationState } from "@/lib/organization";

export function OrganizationOverview() {
  const { activeOrganization, organizations, isLoading } = useOrganizationState();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>Loading workspace details.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeOrganization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No active organization</CardTitle>
          <CardDescription>
            Create your first workspace or switch to one you already joined.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <LocalizedLink to="/settings/organization">Create organization</LocalizedLink>
          </Button>
          {organizations.length ? (
            <Button asChild variant="outline">
              <LocalizedLink to="/settings/organization">Choose existing workspace</LocalizedLink>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              {activeOrganization.name}
            </CardTitle>
            <CardDescription>
              Active workspace for dashboard, members, and invitations.
            </CardDescription>
          </div>
          <Badge>{activeOrganization.slug}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-sm">Organizations</p>
            <p className="text-xl font-semibold">{organizations.length}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-sm">Members</p>
            <p className="text-xl font-semibold">{activeOrganization.members.length}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-sm">Pending invites</p>
            <p className="text-xl font-semibold">
              {
                activeOrganization.invitations.filter(
                  (invitation) => invitation.status === "pending",
                ).length
              }
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <LocalizedLink to="/settings/organization">
              <Users className="mr-2 size-4" />
              Manage members
            </LocalizedLink>
          </Button>
          <Button asChild>
            <LocalizedLink to="/settings/organization">
              <MailPlus className="mr-2 size-4" />
              Invite people
            </LocalizedLink>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
