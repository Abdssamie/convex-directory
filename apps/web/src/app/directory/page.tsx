import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex-hub/backend/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { Badge } from "@convex-hub/ui/components/badge";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { LocalizedLink } from "@/components/localized-link";
import { ProjectBrandmark } from "@/components/project-brandmark";
import { ProjectScreenshot } from "@/components/project-screenshot";
import { useLandingContent } from "@/components/landing/content";
import { formatProjectCategoryName } from "@/lib/project-categories";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

type DirectoryProject = FunctionReturnType<typeof api.projects.getProjects>[number];
type ProductType = DirectoryProject["type"];

const PRODUCT_TYPE_META: Record<
  ProductType,
  {
    label: string;
    route: "/saas" | "/tools" | "/components" | "/open-source";
    description: string;
  }
> = {
  saas: {
    label: "SaaS",
    route: "/saas",
    description: "Browse software products shipped as full SaaS experiences.",
  },
  tool: {
    label: "Tools",
    route: "/tools",
    description: "Browse focused utilities, dev tools, and workflow boosters.",
  },
  component: {
    label: "Components",
    route: "/components",
    description: "Browse reusable UI building blocks and interface kits.",
  },
  "open-source": {
    label: "Open source",
    route: "/open-source",
    description: "Browse open-source projects built and shared in public.",
  },
};

function getProjectCardTag(project: DirectoryProject) {
  if (project.type === "saas" && project.categorySlugs[0]) {
    return formatProjectCategoryName(project.categorySlugs[0]);
  }

  return PRODUCT_TYPE_META[project.type].label;
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans">
      <LandingNavbar />
      <main className="pb-24">{children}</main>
      <LandingFooter />
    </div>
  );
}

