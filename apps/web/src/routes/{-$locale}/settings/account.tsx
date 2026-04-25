import { createFileRoute } from "@tanstack/react-router";
import { BaseLayout } from "@/components/layouts/base-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@convex-directory/ui/components/card";
import { Badge } from "@convex-directory/ui/components/badge";
import { LocalizedLink } from "@/components/localized-link";
import { useQuery } from "convex/react";
import { api } from "@convex-directory/backend/convex/_generated/api";
import { useIntlayer } from "react-intlayer";

export const Route = createFileRoute("/{-$locale}/settings/account")({
  component: AccountPage,
});

function AccountPage() {
  const user = useQuery(api.auth.getCurrentUser);
  const content = useIntlayer("account-settings");

  return (
    <BaseLayout title={content.title.value} description={content.description.value}>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>{content.profile.title.value}</CardTitle>
            <CardDescription>{content.profile.description.value}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-1">
              <p className="text-sm text-muted-foreground">{content.profile.name.value}</p>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm text-muted-foreground">{content.profile.email.value}</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm text-muted-foreground">{content.profile.verification.value}</p>
              <div>
                {user?.emailVerified ? (
                  <Badge variant="default" className="rounded-lg">
                    {content.profile.verified.value}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="rounded-lg">
                    {content.profile.notVerified.value}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm text-muted-foreground">{content.profile.userId.value}</p>
              <p className="font-mono text-xs text-muted-foreground">{user?._id}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-destructive/20">
          <CardHeader>
            <CardTitle>{content.security.title.value}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{content.security.resetPassword.value}</p>
              </div>
              <LocalizedLink
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                {content.security.resetPassword.value}
              </LocalizedLink>
            </div>
            <div className="flex items-center justify-between py-2 border-t">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{content.security.openBilling.value}</p>
              </div>
              <LocalizedLink
                to="/settings/billing"
                className="text-sm font-medium text-primary hover:underline"
              >
                {content.security.openBilling.value}
              </LocalizedLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
}
