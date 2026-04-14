import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendBrevoTemplate } from "./brevo";

const mockConfig = {
  apiKey: "test-api-key",
  sender: { name: "Test Sender", email: "sender@example.com" },
  replyTo: { name: "Reply", email: "reply@example.com" },
  appName: "TestApp",
};

vi.mock("./config", () => ({
  getBrevoConfig: () => mockConfig,
}));

const mockSendTransacEmail = vi.fn();

vi.mock("./brevo/client", () => ({
  getBrevoClient: () => ({
    transactionalEmails: {
      sendTransacEmail: mockSendTransacEmail,
    },
  }),
  getBrevoError: (_error: unknown, fallback: string) => ({ reason: fallback, status: undefined }),
}));

describe("brevo sender", () => {
  beforeEach(() => {
    mockSendTransacEmail.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("sendBrevoTemplate", () => {
    it("sends email with correct payload", async () => {
      mockSendTransacEmail.mockResolvedValueOnce({ messageId: "msg-123" });

      const result = await sendBrevoTemplate({
        flow: "email_verification",
        to: { email: "test@example.com", name: "Test User" },
        params: { verificationUrl: "https://app.example.com/verify" },
      });

      expect(result.ok).toBe(true);
      expect(result.value).toEqual({ messageIds: ["msg-123"] });

      const [body] = mockSendTransacEmail.mock.calls[0] as [Record<string, unknown>];

      expect(body.sender).toEqual({ name: "Test Sender", email: "sender@example.com" });
      expect(body.replyTo).toEqual({ name: "Reply", email: "reply@example.com" });
      expect(body.to).toEqual([{ email: "test@example.com", name: "Test User" }]);
      expect(body.subject).toBe("Verify your email");
      expect(body.htmlContent).toContain("Verify your email");
      expect(body.htmlContent).toContain("https://app.example.com/verify");
    });

    it("includes tags when provided", async () => {
      mockSendTransacEmail.mockResolvedValueOnce({ messageId: "msg-456" });

      const result = await sendBrevoTemplate({
        flow: "magic_link",
        to: { email: "user@example.com" },
        params: { magicLink: "https://app.example.com/login" },
        tags: ["auth", "magic-link"],
      });

      expect(result.ok).toBe(true);

      const [body] = mockSendTransacEmail.mock.calls[0] as [Record<string, unknown>];

      expect(body.tags).toEqual(["auth", "magic-link"]);
    });

    it("sets X-Sib-Sandbox header when sandbox is true", async () => {
      mockSendTransacEmail.mockResolvedValueOnce({});

      await sendBrevoTemplate({
        flow: "welcome",
        to: { email: "sandbox@example.com" },
        params: { userName: "Sandbox", appUrl: "https://app.example.com" },
        sandbox: true,
      });

      const [, requestOptions] = mockSendTransacEmail.mock.calls[0] as [
        unknown,
        Record<string, unknown>,
      ];

      expect(requestOptions.headers).toEqual(
        expect.objectContaining({
          "X-Sib-Sandbox": "drop",
        }),
      );
    });

    it("does not set X-Sib-Sandbox header when sandbox is false", async () => {
      mockSendTransacEmail.mockResolvedValueOnce({});

      await sendBrevoTemplate({
        flow: "welcome",
        to: { email: "user@example.com" },
        params: { userName: "User", appUrl: "https://app.example.com" },
        sandbox: false,
      });

      const [, requestOptions] = mockSendTransacEmail.mock.calls[0] as [
        unknown,
        Record<string, unknown>,
      ];

      expect(requestOptions.headers).toBeUndefined();
    });

    it("returns error when API returns non-OK status", async () => {
      mockSendTransacEmail.mockRejectedValueOnce(new Error("Invalid API key"));

      const result = await sendBrevoTemplate({
        flow: "email_verification",
        to: { email: "test@example.com" },
        params: { verificationUrl: "https://example.com" },
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        const error = result.error as { code: string; status?: number; flow: string };
        expect(error.code).toBe("email_send_failed");
        expect(error.flow).toBe("email_verification");
      }
    });

    it("returns error when network fails", async () => {
      mockSendTransacEmail.mockRejectedValueOnce(new Error("Network error"));

      const result = await sendBrevoTemplate({
        flow: "email_verification",
        to: { email: "test@example.com" },
        params: { verificationUrl: "https://example.com" },
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        const error = result.error as { code: string; reason?: string };
        expect(error.code).toBe("email_send_failed");
        expect(error.reason).toBe("network_error");
      }
    });

    it("sends all email flows correctly", async () => {
      const flows = [
        { flow: "email_verification", params: { verificationUrl: "https://example.com/verify" } },
        { flow: "password_reset", params: { resetUrl: "https://example.com/reset" } },
        { flow: "magic_link", params: { magicLink: "https://example.com/login" } },
        {
          flow: "invitation",
          params: { inviteUrl: "https://example.com/invite", inviterName: "John", appName: "Acme" },
        },
        { flow: "welcome", params: { userName: "Jane", appUrl: "https://example.com" } },
      ] as const;

      for (const { flow, params } of flows) {
        mockSendTransacEmail.mockResolvedValue({ messageId: "msg-1" });
        const result = await sendBrevoTemplate({
          flow,
          to: { email: "test@example.com" },
          params,
        });

        expect(result.ok).toBe(true);
      }
    });
  });
});
