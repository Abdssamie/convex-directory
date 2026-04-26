#!/usr/bin/env pnpm tsx
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
const envPath = path.join(process.cwd(), ".env.convex");
dotenv.config({ path: envPath });
import {
  listTemplates,
  getTemplateByName,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  sendTestTemplate,
  previewTemplate,
  syncRequiredTemplates,
} from "../convex/features/email/brevo/templates";
const commands = {
  list: async () => {
    const result = await listTemplates();
    if (!result.ok) throw new Error(result.error.message);
    console.log(JSON.stringify(result.value, null, 2));
  },
  get: async (args) => {
    if (!args[0]) throw new Error("Usage: brevo get <name>");
    const result = await getTemplateByName(args[0]);
    if (!result.ok) throw new Error(result.error.message);
    console.log(JSON.stringify(result.value, null, 2));
  },
  create: async (args) => {
    if (args.length < 3) throw new Error("Usage: brevo create <name> <subject> <htmlFile>");
    const name = args[0];
    const subject = args[1];
    const htmlFile = args[2];
    const htmlContent = fs.readFileSync(path.join(process.cwd(), htmlFile), "utf-8");
    const result = await createTemplate({ name, subject, htmlContent });
    if (!result.ok) throw new Error(result.error.message);
    console.log(`Created template ${name} (id: ${result.value.id})`);
  },
  update: async (args) => {
    const name = args[0];
    if (!name)
      throw new Error(
        "Usage: brevo update <name> [--subject X] [--html file] [--active true|false]",
      );
    const params = {};
    for (let i = 1; i < args.length; i += 2) {
      if (args[i] === "--subject" && args[i + 1]) params.subject = args[i + 1];
      if (args[i] === "--html" && args[i + 1]) {
        params.htmlContent = fs.readFileSync(path.join(process.cwd(), args[i + 1]), "utf-8");
      }
      if (args[i] === "--active" && args[i + 1]) params.isActive = args[i + 1] === "true";
    }
    const result = await updateTemplate(name, params);
    if (!result.ok) throw new Error(result.error.message);
    console.log(`Updated template ${name}`);
  },
  delete: async (args) => {
    const identifier = args[0];
    if (!identifier) throw new Error("Usage: brevo delete <nameOrId>");
    // First deactivate, then delete
    await updateTemplate(identifier, { isActive: false });
    const result = await deleteTemplate(identifier);
    if (!result.ok) throw new Error(result.error.message);
    console.log(`Deleted ${identifier}`);
  },
  test: async (args) => {
    if (args.length < 2) throw new Error("Usage: brevo test <templateId> <email>");
    const templateId = args[0];
    const email = args[1];
    const result = await sendTestTemplate(+templateId, email);
    if (!result.ok) throw new Error(result.error.message);
    console.log(`Test sent to ${email}`);
  },
  preview: async (args) => {
    const templateIdStr = args[0];
    if (!templateIdStr) throw new Error("Usage: brevo preview <templateId> [key=value...]");
    const templateId = +templateIdStr;
    const params = {};
    for (let i = 1; i < args.length; i++) {
      const kv = args[i];
      const eqIdx = kv.indexOf("=");
      if (eqIdx === -1) continue;
      const k = kv.slice(0, eqIdx);
      const v = kv.slice(eqIdx + 1);
      params[k] = v;
    }
    const result = await previewTemplate(templateId, params);
    if (!result.ok) throw new Error(result.error.message);
    console.log(result.value);
  },
  sync: async () => {
    const result = await syncRequiredTemplates();
    if (!result.ok) throw new Error(result.error.message);
    console.log(JSON.stringify(result.value, null, 2));
  },
  simulate: async (args) => {
    if (args.length < 2)
      throw new Error("Usage: brevo simulate <event> <email> [message-id] [tags...]");
    const event = args[0];
    const email = args[1];
    const messageId = args[2] || `test-${Date.now()}`;
    const tags = args.slice(3);
    const payload = {
      event,
      email,
      "message-id": messageId,
      ts: Math.floor(Date.now() / 1000),
      subject: `Simulated ${event} event`,
      tags: tags.length > 0 ? tags : ["test"],
      ip: "127.0.0.1",
    };
    const webhookUrl =
      process.env.CONVEX_SITE_URL || process.env.NEXT_PUBLIC_CONVEX_URL?.replace(".cloud", ".site");
    if (!webhookUrl) throw new Error("CONVEX_SITE_URL or CONVEX_URL not found in environment");
    const url = `${webhookUrl}/webhooks/brevo`;
    const secret = process.env.BREVO_WEBHOOK_TOKEN;
    console.log(`Simulating ${event} for ${email} to ${url}...`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "X-Brevo-Token": secret } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Webhook failed with status ${response.status}: ${text}`);
    }
    console.log("Success! Event received by Convex.");
  },
};
async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (!cmd || cmd === "-h" || cmd === "--help") {
    console.log(`Usage: pnpm brevo <command> [args]
Commands:
  list                           List all templates
  get <name>                    Get template by name
  create <name> <subject> <html> Create template
  update <name> [--subject X] [--html file] [--active true|false] Update template
  delete <nameOrId>            Delete template
  test <templateId> <email>   Send test email
  preview <templateId> [k=v]  Preview with params
  sync                          Sync required templates
  simulate <event> <email> [id] [tags...] Simulate webhook event`);
    process.exit(0);
  }
  const fn = commands[cmd];
  if (!fn) throw new Error(`Unknown command: ${cmd}`);
  await fn(args);
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
