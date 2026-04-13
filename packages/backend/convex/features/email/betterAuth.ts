import type { EmailFlow } from "./config";
import { sendEmail } from "./index";
import { logger } from "../../lib/logger";
import { getBrevoConfig } from "./config";

type BetterAuthEmailPayload = {
  to: { email: string; name?: string };
  params: Record<string, string>;
  tags?: string[];
};

const sendBetterAuthEmail = async (flow: EmailFlow, payload: BetterAuthEmailPayload) => {
  try {
    await sendEmail({
      flow,
      to: payload.to,
      params: payload.params,
      tags: payload.tags,
    });
  } catch (error) {
    if (error && typeof error === "object") {
      logger.warn("brevo_email_failed", error as Record<string, unknown>);
      return;
    }

    logger.warn("brevo_email_failed", undefined);
  }
};

export const sendVerificationEmail = async (params: {
  email: string;
  name?: string | null;
  url: string;
}) => {
  await sendBetterAuthEmail("email_verification", {
    to: { email: params.email, name: params.name ?? undefined },
    params: {
      verificationUrl: params.url,
      email: params.email,
      name: params.name ?? "",
    },
    tags: ["better-auth", "email-verification"],
  });
};

export const sendPasswordResetEmail = async (params: {
  email: string;
  name?: string | null;
  url: string;
}) => {
  await sendBetterAuthEmail("password_reset", {
    to: { email: params.email, name: params.name ?? undefined },
    params: {
      resetUrl: params.url,
      email: params.email,
      name: params.name ?? "",
    },
    tags: ["better-auth", "password-reset"],
  });
};

export const sendMagicLinkEmail = async (params: { email: string; url: string }) => {
  await sendBetterAuthEmail("magic_link", {
    to: { email: params.email },
    params: {
      magicLink: params.url,
      email: params.email,
    },
    tags: ["better-auth", "magic-link"],
  });
};

export const sendInvitationEmail = async (params: {
  email: string;
  invitedByEmail?: string | null;
  invitedByName?: string | null;
  organizationName?: string | null;
  inviteLink: string;
}) => {
  const { appName } = getBrevoConfig();
  await sendBetterAuthEmail("invitation", {
    to: { email: params.email },
    params: {
      inviteUrl: params.inviteLink,
      inviterName: params.invitedByName ?? "",
      appName: params.organizationName ?? appName,
    },
    tags: ["better-auth", "invitation"],
  });
};

export const sendWelcomeEmail = async (params: { email: string; name?: string | null }) => {
  const { appName } = getBrevoConfig();
  await sendBetterAuthEmail("welcome", {
    to: { email: params.email, name: params.name ?? undefined },
    params: {
      appName,
      userName: params.name ?? "",
    },
    tags: ["better-auth", "welcome"],
  });
};
