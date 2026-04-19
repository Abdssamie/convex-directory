"use client";

import { Building2, MailPlus, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@convex-directory/ui/components/card";
import { Button } from "@convex-directory/ui/components/button";
import { Badge } from "@convex-directory/ui/components/badge";
import { LocalizedLink } from "@/components/localized-link";

import { useOrganizationState } from "@/lib/organization";
import { useIntlayer } from "react-intlayer";

export function OrganizationOverview() {
  const { activeOrganization, organizations, isLoading } = useOrganizationState();
  const content = useIntlayer("dashboard");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{content.organizationOverview.loadingTitle}</CardTitle>
          <CardDescription>{content.organizationOverview.loadingDesc}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeOrganization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{content.organizationOverview.noActiveTitle}</CardTitle>
          <CardDescription>{content.organizationOverview.noActiveDesc}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <LocalizedLink to="/settings/organization">
              {content.organizationOverview.createOrg}
            </LocalizedLink>
          </Button>
          {organizations.length ? (
            <Button asChild variant="outline">
              <LocalizedLink to="/settings/organization">
                {content.organizationOverview.chooseExisting}
              </LocalizedLink>
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
            <CardDescription>{content.organizationOverview.activeWorkspaceDesc}</CardDescription>
          </div>
          <Badge>{activeOrganization.slug}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-sm">
              {content.organizationOverview.organizationsLabel}
            </p>
            <p className="text-xl font-semibold">{organizations.length}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-sm">
              {content.organizationOverview.membersLabel}
            </p>
            <p className="text-xl font-semibold">{activeOrganization.members.length}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-sm">
              {content.organizationOverview.pendingInvitesLabel}
            </p>
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
              {content.organizationOverview.manageMembers}
            </LocalizedLink>
          </Button>
          <Button asChild>
            <LocalizedLink to="/settings/organization">
              <MailPlus className="mr-2 size-4" />
              {content.organizationOverview.invitePeople}
            </LocalizedLink>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
