export type EmailFlow =
  | "email_verification"
  | "password_reset"
  | "magic_link"
  | "invitation"
  | "welcome";

export type EmailSendError = {
  code: "email_send_failed";
  flow: EmailFlow;
  reason?: string;
  status?: number;
};

export type BrevoConfig = {
  apiKey: string;
  sender: { name: string; email: string };
  replyTo?: { name?: string; email: string };
  appName: string;
};

export const getBrevoConfig = (): BrevoConfig => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderName = process.env.BREVO_SENDER_NAME;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const appName = process.env.BREVO_APP_NAME;

  if (!apiKey || !senderName || !senderEmail || !appName) {
    throw new Error(
      "Missing required Brevo env vars: BREVO_API_KEY, BREVO_SENDER_NAME, BREVO_SENDER_EMAIL, BREVO_APP_NAME",
    );
  }

  return {
    apiKey,
    sender: { name: senderName, email: senderEmail },
    replyTo: process.env.BREVO_REPLY_TO_EMAIL
      ? { email: process.env.BREVO_REPLY_TO_EMAIL, name: process.env.BREVO_REPLY_TO_NAME }
      : undefined,
    appName,
  };
};
