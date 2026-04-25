import { createFileRoute } from "@tanstack/react-router";
import { ProductTypePage } from "@/app/directory/page";

export const Route = createFileRoute("/{-$locale}/tools")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProductTypePage productType="tool" />;
}
