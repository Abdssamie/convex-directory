import { type BrevoConfig, type EmailFlow, type EmailSendError, getBrevoConfig } from "./config";
import { renderEmailHtml } from "./templates";
import { type Result, ok, err } from "../../shared/result";

type BrevoResponseSuccess = {
  messageIds: string[];
};

const createBrevoRequest = async (
  config: BrevoConfig,
  payload: object,
  sandbox?: boolean,
): Promise<Response | undefined> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const headers: Record<string, string> = {
        "api-key": config.apiKey,
        "content-type": "application/json",
        accept: "application/json",
      };

      if (sandbox) {
        headers["X-Sib-Sandbox"] = "drop";
      }

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      return response;
    } catch (error) {
      lastError = error;
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }

  console.error("Brevo email send error:", lastError);
  return undefined;
};

export const sendBrevoTemplate = async (params: {
  flow: EmailFlow;
  to: { email: string; name?: string };
  params?: Record<string, string>;
  tags?: string[];
  sandbox?: boolean;
}): Promise<Result<BrevoResponseSuccess, EmailSendError>> => {
  const config = getBrevoConfig();
  const { flow, to, params: emailParams, tags, sandbox } = params;

  const { subject, htmlContent } = renderEmailHtml(flow, emailParams ?? {}, config.appName);

  const payload = {
    sender: config.sender,
    replyTo: config.replyTo,
    to: [to],
    subject,
    htmlContent,
    tags,
  };

  try {
    const response = await createBrevoRequest(config, payload, sandbox);

    if (!response) {
      return err({ code: "email_send_failed", flow, reason: "network_error" });
    }

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { message?: string };
      return err({
        code: "email_send_failed",
        flow,
        status: response.status,
        reason: errorData.message ?? response.statusText,
      });
    }

    const data = (await response.json()) as { messageIds: string[] };
    return ok({ messageIds: data.messageIds ?? [] });
  } catch (error) {
    console.error("Brevo email send error:", error);
    return err({ code: "email_send_failed", flow, reason: "network_error" });
  }
};
