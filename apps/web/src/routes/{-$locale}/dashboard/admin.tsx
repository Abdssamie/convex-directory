import { createFileRoute } from "@tanstack/react-router";
import AdminDashboard from "@/app/dashboard/admin/page";

export const Route = createFileRoute("/{-$locale}/dashboard/admin")({
  component: AdminDashboard,
});
