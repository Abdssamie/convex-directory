import type { Id } from "@convex-hub/backend/convex/_generated/dataModel";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ProductPage } from "@/app/directory/product-page";

const projectIdPattern = /^[a-z0-9]+$/;

export const Route = createFileRoute("/{-$locale}/products/$projectId")({
  beforeLoad: ({ params }) => {
    if (!projectIdPattern.test(params.projectId)) {
      throw redirect({
        to: "/{-$locale}/404",
        params: { locale: params.locale ?? "en" },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  return <ProductPage projectId={projectId as Id<"projects">} />;
}
