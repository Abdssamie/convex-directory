/**
 * Polar Billing — Stub for future payments.
 *
 * MVP: All features are free. No products or env vars required.
 *
 * TODO: When adding paid plans:
 *  1. Create products in Polar dashboard (https://polar.sh or sandbox)
 *  2. Set POLAR_ORGANIZATION_TOKEN + POLAR_WEBHOOK_SECRET in Convex env
 *  3. Set POLAR_SERVER=production when going live
 *  4. Add product keys to the `products` config below
 *  5. Register webhook in Polar dashboard → https://<deployment>.convex.site/polar/events
 *
 * See: https://github.com/get-convex/polar
 */
import { Polar } from '@convex-dev/polar';
import { api, components } from './_generated/api';
import { query } from './_generated/server';
import { authComponent } from './auth';

/**
 * getUserInfo query — used by the Polar component via ctx.runQuery.
 * Returns the userId and email for the currently authenticated user.
 */
export const getUserInfo = query({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) throw new Error('Not authenticated');
		return { userId: user._id as string, email: user.email };
	}
});

/**
 * Polar client stub.
 * No products configured for MVP — all features are free.
 */
export const polar: Polar = new Polar(components.polar, {
	// TODO: Add product UUIDs from Polar dashboard here:
	// products: {
	//   pro: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
	// },
	getUserInfo: async (ctx): Promise<{ userId: string; email: string }> => {
		// Action ctx → must use ctx.runQuery to call a query function
		return await ctx.runQuery(api.polar.getUserInfo);
	}
	// organizationToken and webhookSecret are read from POLAR_ORGANIZATION_TOKEN
	// and POLAR_WEBHOOK_SECRET env vars automatically.
});

export const {
	getConfiguredProducts,
	listAllProducts,
	generateCheckoutLink,
	generateCustomerPortalUrl,
	changeCurrentSubscription,
	cancelCurrentSubscription
} = polar.api();
