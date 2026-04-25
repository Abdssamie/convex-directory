import { t, type Dictionary } from "intlayer";

const dashboardDictionary = {
  key: "dashboard",
  content: {
    page: {
      title: t({ en: "Dashboard", fr: "Tableau de bord" }),
      description: t({
        en: "Welcome to your admin dashboard",
        fr: "Bienvenue sur votre tableau de bord administrateur",
      }),
    },
    admin: {
      title: t({ en: "Admin Review", fr: "Révision Admin" }),
      description: t({
        en: "Manage projects and claims.",
        fr: "Gérer les projets et les réclamations.",
      }),
      checkingAccess: t({ en: "Checking access.", fr: "Vérification de l'accès." }),
      projects: {
        title: t({ en: "Pending Projects", fr: "Projets en attente" }),
        noProjects: t({ en: "No pending projects.", fr: "Aucun projet en attente." }),
        approve: t({ en: "Approve", fr: "Approuver" }),
        reject: t({ en: "Reject", fr: "Rejeter" }),
      },
      claims: {
        title: t({ en: "Pending Claims", fr: "Réclamations en attente" }),
        noClaims: t({ en: "No pending claims.", fr: "Aucune réclamation en attente." }),
        approve: t({ en: "Approve Ownership", fr: "Approuver la propriété" }),
        reject: t({ en: "Reject", fr: "Rejeter" }),
        reason: t({ en: "Reason", fr: "Raison" }),
      },
      toast: {
        projectApproved: t({ en: "Project approved", fr: "Projet approuvé" }),
        projectRejected: t({ en: "Project rejected", fr: "Projet rejeté" }),
        claimApproved: t({ en: "Claim approved", fr: "Réclamation approuvée" }),
        claimRejected: t({ en: "Claim rejected", fr: "Réclamation rejetée" }),
        error: t({ en: "Error occurred", fr: "Une erreur est survenue" }),
      },
      bulkUploader: {
        title: t({ en: "Fast Project Upload", fr: "Téléchargement rapide de projets" }),
        description: t({
          en: "Paste one project per line with title | url | description | optional category.",
          fr: "Collez un projet par ligne avec titre | url | description | catégorie optionnelle.",
        }),
        adminOnly: t({ en: "Admin Only", fr: "Admin uniquement" }),
        approvedUnclaimed: t({ en: "Approved, unclaimed", fr: "Approuvé, non réclamé" }),
        defaultType: t({ en: "Default type", fr: "Type par défaut" }),
        chooseType: t({ en: "Choose type", fr: "Choisir le type" }),
        pasteRows: t({ en: "Paste rows", fr: "Coller les lignes" }),
        parseRows: t({ en: "Parse rows", fr: "Analyser les lignes" }),
        clear: t({ en: "Clear", fr: "Effacer" }),
        publish: t({ en: "Publish {count} projects", fr: "Publier {count} projets" }),
        publishing: t({ en: "Publishing...", fr: "Publication..." }),
      },
    },
    welcome: {
      title: t({ en: "Welcome back!", fr: "Bon retour !" }),
      description: t({
        en: "Manage your projects and submissions from the sidebar.",
        fr: "Gérez vos projets et soumissions depuis la barre latérale.",
      }),
    },
  },
} satisfies Dictionary;

export default dashboardDictionary;
