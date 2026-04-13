import { type Result, ok, err } from "../../../shared/result";
import { type BrevoConfig, getBrevoConfig } from "../config";

type BrevoTemplate = {
  id: number;
  name: string;
  subject: string;
  isActive: boolean;
  htmlContent: string;
  sender: { email: string; name: string };
  replyTo?: string;
  tag?: string;
  toField?: string;
  createdAt: string;
  modifiedAt: string;
};

type BrevoTemplateListResponse = {
  count: number;
  templates: Omit<BrevoTemplate, "htmlContent">[];
};

type BrevoTemplateDetailResponse = BrevoTemplate;

type BrevoTemplateError = {
  code: string;
  message: string;
};

type BrevoTemplateErrorResponse = {
  code: string;
  message: string;
};

const TEMPLATES_CACHE_TTL = 5 * 60 * 1000;

let templatesCache: {
  data: Map<string, number>;
  timestamp: number;
} | null = null;

const isTemplateErrorResponse = (value: unknown): value is BrevoTemplateErrorResponse => {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value &&
    typeof (value as Record<string, unknown>).code === "string" &&
    typeof (value as Record<string, unknown>).message === "string"
  );
};

const parseBrevoError = (value: unknown): BrevoTemplateError | null => {
  if (isTemplateErrorResponse(value)) {
    return value;
  }
  return null;
};

