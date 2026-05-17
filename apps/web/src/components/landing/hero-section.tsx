"use client";

import { ArrowRight, Play, Star } from "lucide-react";
import { Button } from "@convex-hub/ui/components/button";
import { Badge } from "@convex-hub/ui/components/badge";
import { DotPattern } from "@/components/dot-pattern";
import { LocalizedLink } from "@/components/localized-link";
import { useLandingContent } from "./content";

export function HeroSection() {
  const content = useLandingContent();

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 pt-16 sm:pt-20 pb-16"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0">
        {/* Dot pattern overlay using reusable component */}
        <DotPattern className="opacity-100" size="md" fadeStyle="ellipse" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Announcement Badge */}
          <div className="mb-8 flex justify-center">
            <Badge variant="outline" className="px-4 py-2 border-foreground">
              <Star className="w-3 h-3 mr-2 fill-current" />
              {content.hero.badge}
              <ArrowRight className="w-3 h-3 ml-2" />
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {content.hero.titlePart1}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {content.hero.titleHighlight}
            </span>
            {content.hero.titlePart2}
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {content.hero.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="cursor-pointer">
              <LocalizedLink to="/directory">
                {content.hero.getStartedFree}
                <ArrowRight className="h-4 w-4" />
              </LocalizedLink>
            </Button>
            <Button variant="outline" size="lg" asChild className="cursor-pointer">
              <LocalizedLink to="/dashboard/submit">
                <Play className="h-4 w-4" />
                {content.hero.watchDemo}
              </LocalizedLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
