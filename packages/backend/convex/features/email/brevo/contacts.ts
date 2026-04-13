import { type Result, ok, err } from "../../../shared/result";
import { getBrevoConfig, type BrevoConfig } from "../config";

type BrevoContact = {
  id: number;
  email: string;
  attributes?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

type CreateContactRequest = {
  email: string;
  attributes?: Record<string, string>;
};

type CreateContactResponse = {
  id: number;
};

type ContactError = {
  code: string;
  message: string;
};

const isContactError = (value: unknown): value is ContactError => {
  return typeof value === "object" && value !== null && "code" in value && "message" in value;
};

const fetchBrevoContact = async <T>(
  path: string,
  config: BrevoConfig,
  options: {
    method?: string;
    body?: object;
  } = {},
): Promise<Result<T, ContactError>> => {
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
      if (isContactError(data)) {
        if (data.code === "duplicate") {
          return err({ code: "contact_exists", message: data.message });
        }
        return err(data);
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

export const createOrUpdateContact = async (
  params: CreateContactRequest,
): Promise<Result<{ id: number; created: boolean }, ContactError>> => {
  const config = getBrevoConfig();

  const result = await fetchBrevoContact<CreateContactResponse>("/contacts", config, {
    method: "POST",
    body: {
      email: params.email,
      attributes: params.attributes ?? {},
    },
  });

  if (!result.ok) {
    if (result.error.code === "contact_exists") {
      const updateResult = await fetchBrevoContact<CreateContactResponse>(
        `/contacts/${params.email}`,
        config,
        {
          method: "PUT",
          body: {
            attributes: params.attributes ?? {},
          },
        },
      );

      if (!updateResult.ok) {
        return err(updateResult.error);
      }

      return ok({ id: updateResult.value.id, created: false });
    }
    return err(result.error);
  }

  return ok({ id: result.value.id, created: true });
};

export const getContact = async (email: string): Promise<Result<BrevoContact, ContactError>> => {
  const config = getBrevoConfig();

  return fetchBrevoContact<BrevoContact>(`/contacts/${email}`, config);
};

export const ensureContactExists = async (
  email: string,
  attributes?: Record<string, string>,
): Promise<Result<{ id: number }, ContactError>> => {
  const contactResult = await getContact(email);

  if (contactResult.ok) {
    return ok({ id: contactResult.value.id });
  }

  const createResult = await createOrUpdateContact({ email, attributes });

  if (!createResult.ok) {
    return err(createResult.error);
  }

  return ok({ id: createResult.value.id });
};

export const deleteContact = async (email: string): Promise<Result<void, ContactError>> => {
  const config = getBrevoConfig();

  const result = await fetchBrevoContact<{ id: number }>(`/contacts/${email}`, config, {
    method: "DELETE",
  });

  if (!result.ok) {
    return err(result.error);
  }

  return ok(undefined);
};
