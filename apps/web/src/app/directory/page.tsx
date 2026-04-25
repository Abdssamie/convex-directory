import { useQuery } from "convex/react";
import { api } from "@convex-directory/backend/convex/_generated/api";
import { useState } from "react";
import type { FunctionReturnType } from "convex/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@convex-directory/ui/components/card";
import { Input } from "@convex-directory/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@convex-directory/ui/components/tabs";
import { Badge } from "@convex-directory/ui/components/badge";
import { Search, X } from "lucide-react";
import { Button } from "@convex-directory/ui/components/button";
import { BaseLayout } from "@/components/layouts/base-layout";
import { LocalizedLink } from "@/components/localized-link";
import { ProjectBrandmark } from "@/components/project-brandmark";
import { ProjectScreenshot } from "@/components/project-screenshot";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { PROJECT_CATEGORIES } from "@/lib/project-categories";

type DirectoryProject = FunctionReturnType<typeof api.projects.getProjects>[number];

export function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string>("all");
  const { category: categoryFilter } = useSearch({ strict: false }) as { category?: string };
  const navigate = useNavigate();

  const activeCategoryName = categoryFilter
    ? (PROJECT_CATEGORIES.find((c) => c.slug === categoryFilter)?.name ?? categoryFilter)
    : null;

  const projects = useQuery(api.projects.getProjects, {
    status: "approved",
    type: activeType === "all" ? undefined : (activeType as any),
  });

  const filteredProjects = projects?.filter(
    (p: DirectoryProject) =>
      (categoryFilter ? p.categorySlug === categoryFilter : true) &&
      (p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <BaseLayout
      title="Convex Directory"
      description="Discover what people are building with Convex."
    >
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight">Convex Directory</h1>
            {activeCategoryName && (
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 gap-1.5 text-sm font-normal"
              >
                {activeCategoryName}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-0.5 hover:bg-transparent hover:text-foreground"
                  onClick={() => navigate({ search: {} as any })}
                  aria-label="Clear category filter"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveType} className="w-full">
          <TabsList className="rounded-xl p-1">
            <TabsTrigger value="all" className="rounded-lg">
              All
            </TabsTrigger>
            <TabsTrigger value="saas" className="rounded-lg">
              SaaS
            </TabsTrigger>
            <TabsTrigger value="tool" className="rounded-lg">
              Tools
            </TabsTrigger>
            <TabsTrigger value="open-source" className="rounded-lg">
              Open Source
            </TabsTrigger>
            <TabsTrigger value="component" className="rounded-lg">
              Components
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects?.map((project: DirectoryProject) => (
            <LocalizedLink
              key={project._id}
              to="/products/$projectId"
              params={{ projectId: project._id }}
              className="block"
            >
              <Card className="rounded-2xl border-2 hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card">
                        <ProjectBrandmark
                          key={`${project.productLogoUrl ?? ""}:${project.screenshotUrl ?? ""}`}
                          title={project.title}
                          productLogoUrl={project.productLogoUrl}
                          screenshotUrl={project.screenshotUrl}
                          className="h-full w-full object-cover"
                          initialsClassName="text-xs font-semibold text-foreground"
                        />
                      </div>
                      <CardTitle className="min-w-0 text-xl font-semibold">
                        {project.title}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="rounded-lg capitalize">
                      {project.type}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProjectScreenshot
                    key={project.screenshotUrl ?? project._id}
                    title={project.title}
                    screenshotUrl={project.screenshotUrl}
                    className="relative h-48 w-full overflow-hidden rounded-xl"
                    placeholderClassName="flex h-full w-full items-center justify-center bg-muted"
                    fallbackLabelClassName="text-muted-foreground"
                    imgClassName="h-full w-full object-cover"
                  />
                </CardContent>
                {!project.ownerId && (
                  <CardFooter>
                    <LocalizedLink
                      to="/products/$projectId"
                      params={{ projectId: project._id }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Claim this listing
                    </LocalizedLink>
                  </CardFooter>
                )}
              </Card>
            </LocalizedLink>
          ))}
          {filteredProjects?.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No projects found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
}
