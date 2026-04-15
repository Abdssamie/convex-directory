import { v } from "convex/values";
import { httpAction, internalMutation } from "../../_generated/server";
import { internal } from "../../_generated/api";

export const logEvent = internalMutation({
  args: {
    event: v.string(),
    email: v.string(),
    messageId: v.string(),
    ts: v.number(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailEvents", args);
  },
});

export const brevo = httpAction(async (ctx, request) => {
  const secret = process.env.BREVO_WEBHOOK_SECRET;
  const token = request.headers.get("X-Brevo-Token") || request.headers.get("Authorization");

  if (secret && token !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await request.json();

  // Brevo sends a single event object or an array of objects
  const events = Array.isArray(payload) ? payload : [payload];

  for (const event of events) {
    // Brevo fields mapping
    const eventName = event.event || "unknown";
    const email = event.email || "";
    const messageId = event["message-id"] || event.messageId || "none";
    const ts = event.ts || Date.now();

    await ctx.runMutation(internal.features.email.webhooks.logEvent, {
      event: eventName,
      email,
      messageId,
      ts,
      payload: event,
    });
  }

  return new Response("OK", { status: 200 });
});
