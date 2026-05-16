"use client";

import { useQuery } from "convex/react";
import { api } from "@convex-directory/backend/convex/_generated/api";
import { Badge } from "@convex-directory/ui/components/badge";
import type { FunctionReturnType } from "convex/server";
import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import { LocalizedLink } from "@/components/localized-link";
import { ProjectBrandmark } from "@/components/project-brandmark";
import { ProjectScreenshot } from "@/components/project-screenshot";
import { useLandingContent } from "./content";

type DirectoryProject = FunctionReturnType<typeof api.projects.getProjects>[number];

function formatCategoryName(slug: string) {
  return (
    PROJECT_CATEGORIES.find((category) => category.slug === slug)?.name ??
    slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function getProjectCardTag(project: DirectoryProject) {
  if (project.type === "saas" && project.categorySlug && project.categorySlug !== "uncategorized") {
    return formatCategoryName(project.categorySlug);
  }

  switch (project.type) {
    case "open-source":
      return "Open source";
    case "component":
      return "Components";
    case "tool":
      return "Tools";
    default:
      return "SaaS";
  }
}

export function DirectoryGrid() {
  const projects = useQuery(api.projects.getProjects, {});
  const content = useLandingContent();

  const saasProjects = projects?.filter((p: DirectoryProject) => p.type === "saas") || [];
  const categoriesBySlug = new Map<string, { name: string; slug: string }>(
    PROJECT_CATEGORIES.map((category) => [category.slug, category]),
  );
  const categoryStats = projects
    ? Array.from(
        projects
          .filter((project) => project.type === "saas")
          .reduce((acc, project) => {
            const next = acc.get(project.categorySlug) ?? { slug: project.categorySlug, count: 0 };
            next.count += 1;
            acc.set(project.categorySlug, next);
            return acc;
          }, new Map<string, { slug: string; count: number }>()),
      )
        .map(([, stat]) => ({
          ...stat,
          name:
            categoriesBySlug.get(stat.slug)?.name ??
            stat.slug
              .split("-")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" "),
        }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    : [];

  return (
    <section id="directory" className="pt-10 pb-24 bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Featured SaaS Products */}
        <div className="mb-24">
          <div className="flex items-baseline gap-4 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {content.directory.featuredTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {saasProjects.slice(0, 8).map((project: DirectoryProject, index: number) => (
              <LocalizedLink
                key={project._id}
                to="/products/$projectId"
                params={{ projectId: project._id }}
                className="group flex flex-col rounded-xl bg-transparent transition-all overflow-hidden relative cursor-pointer"
              >
                <div className="relative aspect-[1.5/1] w-full overflow-hidden rounded-xl border border-border bg-card group-hover:border-primary/40 transition-colors">
                  <div className="absolute top-3 left-3 z-10 bg-background/90 backdrop-blur-md text-foreground text-xs font-bold px-2.5 py-1 rounded-md border border-border">
                    #{index + 1}
                  </div>
                  <ProjectScreenshot
                    key={project.screenshotUrl ?? project._id}
                    title={project.title}
                    screenshotUrl={project.screenshotUrl}
                    className="relative h-full w-full"
                    imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 left-3 z-10 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-background shadow-sm">
                    <ProjectBrandmark
                      key={`${project.productLogoUrl ?? ""}:${project.screenshotUrl ?? ""}`}
                      title={project.title}
                      productLogoUrl={project.productLogoUrl}
                      screenshotUrl={project.screenshotUrl}
                      className="h-full w-full object-cover"
                      initialsClassName="text-xs font-bold text-foreground"
                    />
                  </div>
                </div>

                <div className="pt-4 pb-2 flex-1 flex flex-col">
                  <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-2 mt-auto">
                    <Badge
                      variant="secondary"
                      className="rounded-full text-xs px-3 font-normal capitalize"
                    >
                      {getProjectCardTag(project)}
                    </Badge>
                  </div>
                </div>
              </LocalizedLink>
            ))}
            {projects === undefined && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                {content.directory.loadingProducts}
              </div>
            )}
            {projects !== undefined && saasProjects.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                {content.directory.noProducts}
              </div>
            )}
          </div>
        </div>

        {/* Product Categories */}
        <div>
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              {content.directory.categoriesTitle}
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl">
              {content.directory.categoriesDescription}
            </p>
          </div>

          <h3 className="text-xl font-semibold mb-6">{content.directory.popularTitle}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects === undefined ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                {content.directory.loadingCategories}
              </div>
            ) : categoryStats.length > 0 ? (
              categoryStats.map((category) => (
                <LocalizedLink
                  key={category.slug}
                  to="/saas/$categorySlug"
                  params={{ categorySlug: category.slug }}
                  className="group bg-card border border-border hover:border-primary/40 hover:bg-accent/30 rounded-xl p-6 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h4>
                    <span className="text-sm text-muted-foreground">
                      {category.count} {content.directory.productsCount}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {content.directory.categoryDescriptions[
                      category.slug as keyof typeof content.directory.categoryDescriptions
                    ] ?? content.directory.categoryDescriptions.fallback}
                  </p>
                </LocalizedLink>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                {content.directory.noProducts}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
