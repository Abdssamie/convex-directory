import { t, type Dictionary } from "intlayer";

export default {
  key: "landing",
  content: {
    seo: {
      title: t({
        en: "Convex Hub - Discover Apps, Tools & Components",
        fr: "Convex Hub - Découvrez des applications, outils et composants",
      }),
      description: t({
        en: "The central hub for projects built with Convex. Explore SaaS apps, open-source tools, and UI components from the community.",
        fr: "Le hub central des projets créés avec Convex. Explorez des applications SaaS, des outils open-source et des composants UI de la communauté.",
      }),
      ogTitle: t({
        en: "Convex Hub - Built with Convex",
        fr: "Convex Hub - Créé avec Convex",
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
      titlePart1: t({ en: "Browse SaaS Built with", fr: "Parcourez les SaaS créés avec" }),
      titleHighlight: t({ en: " Convex ", fr: " Convex " }),
      titlePart2: t({ en: "Today", fr: "Aujourd'hui" }),
      description: t({
        en: "Discover what the community is building with Convex. From SaaS prototypes to production-grade tools and open-source components.",
        fr: "Découvrez ce que la communauté crée avec Convex. Des prototypes SaaS aux outils de production et composants open-source.",
      }),
      getStartedFree: t({ en: "Explore Hub", fr: "Explorer le hub" }),
      watchDemo: t({ en: "Submit Project", fr: "Soumettre un projet" }),
    },
    navbar: {
      directory: t({ en: "Home", fr: "Accueil" }),
      submit: t({ en: "Submit", fr: "Soumettre" }),
      searchPlaceholder: t({ en: "Search projects...", fr: "Rechercher des projets..." }),
      title: "Convex Hub",
      dashboard: t({ en: "Dashboard", fr: "Tableau de bord" }),
      signIn: t({ en: "Sign in", fr: "Connexion" }),
      submitShort: t({ en: "Submit", fr: "Soumettre" }),
    },
    directory: {
      featuredTitle: t({ en: "Featured SaaS Products", fr: "Produits SaaS en vedette" }),
      loadingProducts: t({ en: "Loading products...", fr: "Chargement des produits..." }),
      noProducts: t({
        en: "No SaaS products found yet.",
        fr: "Aucun produit SaaS trouvé pour le moment.",
      }),
      categoriesTitle: t({ en: "Product categories", fr: "Catégories de produits" }),
      categoriesDescription: t({
        en: "Explore products by category and find what fits your needs.",
        fr: "Explorez les produits par catégorie et trouvez ce qui correspond à vos besoins.",
      }),
      popularTitle: t({ en: "Popular", fr: "Populaire" }),
      loadingCategories: t({ en: "Loading categories...", fr: "Chargement des catégories..." }),
      productsCount: t({ en: "products", fr: "produits" }),
      categoryDescriptions: {
        saas: t({
          en: "Software as a Service. Cloud-based subscription software for businesses and individuals, accessible anywhere.",
          fr: "Logiciel en tant que service. Logiciel d'abonnement basé sur le cloud pour les entreprises et les particuliers, accessible partout.",
        }),
        tools: t({
          en: "Essential tools for developers, designers, and creators to boost productivity and build faster.",
          fr: "Outils essentiels pour les développeurs, concepteurs et créateurs pour augmenter la productivité et construire plus rapidement.",
        }),
        "open-source": t({
          en: "Free, transparent, and collaborative software projects built by the community.",
          fr: "Projets logiciels gratuits, transparents et collaboratifs construits par la communauté.",
        }),
        components: t({
          en: "Reusable UI components and code snippets to accelerate your frontend development.",
          fr: "Composants d'interface utilisateur réutilisables et extraits de code pour accélérer votre développement frontend.",
        }),
        fallback: t({
          en: "Explore a wide variety of tools and applications built for this category.",
          fr: "Explorez une grande variété d'outils et d'applications conçus pour cette catégorie.",
        }),
      },
    },
    footer: {
      brandDescription: t({
        en: "A curated hub of apps, tools, and open-source projects built on Convex — the reactive backend for modern web apps.",
        fr: "Un hub organisé d'applications, d'outils et de projets open-source construits sur Convex — le backend réactif pour les applications web modernes.",
      }),
      sections: {
        directory: t({ en: "Directory", fr: "Répertoire" }),
        resources: t({ en: "Resources", fr: "Ressources" }),
        legal: t({ en: "Legal", fr: "Légal" }),
      },
      links: {
        browseAll: t({ en: "Browse all", fr: "Tout parcourir" }),
        submitProject: t({ en: "Submit a project", fr: "Soumettre un projet" }),
        saas: t({ en: "SaaS", fr: "SaaS" }),
        openSource: t({ en: "Open Source", fr: "Open Source" }),
        privacy: t({ en: "Privacy Policy", fr: "Politique de confidentialité" }),
        terms: t({ en: "Terms of Service", fr: "Conditions d'utilisation" }),
      },
      madeWith: t({ en: "Made with", fr: "Fait avec" }),
      forCommunity: t({ en: "for the Convex community", fr: "pour la communauté Convex" }),
      rightsReserved: t({ en: "All rights reserved.", fr: "Tous droits réservés." }),
    },
  },
} satisfies Dictionary;
