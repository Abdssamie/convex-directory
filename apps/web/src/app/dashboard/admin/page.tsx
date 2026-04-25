import { useQuery, useMutation } from "convex/react";
import { api } from "@convex-directory/backend/convex/_generated/api";
import { BaseLayout } from "@/components/layouts/base-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@convex-directory/ui/components/card";
import { Button } from "@convex-directory/ui/components/button";
import { toast } from "sonner";
import type { Id } from "@convex-directory/backend/convex/_generated/dataModel";
import { FastProjectUploader } from "@/app/dashboard/components/fast-project-uploader";

export default function AdminDashboard() {
  const isAdmin = useQuery(api.projects.isAdminQuery);
  const pendingProjects = useQuery(
    api.projects.getProjects,
    isAdmin ? { status: "pending" } : "skip",
  );
  const pendingClaims = useQuery(api.claims.getPendingClaims, isAdmin ? {} : "skip");

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
            {pendingProjects?.map((p) => (
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
            {pendingClaims?.map((c) => (
              <Card key={c._id} className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Claim for Project ID: {c.projectId}</CardTitle>
                    <p className="text-sm text-muted-foreground">User ID: {c.userId}</p>
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
      </div>
    </BaseLayout>
  );
}
