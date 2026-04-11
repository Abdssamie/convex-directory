import { defineApp } from 'convex/server';
import betterAuth from './betterAuth/convex.config';
import polar from '@convex-dev/polar/convex.config';
import agent from '@convex-dev/agent/convex.config';
import rateLimiter from '@convex-dev/rate-limiter/convex.config';
import convexFilesControl from '@gilhrpenner/convex-files-control/convex.config';

const app = defineApp();
app.use(betterAuth);
app.use(polar);
app.use(agent);
app.use(rateLimiter);
app.use(convexFilesControl);
/**
 * Convex application configured with Polar billing stub, Brevo email, and AI Agent.
 *
 * - Polar: Subscription and billing (stub — no products configured for MVP, all features free)
 * - Agent: AI-powered conversation and thread management
 * - Email: Brevo transactional email (direct HTTP — no Convex component needed)
 *
 * TODO: Configure Polar products + env vars when adding paid plans
 */
export default app;
