import { t, type Dictionary } from "intlayer";

const submitProjectFormDictionary = {
  key: "submit-project-form",
  content: {
    title: t({ en: "Submit Your Project", fr: "Soumettez votre projet" }),
    fields: {
      title: {
        label: t({ en: "Project Title", fr: "Titre du projet" }),
        placeholder: t({ en: "My Cool Convex App", fr: "Mon application Convex" }),
      },
      description: {
        label: t({ en: "Description", fr: "Description" }),
        placeholder: t({ en: "What does it do?", fr: "Que fait-elle ?" }),
      },
      url: {
        label: t({ en: "URL", fr: "URL" }),
        placeholder: t({ en: "https://...", fr: "https://..." }),
      },
      type: {
        label: t({ en: "Type", fr: "Type" }),
        placeholder: t({ en: "Select type", fr: "Sélectionner le type" }),
        options: {
          saas: t({ en: "SaaS", fr: "SaaS" }),
          tool: t({ en: "Tool", fr: "Outil" }),
          openSource: t({ en: "Open Source", fr: "Open Source" }),
          component: t({ en: "Component", fr: "Composant" }),
        },
      },
      category: {
        label: t({ en: "Category", fr: "Catégorie" }),
        placeholder: t({ en: "Select category", fr: "Sélectionner une catégorie" }),
      },
      logo: {
        label: t({ en: "Product Logo", fr: "Logo du produit" }),
      },
      screenshot: {
        label: t({ en: "Project Screenshot", fr: "Capture d'écran du projet" }),
      },
    },
    submit: t({ en: "Submit for Review", fr: "Soumettre pour révision" }),
    submitting: t({ en: "Submitting...", fr: "Envoi en cours..." }),
    success: t({
      en: "Project submitted successfully! Waiting for approval.",
      fr: "Projet soumis avec succès ! En attente d'approbation.",
    }),
    error: t({ en: "Failed to submit project.", fr: "Échec de la soumission du projet." }),
    validation: {
      titleMin: t({
        en: "Title must be at least 2 characters",
        fr: "Le titre doit faire au moins 2 caractères",
      }),
      descMin: t({
        en: "Description must be at least 10 characters",
        fr: "La description doit faire au moins 10 caractères",
      }),
      urlInvalid: t({ en: "Must be a valid URL", fr: "Doit être une URL valide" }),
      categoryRequired: t({
        en: "Select at least one category",
        fr: "Sélectionnez au moins une catégorie",
      }),
    },
  },
} satisfies Dictionary;

export default submitProjectFormDictionary;
