import { v } from "convex/values";

import { query } from "./_generated/server";

export const inspect = query({
  args: {},
  returns: v.object({
    identityReceived: v.boolean(),
    rawJson: v.string(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return {
      identityReceived: identity !== null,
      rawJson: JSON.stringify(identity, null, 2),
    };
  },
});
