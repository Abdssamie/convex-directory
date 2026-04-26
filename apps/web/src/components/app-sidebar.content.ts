import { t, type Dictionary } from "intlayer";

const appSidebarDictionary = {
  key: "app-sidebar",
  content: {
    groups: [
      {
        label: t({ en: "Directory", fr: "Répertoire" }),
        items: [
          { title: t({ en: "Dashboard", fr: "Tableau de bord" }), url: "/dashboard" },
          {
            title: t({ en: "Submit Project", fr: "Soumettre un projet" }),
            url: "/dashboard/submit",
          },
          { title: t({ en: "Browse", fr: "Parcourir" }), url: "/directory" },
        ],
      },
      {
        label: t({ en: "Admin", fr: "Admin" }),
        items: [
          { title: t({ en: "Review Queue", fr: "File de révision" }), url: "/dashboard/admin" },
        ],
      },
      {
        label: t({ en: "Settings", fr: "Paramètres" }),
        items: [{ title: t({ en: "Account", fr: "Compte" }), url: "/settings/account" }],
      },
    ],
    signedIn: t({ en: "Signed in", fr: "Connecté" }),
  },
} satisfies Dictionary;

export default appSidebarDictionary;
