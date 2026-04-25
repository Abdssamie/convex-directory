"use client";

import { Separator } from "@convex-directory/ui/components/separator";
import { Button } from "@convex-directory/ui/components/button";
import { Logo } from "@/components/logo";
import { Github, Twitter, Heart } from "lucide-react";
import { useIntlayer } from "react-intlayer";

export function LandingFooter() {
  const content = useIntlayer("landing");

  const footerLinks = {
    directory: [
      { name: content.footer.links.browseAll.value, href: "#directory" },
      { name: content.footer.links.submitProject.value, href: "/sign-up" },
      { name: content.footer.links.saas.value, href: "#directory" },
      { name: content.footer.links.openSource.value, href: "#directory" },
    ],
    resources: [
      { name: "Convex Docs", href: "https://docs.convex.dev", external: true },
      { name: "Convex Discord", href: "https://convex.dev/community", external: true },
      { name: "GitHub", href: "https://github.com/get-convex", external: true },
    ],
    legal: [
      { name: content.footer.links.privacy.value, href: "/privacy" },
      { name: content.footer.links.terms.value, href: "/terms" },
    ],
  };

  const socialLinks = [
    { name: "Twitter / X", href: "https://twitter.com/convex_dev", icon: Twitter },
    { name: "GitHub", href: "https://github.com/get-convex", icon: Github },
  ];

  type FooterLink = { name: string; href: string; external?: boolean };

  function FooterLinkItem({ link }: { link: FooterLink }) {
    return (
      <li>
        <a
          href={link.href}
          {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          {link.name}
        </a>
      </li>
    );
  }

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <Logo size={28} />
              <span className="font-bold text-lg">{content.navbar.title}</span>
            </a>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
              {content.footer.brandDescription}
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <Button key={social.name} variant="outline" size="icon" asChild>
                  <a
                    href={social.href}
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Directory links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">{content.footer.sections.directory}</h4>
            <ul className="space-y-3">
              {footerLinks.directory.map((link) => (
                <FooterLinkItem key={link.name} link={link} />
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">{content.footer.sections.resources}</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <FooterLinkItem key={link.name} link={link} />
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">{content.footer.sections.legal}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <FooterLinkItem key={link.name} link={link} />
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span>{content.footer.madeWith}</span>
            <Heart className="h-3.5 w-3.5 text-primary fill-current" />
            <span>{content.footer.forCommunity}</span>
          </div>
          <span>
            © {new Date().getFullYear()} {content.navbar.title}. {content.footer.rightsReserved}
          </span>
        </div>
      </div>
    </footer>
  );
}
