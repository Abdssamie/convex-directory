import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth, type User } from "better-auth";
import { magicLink, organization } from "better-auth/plugins";

import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMagicLinkEmail,
  sendInvitationEmail,
  sendWelcomeEmail,
} from "./features/email/betterAuth";

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel>(components.betterAuth);

function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth({
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }: { user: User; url: string }) => {
        await sendPasswordResetEmail({
          email: user.email,
          name: user.name,
          url,
        });
      },
    },
    emailVerification: {
      expiresIn: 7200,
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }: { user: User; url: string }) => {
        await sendVerificationEmail({
          email: user.email,
          name: user.name,
          url,
        });
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user: User) => {
            await sendWelcomeEmail({
              email: user.email,
              name: user.name,
            });
          },
        },
      },
    },
    plugins: [
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLinkEmail({ email, url });
        },
      }),
      organization({
        requireEmailVerificationOnInvitation: true,
        async sendInvitationEmail(data) {
          const siteUrl = process.env.SITE_URL ?? "http://localhost:3001";
          const inviteLink = `${siteUrl}/invite/${data.id}`;

          await sendInvitationEmail({
            email: data.email,
            invitedByEmail: data.inviter?.user?.email ?? null,
            invitedByName: data.inviter?.user?.name ?? null,
            organizationName: data.organization?.name ?? null,
            inviteLink,
          });
        },
      }),
    ],
  });
}

export { createAuth };

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx);
  },
});
