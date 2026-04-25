import { BaseLayout } from "@/components/layouts/base-layout";
import { useIntlayer } from "react-intlayer";

export default function Page() {
  const content = useIntlayer("dashboard");

  return (
    <BaseLayout
      title={content.page.title.toString()}
      description={content.page.description.toString()}
    >
      <div className="@container/main px-4 lg:px-6 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">
            <content.welcome.title />
          </h2>
          <p className="text-muted-foreground">
            <content.welcome.description />
          </p>
        </div>
      </div>
    </BaseLayout>
  );
}
