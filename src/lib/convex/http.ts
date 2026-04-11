import { httpRouter } from 'convex/server';
import { authComponent, createAuth } from './auth';

const http = httpRouter();

// Better Auth routes
authComponent.registerRoutes(http, createAuth);

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
