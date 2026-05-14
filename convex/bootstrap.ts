import { v } from "convex/values";

import { SEED_MODULES } from "./_seedData";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

type BootstrapResult = {
  modulesUpserted: number;
  lessonsUpserted: number;
  questionsUpserted: number;
  chunksIndexed: number;
};

export const run = internalAction({
  args: {
    reindex: v.optional(v.boolean()),
  },
  returns: v.object({
    modulesUpserted: v.number(),
    lessonsUpserted: v.number(),
    questionsUpserted: v.number(),
    chunksIndexed: v.number(),
  }),
  handler: async (ctx, { reindex }): Promise<BootstrapResult> => {
    const seedResult: {
      modulesUpserted: number;
      lessonsUpserted: number;
      questionsUpserted: number;
    } = await ctx.runMutation(internal.seed.seedInternal, {
      modules: SEED_MODULES,
    });

    let chunksIndexed = 0;
    if (reindex ?? true) {
      const indexResult: { chunksIndexed: number } = await ctx.runAction(
        internal.retrieval.reindexAllLessonsInternal,
        {},
      );
      chunksIndexed = indexResult.chunksIndexed;
    }

    return {
      ...seedResult,
      chunksIndexed,
    };
  },
});
