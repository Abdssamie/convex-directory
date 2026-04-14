import { BrevoClient, BrevoError } from "@getbrevo/brevo";
import { z } from "zod";

import { type BrevoConfig, getBrevoConfig } from "../config";

let cachedClient: { apiKey: string; client: BrevoClient } | null = null;

const brevoErrorBodySchema = z.object({
  message: z.string(),
});

export const getBrevoClient = (config: BrevoConfig = getBrevoConfig()) => {
  if (cachedClient?.apiKey === config.apiKey) {
    return cachedClient.client;
  }

  const client = new BrevoClient({
    apiKey: config.apiKey,
    maxRetries: 3,
    timeoutInSeconds: 30,
  });

  cachedClient = { apiKey: config.apiKey, client };
  return client;
};

export const getBrevoError = (error: unknown, fallback: string) => {
  if (!(error instanceof BrevoError)) {
    return { reason: fallback, status: undefined };
  }

  const message = brevoErrorBodySchema.safeParse(error.body).data?.message ?? error.message;

  return {
    reason: message || fallback,
    status: error.statusCode,
  };
};
