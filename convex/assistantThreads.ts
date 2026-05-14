import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

const threadValidator = v.object({
  _id: v.id("assistantThreads"),
  moduleId: v.optional(v.id("modules")),
  title: v.string(),
  createdAt: v.number(),
  lastMessageAt: v.number(),
});

export const listForCurrentUser = query({
  args: {},
  returns: v.array(threadValidator),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const threads = await ctx.db
      .query("assistantThreads")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
    return threads.map((t) => ({
      _id: t._id,
      moduleId: t.moduleId,
      title: t.title,
      createdAt: t.createdAt,
      lastMessageAt: t.lastMessageAt,
    }));
  },
});

export const messagesForThread = query({
  args: { threadId: v.id("assistantThreads") },
  returns: v.array(
    v.object({
      _id: v.id("assistantMessages"),
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      createdAt: v.number(),
      citations: v.optional(
        v.array(
          v.object({
            lessonId: v.id("lessons"),
            moduleId: v.id("modules"),
            excerpt: v.string(),
          }),
        ),
      ),
    }),
  ),
  handler: async (ctx, { threadId }) => {
    const user = await getCurrentUser(ctx);
    const thread = await ctx.db.get(threadId);
    if (!thread || thread.userId !== user._id) return [];

    const messages = await ctx.db
      .query("assistantMessages")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .collect();

    return messages.map((m) => ({
      _id: m._id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
      citations: m.citations,
    }));
  },
});

export const createThread = mutation({
  args: {
    title: v.string(),
    moduleId: v.optional(v.id("modules")),
  },
  returns: v.id("assistantThreads"),
  handler: async (ctx, { title, moduleId }) => {
    const user = await getCurrentUser(ctx);
    const now = Date.now();
    return ctx.db.insert("assistantThreads", {
      userId: user._id,
      moduleId,
      title: title.trim().slice(0, 120) || "New conversation",
      createdAt: now,
      lastMessageAt: now,
    });
  },
});

export const appendMessage = mutation({
  args: {
    threadId: v.id("assistantThreads"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    citations: v.optional(
      v.array(
        v.object({
          lessonId: v.id("lessons"),
          moduleId: v.id("modules"),
          excerpt: v.string(),
        }),
      ),
    ),
  },
  returns: v.id("assistantMessages"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== user._id) {
      throw new Error("Thread not found");
    }

    const id = await ctx.db.insert("assistantMessages", {
      threadId: args.threadId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
      citations: args.citations,
    });
    await ctx.db.patch(args.threadId, { lastMessageAt: Date.now() });
    return id;
  },
});
