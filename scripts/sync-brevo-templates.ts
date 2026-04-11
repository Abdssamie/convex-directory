/**
 * Sync email templates to Brevo dashboard
 *
 * Creates/updates email templates in Brevo for visual preview and monitoring.
 * The actual email sending sends raw HTML directly (not using templateId),
 * so this script is purely for Brevo dashboard visibility.
 *
 * Usage:
 *   bun run sync:brevo-templates
 *   bun run sync:brevo-templates -- --dry-run
 *
 * Env vars are loaded automatically from .env.local and .env.convex.local
 * via the --env-file flags in the npm script definition.
 */

// ---------------------------------------------------------------------------
// Env helpers — bun --env-file already populated process.env
// ---------------------------------------------------------------------------
const get = (key: string): string => {
	const val = process.env[key];
	if (!val?.trim()) throw new Error(`Missing env var: ${key}. Set it in .env.local or .env.convex.local`);
	return val.trim();
};
const getOpt = (key: string): string => process.env[key]?.trim() ?? '';

// ---------------------------------------------------------------------------
// Import built templates (run `bun run build:emails` first if missing)
// ---------------------------------------------------------------------------
const {
	VERIFICATION_HTML,
	VERIFICATION_TEXT,
	PASSWORDRESET_HTML,
	PASSWORDRESET_TEXT,
	ADMINREPLYNOTIFICATION_HTML,
	ADMINREPLYNOTIFICATION_TEXT,
	NEWUSERSIGNUPNOTIFICATION_HTML,
	NEWUSERSIGNUPNOTIFICATION_TEXT,
	NEWTICKETADMINNOTIFICATION_HTML,
	NEWTICKETADMINNOTIFICATION_TEXT,
} = await import('../src/lib/convex/emails/_generated/index.js');

// ---------------------------------------------------------------------------
// Template renderer (matches templates.ts logic)
// ---------------------------------------------------------------------------
function render(template: string, data: Record<string, string | number>): string {
	return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
		const value = data[key];
		return value !== undefined ? String(value) : `{{${key}}}`;
	});
}

