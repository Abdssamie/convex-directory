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
    organizationOverview: {
      loadingTitle: t({ en: "Organization", fr: "Organisation" }),
      loadingDesc: t({
        en: "Loading workspace details.",
        fr: "Chargement des détails de l'espace de travail.",
      }),
      noActiveTitle: t({ en: "No active organization", fr: "Aucune organisation active" }),
      noActiveDesc: t({
        en: "Create your first workspace or switch to one you already joined.",
        fr: "Créez votre premier espace de travail ou rejoignez-en un.",
      }),
      createOrg: t({ en: "Create organization", fr: "Créer une organisation" }),
      chooseExisting: t({
        en: "Choose existing workspace",
        fr: "Choisir un espace de travail existant",
      }),
      activeWorkspaceDesc: t({
        en: "Active workspace for dashboard, members, and invitations.",
        fr: "Espace de travail actif pour le tableau de bord, les membres et les invitations.",
      }),
      organizationsLabel: t({ en: "Organizations", fr: "Organisations" }),
      membersLabel: t({ en: "Members", fr: "Membres" }),
      pendingInvitesLabel: t({ en: "Pending invites", fr: "Invitations en attente" }),
      manageMembers: t({ en: "Manage members", fr: "Gérer les membres" }),
      invitePeople: t({ en: "Invite people", fr: "Inviter des personnes" }),
    },
    sectionCards: {
      totalRevenue: t({ en: "Total Revenue", fr: "Revenu Total" }),
      trendingUpMonth: t({ en: "Trending up this month", fr: "En hausse ce mois-ci" }),
      visitorsLast6Months: t({
        en: "Visitors for the last 6 months",
        fr: "Visiteurs sur les 6 derniers mois",
      }),
      newCustomers: t({ en: "New Customers", fr: "Nouveaux Clients" }),
      down20Period: t({ en: "Down 20% this period", fr: "En baisse de 20% cette période" }),
      acquisitionNeedsAttention: t({
        en: "Acquisition needs attention",
        fr: "L'acquisition nécessite de l'attention",
      }),
      activeAccounts: t({ en: "Active Accounts", fr: "Comptes Actifs" }),
      strongUserRetention: t({
        en: "Strong user retention",
        fr: "Forte rétention des utilisateurs",
      }),
      engagementExceedTargets: t({
        en: "Engagement exceed targets",
        fr: "L'engagement dépasse les objectifs",
      }),
      growthRate: t({ en: "Growth Rate", fr: "Taux de Croissance" }),
      steadyPerformanceIncrease: t({
        en: "Steady performance increase",
        fr: "Augmentation régulière des performances",
      }),
      meetsGrowthProjections: t({
        en: "Meets growth projections",
        fr: "Atteint les projections de croissance",
      }),
    },
    chartAreaInteractive: {
      totalVisitors: t({ en: "Total Visitors", fr: "Visiteurs Totaux" }),
      totalLast3Months: t({
        en: "Total for the last 3 months",
        fr: "Total pour les 3 derniers mois",
      }),
      last3Months: t({ en: "Last 3 months", fr: "3 derniers mois" }),
      last30Days: t({ en: "Last 30 days", fr: "30 derniers jours" }),
      last7Days: t({ en: "Last 7 days", fr: "7 derniers jours" }),
    },
    dataTable: {
      columns: {
        header: t({ en: "Header", fr: "En-tête" }),
        sectionType: t({ en: "Section Type", fr: "Type de Section" }),
        status: t({ en: "Status", fr: "Statut" }),
        target: t({ en: "Target", fr: "Cible" }),
        limit: t({ en: "Limit", fr: "Limite" }),
        reviewer: t({ en: "Reviewer", fr: "Relecteur" }),
      },
      actions: {
        assignReviewer: t({ en: "Assign reviewer", fr: "Assigner un relecteur" }),
        edit: t({ en: "Edit", fr: "Éditer" }),
        makeCopy: t({ en: "Make a copy", fr: "Faire une copie" }),
        favorite: t({ en: "Favorite", fr: "Favori" }),
        delete: t({ en: "Delete", fr: "Supprimer" }),
      },
      pagination: {
        noResults: t({ en: "No results.", fr: "Aucun résultat." }),
        rowsSelected: t({ en: "row(s) selected.", fr: "ligne(s) sélectionnée(s)." }),
        of: t({ en: "of", fr: "sur" }),
        rowsPerPage: t({ en: "Rows per page", fr: "Lignes par page" }),
        page: t({ en: "Page", fr: "Page" }),
        goToFirst: t({ en: "Go to first page", fr: "Aller à la première page" }),
        goToPrevious: t({ en: "Go to previous page", fr: "Aller à la page précédente" }),
        goToNext: t({ en: "Go to next page", fr: "Aller à la page suivante" }),
        goToLast: t({ en: "Go to last page", fr: "Aller à la dernière page" }),
      },
      tabs: {
        selectView: t({ en: "Select a view", fr: "Sélectionner une vue" }),
        outline: t({ en: "Outline", fr: "Plan" }),
        pastPerformance: t({ en: "Past Performance", fr: "Performances passées" }),
        keyPersonnel: t({ en: "Key Personnel", fr: "Personnel clé" }),
        focusDocuments: t({ en: "Focus Documents", fr: "Documents prioritaires" }),
      },
      toolbar: {
        customizeColumns: t({ en: "Customize Columns", fr: "Personnaliser les colonnes" }),
        columns: t({ en: "Columns", fr: "Colonnes" }),
        addSection: t({ en: "Add Section", fr: "Ajouter une section" }),
      },
      toast: {
        saving: t({ en: "Saving", fr: "Enregistrement de" }),
        done: t({ en: "Done", fr: "Fait" }),
        error: t({ en: "Error", fr: "Erreur" }),
      },
    },
  },
} satisfies Dictionary;

export default dashboardDictionary;
