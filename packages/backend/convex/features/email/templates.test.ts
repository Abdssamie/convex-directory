import { describe, it, expect } from "vitest";
import { getEmailTemplate, renderEmailHtml, getSupportedFlows } from "./templates";

describe("email templates", () => {
  it("returns all supported email flows", () => {
    const flows = getSupportedFlows();
    expect(flows).toContain("email_verification");
    expect(flows).toContain("password_reset");
    expect(flows).toContain("magic_link");
    expect(flows).toContain("invitation");
    expect(flows).toContain("welcome");
    expect(flows).toHaveLength(5);
  });

  describe("getEmailTemplate", () => {
    it("returns template config for email_verification", () => {
      const template = getEmailTemplate("email_verification");
      expect(template.subject).toBeDefined();
      expect(template.html).toBeDefined();
    });

    it("returns template config for password_reset", () => {
      const template = getEmailTemplate("password_reset");
      expect(template.subject).toBeDefined();
      expect(template.html).toBeDefined();
    });

    it("returns template config for magic_link", () => {
      const template = getEmailTemplate("magic_link");
      expect(template.subject).toBeDefined();
      expect(template.html).toBeDefined();
    });

    it("returns template config for invitation", () => {
      const template = getEmailTemplate("invitation");
      expect(template.subject).toBeDefined();
      expect(template.html).toBeDefined();
    });

    it("returns template config for welcome", () => {
      const template = getEmailTemplate("welcome");
      expect(template.subject).toBeDefined();
      expect(template.html).toBeDefined();
    });

    it("throws for unknown flow", () => {
      expect(() => getEmailTemplate("unknown" as any)).toThrow("Unknown email flow: unknown");
    });
  });

  describe("renderEmailHtml", () => {
    it("renders email_verification with params", () => {
      const result = renderEmailHtml(
        "email_verification",
        {
          verificationUrl: "https://app.example.com/verify?token=abc123",
        },
        "MyApp",
      );

      expect(result.subject).toBe("Verify your email");
      expect(result.htmlContent).toContain("MyApp");
      expect(result.htmlContent).toContain("https://app.example.com/verify?token=abc123");
      expect(result.htmlContent).toContain("Verify Email");
    });

    it("renders password_reset with params", () => {
      const result = renderEmailHtml(
        "password_reset",
        {
          resetUrl: "https://app.example.com/reset?token=xyz789",
        },
        "MyApp",
      );

      expect(result.subject).toBe("Reset your password");
      expect(result.htmlContent).toContain("MyApp");
      expect(result.htmlContent).toContain("https://app.example.com/reset?token=xyz789");
      expect(result.htmlContent).toContain("Reset Password");
    });

    it("renders magic_link with params", () => {
      const result = renderEmailHtml(
        "magic_link",
        {
          magicLink: "https://app.example.com/login?token=magic123",
        },
        "MyApp",
      );

      expect(result.subject).toBe("Sign in to your account");
      expect(result.htmlContent).toContain("MyApp");
      expect(result.htmlContent).toContain("Sign In");
    });

    it("renders invitation with params", () => {
      const result = renderEmailHtml(
        "invitation",
        {
          inviteUrl: "https://app.example.com/invite?code=inv456",
          inviterName: "John Doe",
          appName: "Acme Corp",
        },
        "Acme Corp",
      );

      expect(result.subject).toBe("You're invited to join Acme Corp");
      expect(result.htmlContent).toContain("Acme Corp");
      expect(result.htmlContent).toContain("John Doe");
      expect(result.htmlContent).toContain("Accept Invitation");
    });

    it("renders welcome with params", () => {
      const result = renderEmailHtml(
        "welcome",
        {
          userName: "Jane Doe",
          appUrl: "https://app.example.com/dashboard",
          appName: "MyApp",
        },
        "MyApp",
      );

      expect(result.subject).toBe("Welcome to MyApp");
      expect(result.htmlContent).toContain("Welcome, Jane Doe");
      expect(result.htmlContent).toContain("Get Started");
    });

    it("escapes HTML in params to prevent XSS", () => {
      const result = renderEmailHtml(
        "email_verification",
        {
          verificationUrl: "https://app.example.com/verify?token=<script>alert('xss')</script>",
        },
        "MyApp",
      );

      expect(result.htmlContent).not.toContain("<script>alert");
      expect(result.htmlContent).toContain("&lt;script&gt;alert");
    });

    it("uses default appName when not provided", () => {
      const result = renderEmailHtml(
        "email_verification",
        { verificationUrl: "https://example.com" },
        "",
      );

      expect(result.htmlContent).toContain("App");
    });
  });
});
