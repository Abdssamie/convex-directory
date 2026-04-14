import type { EmailFlow } from "./config";
import { sendEmail } from "./index";

const sendBetterAuthEmail = async (
  flow: EmailFlow,
  params: Record<string, string>,
  tags: string[],
) => {
  await sendEmail({ flow, to: { email: params.email }, params, tags });
};

export const sendVerificationEmail = async (params: {
  email: string;
  name?: string | null;
  url: string;
}) => {
  await sendBetterAuthEmail(
    "email_verification",
    { email: params.email, verificationUrl: params.url, name: params.name ?? "" },
    ["better-auth", "email-verification"],
  );
};

export const sendPasswordResetEmail = async (params: {
  email: string;
  name?: string | null;
  url: string;
}) => {
  await sendBetterAuthEmail(
    "password_reset",
    { email: params.email, resetUrl: params.url, name: params.name ?? "" },
    ["better-auth", "password-reset"],
  );
};

export const sendMagicLinkEmail = async (params: { email: string; url: string }) => {
  await sendBetterAuthEmail("magic_link", { email: params.email, magicLink: params.url }, [
    "better-auth",
    "magic-link",
  ]);
};

export const sendInvitationEmail = async (params: {
  email: string;
  invitedByName?: string | null;
  organizationName?: string | null;
  inviteLink: string;
}) => {
  await sendBetterAuthEmail(
    "invitation",
    {
      email: params.email,
      inviteUrl: params.inviteLink,
      inviterName: params.invitedByName ?? "",
      appName: params.organizationName ?? "",
    },
    ["better-auth", "invitation"],
  );
};

export const sendWelcomeEmail = async (params: { email: string; name?: string | null }) => {
  const appUrl = process.env.APP_URL || "";
  await sendBetterAuthEmail(
    "welcome",
    { email: params.email, appUrl, userName: params.name ?? "" },
    ["better-auth", "welcome"],
  );
};
