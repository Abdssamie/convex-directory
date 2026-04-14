import { BrevoClient, BrevoError } from "@getbrevo/brevo";

import { type BrevoConfig, getBrevoConfig } from "../config";

let cachedClient: { apiKey: string; client: BrevoClient } | null = null;

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

  const body = error.body;
  const message =
    body && typeof body === "object" && "message" in body && typeof body.message === "string"
      ? body.message
      : error.message;

  return {
    reason: message || fallback,
    status: error.statusCode,
  };
};
