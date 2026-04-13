export type EmailFlow =
  | "email_verification"
  | "password_reset"
  | "magic_link"
  | "invitation"
  | "welcome";

export type EmailConfigError =
  | { code: "missing_env"; field: string; value: string }
  | { code: "template_not_found"; flow: EmailFlow; templateName: string };

export type EmailSendError =
  | (EmailConfigError & { flow: EmailFlow })
  | {
      code: "email_send_failed";
      flow: EmailFlow;
      reason?: string;
      status?: number;
      templateId?: number;
    };

export type BrevoConfig = {
  apiKey: string;
  sender: { name: string; email: string };
  replyTo?: { name?: string; email: string };
  appName: string;
};

const requiredEnv = (field: string): string => {
  const value = process.env[field];
  if (!value) {
    throw { code: "missing_env", field, value: "" } as EmailConfigError;
  }
  return value;
};

export const getBrevoConfig = (): BrevoConfig => {
  const apiKey = requiredEnv("BREVO_API_KEY");
  const senderName = requiredEnv("BREVO_SENDER_NAME");
  const senderEmail = requiredEnv("BREVO_SENDER_EMAIL");
  const appName = requiredEnv("BREVO_APP_NAME");

  const replyToEmail = process.env.BREVO_REPLY_TO_EMAIL;
  const replyToName = process.env.BREVO_REPLY_TO_NAME;
  const replyTo = replyToEmail
    ? {
        email: replyToEmail,
        name: replyToName,
      }
    : undefined;

  return {
    apiKey,
    sender: {
      name: senderName,
      email: senderEmail,
    },
    replyTo,
    appName,
  };
};

export const getEmailProvider = (): "brevo" => {
  return "brevo";
};

export const getTemplateName = (flow: EmailFlow): string => {
  return flow;
};
