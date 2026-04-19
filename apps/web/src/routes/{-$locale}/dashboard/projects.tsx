import { createFileRoute } from "@tanstack/react-router";
import { SubmitProjectForm } from "@/app/dashboard/components/submit-project-form";
import { BaseLayout } from "@/components/layouts/base-layout";

export const Route = createFileRoute("/{-$locale}/dashboard/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <BaseLayout title="Dashboard" description="Submit and manage your Convex projects.">
      <div className="container mx-auto px-4 py-8">
        <SubmitProjectForm />
      </div>
    </BaseLayout>
  );
}