function DirectoryBreadcrumbs({
  items,
}: {
  items: Array<
    | {
        kind: "link";
        label: string;
        to:
          | "/"
          | "/directory"
          | "/saas"
          | "/tools"
          | "/components"
          | "/open-source"
          | "/saas/$categorySlug";
        params?: { categorySlug: string };
      }
    | { kind: "page"; label: string }
  >;
}) {
  return (
    <Breadcrumb className="mb-8">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <LocalizedLink to="/" className="flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" />
              Home
            </LocalizedLink>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="contents">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.kind === "link" ? (
                <BreadcrumbLink asChild>
                  {"params" in item && item.params ? (
                    <LocalizedLink to={item.to} params={item.params}>
                      {item.label}
                    </LocalizedLink>
                  ) : (
                    <LocalizedLink to={item.to}>{item.label}</LocalizedLink>
                  )}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="font-medium">{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function DirectoryCards({ projects }: { projects: DirectoryProject[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {projects.map((project, index) => (
        <LocalizedLink
          key={project._id}
          to="/products/$projectId"
          params={{ projectId: project._id }}
          className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl bg-transparent transition-all"
        >
          <div className="relative aspect-[1.5/1] w-full overflow-hidden rounded-xl border border-border bg-card transition-colors group-hover:border-primary/40">
            <div className="absolute left-3 top-3 z-10 rounded-md border border-border bg-background/90 px-2.5 py-1 text-xs font-bold text-foreground backdrop-blur-md">
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

          <div className="flex flex-1 flex-col pt-4 pb-2">
            <h3 className="mb-1 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
              {project.title}
            </h3>
            <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
              {project.description}
            </p>

            <div className="mt-auto flex items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full px-3 text-xs font-normal capitalize"
              >
                {getProjectCardTag(project)}
              </Badge>
              {project.ownerId && (
                <Badge variant="outline" className="rounded-full px-3 text-xs font-normal">
                  Verified
                </Badge>
              )}
              {project.staffPick && (
                <Badge className="rounded-full px-3 text-xs font-normal">Staff pick</Badge>
              )}
            </div>
          </div>
        </LocalizedLink>
      ))}
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/40 px-8 py-16 text-center">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    </div>
  );
}

function TypeLinksSection({ projects }: { projects: DirectoryProject[] }) {
  const typeCounts = useMemo(
    () =>
      projects.reduce(
        (acc, project) => {
          acc[project.type] += 1;
          return acc;
        },
        { saas: 0, tool: 0, component: 0, "open-source": 0 },
      ),
    [projects],
  );

  return (
    <section className="border-t border-border/70 bg-card/20">
      <div className="container mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Collections
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(
            Object.entries(PRODUCT_TYPE_META) as Array<
              [ProductType, (typeof PRODUCT_TYPE_META)[ProductType]]
            >
          ).map(([type, meta]) => (
            <LocalizedLink
              key={type}
              to={meta.route}
              className="group rounded-2xl border border-border bg-background p-5 transition-all hover:border-primary/40 hover:bg-accent/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                    {meta.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {typeCounts[type]} published product{typeCounts[type] === 1 ? "" : "s"}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{meta.description}</p>
                </div>
              </div>
            </LocalizedLink>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryLinksSection({ projects }: { projects: DirectoryProject[] }) {
  const categoryStats = useMemo(() => {
    return Array.from(
      projects.reduce((acc, project) => {
        if (project.type !== "saas") {
          return acc;
        }

        for (const categorySlug of project.categorySlugs) {
          const current = acc.get(categorySlug) ?? { slug: categorySlug, count: 0 };
          current.count += 1;
          acc.set(categorySlug, current);
        }
        return acc;
      }, new Map<string, { slug: string; count: number }>()),
    )
      .map(([, stat]) => ({
        ...stat,
        name: formatProjectCategoryName(stat.slug),
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [projects]);

  if (categoryStats.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border/70 bg-card/20">
      <div className="container mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            SaaS categories
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categoryStats.map((category) => (
            <LocalizedLink
              key={category.slug}
              to="/saas/$categorySlug"
              params={{ categorySlug: category.slug }}
              className="group rounded-2xl border border-border bg-background p-5 transition-all hover:border-primary/40 hover:bg-accent/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {category.count} published SaaS product{category.count === 1 ? "" : "s"}
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
                  View
                </Badge>
              </div>
            </LocalizedLink>
          ))}
        </div>
      </div>
    </section>
  );
}

function ListingSection({
  breadcrumbs,
  projects,
  loadingLabel,
  emptyTitle,
}: {
  breadcrumbs: React.ReactNode;
  projects: DirectoryProject[] | undefined;
  loadingLabel: string;
  emptyTitle: string;
}) {
  const [search, setSearch] = useState("");
  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filteredProjects = query
      ? projects?.filter((project) =>
          `${project.title} ${project.description} ${project.categorySlugs.join(" ")}`
            .toLowerCase()
            .includes(query),
        )
      : projects;

    return filteredProjects
      ? [...filteredProjects].sort((a, b) => {
          const curationDelta = Number(b.featured ?? false) - Number(a.featured ?? false);
          if (curationDelta !== 0) return curationDelta;
          return b.createdAt - a.createdAt;
        })
      : undefined;
  }, [projects, search]);

  return (
    <section className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {breadcrumbs}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products, categories, descriptions..."
          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm sm:max-w-md"
        />
      </div>
      {projects === undefined && (
        <div className="rounded-3xl border border-dashed border-border bg-card/40 px-8 py-16 text-center text-muted-foreground">
          {loadingLabel}
        </div>
      )}
      {visibleProjects !== undefined && visibleProjects.length > 0 && (
        <DirectoryCards projects={visibleProjects} />
      )}
      {visibleProjects !== undefined && visibleProjects.length === 0 && (
        <EmptyState title={emptyTitle} />
      )}
    </section>
  );
}

export function DirectoryPage() {
  const content = useLandingContent();
  const projects = useQuery(api.projects.getProjects, {});
  const saasProjects = useMemo(
    () => (projects ? projects.filter((project) => project.type === "saas") : undefined),
    [projects],
  );

  return (
    <PageShell>
      <ListingSection
        breadcrumbs={<DirectoryBreadcrumbs items={[{ kind: "page", label: "Directory" }]} />}
        projects={projects}
        loadingLabel={content.directory.loadingProducts}
        emptyTitle="No published products found"
      />
      {projects && <TypeLinksSection projects={projects} />}
      {saasProjects && <CategoryLinksSection projects={saasProjects} />}
    </PageShell>
  );
}

export function ProductTypePage({ productType }: { productType: ProductType }) {
  const content = useLandingContent();
  const meta = PRODUCT_TYPE_META[productType];
  const projects = useQuery(api.projects.getProjects, { type: productType });

  return (
    <PageShell>
      <ListingSection
        breadcrumbs={
          <DirectoryBreadcrumbs
            items={[
              { kind: "link", label: "Directory", to: "/directory" },
              { kind: "page", label: meta.label },
            ]}
          />
        }
        projects={projects}
        loadingLabel={content.directory.loadingProducts}
        emptyTitle={`No ${meta.label.toLowerCase()} products found`}
      />
      {productType === "saas" && projects && <CategoryLinksSection projects={projects} />}
    </PageShell>
  );
}

export function CategoryDirectoryPage({ categorySlug }: { categorySlug: string }) {
  const content = useLandingContent();
  const categoryName = formatProjectCategoryName(categorySlug);
  const categoryProjects = useQuery(api.projects.getProjects, {
    type: "saas",
    categorySlug,
  });

  return (
    <PageShell>
      <ListingSection
        breadcrumbs={
          <DirectoryBreadcrumbs
            items={[
              { kind: "link", label: "Directory", to: "/directory" },
              { kind: "link", label: "SaaS", to: "/saas" },
              { kind: "page", label: categoryName },
            ]}
          />
        }
        projects={categoryProjects}
        loadingLabel={content.directory.loadingProducts}
        emptyTitle="No SaaS products found"
      />
    </PageShell>
  );
}
