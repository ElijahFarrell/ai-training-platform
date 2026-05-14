import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserOrNull } from "./lib/auth";

const DEFAULT_DISPLAY_NAME = "Trainee";

export const me = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("users"),
      email: v.string(),
      displayName: v.string(),
      role: v.union(v.literal("learner"), v.literal("admin")),
    }),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) return null;
    return {
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };
  },
});

export const upsertFromIdentity = mutation({
  args: {
    email: v.string(),
    displayName: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const workosId = identity.subject;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", workosId))
      .unique();

    const displayName =
      args.displayName?.trim() ||
      (identity.name as string | undefined)?.trim() ||
      args.email.split("@")[0] ||
      DEFAULT_DISPLAY_NAME;

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        displayName,
        lastSeenAt: Date.now(),
      });
      return existing._id;
    }

    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existingByEmail) {
      await ctx.db.patch(existingByEmail._id, {
        workosId,
        displayName,
        lastSeenAt: Date.now(),
      });
      return existingByEmail._id;
    }

    const totalUsers = (await ctx.db.query("users").take(1)).length;
    const role = totalUsers === 0 ? "admin" : "learner";

    return ctx.db.insert("users", {
      workosId,
      email: args.email,
      displayName,
      role,
      lastSeenAt: Date.now(),
    });
  },
});

export const listAll = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("users"),
      email: v.string(),
      displayName: v.string(),
      role: v.union(v.literal("learner"), v.literal("admin")),
      lastSeenAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const me = await getCurrentUserOrNull(ctx);
    if (!me || me.role !== "admin") return [];
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({
      _id: u._id,
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      lastSeenAt: u.lastSeenAt,
    }));
  },
});
