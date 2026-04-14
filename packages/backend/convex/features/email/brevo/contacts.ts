import { type Result, ok } from "../../../shared/result";
import { getBrevoConfig } from "../config";

const fetchBrevo = async <T>(
  path: string,
  options: { method?: string; body?: object } = {},
): Promise<T> => {
  const config = getBrevoConfig();
  const headers: Record<string, string> = {
    "api-key": config.apiKey,
    "content-type": "application/json",
  };

  const response = await fetch(`https://api.brevo.com/v3${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return response.json() as Promise<T>;
};

export const ensureContactExists = async (
  email: string,
  attributes?: Record<string, string>,
): Promise<Result<{ id: number }, { code: string; message: string }>> => {
  try {
    const contact = await fetchBrevo<{ id: number }>(`/contacts/${email}`);
    return ok({ id: contact.id });
  } catch {
    // Not found, create
    const created = await fetchBrevo<{ id: number }>("/contacts", {
      method: "POST",
      body: { email, attributes: attributes ?? {} },
    });
    return ok({ id: created.id });
  }
};
