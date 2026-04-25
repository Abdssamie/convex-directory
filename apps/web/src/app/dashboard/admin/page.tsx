import { useQuery, useMutation } from "convex/react";
import { api } from "@convex-directory/backend/convex/_generated/api";
import { BaseLayout } from "@/components/layouts/base-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@convex-directory/ui/components/card";
import { Button } from "@convex-directory/ui/components/button";
import { Badge } from "@convex-directory/ui/components/badge";
import { toast } from "sonner";
import type { Id } from "@convex-directory/backend/convex/_generated/dataModel";
import type { FunctionReturnType } from "convex/server";
import { FastProjectUploader } from "@/app/dashboard/components/fast-project-uploader";

type PendingProject = FunctionReturnType<typeof api.projects.getProjects>[number];
type PendingClaim = FunctionReturnType<typeof api.claims.getPendingClaims>[number];
type OwnershipProject = FunctionReturnType<
  typeof api.projects.getApprovedProjectsOwnershipStatus
>[number];

export default function AdminDashboard() {
  const isAdmin = useQuery(api.projects.isAdminQuery);
  const pendingProjects = useQuery(
    api.projects.getProjects,
    isAdmin ? { status: "pending" } : "skip",
  );
  const pendingClaims = useQuery(api.claims.getPendingClaims, isAdmin ? {} : "skip");
  const ownershipProjects = useQuery(
    api.projects.getApprovedProjectsOwnershipStatus,
    isAdmin ? {} : "skip",
  );

  const approveProject = useMutation(api.projects.approveProject);
  const rejectProject = useMutation(api.projects.rejectProject);
  const approveClaim = useMutation(api.claims.approveClaim);

  const handleApproveProject = async (id: Id<"projects">) => {
    try {
      await approveProject({ id });
      toast.success("Project approved");
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleApproveClaim = async (claimId: Id<"claims">) => {
    try {
      await approveClaim({ claimId });
      toast.success("Claim approved");
    } catch {
      toast.error("Failed to approve claim");
    }
  };

  if (isAdmin === undefined) {
    return (
      <BaseLayout title="Admin Review" description="Checking access.">
        <div className="container mx-auto px-4 py-12 text-muted-foreground">Loading access...</div>
      </BaseLayout>
    );
  }

  if (!isAdmin) {
    return (
      <BaseLayout title="Access denied" description="This admin page is private.">
        <div className="container mx-auto px-4 py-12">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Access denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This page is restricted to the configured admin account.
              </p>
            </CardContent>
          </Card>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title="Admin Review"
      description="Fast private publishing plus review queue for project submissions and claims."
    >
      <div className="container mx-auto px-4 py-12 space-y-12">
        <FastProjectUploader />

        <section>
          <h2 className="text-3xl font-bold mb-6">Pending Submissions</h2>
          <div className="grid gap-4">
            {pendingProjects?.map((p: PendingProject) => (
              <Card key={p._id} className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{p.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{p.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApproveProject(p._id)} className="rounded-xl">
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => rejectProject({ id: p._id })}
                      className="rounded-xl"
                    >
                      Reject
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{p.description}</p>
                </CardContent>
              </Card>
            ))}
            {pendingProjects?.length === 0 && (
              <p className="text-muted-foreground">No pending submissions.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Pending Claims</h2>
          <div className="grid gap-4">
            {pendingClaims?.map((c: PendingClaim) => (
              <Card key={c._id} className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Claim for Project ID: {c.projectId}</CardTitle>
                    <p className="text-sm text-muted-foreground">User Doc ID: {c.userId}</p>
                  </div>
                  <Button onClick={() => handleApproveClaim(c._id)} className="rounded-xl">
                    Approve Ownership
                  </Button>
                </CardHeader>
                <CardContent>
                  <p>Reason: {c.reason}</p>
                </CardContent>
              </Card>
            ))}
            {pendingClaims?.length === 0 && (
              <p className="text-muted-foreground">No pending claims.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Ownership Tracking</h2>
          <div className="grid gap-4">
            {ownershipProjects?.map((project: OwnershipProject) => (
              <Card key={project._id} className="rounded-2xl">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle>{project.title}</CardTitle>
                      <Badge
                        variant={
                          project.claimState === "claimed"
                            ? "default"
                            : project.claimState === "pending"
                              ? "secondary"
                              : "outline"
                        }
                        className="capitalize"
                      >
                        {project.claimState}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.url}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Pending claims: {project.pendingClaimsCount}</p>
                    <p>Approved claims: {project.approvedClaimsCount}</p>
                    <p>Rejected claims: {project.rejectedClaimsCount}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {project.claimState === "claimed"
                      ? "This project already has an owner."
                      : project.claimState === "pending"
                        ? "This project has claim requests waiting for review."
                        : "This project is approved but still unclaimed."}
                  </p>
                </CardContent>
              </Card>
            ))}
            {ownershipProjects?.length === 0 && (
              <p className="text-muted-foreground">No approved projects found.</p>
            )}
          </div>
        </section>
      </div>
    </BaseLayout>
  );
}
