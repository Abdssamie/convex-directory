import { BaseLayout } from "@/components/layouts/base-layout";
import { OrganizationOverview } from "@/components/organization-overview";

import { useIntlayer } from "react-intlayer";

export default function Page() {
  const content = useIntlayer("dashboard");

  return (
    <BaseLayout title={content.page.title.value} description={content.page.description.value}>
      <div className="@container/main px-4 lg:px-6 space-y-6">
        <OrganizationOverview />
      </div>
    </BaseLayout>
  );
}
