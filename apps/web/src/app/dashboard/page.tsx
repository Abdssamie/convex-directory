import { BaseLayout } from "@/components/layouts/base-layout";
import { useIntlayer } from "react-intlayer";

export default function Page() {
  const content = useIntlayer("dashboard");

  return (
    <BaseLayout title={content.page.title.value} description={content.page.description.value}>
      <div className="@container/main px-4 lg:px-6 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">{content.welcome.title.value}</h2>
          <p className="text-muted-foreground">{content.welcome.description.value}</p>
        </div>
      </div>
    </BaseLayout>
  );
}
