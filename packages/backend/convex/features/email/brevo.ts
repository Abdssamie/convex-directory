import { type BrevoConfig, type EmailFlow, type EmailSendError, getBrevoConfig } from "./config";
import { getTemplateIdByFlow } from "./brevo/templates";
import { type Result, ok, err } from "../../shared/result";

type BrevoEmailPayload = {
  sender: { name: string; email: string };
  replyTo?: { name?: string; email: string };
  templateId: number;
  params?: Record<string, string>;
  tags?: string[];
  messageVersions: {
    to: { email: string; name?: string }[];
    params?: Record<string, string>;
  }[];
};

type BrevoResponseSuccess = {
  messageIds: string[];
};

type BrevoResponseBody = { message?: string; messageIds?: string[] };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseBrevoResponseBody = (value: unknown): BrevoResponseBody | null => {
  if (!isRecord(value)) return null;
  const message = typeof value.message === "string" ? value.message : undefined;
  const messageIds = Array.isArray(value.messageIds)
    ? value.messageIds.filter((item): item is string => typeof item === "string")
    : undefined;
  return { message, messageIds };
};

const parseBrevoJson = async (response: Response): Promise<BrevoResponseBody | null> => {
  try {
    return parseBrevoResponseBody(await response.json());
  } catch {
    return null;
  }
};

const createBrevoRequest = async (
  config: BrevoConfig,
  payload: BrevoEmailPayload,
  sandbox?: boolean,
  maxRetries = 3,
): Promise<Response> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
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

      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      throw new Error(`Server error: ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;

      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

export const sendBrevoTemplate = async (params: {
  flow: EmailFlow;
  to: { email: string; name?: string };
  templateId?: number;
  params?: Record<string, string>;
  tags?: string[];
  sandbox?: boolean;
}): Promise<Result<BrevoResponseSuccess, EmailSendError>> => {
  const config = getBrevoConfig();

  let templateId = params.templateId;

  if (!templateId) {
    const templateResult = await getTemplateIdByFlow(params.flow);
    if (!templateResult.ok) {
      return err({
        code: "template_not_found",
        flow: params.flow,
        templateName: params.flow,
      });
    }
    templateId = templateResult.value;
  }

  const payload: BrevoEmailPayload = {
    sender: config.sender,
    replyTo: config.replyTo,
    templateId,
    params: params.params,
    tags: params.tags,
    messageVersions: [
      {
        to: [params.to],
        params: params.params,
      },
    ],
  };

  const errorBody = (status?: number, reason?: string): EmailSendError => ({
    code: "email_send_failed",
    flow: params.flow,
    status,
    reason,
    templateId,
  });

  try {
    const response = await createBrevoRequest(config, payload, params.sandbox);

    const body = await parseBrevoJson(response);

    if (response.ok) {
      const messageIds =
        body && typeof body === "object" && "messageIds" in body ? (body.messageIds ?? []) : [];
      return ok({ messageIds });
    }

    const reason =
      body && typeof body === "object" && "message" in body
        ? String(body.message)
        : response.statusText;

    return err(errorBody(response.status, reason));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      return err(error as EmailSendError);
    }
    console.error("Brevo email send error:", error);
    return err(errorBody(undefined, "network_error"));
  }
};
