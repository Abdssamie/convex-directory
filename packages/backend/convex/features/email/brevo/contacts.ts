import { type Result, ok, err } from "../../../shared/result";
import { getBrevoConfig } from "../config";

const fetchBrevo = async <T>(
  path: string,
  options: { method?: string; body?: object } = {},
): Promise<T | undefined> => {
  const config = getBrevoConfig();
  const response = await fetch(`https://api.brevo.com/v3${path}`, {
    method: options.method ?? "GET",
    headers: {
      "api-key": config.apiKey,
      "content-type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    return undefined;
  }
  return response.json() as Promise<T>;
};

export const ensureContactExists = async (
  email: string,
  attributes?: Record<string, string>,
): Promise<Result<{ id: number }, { code: string; message: string }>> => {
  const result = await fetchBrevo<{ id: number }>("/contacts", {
    method: "POST",
    body: { email, attributes: attributes ?? {}, updateEnabled: true },
  });

  if (!result) {
    return err({ code: "contact_creation_failed", message: "Failed to create contact" });
  }

  return ok({ id: result.id });
};