function escHtml(s: string): string {
	return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

// ---------------------------------------------------------------------------
// Brevo API client
// ---------------------------------------------------------------------------
const BREVO_API_BASE = 'https://api.brevo.com/v3';

async function brevoRequest(
	method: string,
	path: string,
	body?: unknown,
	apiKey?: string
): Promise<{ ok: boolean; status: number; data: unknown }> {
	const key = apiKey ?? get('BREVO_API_KEY');
	const res = await fetch(`${BREVO_API_BASE}${path}`, {
		method,
		headers: {
			'api-key': key,
			'content-type': 'application/json',
			accept: 'application/json',
		},
		body: body ? JSON.stringify(body) : undefined,
	});
	const data = await res.json().catch(() => ({}));
	return { ok: res.ok, status: res.status, data };
}

// Get all existing templates (Brevo paginates, get first 50 — more than enough)
async function listTemplates(): Promise<Array<{ id: number; name: string; isActive: boolean }>> {
	const res = await brevoRequest('GET', '/smtp/templates?templateStatus=true&limit=50');
	const inactive = await brevoRequest('GET', '/smtp/templates?templateStatus=false&limit=50');
	const activeTemplates = (res.data as { templates?: Array<{ id: number; name: string; isActive: boolean }> })?.templates ?? [];
	const inactiveTemplates = (inactive.data as { templates?: Array<{ id: number; name: string; isActive: boolean }> })?.templates ?? [];
	return [...activeTemplates, ...inactiveTemplates];
}

async function createTemplate(payload: Record<string, unknown>): Promise<number | null> {
	const res = await brevoRequest('POST', '/smtp/templates', payload);
	if (res.ok) {
		return (res.data as { id: number }).id ?? null;
	}
	console.error(`  Failed to create: HTTP ${res.status}`, res.data);
	return null;
}

async function updateTemplate(id: number, payload: Record<string, unknown>): Promise<boolean> {
	const res = await brevoRequest('PUT', `/smtp/templates/${id}`, payload);
	return res.ok || res.status === 204;
}

// ---------------------------------------------------------------------------
// Template definitions
// ---------------------------------------------------------------------------
type TemplateSpec = {
	name: string;
	subject: string;
	htmlContent: string;
	textContent: string;
};

function buildTemplates(baseUrl: string, senderEmail: string, senderName: string): TemplateSpec[] {
	const exampleUrl = `https://example.com/verify?token=example-token-123`;
	const exampleReset = `https://example.com/reset?token=example-token-456`;
	const exampleDeepLink = `https://example.com?support=open&thread=thread123`;
	const exampleAdmin = `https://example.com/admin/support?thread=thread123`;

	return [
		{
			name: 'SaaS — Email Verification',
			subject: 'Verify your email address',
			htmlContent: render(VERIFICATION_HTML, {
				verificationUrl: escHtml(exampleUrl),
				expiryMinutes: 20,
				baseUrl: escHtml(baseUrl),
			}),
			textContent: render(VERIFICATION_TEXT, {
				verificationUrl: exampleUrl,
				expiryMinutes: 20,
				baseUrl,
			}),
		},
		{
			name: 'SaaS — Password Reset',
			subject: 'Reset your password',
			htmlContent: render(PASSWORDRESET_HTML, {
				resetUrl: escHtml(exampleReset),
				userName: escHtml('John'),
				baseUrl: escHtml(baseUrl),
			}),
			textContent: render(PASSWORDRESET_TEXT, {
				resetUrl: exampleReset,
				userName: 'John',
				baseUrl,
			}),
		},
		{
			name: 'SaaS — Admin Reply Notification',
			subject: 'New reply to your support request',
			htmlContent: render(ADMINREPLYNOTIFICATION_HTML, {
				adminName: escHtml('Alex (Support)'),
				messagePreview: escHtml('Thanks for reaching out! I\'ve reviewed your issue and wanted to follow up.'),
				deepLink: escHtml(exampleDeepLink),
				baseUrl: escHtml(baseUrl),
			}),
			textContent: render(ADMINREPLYNOTIFICATION_TEXT, {
				adminName: 'Alex (Support)',
				messagePreview: 'Thanks for reaching out! I\'ve reviewed your issue and wanted to follow up.',
				deepLink: exampleDeepLink,
				baseUrl,
			}),
		},
		{
			name: 'SaaS — New Support Ticket (Admin)',
			subject: 'New support ticket: John Doe',
			htmlContent: render(NEWTICKETADMINNOTIFICATION_HTML, {
				titleText: escHtml('New Support Ticket'),
				descriptionText: escHtml('John Doe started a new support conversation.'),
				previewText: escHtml('New ticket from John Doe'),
				messagesHtml: `
					<div style="background-color:#f4f4f5;border-radius:6px;padding:12px;margin-bottom:8px;">
						<span style="display:block;font-size:12px;color:#71717a;margin-bottom:4px;">Apr 11, 2026 5:00 PM</span>
						<span style="font-size:14px;color:#18181b;">Hi, I need help with my account. The billing page is not loading.</span>
					</div>`,
				adminDashboardLink: escHtml(exampleAdmin),
				baseUrl: escHtml(baseUrl),
			}),
			textContent: render(NEWTICKETADMINNOTIFICATION_TEXT, {
				titleText: 'New Support Ticket',
				descriptionText: 'John Doe started a new support conversation.',
				previewText: 'New ticket from John Doe',
				messagesHtml: '[Apr 11, 2026 5:00 PM] Hi, I need help with my account.',
				adminDashboardLink: exampleAdmin,
				baseUrl,
			}),
		},
		{
			name: 'SaaS — New User Signup (Admin)',
			subject: 'New user signup: john@example.com',
			htmlContent: render(NEWUSERSIGNUPNOTIFICATION_HTML, {
				userName: escHtml('John Doe'),
				userEmail: escHtml('john@example.com'),
				signupMethod: escHtml('Email'),
				signupTime: escHtml('Apr 11, 2026, 5:00 PM'),
				adminDashboardLink: escHtml(exampleAdmin),
				baseUrl: escHtml(baseUrl),
			}),
			textContent: render(NEWUSERSIGNUPNOTIFICATION_TEXT, {
				userName: 'John Doe',
				userEmail: 'john@example.com',
				signupMethod: 'Email',
				signupTime: 'Apr 11, 2026, 5:00 PM',
				adminDashboardLink: exampleAdmin,
				baseUrl,
			}),
		},
	];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const isDryRun = process.argv.includes('--dry-run');

console.log('🔄 Brevo template sync\n');

const apiKey = get('BREVO_API_KEY');
const senderEmail = getOpt('BREVO_SENDER_EMAIL') || 'noreply@example.com';
const senderName = getOpt('BREVO_SENDER_NAME') || 'Your App';
const baseUrl = getOpt('EMAIL_ASSET_URL') || getOpt('SITE_URL') || 'https://example.com';

if (!getOpt('BREVO_SENDER_EMAIL') && !isDryRun) {
	console.error('❌ BREVO_SENDER_EMAIL is required for live sync. Set it in .env.convex.local');
	process.exit(1);
}

console.log(`  Sender:   ${senderName} <${senderEmail}>`);
console.log(`  Base URL: ${baseUrl}`);
console.log(`  Mode:     ${isDryRun ? 'DRY RUN' : 'LIVE'}\n`);

// Build template specs
const templates = buildTemplates(baseUrl, senderEmail, senderName);

if (isDryRun) {
	console.log('Templates that would be synced:');
	for (const t of templates) {
		console.log(`  • ${t.name} — Subject: "${t.subject}"`);
	}
	console.log('\nRe-run without --dry-run to push to Brevo.');
	process.exit(0);
}

// Fetch existing templates
process.stdout.write('Fetching existing Brevo templates... ');
const existing = await listTemplates();
console.log(`Found ${existing.length} existing template(s).`);

const byName = new Map(existing.map((t) => [t.name, t.id]));
const results: Array<{ name: string; id: number; action: 'created' | 'updated' }> = [];

for (const spec of templates) {
	const existingId = byName.get(spec.name);
	const payload = {
		templateName: spec.name,
		subject: spec.subject,
		htmlContent: spec.htmlContent,
		isActive: true,
		sender: { name: senderName, email: senderEmail },
		// Text part stored as reply-to plain text (Brevo doesn't have a direct textContent field
		// for templates — use tag to track and keep text in a comment for reference)
		tag: spec.name.replace('SaaS — ', '').toLowerCase().replace(/\s+/g, '-'),
	};

	if (existingId) {
		process.stdout.write(`  Updating "${spec.name}" (ID: ${existingId})... `);
		const ok = await updateTemplate(existingId, payload);
		if (ok) {
			console.log('✓');
			results.push({ name: spec.name, id: existingId, action: 'updated' });
		} else {
			console.log('✗ FAILED');
		}
	} else {
		process.stdout.write(`  Creating "${spec.name}"... `);
		const id = await createTemplate(payload);
		if (id) {
			console.log(`✓ (ID: ${id})`);
			results.push({ name: spec.name, id, action: 'created' });
		} else {
			console.log('✗ FAILED');
		}
	}
}

console.log('\n✅ Sync complete!\n');
console.log('Template IDs (for reference):');
for (const r of results) {
	console.log(`  ${r.action === 'created' ? '🆕' : '🔄'} ${r.id.toString().padStart(6)} — ${r.name}`);
}

console.log(`
ℹ️  These templates are for Brevo dashboard preview only.
   The app sends raw HTML directly (no templateId dependency).
   View them at: https://app.brevo.com/email/templates
`);

export { };
