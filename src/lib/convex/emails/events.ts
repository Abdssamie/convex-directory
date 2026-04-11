import { internalMutation, internalAction, httpAction } from '../_generated/server';
import { internal } from '../_generated/api';
import { v } from 'convex/values';
import { verifyBrevoWebhookSignature, parseBrevoWebhookPayload } from './brevo';

/**
 * Brevo webhook HTTP handler — receives email delivery events.
 *
 * Configure webhook URL in Brevo dashboard:
 *   Settings → Tracking & Emails → Transactional → Webhooks
 *   URL: https://your-deployment.convex.site/brevo-webhook
 *   Events: delivered, soft_bounce, hard_bounce, spam, opened, clicks, unsubscribed
 *
 * Brevo sends one POST per event with JSON body.
 * We verify HMAC-SHA256 signature (BREVO_WEBHOOK_SECRET env var) and
 * store the event in the emailEvents table for observability.
 */
export const handleBrevoWebhook = httpAction(async (ctx, req) => {
	const body = await req.text();

	// Verify signature (skipped if BREVO_WEBHOOK_SECRET not set)
	const signature = req.headers.get('X-Brevo-Signature');
	const valid = await verifyBrevoWebhookSignature(body, signature);
	if (!valid) {
		console.error('[handleBrevoWebhook] Invalid signature — rejecting request');
		return new Response('Unauthorized', { status: 401 });
	}

	let payload: unknown;
	try {
		payload = JSON.parse(body);
	} catch {
		return new Response('Bad Request: invalid JSON', { status: 400 });
	}

	const event = parseBrevoWebhookPayload(payload);
	if (!event) {
		// Brevo can send test pings with incomplete payloads — accept silently
		console.warn('[handleBrevoWebhook] Could not parse event payload, ignoring');
		return new Response('OK', { status: 200 });
	}

	// Persist event (fire and forget from Brevo's perspective; Brevo retries on non-2xx)
	await ctx.runMutation(internal.emails.events.storeEmailEvent, { event: event.raw });

	return new Response('OK', { status: 200 });
});

/**
 * Store a Brevo webhook event in the emailEvents table.
 *
 * Called internally after webhook signature verification.
 * Handles all event types:
 * - delivered: Email reached inbox
 * - soft_bounce / hard_bounce: Delivery failure
 * - spam: Recipient marked as spam
 * - opened: Email opened (tracking pixel)
 * - clicks: Link clicked
 * - unsubscribed: Recipient unsubscribed
 * - blocked / invalid_email: Filtered before sending
 */
export const storeEmailEvent = internalMutation({
	args: {
		event: v.record(v.string(), v.any())
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const payload = args.event;
		const eventType = typeof payload.event === 'string' ? payload.event : 'unknown';
		const messageId =
			typeof payload['message-id'] === 'string'
				? payload['message-id']
				: typeof payload.messageId === 'string'
					? payload.messageId
					: '';

		if (!messageId) {
			console.warn('[storeEmailEvent] Missing messageId, ignoring event');
			return null;
		}

		console.log('[storeEmailEvent] Brevo event received:', {
			event: eventType,
			email: payload.email,
			messageId
		});

		await ctx.db.insert('emailEvents', {
			emailId: messageId,
			eventType,
			timestamp: Date.now(),
			data: payload
		});

		// Business-critical side effects per event type
		switch (eventType) {
			case 'delivered':
				// No action needed — stored for analytics
				break;

			case 'hard_bounce':
			case 'invalid_email':
				// Hard bounce: email address invalid, should be suppressed
				console.warn(`[storeEmailEvent] Hard bounce for ${payload.email} — consider suppressing`);
				break;

			case 'soft_bounce':
				// Soft bounce: temporary failure (full mailbox, etc.)
				console.warn(`[storeEmailEvent] Soft bounce for ${payload.email}: ${payload.reason}`);
				break;

			case 'spam':
				// Spam complaint: protect sender reputation
				console.warn(`[storeEmailEvent] Spam complaint from ${payload.email} — review suppression`);
				break;

			case 'unsubscribed':
				console.log(`[storeEmailEvent] Unsubscribe request from ${payload.email}`);
				break;

			default:
				// opened, clicks, blocked, error, request — stored, no extra action
				break;
		}

		return null;
	}
});

/**
 * Get all stored email events for a given Brevo message ID.
 * Useful for debugging and audit trails in the admin dashboard.
 */
export const getEmailEventsByMessageId = internalMutation({
	args: { messageId: v.string() },
	returns: v.null(),
	handler: async (_ctx, _args) => {
		// Placeholder — use ctx.db.query('emailEvents').withIndex('by_email_id') in queries
		return null;
	}
});

/** Purge email events older than N days (for data hygiene). Bounded by index. */
export const purgeOldEmailEvents = internalAction({
	args: { olderThanDays: v.optional(v.number()) },
	returns: v.null(),
	handler: async (ctx, args) => {
		const days = args.olderThanDays ?? 90;
		const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

		// Use mutation for actual delete so it's transactional
		const _deletedCount = (await ctx.runMutation(internal.emails.events.deleteOldEventsBefore, {
			cutoff
		})) as number;
		return null;
	}
});

export const deleteOldEventsBefore = internalMutation({
	args: { cutoff: v.number() },
	returns: v.number(),
	handler: async (ctx, args) => {
		// Bounded by timestamp index, paginated to stay within mutation limits
		const old = await ctx.db
			.query('emailEvents')
			.withIndex('by_timestamp', (q) => q.lt('timestamp', args.cutoff))
			.take(500);

		for (const row of old) {
			await ctx.db.delete(row._id);
		}

		return old.length;
	}
});
