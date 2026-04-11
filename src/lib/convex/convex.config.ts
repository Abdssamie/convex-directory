import { defineApp } from 'convex/server';
import betterAuth from './betterAuth/convex.config';
import autumn from '@useautumn/convex/convex.config';
import agent from '@convex-dev/agent/convex.config';
import rateLimiter from '@convex-dev/rate-limiter/convex.config';
import convexFilesControl from '@gilhrpenner/convex-files-control/convex.config';

const app = defineApp();
app.use(betterAuth);
app.use(autumn);
app.use(agent);
app.use(rateLimiter);
app.use(convexFilesControl);
/**
 * Convex application configured with Autumn billing, Brevo email, and AI Agent.
 *
 * This configuration registers plugins with the Convex backend:
 * - Autumn: Subscription and usage tracking functionality
 * - Agent: AI-powered conversation and thread management
 *
 * Email: Brevo transactional email (direct HTTP — no Convex component needed)
 */
export default app;
