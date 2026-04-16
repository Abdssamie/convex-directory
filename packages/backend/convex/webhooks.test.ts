import { convexTest } from "convex-test";
import { beforeEach, describe, expect, it, vi } from "vitest";

// @ts-ignore
import schema from "./schema";

describe("brevo webhook", () => {
  beforeEach(() => {
    vi.stubEnv("BREVO_WEBHOOK_TOKEN", "test-secret");
  });

  it("stores single event authenticated by X-Brevo-Token", async () => {
    // @ts-ignore
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));

    const response = await t.fetch("/webhooks/brevo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Brevo-Token": "test-secret",
      },
      body: JSON.stringify({
        event: "delivered",
        email: "test@example.com",
        "message-id": "<msg-123>",
        ts: 1610000000,
        subject: "Test Email",
        tags: ["test"],
        ip: "1.1.1.1",
      }),
    });

    expect(response.status).toBe(200);

    const events = await t.run(async (ctx) => await ctx.db.query("emailEvents").collect());

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      event: "delivered",
      email: "test@example.com",
      messageId: "<msg-123>",
      ts: 1610000000,
      tags: ["test"],
      ip: "1.1.1.1",
    });
  });

  it("accepts bearer auth and normalizes Brevo tag string", async () => {
    // @ts-ignore
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));

    const response = await t.fetch("/webhooks/brevo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-secret",
      },
      body: JSON.stringify({
        event: "unique_proxy_open",
        email: "test@example.com",
        "message-id": "msg-456",
        tag: '["alpha","beta"]',
        ts: 1,
        ts_event: 2,
      }),
    });

    expect(response.status).toBe(200);

    const events = await t.run(async (ctx) => await ctx.db.query("emailEvents").collect());

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      event: "unique_proxy_open",
      messageId: "msg-456",
      ts: 2,
      tags: ["alpha", "beta"],
    });
  });

  it("accepts basic auth and batched payloads", async () => {
    // @ts-ignore
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));

    const response = await t.fetch("/webhooks/brevo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from("test-secret").toString("base64")}`,
      },
      body: JSON.stringify([
        {
          event: "request",
          email: "first@example.com",
          "message-id": "msg-1",
        },
        {
          event: "delivered",
          email: "second@example.com",
          messageId: "msg-2",
        },
      ]),
    });

    expect(response.status).toBe(200);

    const events = await t.run(async (ctx) => await ctx.db.query("emailEvents").collect());

    expect(events).toHaveLength(2);
    expect(events.map((event) => event.event).sort()).toEqual(["delivered", "request"]);
  });

  it("rejects wrong auth", async () => {
    // @ts-ignore
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));

    const response = await t.fetch("/webhooks/brevo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer wrong-secret",
      },
      body: JSON.stringify({ event: "delivered", email: "test@example.com" }),
    });

    expect(response.status).toBe(401);
  });
});
