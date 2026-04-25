import { t, type Dictionary } from "intlayer";

const commonDictionary = {
  key: "common",
  content: {
    loading: t({ en: "Loading...", fr: "Chargement..." }),
    notFound: t({ en: "Not Found", fr: "Non trouvé" }),
    unauthorized: t({ en: "Unauthorized", fr: "Non autorisé" }),
    searchPlaceholder: t({ en: "Search...", fr: "Rechercher..." }),
    noResults: t({ en: "No results found.", fr: "Aucun résultat trouvé." }),
    close: t({ en: "Close", fr: "Fermer" }),
    error: {
      title: t({ en: "404 - Not Found", fr: "404 - Non trouvé" }),
      description: t({
        en: "The page you were looking for doesn't exist.",
        fr: "La page que vous recherchez n'existe pas.",
      }),
    },
  },
} satisfies Dictionary;

export default commonDictionary;
