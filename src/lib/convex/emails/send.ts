import { internalAction, internalQuery, internalMutation } from '../_generated/server';
import { v } from 'convex/values';
import { components, internal } from '../_generated/api';
import { sendBrevoEmail } from './brevo';
import {
	renderVerificationEmail,
	renderPasswordResetEmail,
	renderAdminReplyNotificationEmail,
	renderNewTicketAdminNotificationEmail,
	renderNewUserSignupNotificationEmail
} from './templates';
import { requireEnv } from '../env';
import type { NotificationMessage } from '../../emails/templates/types';
import { t, getValidLocale, type SupportedLocale } from '../i18n/translations';
import type { GenericActionCtx } from 'convex/server';
import type { DataModel } from '../_generated/dataModel';
import { shouldSkipTestEmail } from './helpers';

/** Type for user result from Better Auth adapter with optional locale field */
type UserWithLocale = { locale?: string | null } | null;

/**
 * Look up a user's locale preference by email address.
 * Falls back to default locale if user not found or locale not set.
 */
async function getLocaleForEmail(
	ctx: GenericActionCtx<DataModel>,
	email: string
): Promise<SupportedLocale> {
	const result = await ctx.runQuery(components.betterAuth.adapter.findOne, {
		model: 'user',
		where: [{ field: 'email', operator: 'eq', value: email }]
	});
	return getValidLocale((result as UserWithLocale)?.locale);
}

/**
 * Send verification email with verification link
 *
 * Uses pre-rendered HTML templates with template placeholders for dynamic content.
 * Looks up user's locale preference for translated subject.
 */
export const sendVerificationEmail = internalAction({
	args: {
		email: v.string(),
		verificationUrl: v.string(),
		expiryMinutes: v.optional(v.number())
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const { email, verificationUrl, expiryMinutes = 20 } = args;

		if (shouldSkipTestEmail('sendVerificationEmail', email)) return null;

		const locale = await getLocaleForEmail(ctx, email);
		const { html, text } = renderVerificationEmail(verificationUrl, expiryMinutes);

		const result = await sendBrevoEmail({
			to: email,
			subject: t(locale, 'email.subject.verify'),
			htmlContent: html,
			textContent: text,
			headers: {
				'X-Email-Category': 'authentication',
				'X-Email-Template': 'verification'
			}
		});

		if (!result.ok) {
			console.error(`[sendVerificationEmail] Failed to send to ${email}:`, result.error);
		}
		return null;
	}
});

/**
 * Send password reset email with reset link
 *
 * Uses pre-rendered HTML templates with template placeholders for dynamic content.
 * Looks up user's locale preference for translated subject.
 */
export const sendResetPasswordEmail = internalAction({
	args: {
		email: v.string(),
		resetUrl: v.string(),
		userName: v.optional(v.string())
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const { email, resetUrl, userName } = args;

		if (shouldSkipTestEmail('sendResetPasswordEmail', email)) return null;

		const locale = await getLocaleForEmail(ctx, email);
		const { html, text } = renderPasswordResetEmail(resetUrl, userName);

		const result = await sendBrevoEmail({
			to: email,
			subject: t(locale, 'email.subject.reset_password'),
			htmlContent: html,
			textContent: text,
			headers: {
				'X-Email-Category': 'authentication',
				'X-Email-Template': 'password-reset'
			}
		});

		if (!result.ok) {
			console.error(`[sendResetPasswordEmail] Failed to send to ${email}:`, result.error);
		}
		return null;
	}
});

/**
 * Send notification email when admin replies to a support thread
 *
 * Called when an admin responds to a user's support request.
 * Uses pre-rendered HTML templates with template placeholders for dynamic content.
 * Looks up user's locale preference for translated subject.
 */
export const sendAdminReplyNotification = internalAction({
	args: {
		email: v.string(),
		adminName: v.string(),
		messagePreview: v.string(),
		threadId: v.string(),
		pageUrl: v.optional(v.string())
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const { email, adminName, messagePreview, threadId, pageUrl } = args;

		if (shouldSkipTestEmail('sendAdminReplyNotification', email)) return null;

		const locale = await getLocaleForEmail(ctx, email);
		const siteUrl = requireEnv('SITE_URL');

		// Build deep link that opens the support widget to this thread
		// Strip any existing support/thread params to avoid duplicates
		const url = new URL(pageUrl || siteUrl);
		url.searchParams.delete('support');
		url.searchParams.delete('thread');
		url.searchParams.set('support', 'open');
		url.searchParams.set('thread', threadId);
		const deepLink = url.toString();

		const { html, text } = renderAdminReplyNotificationEmail(adminName, messagePreview, deepLink);

		const result = await sendBrevoEmail({
			to: email,
			subject: t(locale, 'email.subject.support_reply'),
			htmlContent: html,
			textContent: text,
			headers: {
				'X-Email-Category': 'support',
				'X-Email-Template': 'admin-reply',
				'X-Thread-ID': threadId
			}
		});

		if (!result.ok) {
			console.error(`[sendAdminReplyNotification] Failed to send to ${email}:`, result.error);
		}
		return null;
	}
});

