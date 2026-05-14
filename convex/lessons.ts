import { v } from "convex/values";

import { query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

const lessonValidator = v.object({
  _id: v.id("lessons"),
  moduleId: v.id("modules"),
  title: v.string(),
  type: v.union(v.literal("video"), v.literal("reading"), v.literal("document")),
  body: v.string(),
  videoUrl: v.optional(v.string()),
  documentTitle: v.optional(v.string()),
  documentUrl: v.optional(v.string()),
  order: v.number(),
});

export const listForModule = query({
  args: { moduleId: v.id("modules") },
  returns: v.array(lessonValidator),
  handler: async (ctx, { moduleId }) => {
    await getCurrentUser(ctx);
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_module_and_order", (q) => q.eq("moduleId", moduleId))
      .collect();
    return lessons.map((l) => ({
      _id: l._id,
      moduleId: l.moduleId,
      title: l.title,
      type: l.type,
      body: l.body,
      videoUrl: l.videoUrl,
      documentTitle: l.documentTitle,
      documentUrl: l.documentUrl,
      order: l.order,
    }));
  },
});
