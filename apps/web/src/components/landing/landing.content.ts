import { t, type Dictionary } from "intlayer";

export default {
  key: "landing",
  content: {
    seo: {
      title: t({
        en: "Convex Directory - Discover Apps, Tools & Components",
        fr: "Convex Directory - Découvrez des applications, outils et composants",
      }),
      description: t({
        en: "The ultimate directory for projects built with Convex. Explore SaaS apps, open-source tools, and UI components from the community.",
        fr: "Le répertoire ultime des projets créés avec Convex.",
      }),
      ogTitle: t({
        en: "Convex Directory - Built with Convex",
        fr: "Convex Directory - Créé avec Convex",
      }),
      ogDescription: t({
        en: "Explore the ecosystem of apps, tools, and components powered by Convex.",
        fr: "Explorez l'écosystème d'applications, d'outils et de composants alimentés par Convex.",
      }),
    },
    hero: {
      badge: t({
        en: "New: Submit your project today!",
        fr: "Nouveau : Soumettez votre projet dès aujourd'hui !",
      }),
      titlePart1: t({ en: "The Ecosystem of", fr: "L'écosystème de" }),
      titleHighlight: t({ en: " Convex ", fr: " Convex " }),
      titlePart2: t({ en: "Apps & Tools", fr: "Apps & Outils" }),
      description: t({
        en: "Discover what the community is building with Convex. From SaaS prototypes to production-grade tools and open-source components.",
        fr: "Découvrez ce que la communauté crée avec Convex. Des prototypes SaaS aux outils de production et composants open-source.",
      }),
      getStartedFree: t({ en: "Explore Directory", fr: "Explorer le répertoire" }),
      watchDemo: t({ en: "Submit Project", fr: "Soumettre un projet" }),
    },
    navbar: {
      home: t({ en: "Home", fr: "Accueil" }),
      features: t({ en: "Features", fr: "Fonctionnalités" }),
      solutions: t({ en: "Solutions", fr: "Solutions" }),
      team: t({ en: "Team", fr: "Équipe" }),
      pricing: t({ en: "Pricing", fr: "Tarification" }),
      faq: t({ en: "FAQ", fr: "FAQ" }),
      contact: t({ en: "Contact", fr: "Contact" }),
      dashboard: t({ en: "Dashboard", fr: "Tableau de bord" }),
      signIn: t({ en: "Sign In", fr: "Connexion" }),
      getStarted: t({ en: "Join Now", fr: "Rejoindre" }),
      browseProducts: t({ en: "Browse Products", fr: "Parcourir les produits" }),
      freeBlocks: t({ en: "Free Blocks", fr: "Blocs Gratuits" }),
      premiumTemplates: t({ en: "Premium Templates", fr: "Modèles Premium" }),
      adminDashboards: t({ en: "Admin Dashboards", fr: "Tableaux de Bord Admin" }),
      landingPages: t({ en: "Landing Pages", fr: "Pages de Destination" }),
      categories: t({ en: "Categories", fr: "Catégories" }),
      ecommerce: t({ en: "E-commerce", fr: "E-commerce" }),
      saasDashboards: t({ en: "SaaS Dashboards", fr: "Tableaux de Bord SaaS" }),
      analytics: t({ en: "Analytics", fr: "Analytique" }),
      authentication: t({ en: "Authentication", fr: "Authentification" }),
      resources: t({ en: "Resources", fr: "Ressources" }),
      documentation: t({ en: "Documentation", fr: "Documentation" }),
      componentShowcase: t({ en: "Component Showcase", fr: "Vitrine de Composants" }),
      githubRepo: t({ en: "GitHub Repository", fr: "Dépôt GitHub" }),
      designSystem: t({ en: "Design System", fr: "Système de Design" }),
    },
  },
} satisfies Dictionary;
