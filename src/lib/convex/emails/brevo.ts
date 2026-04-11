/**
 * Brevo transactional email client
 *
 * Direct HTTP integration — no SDK, runs in Convex actions.
 * Docs: https://developers.brevo.com/reference/sendtransacemail
 *
 * Environment Variables (set via: bunx convex env set KEY value):
 * - BREVO_API_KEY: Brevo API key (required)
 * - BREVO_SENDER_NAME: Display name for sender (required)
 * - BREVO_SENDER_EMAIL: Sender email address (required)
 * - BREVO_REPLY_TO_EMAIL: Reply-to address (optional)
 * - BREVO_WEBHOOK_SECRET: Webhook HMAC secret for event verification (optional)
 */

import { requireEnv } from '../env';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BrevoSendParams = {
	to: string;
	subject: string;
	htmlContent: string;
	textContent?: string;
	replyTo?: string;
	headers?: Record<string, string>;
};

export type BrevoSendResult =
	| { ok: true; messageId: string }
	| { ok: false; status: number; error: string };

/** Brevo webhook event types */
export type BrevoEventType =
	| 'request'
	| 'delivered'
	| 'soft_bounce'
	| 'hard_bounce'
	| 'invalid_email'
	| 'deferred'
	| 'opened'
	| 'clicks'
	| 'spam'
	| 'unsubscribed'
	| 'blocked'
	| 'error';

/** Parsed Brevo webhook event */
export type BrevoWebhookEvent = {
	event: BrevoEventType;
	email: string;
	messageId: string; // Brevo's "message-id" header value
	date: string; // ISO timestamp
	subject?: string;
	tag?: string;
	ip?: string;
	// Raw payload stored for analytics
	raw: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type BrevoSendPayload = {
	sender: { name: string; email: string };
	to: { email: string }[];
	subject: string;
	htmlContent: string;
	textContent?: string;
	replyTo?: { email: string };
	headers?: Record<string, string>;
};

const parseResponseBody = (value: unknown): { messageId?: string; message?: string } => {
	if (typeof value !== 'object' || value === null) return {};
	const v = value as Record<string, unknown>;
	return {
		messageId: typeof v.messageId === 'string' ? v.messageId : undefined,
		message: typeof v.message === 'string' ? v.message : undefined
	};
};

/**
 * Low-level fetch against Brevo SMTP API with exponential backoff retry for 5xx.
 * Returns raw Response on success or client error (4xx).
 * Throws on network failure after all retries.
 */
async function fetchBrevo(
	apiKey: string,
	payload: BrevoSendPayload,
	maxRetries = 3
): Promise<Response> {
	let lastError: unknown;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			const response = await fetch('https://api.brevo.com/v3/smtp/email', {
				method: 'POST',
				headers: {
					'api-key': apiKey,
					'content-type': 'application/json',
					accept: 'application/json'
				},
				body: JSON.stringify(payload)
			});

			// Success or client error (4xx) → return immediately, caller decides
			if (response.ok || (response.status >= 400 && response.status < 500)) {
				return response;
			}

			// 5xx → retry
			throw new Error(`Brevo server error: ${response.status}`);
		} catch (error) {
			lastError = error;
			if (attempt === maxRetries) break;
			// Exponential backoff: 1s, 2s, 4s
			await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
		}
	}

	throw lastError;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send a transactional email via Brevo.
 *
 * Must be called from a Convex `internalAction` (not a mutation).
 * Reads sender config from environment at call time.
 */
export async function sendBrevoEmail(params: BrevoSendParams): Promise<BrevoSendResult> {
	const apiKey = requireEnv('BREVO_API_KEY');
	const senderName = requireEnv('BREVO_SENDER_NAME');
	const senderEmail = requireEnv('BREVO_SENDER_EMAIL');
	const replyToEmail = process.env.BREVO_REPLY_TO_EMAIL;

	const payload: BrevoSendPayload = {
		sender: { name: senderName, email: senderEmail },
		to: [{ email: params.to }],
		subject: params.subject,
		htmlContent: params.htmlContent,
		...(params.textContent ? { textContent: params.textContent } : {}),
		replyTo: params.replyTo
			? { email: params.replyTo }
			: replyToEmail
				? { email: replyToEmail }
				: undefined,
		...(params.headers ? { headers: params.headers } : {})
	};

	try {
		const response = await fetchBrevo(apiKey, payload);
		const body = parseResponseBody(await response.json().catch(() => ({})));

		if (response.ok) {
			return { ok: true, messageId: body.messageId ?? '' };
		}

		return {
			ok: false,
			status: response.status,
			error: body.message ?? response.statusText
		};
	} catch (error) {
		console.error('[sendBrevoEmail] Unexpected error:', error);
		return {
			ok: false,
			status: 0,
			error: error instanceof Error ? error.message : 'network_error'
		};
	}
}

// ---------------------------------------------------------------------------
// Webhook verification
// ---------------------------------------------------------------------------

/**
 * Verify Brevo webhook HMAC-SHA256 signature.
 *
 * Brevo signs webhook payloads using the secret configured in your
 * Brevo dashboard → Settings → Tracking & Emails → Webhook.
 * The signature is sent in the `X-Brevo-Signature` header.
 *
 * If BREVO_WEBHOOK_SECRET is not set, verification is skipped (dev mode).
 * Returns true if valid, false if invalid.
 */
export async function verifyBrevoWebhookSignature(
	body: string,
	signatureHeader: string | null
): Promise<boolean> {
	const secret = process.env.BREVO_WEBHOOK_SECRET;

	// No secret configured → skip verification (dev/local mode)
	if (!secret) {
		console.warn(
			'[verifyBrevoWebhookSignature] BREVO_WEBHOOK_SECRET not set — skipping verification'
		);
		return true;
	}

	if (!signatureHeader) {
		console.warn('[verifyBrevoWebhookSignature] Missing X-Brevo-Signature header');
		return false;
	}

	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['verify']
	);

	// Brevo sends signature as hex string
	const sigBytes = new Uint8Array(
		signatureHeader.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
	);

	return await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(body));
}

/**
 * Parse Brevo webhook payload into a typed BrevoWebhookEvent.
 * Returns null if payload is missing required fields.
 */
export function parseBrevoWebhookPayload(raw: unknown): BrevoWebhookEvent | null {
	if (typeof raw !== 'object' || raw === null) return null;
	const payload = raw as Record<string, unknown>;

	const event = payload.event;
	const email = payload.email;
	const messageId =
		typeof payload['message-id'] === 'string'
			? payload['message-id']
			: typeof payload.messageId === 'string'
				? payload.messageId
				: '';
	const date = typeof payload.date === 'string' ? payload.date : new Date().toISOString();

	if (typeof event !== 'string' || typeof email !== 'string') {
		return null;
	}

	return {
		event: event as BrevoEventType,
		email,
		messageId,
		date,
		subject: typeof payload.subject === 'string' ? payload.subject : undefined,
		tag: typeof payload.tag === 'string' ? payload.tag : undefined,
		ip: typeof payload.ip === 'string' ? payload.ip : undefined,
		raw: payload
	};
}
