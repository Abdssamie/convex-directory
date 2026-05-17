import { useIntlayer } from "react-intlayer";

function getTranslation(entry: { value?: string } | string | undefined, fallback: string) {
  if (typeof entry === "string") {
    return entry;
  }

  return entry?.value ?? fallback;
}

export function useLandingContent() {
  const content = useIntlayer("landing");

  return {
    seo: {
      title: getTranslation(content?.seo?.title, "Convex Hub - Discover Apps, Tools & Components"),
      description: getTranslation(
        content?.seo?.description,
        "The central hub for projects built with Convex.",
      ),
      ogTitle: getTranslation(content?.seo?.ogTitle, "Convex Hub - Built with Convex"),
      ogDescription: getTranslation(
        content?.seo?.ogDescription,
        "Explore the ecosystem of apps, tools, and components powered by Convex.",
      ),
    },
    hero: {
      badge: getTranslation(content?.hero?.badge, "New: Submit your project today!"),
      titlePart1: getTranslation(content?.hero?.titlePart1, "The Ecosystem of"),
      titleHighlight: getTranslation(content?.hero?.titleHighlight, " Convex "),
      titlePart2: getTranslation(content?.hero?.titlePart2, "Apps & Tools"),
      description: getTranslation(
        content?.hero?.description,
        "Discover what the community is building with Convex.",
      ),
      getStartedFree: getTranslation(content?.hero?.getStartedFree, "Explore Hub"),
      watchDemo: getTranslation(content?.hero?.watchDemo, "Submit Project"),
    },
    navbar: {
      directory: getTranslation(content?.navbar?.directory, "Directory"),
      submit: getTranslation(content?.navbar?.submit, "Submit a project"),
      searchPlaceholder: getTranslation(content?.navbar?.searchPlaceholder, "Search projects..."),
      title: getTranslation(content?.navbar?.title, "Convex Hub"),
      dashboard: getTranslation(content?.navbar?.dashboard, "Dashboard"),
      signIn: getTranslation(content?.navbar?.signIn, "Sign in"),
      submitShort: getTranslation(content?.navbar?.submitShort, "Submit"),
    },
    directory: {
      featuredTitle: getTranslation(content?.directory?.featuredTitle, "Featured SaaS Products"),
      loadingProducts: getTranslation(content?.directory?.loadingProducts, "Loading products..."),
      noProducts: getTranslation(content?.directory?.noProducts, "No SaaS products found yet."),
      categoriesTitle: getTranslation(content?.directory?.categoriesTitle, "Product categories"),
      categoriesDescription: getTranslation(
        content?.directory?.categoriesDescription,
        "Discover innovative products organized by category.",
      ),
      popularTitle: getTranslation(content?.directory?.popularTitle, "Popular"),
      loadingCategories: getTranslation(
        content?.directory?.loadingCategories,
        "Loading categories...",
      ),
      productsCount: getTranslation(content?.directory?.productsCount, "products"),
      categoryDescriptions: {
        saas: getTranslation(
          content?.directory?.categoryDescriptions?.saas,
          "Software as a Service. Cloud-based subscription software for businesses and individuals, accessible anywhere.",
        ),
        tools: getTranslation(
          content?.directory?.categoryDescriptions?.tools,
          "Essential tools for developers, designers, and creators to boost productivity and build faster.",
        ),
        "open-source": getTranslation(
          content?.directory?.categoryDescriptions?.["open-source"],
          "Free, transparent, and collaborative software projects built by the community.",
        ),
        components: getTranslation(
          content?.directory?.categoryDescriptions?.components,
          "Reusable UI components and code snippets to accelerate your frontend development.",
        ),
        fallback: getTranslation(
          content?.directory?.categoryDescriptions?.fallback,
          "Explore a wide variety of tools and applications built for this category.",
        ),
      },
    },
    footer: {
      brandDescription: getTranslation(
        content?.footer?.brandDescription,
        "A curated hub of apps, tools, and open-source projects built on Convex.",
      ),
      sections: {
        directory: getTranslation(content?.footer?.sections?.directory, "Directory"),
        resources: getTranslation(content?.footer?.sections?.resources, "Resources"),
        legal: getTranslation(content?.footer?.sections?.legal, "Legal"),
      },
      links: {
        browseAll: getTranslation(content?.footer?.links?.browseAll, "Browse all"),
        submitProject: getTranslation(content?.footer?.links?.submitProject, "Submit a project"),
        saas: getTranslation(content?.footer?.links?.saas, "SaaS"),
        openSource: getTranslation(content?.footer?.links?.openSource, "Open Source"),
        privacy: getTranslation(content?.footer?.links?.privacy, "Privacy Policy"),
        terms: getTranslation(content?.footer?.links?.terms, "Terms of Service"),
      },
      madeWith: getTranslation(content?.footer?.madeWith, "Made with"),
      forCommunity: getTranslation(content?.footer?.forCommunity, "for the Convex community"),
      rightsReserved: getTranslation(content?.footer?.rightsReserved, "All rights reserved."),
    },
  };
}
