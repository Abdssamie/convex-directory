/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as claims from "../claims.js";
import type * as features_email_betterAuth from "../features/email/betterAuth.js";
import type * as features_email_brevo from "../features/email/brevo.js";
import type * as features_email_brevo_client from "../features/email/brevo/client.js";
import type * as features_email_brevo_contacts from "../features/email/brevo/contacts.js";
import type * as features_email_config from "../features/email/config.js";
import type * as features_email_eventLog from "../features/email/eventLog.js";
import type * as features_email_index from "../features/email/index.js";
import type * as features_email_templates from "../features/email/templates.js";
import type * as features_email_webhooks from "../features/email/webhooks.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as lib_logger from "../lib/logger.js";
import type * as lib_org from "../lib/org.js";
import type * as lib_rateLimiter from "../lib/rateLimiter.js";
import type * as polar from "../polar.js";
import type * as privateData from "../privateData.js";
import type * as projects from "../projects.js";
import type * as r2 from "../r2.js";
import type * as shared_result from "../shared/result.js";

import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  claims: typeof claims;
  "features/email/betterAuth": typeof features_email_betterAuth;
  "features/email/brevo": typeof features_email_brevo;
  "features/email/brevo/client": typeof features_email_brevo_client;
  "features/email/brevo/contacts": typeof features_email_brevo_contacts;
  "features/email/config": typeof features_email_config;
  "features/email/eventLog": typeof features_email_eventLog;
  "features/email/index": typeof features_email_index;
  "features/email/templates": typeof features_email_templates;
  "features/email/webhooks": typeof features_email_webhooks;
  healthCheck: typeof healthCheck;
  http: typeof http;
  "lib/logger": typeof lib_logger;
  "lib/org": typeof lib_org;
  "lib/rateLimiter": typeof lib_rateLimiter;
  polar: typeof polar;
  privateData: typeof privateData;
  projects: typeof projects;
  r2: typeof r2;
  "shared/result": typeof shared_result;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;

export declare const components: {
  betterAuth: import("../features/auth/_generated/component.js").ComponentApi<"betterAuth">;
  polar: import("@convex-dev/polar/_generated/component.js").ComponentApi<"polar">;
  r2: import("@convex-dev/r2/_generated/component.js").ComponentApi<"r2">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
