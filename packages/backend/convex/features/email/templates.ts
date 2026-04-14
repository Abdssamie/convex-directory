import type { EmailFlow } from "./config";

export type EmailTemplateConfig = {
  subject: (params: Record<string, string>) => string;
  html: (params: Record<string, string>) => string;
};

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const safeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return url;
  } catch {
    return "";
  }
};

const wrapHtml = (appName: string, subject: string, body: string): string => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
            <!-- Header -->
            <tr>
              <td style="padding: 30px 40px; background-color: #ffffff; border-bottom: 1px solid #eeeeee;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111111;">${escapeHtml(appName)}</h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding: 40px;">
                ${body}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #eeeeee;">
                <p style="margin: 0; font-size: 14px; color: #888888; text-align: center;">
                  This email was sent by ${escapeHtml(appName)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
</body>
</html>`;

const BUTTON_STYLE = `display: inline-block; padding: 14px 28px; background-color: #000000; color: #ffffff; text-decoration: none; font-weight: 500; border-radius: 6px;`;

const templates: Record<EmailFlow, EmailTemplateConfig> = {
  email_verification: {
    subject: (_p) => `Verify your email`,
    html: (p) =>
      wrapHtml(
        p.appName || "App",
        "Verify your email",
        `<h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #111111;">
        Verify your email
      </h2>
      <p style="margin: 0 0 24px 0; color: #444444;">
        Click the button below to verify your email address.
      </p>
      <p style="margin: 0 0 32px 0;">
        <a href="${safeUrl(p.verificationUrl)}" style="${BUTTON_STYLE}">Verify Email</a>
      </p>
      <p style="margin: 0; font-size: 14px; color: #888888;">
        If you didn't request this, you can safely ignore this email.
      </p>`,
      ),
  },

  password_reset: {
    subject: () => `Reset your password`,
    html: (p) =>
      wrapHtml(
        p.appName || "App",
        "Reset your password",
        `<h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #111111;">
        Reset your password
      </h2>
      <p style="margin: 0 0 24px 0; color: #444444;">
        Click the button below to reset your password. This link will expire in 1 hour.
      </p>
      <p style="margin: 0 0 32px 0;">
        <a href="${safeUrl(p.resetUrl)}" style="${BUTTON_STYLE}">Reset Password</a>
      </p>
      <p style="margin: 0; font-size: 14px; color: #888888;">
        If you didn't request this, you can safely ignore this email.
      </p>`,
      ),
  },

  magic_link: {
    subject: () => `Sign in to your account`,
    html: (p) =>
      wrapHtml(
        p.appName || "App",
        "Sign in to your account",
        `<h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #111111;">
        Sign in to your account
      </h2>
      <p style="margin: 0 0 24px 0; color: #444444;">
        Click the button below to sign in to your account.
      </p>
      <p style="margin: 0 0 32px 0;">
        <a href="${safeUrl(p.magicLink)}" style="${BUTTON_STYLE}">Sign In</a>
      </p>
      <p style="margin: 0; font-size: 14px; color: #888888;">
        This link will expire in 10 minutes.
      </p>`,
      ),
  },

  invitation: {
    subject: (p) => `You're invited to join ${p.appName || "an organization"}`,
    html: (p) =>
      wrapHtml(
        p.appName || "App",
        "You're invited to join",
        `<h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #111111;">
        You're invited to join ${escapeHtml(p.appName || "an organization")}
      </h2>
      <p style="margin: 0 0 24px 0; color: #444444;">
        ${escapeHtml(p.inviterName || "Someone")} has invited you to join their workspace.
      </p>
      <p style="margin: 0 0 32px 0;">
        <a href="${safeUrl(p.inviteUrl)}" style="${BUTTON_STYLE}">Accept Invitation</a>
      </p>
      <p style="margin: 0; font-size: 14px; color: #888888;">
        If you don't have an account, you'll be asked to create one.
      </p>`,
      ),
  },

  welcome: {
    subject: (p) => `Welcome to ${p.appName || "App"}`,
    html: (p) =>
      wrapHtml(
        p.appName || "App",
        "Welcome",
        `<h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #111111;">
        Welcome${p.userName ? `, ${escapeHtml(p.userName)}` : ""}!
      </h2>
      <p style="margin: 0 0 24px 0; color: #444444;">
        Thanks for signing up. You're now ready to get started.
      </p>
      <p style="margin: 0 0 32px 0;">
        <a href="${safeUrl(p.appUrl || "")}" style="${BUTTON_STYLE}">Get Started</a>
      </p>
      <p style="margin: 0; font-size: 14px; color: #888888;">
        If you have any questions, just reply to this email.
      </p>`,
      ),
  },
};

export const getEmailTemplate = (flow: EmailFlow): EmailTemplateConfig => {
  const template = templates[flow];
  if (!template) {
    throw new Error(`Unknown email flow: ${flow}`);
  }
  return template;
};

export const renderEmailHtml = (
  flow: EmailFlow,
  params: Record<string, string>,
  appName: string,
): { subject: string; htmlContent: string } => {
  const template = getEmailTemplate(flow);
  return {
    subject: template.subject(params),
    htmlContent: template.html({ ...params, appName }),
  };
};

export const getSupportedFlows = (): EmailFlow[] => Object.keys(templates) as EmailFlow[];
