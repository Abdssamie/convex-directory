import { type EmailFlow } from "./config";
import { sendBrevoTemplate } from "./brevo";
import { ensureContactExists } from "./brevo/contacts";

export type EmailRequest = {
  flow: EmailFlow;
  to: { email: string; name?: string };
  params: Record<string, string>;
  tags?: string[];
  sandbox?: boolean;
  ensureContact?: boolean;
};

export const sendEmail = async (request: EmailRequest) => {
  if (request.ensureContact !== false) {
    const attributes: Record<string, string> = {};
    if (request.to.name) {
      attributes.NAME = request.to.name;
    }
    const contactResult = await ensureContactExists(request.to.email, attributes);
    if (!contactResult.ok) {
      console.warn("Failed to ensure contact exists:", contactResult.error.message);
    }
  }

  return await sendBrevoTemplate({
    flow: request.flow,
    to: request.to,
    params: request.params,
    tags: request.tags,
    sandbox: request.sandbox,
  });
};
