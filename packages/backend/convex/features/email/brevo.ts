import { type EmailFlow, type EmailSendError, getBrevoConfig } from "./config";
import { getBrevoClient, getBrevoError } from "./brevo/client";
import { renderEmailHtml } from "./templates";
import { type Result, ok, err } from "../../shared/result";

type BrevoResponseSuccess = {
  messageIds: string[];
};

export const sendBrevoTemplate = async (params: {
  flow: EmailFlow;
  to: { email: string; name?: string };
  params?: Record<string, string>;
  tags?: string[];
  sandbox?: boolean;
}): Promise<Result<BrevoResponseSuccess, EmailSendError>> => {
  const config = getBrevoConfig();
  const client = getBrevoClient(config);
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
    const data = await client.transactionalEmails.sendTransacEmail(payload, {
      headers: sandbox ? { "X-Sib-Sandbox": "drop" } : undefined,
    });

    return ok({ messageIds: data.messageId ? [data.messageId] : [] });
  } catch (error) {
    console.error("Brevo email send error:", error);
    const brevoError = getBrevoError(error, "network_error");
    return err({
      code: "email_send_failed",
      flow,
      reason: brevoError.reason,
      status: brevoError.status,
    });
  }
};