/**
 * Send notification email to admin when a new ticket is created or reopened
 *
 * Called after the debounce period expires when a user creates a new ticket
 * or sends a message to a previously closed ticket.
 *
 * Uses pre-rendered HTML templates with template placeholders for dynamic content.
 * Looks up admin's locale preference for translated subject.
 */
export const sendNewTicketAdminNotification = internalAction({
	args: {
		email: v.string(),
		isReopen: v.boolean(),
		userName: v.string(),
		messages: v.array(
			v.object({
				text: v.string(),
				timestamp: v.string()
			})
		),
		threadId: v.string()
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const { email, isReopen, userName, messages, threadId } = args;
		const siteUrl = requireEnv('SITE_URL');
		const locale = await getLocaleForEmail(ctx, email);

		// Build admin dashboard link for this thread
		const adminDashboardLink = `${siteUrl}/admin/support?thread=${threadId}`;

		const { html, text } = renderNewTicketAdminNotificationEmail(
			{
				isReopen,
				userName,
				messages: messages as NotificationMessage[],
				adminDashboardLink
			},
			locale
		);

		const subject = isReopen
			? t(locale, 'email.subject.ticket_reopened', { userName })
			: t(locale, 'email.subject.ticket_new', { userName });

		const result = await sendBrevoEmail({
			to: email,
			subject,
			htmlContent: html,
			textContent: text,
			headers: {
				'X-Email-Category': 'support-admin',
				'X-Email-Template': isReopen ? 'ticket-reopened' : 'new-ticket',
				'X-Thread-ID': threadId
			}
		});

		if (!result.ok) {
			// Re-throw so the caller (sendPendingAdminNotification action) can handle retry logic
			throw new Error(
				`[sendNewTicketAdminNotification] Failed to send to ${email}: ${result.error}`
			);
		}
		return null;
	}
});

/**
 * Send notification email to recipients when a new user signs up
 *
 * Called by auth trigger when a new user is created.
 * Sends to all recipients with new signup notifications enabled (admins + custom emails).
 *
 * Uses pre-rendered HTML templates with template placeholders for dynamic content.
 */
export const sendNewUserSignupNotification = internalAction({
	args: {
		userName: v.optional(v.string()),
		userEmail: v.string(),
		signupMethod: v.union(v.literal('Email'), v.literal('Google'), v.literal('GitHub')),
		signupTime: v.string()
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const { userName, userEmail, signupMethod, signupTime } = args;

		if (shouldSkipTestEmail('sendNewUserSignupNotification', userEmail)) return null;

		const siteUrl = requireEnv('SITE_URL');

		// Get recipients who have new signup notifications enabled
		const recipients = await ctx.runQuery(
			internal.admin.notificationPreferences.queries.getRecipientsForNotificationType,
			{ type: 'newSignups' }
		);

		if (recipients.length === 0) {
			console.log('[sendNewUserSignupNotification] No recipients configured, skipping');
			return null;
		}

		// Build admin dashboard link with search for this user
		const adminDashboardLink = `${siteUrl}/admin/users?search=${encodeURIComponent(userEmail)}`;

		const { html, text } = renderNewUserSignupNotificationEmail({
			userName: userName || 'New User',
			userEmail,
			signupMethod,
			signupTime,
			adminDashboardLink
		});

		// Send to each recipient individually
		let sentCount = 0;
		for (const email of recipients) {
			try {
				const result = await sendBrevoEmail({
					to: email,
					subject: `New user signup: ${userEmail}`,
					htmlContent: html,
					textContent: text,
					headers: {
						'X-Email-Category': 'stats',
						'X-Email-Template': 'new-user-signup'
					}
				});

				if (result.ok) {
					sentCount++;
				} else {
					console.error(
						`[sendNewUserSignupNotification] Failed to send to ${email}:`,
						result.error
					);
				}
			} catch (error) {
				console.error(
					`[sendNewUserSignupNotification] Exception sending to ${email}:`,
					error instanceof Error ? error.message : error
				);
			}
		}

		if (sentCount > 0) {
			console.log(
				`[sendNewUserSignupNotification] Sent notification for ${userEmail} to ${sentCount}/${recipients.length} recipient(s)`
			);
		} else if (recipients.length > 0) {
			console.error(
				`[sendNewUserSignupNotification] All ${recipients.length} email sends failed for new user ${userEmail}`
			);
		}
		return null;
	}
});

/**
 * Send founder welcome email to a new user
 *
 * Reads config from adminSettings at send time (not at schedule time)
 * to ensure the latest config is used. Sends plain text only.
 */
