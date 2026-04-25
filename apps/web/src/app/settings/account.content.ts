import { t, type Dictionary } from "intlayer";

const accountSettingsDictionary = {
  key: "account-settings",
  content: {
    title: t({ en: "Account Settings", fr: "Paramètres du compte" }),
    description: t({
      en: "Manage your profile and security.",
      fr: "Gérez votre profil et votre sécurité.",
    }),
    profile: {
      title: t({ en: "Profile", fr: "Profil" }),
      description: t({
        en: "Your current account details from Better Auth.",
        fr: "Les détails de votre compte actuel via Better Auth.",
      }),
      name: t({ en: "Name", fr: "Nom" }),
      email: t({ en: "Email", fr: "Email" }),
      verification: t({ en: "Verification", fr: "Vérification" }),
      userId: t({ en: "User ID", fr: "ID Utilisateur" }),
      verified: t({ en: "Verified", fr: "Vérifié" }),
      notVerified: t({ en: "Not verified", fr: "Non vérifié" }),
    },
    security: {
      title: t({ en: "Security", fr: "Sécurité" }),
      resetPassword: t({ en: "Reset password", fr: "Réinitialiser le mot de passe" }),
      openBilling: t({ en: "Open billing", fr: "Ouvrir la facturation" }),
    },
  },
} satisfies Dictionary;

export default accountSettingsDictionary;
