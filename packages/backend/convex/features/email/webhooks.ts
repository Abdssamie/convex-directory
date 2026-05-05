import { httpAction } from "../../_generated/server";
import { internal } from "../../_generated/api";

const unauthorized = () => new Response("Unauthorized", { status: 401 });

type AuthFailureReason =
  | "missing_token_env"
  | "missing_auth_headers"
  | "invalid_x_brevo_token"
  | "invalid_bearer_token"
  | "invalid_basic_token"
  | "invalid_authorization_header";

const decodeBasicAuth = (value: string) => {
  try {
    return atob(value);
  } catch {
    return null;
  }
};

const getAuthorizationFailure = (
  request: Request,
  secret: string | undefined,
): AuthFailureReason | null => {
  if (!secret) {
    return "missing_token_env";
  }

  const token = request.headers.get("X-Brevo-Token");
  if (token !== null) {
    return token === secret ? null : "invalid_x_brevo_token";
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return "missing_auth_headers";
  }

  const [scheme, ...rest] = authorization.split(" ");
  const normalizedScheme = scheme?.toLowerCase();
  const credentials = rest.join(" ");

  if (authorization === secret) {
    return null;
  }

  if (normalizedScheme === "bearer") {
    return credentials === secret ? null : "invalid_bearer_token";
  }

  if (normalizedScheme === "basic") {
    return decodeBasicAuth(credentials) === secret ? null : "invalid_basic_token";
  }

  return "invalid_authorization_header";
};

const getTags = (event: Record<string, unknown>) => {
  if (Array.isArray(event.tags)) {
    return event.tags.filter((tag): tag is string => typeof tag === "string");
  }

  if (typeof event.tag === "string") {
    try {
      const parsed = JSON.parse(event.tag);
      if (Array.isArray(parsed)) {
        return parsed.filter((tag): tag is string => typeof tag === "string");
      }
    } catch {
      if (event.tag.length > 0) {
        return [event.tag];
      }
    }
  }

  return undefined;
};

export const brevo = httpAction(async (ctx, request) => {
  const secret = process.env.BREVO_WEBHOOK_TOKEN;
  const authFailure = getAuthorizationFailure(request, secret);
  if (authFailure) {
    return unauthorized();
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Brevo sends a single event object or an array of objects
  const events = Array.isArray(payload) ? payload : [payload];

  for (const event of events) {
    if (!event || typeof event !== "object") {
      continue;
    }

    // Brevo fields mapping
    const eventName = event.event || "unknown";
    const email = event.email || "";
    const messageId = event["message-id"] || event.messageId || "none";
    const ts = event.ts_event || event.ts || Math.floor(Date.now() / 1000);

    // More detailed mapping
    const subject = event.subject;
    const tags = getTags(event);
    const link = event.link;
    const ip = event.ip || event.sending_ip;
    const userAgent = event["user-agent"] || event.user_agent;

    await ctx.runMutation(internal.features.email.eventLog.logEvent, {
      event: typeof eventName === "string" ? eventName : "unknown",
      email: typeof email === "string" ? email : "",
      messageId: typeof messageId === "string" ? messageId : String(messageId),
      ts: typeof ts === "number" ? ts : Math.floor(Date.now() / 1000),
      subject,
      tags,
      link,
      ip,
      userAgent,
      payload: JSON.stringify(event),
    });
  }

  return new Response("OK", { status: 200 });
});
