import polarComponent from "@convex-dev/polar/convex.config.js";
import r2Component from "@convex-dev/r2/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";
import { defineApp } from "convex/server";
import betterAuth from "./features/auth/convex.config";

const app = defineApp();
app.use(betterAuth);
app.use(polarComponent);
app.use(r2Component);
app.use(rateLimiter);

export default app;
