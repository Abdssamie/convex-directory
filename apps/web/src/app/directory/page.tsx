import { useQuery } from "convex/react";
import { api } from "@convex-directory/backend/convex/_generated/api";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@convex-directory/ui/components/card";
import { Button } from "@convex-directory/ui/components/button";
import { Input } from "@convex-directory/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@convex-directory/ui/components/tabs";
import { Badge } from "@convex-directory/ui/components/badge";
import { ExternalLink, Search } from "lucide-react";
import { BaseLayout } from "@/components/layouts/base-layout";

export function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string>("all");

  const projects = useQuery(api.projects.getProjects, {
    status: "approved",
    type: activeType === "all" ? undefined : (activeType as any),
  });

  const filteredProjects = projects?.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <BaseLayout
      title="Convex Directory"
      description="Discover what people are building with Convex."
    >
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl font-bold tracking-tight">Convex Directory</h1>
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
          {filteredProjects?.map((project) => (
            <Card
              key={project._id}
              className="rounded-2xl border-2 hover:border-primary/50 transition-colors"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-semibold">{project.title}</CardTitle>
                  <Badge variant="secondary" className="rounded-lg capitalize">
                    {project.type}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted rounded-xl flex items-center justify-center">
                    <span className="text-muted-foreground">No Preview</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="rounded-xl" asChild>
                  <a href={project.url} target="_blank" rel="noopener noreferrer">
                    Visit <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                {!project.ownerId && (
                  <Button variant="ghost" size="sm" className="rounded-xl">
                    Claim
                  </Button>
                )}
              </CardFooter>
            </Card>
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
