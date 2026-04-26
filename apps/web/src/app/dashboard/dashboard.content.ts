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
        en: "Manage your projects and submissions.",
        fr: "Gérez vos projets et soumissions.",
      }),
    },
    submissions: {
      title: t({ en: "Your Submissions", fr: "Vos soumissions" }),
      description: t({
        en: "All projects you've submitted.",
        fr: "Tous les projets que vous avez soumis.",
      }),
      submitNew: t({ en: "Submit New Project", fr: "Soumettre un nouveau projet" }),
      noSubmissions: t({
        en: "You haven't submitted any projects yet.",
        fr: "Vous n'avez encore soumis aucun projet.",
      }),
      table: {
        title: t({ en: "Title", fr: "Titre" }),
        status: t({ en: "Status", fr: "Statut" }),
        date: t({ en: "Date", fr: "Date" }),
        actions: t({ en: "Actions", fr: "Actions" }),
      },
      status: {
        pending: t({ en: "Pending", fr: "En attente" }),
        approved: t({ en: "Approved", fr: "Approuvé" }),
        rejected: t({ en: "Rejected", fr: "Rejeté" }),
      },
    },
  },
} satisfies Dictionary;

export default dashboardDictionary;
