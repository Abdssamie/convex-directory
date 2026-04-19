"use client";

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
import { Badge } from "@convex-directory/ui/components/badge";
import { Tabs, TabsList, TabsTrigger } from "@convex-directory/ui/components/tabs";
import { ExternalLink, ArrowRight } from "lucide-react";

export function DirectoryGrid() {
  const [activeType, setActiveType] = useState<string>("all");
  const projects = useQuery(api.projects.getProjects, {
    status: "approved",
    type: activeType === "all" ? undefined : (activeType as any),
  });

  return (
    <section id="directory" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Built with Convex</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the ecosystem of apps, tools, and components powered by the best backend.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <Tabs defaultValue="all" onValueChange={setActiveType} className="w-full max-w-2xl">
            <TabsList className="grid grid-cols-5 h-12 rounded-xl p-1 bg-muted/50">
              <TabsTrigger
                value="all"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="saas"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                SaaS
              </TabsTrigger>
              <TabsTrigger
                value="tool"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Tools
              </TabsTrigger>
              <TabsTrigger
                value="open-source"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                OSS
              </TabsTrigger>
              <TabsTrigger
                value="component"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                UI
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects?.map((project) => (
            <Card
              key={project._id}
              className="group relative rounded-2xl border-2 bg-card/50 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl overflow-hidden"
            >
              <CardHeader className="pb-0">
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant="outline"
                    className="rounded-lg border-primary/20 bg-primary/5 text-primary capitalize font-medium"
                  >
                    {project.type}
                  </Badge>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
                <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                  {project.title}
                </CardTitle>
                <CardDescription className="text-base line-clamp-2 min-h-[3rem] pt-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="aspect-video w-full overflow-hidden rounded-xl border-2 border-muted bg-muted/30">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                      <span className="text-primary/40 font-bold text-4xl">C</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  className="w-full rounded-xl font-semibold gap-2 transition-all hover:gap-3"
                  asChild
                >
                  <a href={project.url} target="_blank" rel="noreferrer">
                    Explore Project <ArrowRight size={16} />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
          {projects?.length === 0 && (
            <div className="col-span-full py-24 text-center">
              <p className="text-muted-foreground text-lg">
                No projects featured in this category yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
