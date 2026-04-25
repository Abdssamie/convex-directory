import { createFileRoute } from "@tanstack/react-router";
import { SubmitProjectForm } from "@/app/dashboard/components/submit-project-form";
import { BaseLayout } from "@/components/layouts/base-layout";
import { useIntlayer } from "react-intlayer";

export const Route = createFileRoute("/{-$locale}/dashboard/submit")({
  component: SubmitProjectPage,
});

function SubmitProjectPage() {
  const content = useIntlayer("submit-project-form");
  return (
    <BaseLayout
      title={content.title.value}
      description={content.fields.description.placeholder.value}
    >
      <div className="px-4 lg:px-6 py-8">
        <SubmitProjectForm />
      </div>
    </BaseLayout>
  );
}
