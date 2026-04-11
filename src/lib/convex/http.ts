import { httpRouter } from 'convex/server';
import { authComponent, createAuth } from './auth';
import { polar } from './polar';

const http = httpRouter();

// Better Auth routes
authComponent.registerRoutes(http, createAuth);

// Polar billing webhook — safe no-op without POLAR_WEBHOOK_SECRET configured
// TODO: Set POLAR_WEBHOOK_SECRET + POLAR_ORGANIZATION_TOKEN env vars when adding paid plans
polar.registerRoutes(http);

// Brevo webhook endpoint — DISABLED (not wired up yet)
// To enable: uncomment + configure in Brevo dashboard → Settings → Webhooks
// URL: https://your-deployment.convex.site/brevo-webhook
//
// import { handleBrevoWebhook } from './emails/events';
// http.route({
// 	path: '/brevo-webhook',
// 	method: 'POST',
// 	handler: handleBrevoWebhook
// });

export default http;
