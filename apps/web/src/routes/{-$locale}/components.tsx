import { createFileRoute } from "@tanstack/react-router";
import { ProductTypePage } from "@/app/directory/page";

export const Route = createFileRoute("/{-$locale}/components")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProductTypePage productType="component" />;
}
