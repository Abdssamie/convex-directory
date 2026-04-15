import { query } from "./_generated/server";
import { requireActiveOrg } from "./lib/org";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const { orgId, userId } = await requireActiveOrg(ctx);

    return {
      message: `This is private data for user ${userId} in organization ${orgId}`,
    };
  },
});
