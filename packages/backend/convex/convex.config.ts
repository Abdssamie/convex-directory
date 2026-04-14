import betterAuth from "@convex-dev/better-auth/convex.config";
import polarComponent from "@convex-dev/polar/convex.config.js";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(betterAuth);
app.use(polarComponent);

export default app;
