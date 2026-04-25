import { useMutation, useQuery } from "convex/react";
import { api } from "@convex-directory/backend/convex/_generated/api";
import type { Id } from "@convex-directory/backend/convex/_generated/dataModel";
import { BaseLayout } from "@/components/layouts/base-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@convex-directory/ui/components/card";
import { Button } from "@convex-directory/ui/components/button";
import { toast } from "sonner";
import { useIntlayer } from "react-intlayer";
import { FastProjectUploader } from "@/app/dashboard/components/fast-project-uploader";

export default function AdminDashboard() {
  const isAdmin = useQuery(api.projects.isAdminQuery);
  const pendingProjects = useQuery(api.projects.getProjects, { status: "pending" });
  const pendingClaims = useQuery(api.claims.getPendingClaims);
  const content = useIntlayer("dashboard");

  const approveProject = useMutation(api.projects.approveProject);
  const rejectProject = useMutation(api.projects.rejectProject);
  const approveClaim = useMutation(api.claims.approveClaim);
  const rejectClaim = useMutation(api.claims.rejectClaim);

  const handleApproveProject = async (id: Id<"projects">) => {
    try {
      await approveProject({ id });
      toast.success(content.admin.toast.projectApproved.value);
    } catch {
      toast.error(content.admin.toast.error.value);
    }
  };

  const handleRejectProject = async (id: Id<"projects">) => {
    try {
      await rejectProject({ id });
      toast.success(content.admin.toast.projectRejected.value);
    } catch {
      toast.error(content.admin.toast.error.value);
    }
  };

  const handleApproveClaim = async (claimId: Id<"claims">) => {
    try {
      await approveClaim({ claimId });
      toast.success(content.admin.toast.claimApproved.value);
    } catch {
      toast.error(content.admin.toast.error.value);
    }
  };

  const handleRejectClaim = async (claimId: Id<"claims">) => {
    try {
      await rejectClaim({ claimId });
      toast.success(content.admin.toast.claimRejected.value);
    } catch {
      toast.error(content.admin.toast.error.value);
    }
  };

  if (isAdmin === undefined) {
    return (
      <BaseLayout
        title={content.admin.title.value}
        description={content.admin.checkingAccess.value}
      >
        <div className="flex h-svh items-center justify-center">
          {content.admin.checkingAccess.value}
        </div>
      </BaseLayout>
    );
  }

  if (!isAdmin) {
    return (
      <BaseLayout title={content.admin.title.value} description={content.admin.description.value}>
        <div className="flex h-svh items-center justify-center">Unauthorized</div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={content.admin.title.value} description={content.admin.description.value}>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <FastProjectUploader />

        <section>
          <h2 className="text-2xl font-bold mb-4">{content.admin.projects.title.value}</h2>
          <div className="grid gap-4">
            {pendingProjects?.length === 0 && (
              <p className="text-muted-foreground">{content.admin.projects.noProjects.value}</p>
            )}
            {pendingProjects?.map((project) => (
              <Card key={project._id} className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>{project.url}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveProject(project._id)}
                      className="rounded-xl"
                    >
                      {content.admin.projects.approve.value}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectProject(project._id)}
                      className="rounded-xl"
                    >
                      {content.admin.projects.reject.value}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{content.admin.claims.title.value}</h2>
          <div className="grid gap-4">
            {pendingClaims?.length === 0 && (
              <p className="text-muted-foreground">{content.admin.claims.noClaims.value}</p>
            )}
            {pendingClaims?.map((c) => (
              <Card key={c._id} className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Claim for Project ID: {c.projectId}</CardTitle>
                    <p className="text-sm text-muted-foreground">User Doc ID: {c.userId}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApproveClaim(c._id)} className="rounded-xl">
                      {content.admin.claims.approve.value}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectClaim(c._id)}
                      className="rounded-xl"
                    >
                      {content.admin.claims.reject.value}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>
                    {content.admin.claims.reason.value}: {c.reason}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </BaseLayout>
  );
}
