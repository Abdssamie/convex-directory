import { createFileRoute } from "@tanstack/react-router";
import { DirectoryPage } from "@/app/directory/page";

export const Route = createFileRoute("/{-$locale}/directory")({
  component: DirectoryPage,
});
