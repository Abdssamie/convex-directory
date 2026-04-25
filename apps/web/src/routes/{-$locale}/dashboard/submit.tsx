import { createFileRoute } from "@tanstack/react-router";
import { SubmitProjectForm } from "@/app/dashboard/components/submit-project-form";
import { BaseLayout } from "@/components/layouts/base-layout";

export const Route = createFileRoute("/{-$locale}/dashboard/submit")({
  component: SubmitProjectPage,
});

function SubmitProjectPage() {
  return (
    <BaseLayout title="Submit Project" description="Share your Convex project with the community.">
      <div className="px-4 lg:px-6 py-8">
        <SubmitProjectForm />
      </div>
    </BaseLayout>
  );
}
