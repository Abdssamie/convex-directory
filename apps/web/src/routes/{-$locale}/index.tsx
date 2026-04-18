import { useSeoMeta } from "@unhead/react";
import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { LogoCarousel } from "@/components/landing/logo-carousel";
import { StatsSection } from "@/components/landing/stats-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { TeamSection } from "@/components/landing/team-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { BlogSection } from "@/components/landing/blog-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CTASection } from "@/components/landing/cta-section";
import { ContactSection } from "@/components/landing/contact-section";
import { FaqSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/footer";
import { AboutSection } from "@/components/landing/about-section";
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
      {/* Navigation */}
      <LandingNavbar />

      {/* Main Content */}
      <main>
        <HeroSection />
        <LogoCarousel />
        <StatsSection />
        <AboutSection />
        <FeaturesSection />
        <TeamSection />
        <PricingSection />
        <TestimonialsSection />
        <BlogSection />
        <FaqSection />
        <CTASection />
        <ContactSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
