import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

const lessonProgressValidator = v.object({
  _id: v.id("lessonProgress"),
  lessonId: v.id("lessons"),
  moduleId: v.id("modules"),
  status: v.union(v.literal("not_started"), v.literal("in_progress"), v.literal("completed")),
  updatedAt: v.number(),
});

export const forModule = query({
  args: { moduleId: v.id("modules") },
  returns: v.array(lessonProgressValidator),
  handler: async (ctx, { moduleId }) => {
    const user = await getCurrentUser(ctx);
    const rows = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_and_module", (q) => q.eq("userId", user._id).eq("moduleId", moduleId))
      .collect();
    return rows.map((r) => ({
      _id: r._id,
      lessonId: r.lessonId,
      moduleId: r.moduleId,
      status: r.status,
      updatedAt: r.updatedAt,
    }));
  },
});

export const summary = query({
  args: {},
  returns: v.array(
    v.object({
      moduleId: v.id("modules"),
      completedLessons: v.number(),
      totalLessons: v.number(),
      lastTouchedAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const rows = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_and_module", (q) => q.eq("userId", user._id))
      .collect();

    const byModule = new Map<
      string,
      { moduleId: typeof rows[number]["moduleId"]; completed: number; lastTouchedAt: number }
    >();

    for (const row of rows) {
      const key = row.moduleId.toString();
      const entry = byModule.get(key) ?? {
        moduleId: row.moduleId,
        completed: 0,
        lastTouchedAt: 0,
      };
      if (row.status === "completed") entry.completed += 1;
      if (row.updatedAt > entry.lastTouchedAt) entry.lastTouchedAt = row.updatedAt;
      byModule.set(key, entry);
    }

    const result = [] as Array<{
      moduleId: typeof rows[number]["moduleId"];
      completedLessons: number;
      totalLessons: number;
      lastTouchedAt: number;
    }>;

    for (const entry of byModule.values()) {
      const totalLessons = (
        await ctx.db
          .query("lessons")
          .withIndex("by_module_and_order", (q) => q.eq("moduleId", entry.moduleId))
          .collect()
      ).length;
      result.push({
        moduleId: entry.moduleId,
        completedLessons: entry.completed,
        totalLessons,
        lastTouchedAt: entry.lastTouchedAt,
      });
    }

    return result;
  },
});

export const markLesson = mutation({
  args: {
    moduleId: v.id("modules"),
    lessonId: v.id("lessons"),
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("completed"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson || lesson.moduleId !== args.moduleId) {
      throw new Error("Lesson does not belong to the specified module");
    }

    const existing = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_and_lesson", (q) =>
        q.eq("userId", user._id).eq("lessonId", args.lessonId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("lessonProgress", {
        userId: user._id,
        moduleId: args.moduleId,
        lessonId: args.lessonId,
        status: args.status,
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});
