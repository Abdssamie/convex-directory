import { useSeoMeta } from "@unhead/react";
import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { DirectoryGrid } from "@/components/landing/directory-grid";
import { LandingFooter } from "@/components/landing/footer";
import { createFileRoute } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";

export const Route = createFileRoute("/{-$locale}/")({
  component: LandingPage,
});

function LandingPage() {
  const content = useIntlayer("landing");

  useSeoMeta({
    title: content.seo.title.value,
    description: content.seo.description.value,
    ogTitle: content.seo.ogTitle.value,
    ogDescription: content.seo.ogDescription.value,
    ogImage: "/og-image.png",
    twitterCard: "summary_large_image",
  });

  return (
    <div className="min-h-screen bg-background font-sans">
      <LandingNavbar />
      <main>
        <HeroSection />
        <DirectoryGrid />
      </main>
      <LandingFooter />
    </div>
  );
}
