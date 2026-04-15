import { httpRouter } from "convex/server";

import { authComponent, createAuth } from "./auth";
import { brevo as brevoWebhook } from "./features/email/webhooks";
import { polar } from "./polar";

const http = httpRouter();

http.route({
  path: "/webhooks/brevo",
  method: "POST",
  handler: brevoWebhook,
});

authComponent.registerRoutes(http, createAuth);
polar.registerRoutes(http as Parameters<typeof polar.registerRoutes>[0]);

export default http;
