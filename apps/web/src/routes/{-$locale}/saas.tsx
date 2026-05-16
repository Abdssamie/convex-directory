import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/{-$locale}/saas")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
