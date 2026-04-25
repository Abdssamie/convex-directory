import { createFileRoute } from "@tanstack/react-router";
import { CategoryDirectoryPage } from "@/app/directory/page";

export const Route = createFileRoute("/{-$locale}/saas/$categorySlug")({
  component: RouteComponent,
});

function RouteComponent() {
  const { categorySlug } = Route.useParams();
  return <CategoryDirectoryPage categorySlug={categorySlug} />;
}
