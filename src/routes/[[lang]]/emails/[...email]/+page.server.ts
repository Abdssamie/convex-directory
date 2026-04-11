import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const emailFiles = import.meta.env.DEV
	? Object.keys(import.meta.glob('/src/lib/emails/templates/*.svelte', { eager: false }))
	: [];

export const load: PageServerLoad = async () => {
	if (!import.meta.env.DEV) error(404, 'Not available in production');

	const files = emailFiles.map((path) => {
		return path.split('/').pop()?.replace('.svelte', '') || '';
	});

	return {
		emails: {
			files: files.length > 0 ? files : null,
			path: '/src/lib/emails/templates'
		}
	};
};

async function buildActions() {
	if (!import.meta.env.DEV) return {};
	const { renderer } = await import('$lib/emails/renderer');
	const { createEmail } = await import('better-svelte-email/preview');
	return {
		...createEmail({ renderer })
		// Note: sendEmail (test send via Brevo) not yet wired in preview tool.
		// Use Brevo dashboard's transactional email test feature instead.
	};
}

export const actions = await buildActions();
