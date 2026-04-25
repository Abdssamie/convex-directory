"use client";

import { useQuery } from "convex/react";
import { api } from "@convex-directory/backend/convex/_generated/api";
import { Badge } from "@convex-directory/ui/components/badge";
import { useIntlayer } from "react-intlayer";

export function DirectoryGrid() {
  const projects = useQuery(api.projects.getProjects, {
    status: "approved",
  });
  const categories = useQuery(api.projects.getCategories);
  const content = useIntlayer("landing");

  const saasProjects = projects?.filter((p) => p.type === "saas") || [];

  return (
    <section id="directory" className="py-24 bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Featured SaaS Products */}
        <div className="mb-24">
          <div className="flex items-baseline gap-4 mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {content.directory.featuredTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {saasProjects.slice(0, 8).map((project, index) => (
              <div
                key={project._id}
                className="group flex flex-col rounded-xl bg-transparent transition-all overflow-hidden relative cursor-pointer"
              >
                <div className="relative aspect-[1.5/1] w-full overflow-hidden rounded-xl border border-border bg-card group-hover:border-primary/40 transition-colors">
                  <div className="absolute top-3 left-3 z-10 bg-background/90 backdrop-blur-md text-foreground text-xs font-bold px-2.5 py-1 rounded-md border border-border">
                    #{index + 1}
                  </div>
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <span className="text-muted-foreground font-bold text-4xl">
                        {project.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* Avatar initials bubble */}
                  <div className="absolute -bottom-5 left-4 z-10 h-10 w-10 rounded-full border-4 border-background bg-primary shadow-md flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {project.title.substring(0, 2).toUpperCase()}
                  </div>
                </div>

                <div className="pt-6 pb-2 flex-1 flex flex-col">
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
                      {project.type}
                    </Badge>
                  </div>
                </div>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 z-20"
                >
                  <span className="sr-only">View {project.title}</span>
                </a>
              </div>
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
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              {content.directory.categoriesTitle}
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl">
              {content.directory.categoriesDescription}
            </p>
          </div>

          <h3 className="text-xl font-semibold mb-6">{content.directory.popularTitle}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories ? (
              categories.map((category) => (
                <div
                  key={category._id}
                  className="group bg-card border border-border hover:border-primary/40 hover:bg-accent/30 rounded-xl p-6 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h4>
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(Math.random() * 300) + 50} {content.directory.productsCount}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {content.directory.categoryDescriptions[
                      category.slug as keyof typeof content.directory.categoryDescriptions
                    ]?.value || content.directory.categoryDescriptions.fallback}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                {content.directory.loadingCategories}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
