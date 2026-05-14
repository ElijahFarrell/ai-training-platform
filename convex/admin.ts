import { v } from "convex/values";

import { query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

export const overview = query({
  args: {},
  returns: v.object({
    learners: v.number(),
    admins: v.number(),
    modules: v.number(),
    completedLessons: v.number(),
    quizzesPassed: v.number(),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const modules = await ctx.db.query("modules").collect();
    const lessonRows = await ctx.db.query("lessonProgress").collect();
    const attempts = await ctx.db.query("quizAttempts").collect();

    return {
      learners: users.filter((u) => u.role === "learner").length,
      admins: users.filter((u) => u.role === "admin").length,
      modules: modules.length,
      completedLessons: lessonRows.filter((r) => r.status === "completed").length,
      quizzesPassed: attempts.filter((a) => a.passed).length,
    };
  },
});

export const learnerActivity = query({
  args: {},
  returns: v.array(
    v.object({
      userId: v.id("users"),
      email: v.string(),
      displayName: v.string(),
      role: v.union(v.literal("learner"), v.literal("admin")),
      lessonsCompleted: v.number(),
      quizzesPassed: v.number(),
      lastSeenAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const result = [] as Array<{
      userId: typeof users[number]["_id"];
      email: string;
      displayName: string;
      role: "learner" | "admin";
      lessonsCompleted: number;
      quizzesPassed: number;
      lastSeenAt: number;
    }>;

    for (const user of users) {
      const lessons = await ctx.db
        .query("lessonProgress")
        .withIndex("by_user_and_module", (q) => q.eq("userId", user._id))
        .collect();
      const attempts = await ctx.db
        .query("quizAttempts")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      result.push({
        userId: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        lessonsCompleted: lessons.filter((l) => l.status === "completed").length,
        quizzesPassed: attempts.filter((a) => a.passed).length,
        lastSeenAt: user.lastSeenAt,
      });
    }

    return result.sort((a, b) => b.lastSeenAt - a.lastSeenAt);
  },
});
