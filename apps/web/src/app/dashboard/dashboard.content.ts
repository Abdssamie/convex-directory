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
