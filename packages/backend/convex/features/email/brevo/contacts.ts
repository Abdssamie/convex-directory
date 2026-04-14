import { getBrevoClient, getBrevoError } from "./client";
import { type Result, ok, err } from "../../../shared/result";
import { getBrevoConfig } from "../config";

export const ensureContactExists = async (
  email: string,
  attributes?: Record<string, string>,
): Promise<Result<{ id: number }, { code: string; message: string }>> => {
  const client = getBrevoClient(getBrevoConfig());

  try {
    const result = await client.contacts.createContact({
      email,
      attributes: attributes ?? {},
      updateEnabled: true,
    });

    if (!result?.id) {
      return err({ code: "contact_creation_failed", message: "Failed to create contact" });
    }

    return ok({ id: result.id });
  } catch (error) {
    const brevoError = getBrevoError(error, "Failed to create contact");
    return err({ code: "contact_creation_failed", message: brevoError.reason });
  }
};
