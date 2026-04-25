import { useSeoMeta } from "@unhead/react";
import { LandingNavbar } from "@/components/landing/navbar";
import { DirectoryGrid } from "@/components/landing/directory-grid";
import { LandingFooter } from "@/components/landing/footer";
import { createFileRoute } from "@tanstack/react-router";
import { useLandingContent } from "@/components/landing/content";

export const Route = createFileRoute("/{-$locale}/")({
  component: LandingPage,
});

function LandingPage() {
  const content = useLandingContent();

  useSeoMeta({
    title: content.seo.title,
    description: content.seo.description,
    ogTitle: content.seo.ogTitle,
    ogDescription: content.seo.ogDescription,
    ogImage: "/og-image.png",
    twitterCard: "summary_large_image",
  });

  return (
    <div className="min-h-screen bg-background font-sans">
      <LandingNavbar />
      <main>
        <DirectoryGrid />
      </main>
      <LandingFooter />
    </div>
  );
}
