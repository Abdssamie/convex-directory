import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DirectoryPage } from "@/app/directory/page";

const directorySearchSchema = z.object({
  category: z.string().optional(),
});

export const Route = createFileRoute("/{-$locale}/directory")({
  validateSearch: directorySearchSchema,
  component: DirectoryPage,
});
