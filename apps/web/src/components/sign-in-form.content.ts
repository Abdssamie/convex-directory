import { t, type Dictionary } from "intlayer";

const signInFormDictionary = {
  key: "sign-in-form",
  content: {
    title: t({ en: "Welcome Back", fr: "Bon retour" }),
    email: t({ en: "Email", fr: "Email" }),
    password: t({ en: "Password", fr: "Mot de passe" }),
    signIn: t({ en: "Sign in", fr: "Se connecter" }),
    signingIn: t({ en: "Signing in...", fr: "Connexion..." }),
    forgotPassword: t({ en: "Forgot password?", fr: "Mot de passe oublié ?" }),
    noAccount: t({ en: "Don't have an account?", fr: "Pas encore de compte ?" }),
    signUp: t({ en: "Sign up", fr: "S'inscrire" }),
    success: t({ en: "Signed in successfully", fr: "Connecté avec succès" }),
    error: t({ en: "Failed to sign in", fr: "Échec de la connexion" }),
  },
} satisfies Dictionary;

export default signInFormDictionary;