export const sendFounderWelcomeEmail = internalAction({
	args: { founderWelcomeId: v.id('founderWelcomeEmails') },
	returns: v.null(),
	handler: async (ctx, { founderWelcomeId }) => {
		// Fetch the row (action cannot directly access ctx.db)
		const row = await ctx.runQuery(internal.emails.send.getFounderWelcomeRow, { founderWelcomeId });
		if (!row || row.status !== 'scheduled') return null;

		// Read config at send time
		const config = await ctx.runQuery(
			internal.admin.founderWelcome.queries.getFounderWelcomeConfigInternal,
			{}
		);
		if (!config.enabled) {
			await ctx.runMutation(internal.emails.send.patchFounderWelcomeStatus, {
				founderWelcomeId,
				status: 'skipped',
				skippedReason: 'feature_disabled'
			});
			return null;
		}

		// Resolve current user
		const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
			model: 'user',
			where: [{ field: '_id', operator: 'eq', value: row.userId }]
		});
		if (!user) {
			await ctx.runMutation(internal.emails.send.patchFounderWelcomeStatus, {
				founderWelcomeId,
				status: 'skipped',
				skippedReason: 'user_deleted'
			});
			return null;
		}

		const { email, name, emailVerified } = user as {
			email: string;
			name?: string;
			emailVerified?: boolean;
		};

		// Guards
		if (!emailVerified) {
			await ctx.runMutation(internal.emails.send.patchFounderWelcomeStatus, {
				founderWelcomeId,
				status: 'skipped',
				skippedReason: 'not_verified'
			});
			return null;
		}
		if (email !== row.signupEmail) {
			await ctx.runMutation(internal.emails.send.patchFounderWelcomeStatus, {
				founderWelcomeId,
				status: 'skipped',
				skippedReason: 'email_changed'
			});
			return null;
		}
		if (shouldSkipTestEmail('sendFounderWelcomeEmail', email)) {
			await ctx.runMutation(internal.emails.send.patchFounderWelcomeStatus, {
				founderWelcomeId,
				status: 'skipped',
				skippedReason: 'test_email'
			});
			return null;
		}

		// Guard against empty config (subject/body required for a valid email)
		if (!config.subject.trim() || !config.body.trim()) {
			await ctx.runMutation(internal.emails.send.patchFounderWelcomeStatus, {
				founderWelcomeId,
				status: 'skipped',
				skippedReason: 'empty_template'
			});
			return null;
		}

		// Render plain text with {{placeholder}} interpolation
		const parts = (name?.trim() || 'there').split(/\s+/);
		const templateVars: Record<string, string> = {
			userFirstName: parts[0] ?? '',
			userLastName: parts.slice(1).join(' '),
			founderName: config.name,
			founderTitle: config.title
		};

		const renderTemplate = (template: string) =>
			template.replace(/\{\{(\w+)\}\}/g, (_, key) => templateVars[key] ?? '');

		const textContent = renderTemplate(config.body);
		const subject = renderTemplate(config.subject);

		const result = await sendBrevoEmail({
			to: email,
			subject,
			// Founder welcome is plain text only — Brevo requires htmlContent so we wrap
			htmlContent: `<pre style="font-family:inherit;white-space:pre-wrap">${textContent}</pre>`,
			textContent,
			replyTo: config.replyTo || undefined,
			headers: {
				'X-Email-Category': 'onboarding',
				'X-Email-Template': 'founder-welcome'
			}
		});

		if (!result.ok) {
			console.error(`[sendFounderWelcomeEmail] Failed to send to ${email}:`, result.error);
			// Status stays 'scheduled' — admin can see it didn't go out
			return null;
		}

		await ctx.runMutation(internal.emails.send.patchFounderWelcomeStatus, {
			founderWelcomeId,
			status: 'sent',
			sentAt: Date.now()
		});
		return null;
	}
});

// ---------------------------------------------------------------------------
// Internal helpers for sendFounderWelcomeEmail (action cannot access ctx.db)
// ---------------------------------------------------------------------------

/** Fetches a founderWelcomeEmails row by ID for use in the action above. */
export const getFounderWelcomeRow = internalQuery({
	args: { founderWelcomeId: v.id('founderWelcomeEmails') },
	returns: v.union(
		v.object({
			userId: v.string(),
			signupEmail: v.string(),
			status: v.union(
				v.literal('pending_verification'),
				v.literal('scheduled'),
				v.literal('sent'),
				v.literal('skipped')
			)
		}),
		v.null()
	),
	handler: async (ctx, { founderWelcomeId }) => {
		const row = await ctx.db.get(founderWelcomeId);
		if (!row) return null;
		return { userId: row.userId, signupEmail: row.signupEmail, status: row.status };
	}
});

/** Patches status (and optional sentAt) on a founderWelcomeEmails row. */
export const patchFounderWelcomeStatus = internalMutation({
	args: {
		founderWelcomeId: v.id('founderWelcomeEmails'),
		status: v.union(
			v.literal('pending_verification'),
			v.literal('scheduled'),
			v.literal('sent'),
			v.literal('skipped')
		),
		skippedReason: v.optional(v.string()),
		sentAt: v.optional(v.number())
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const { founderWelcomeId, status, skippedReason, sentAt } = args;
		await ctx.db.patch(founderWelcomeId, {
			status,
			...(skippedReason !== undefined ? { skippedReason } : {}),
			...(sentAt !== undefined ? { sentAt } : {})
		});
		return null;
	}
});