const fetchBrevo = async <T>(
  path: string,
  config: BrevoConfig,
  options: {
    method?: string;
    body?: object;
  } = {},
): Promise<Result<T, { code: string; message: string }>> => {
  const headers: Record<string, string> = {
    "api-key": config.apiKey,
    accept: "application/json",
  };

  if (options.body) {
    headers["content-type"] = "application/json";
  }

  try {
    const response = await fetch(`https://api.brevo.com/v3${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = parseBrevoError(data);
      if (error) {
        return err(error);
      }
      return err({
        code: "unknown_error",
        message: response.statusText,
      });
    }

    return ok(data as T);
  } catch (error) {
    return err({
      code: "network_error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const listTemplates = async (): Promise<
  Result<
    { count: number; templates: Omit<BrevoTemplate, "htmlContent">[] },
    { code: string; message: string }
  >
> => {
  const config = getBrevoConfig();
  return fetchBrevo<BrevoTemplateListResponse>(`/smtp/templates?limit=100`, config);
};

export const getTemplateByName = async (
  name: string,
): Promise<Result<BrevoTemplate, { code: string; message: string }>> => {
  const config = getBrevoConfig();

  const result = await fetchBrevo<BrevoTemplateDetailResponse>(`/smtp/templates/${name}`, config);

  if (!result.ok) {
    if (result.error.code === "document_not_found") {
      return err({ code: "template_not_found", message: `Template "${name}" not found` });
    }
    return err(result.error);
  }

  return ok(result.value);
};

export const getTemplateIdByFlow = async (
  flow: string,
): Promise<Result<number, { code: string; message: string }>> => {
  const now = Date.now();

  if (templatesCache && now - templatesCache.timestamp < TEMPLATES_CACHE_TTL) {
    const cachedId = templatesCache.data.get(flow);
    if (cachedId !== undefined) {
      return ok(cachedId);
    }
  }

  const result = await getTemplateByName(flow);

  if (!result.ok) {
    return err({
      code: "template_not_found",
      message: `Template for flow "${flow}" not found. Create it in Brevo or run template sync.`,
    });
  }

  if (!result.value.isActive) {
    return err({
      code: "template_inactive",
      message: `Template "${flow}" exists but is not active`,
    });
  }

  const templateId = result.value.id;

  if (!templatesCache) {
    templatesCache = { data: new Map(), timestamp: now };
  }
  templatesCache.data.set(flow, templateId);
  templatesCache.timestamp = now;

  return ok(templateId);
};

export const createTemplate = async (params: {
  name: string;
  subject: string;
  htmlContent: string;
  isActive?: boolean;
  tag?: string;
  replyTo?: string;
}): Promise<Result<{ id: number }, { code: string; message: string }>> => {
  const config = getBrevoConfig();

  const result = await fetchBrevo<{ id: number }>("/smtp/templates", config, {
    method: "POST",
    body: {
      templateName: params.name,
      subject: params.subject,
      htmlContent: params.htmlContent,
      sender: config.sender,
      isActive: params.isActive ?? true,
      tag: params.tag,
      replyTo: params.replyTo ?? config.replyTo?.email,
    },
  });

  return result;
};

export const updateTemplate = async (
  nameOrId: string | number,
  params: {
    subject?: string;
    htmlContent?: string;
    isActive?: boolean;
    tag?: string;
  },
): Promise<Result<{ id: number }, { code: string; message: string }>> => {
  const config = getBrevoConfig();
  const identifier = typeof nameOrId === "number" ? nameOrId : nameOrId;

  const result = await fetchBrevo<{ id: number }>(`/smtp/templates/${identifier}`, config, {
    method: "PUT",
    body: {
      ...(params.subject && { subject: params.subject }),
      ...(params.htmlContent && { htmlContent: params.htmlContent }),
      ...(params.isActive !== undefined && { isActive: params.isActive }),
      ...(params.tag && { tag: params.tag }),
    },
  });

  return result;
};

export const deleteTemplate = async (
  identifier: string | number,
): Promise<Result<void, { code: string; message: string }>> => {
  const config = getBrevoConfig();

  const result = await fetchBrevo<{ id: number }>(`/smtp/templates/${identifier}`, config, {
    method: "DELETE",
  });

  if (!result.ok) {
    return err(result.error);
  }

  return ok(undefined);
};

export const sendTestTemplate = async (
  templateId: number,
  email: string,
): Promise<Result<void, { code: string; message: string }>> => {
  const config = getBrevoConfig();

  const result = await fetchBrevo<{ messageId: string }>(
    `/smtp/templates/${templateId}/sendTest`,
    config,
    {
      method: "POST",
      body: {
        emailTo: email,
      },
    },
  );

  if (!result.ok) {
    return err(result.error);
  }

  return ok(undefined);
};

export const previewTemplate = async (
  templateId: number,
  params?: Record<string, string>,
): Promise<Result<string, { code: string; message: string }>> => {
  const config = getBrevoConfig();

  const result = await fetchBrevo<{ htmlContent: string }>(`/smtp/template/preview`, config, {
    method: "POST",
    body: {
      templateId,
      ...(params && { params }),
    },
  });

  if (!result.ok) {
    return err(result.error);
  }

  return ok(result.value.htmlContent);
};

export const clearTemplateCache = (): void => {
  templatesCache = null;
};

const REQUIRED_TEMPLATE_SUBJECTS: Record<string, string> = {
  email_verification: "Verify your email",
  password_reset: "Reset your password",
  magic_link: "Sign in to your account",
  invitation: "You're invited to join",
  welcome: "Welcome",
};

const DEFAULT_HTML_TEMPLATE = (appName: string, subject: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #fff; padding: 30px; border-radius: 8px;">
    <h1 style="color: #333; margin-bottom: 20px;">{{subject}}</h1>
    <p style="color: #666; line-height: 1.6;">{{content}}</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
      <p>This email was sent by ${appName}</p>
    </div>
  </div>
</body>
</html>
`;

export const syncRequiredTemplates = async (): Promise<
  Result<
    { created: string[]; existing: string[]; errors: string[] },
    { code: string; message: string }
  >
> => {
  const config = getBrevoConfig();

  const listResult = await listTemplates();
  if (!listResult.ok) {
    return err(listResult.error);
  }

  const existingTemplates = new Map<string, number>();
  for (const template of listResult.value.templates) {
    existingTemplates.set(template.name, template.id);
  }

  const created: string[] = [];
  const errors: string[] = [];

  for (const [flow, subject] of Object.entries(REQUIRED_TEMPLATE_SUBJECTS)) {
    if (existingTemplates.has(flow)) {
      continue;
    }

    const createResult = await createTemplate({
      name: flow,
      subject,
      htmlContent: DEFAULT_HTML_TEMPLATE(config.appName, subject),
      isActive: true,
      tag: flow,
    });

    if (!createResult.ok) {
      errors.push(`${flow}: ${createResult.error.message}`);
      continue;
    }

    created.push(flow);
    existingTemplates.set(flow, createResult.value.id);
  }

  clearTemplateCache();

  const existing = Object.keys(REQUIRED_TEMPLATE_SUBJECTS).filter((flow) =>
    existingTemplates.has(flow),
  );

  return ok({ created, existing, errors });
};

export type { BrevoTemplate };
