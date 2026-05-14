import { v } from "convex/values";

import { query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getCurrentUser } from "./lib/auth";

const moduleSummaryValidator = v.object({
  _id: v.id("modules"),
  slug: v.string(),
  title: v.string(),
  summary: v.string(),
  agencyTag: v.string(),
  audience: v.string(),
  estimatedMinutes: v.number(),
  order: v.number(),
  status: v.union(v.literal("draft"), v.literal("published")),
});

export const listPublished = query({
  args: {},
  returns: v.array(moduleSummaryValidator),
  handler: async (ctx) => {
    await getCurrentUser(ctx);
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_status_and_order", (q) => q.eq("status", "published"))
      .collect();
    return modules.map(stripModule);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(v.null(), moduleSummaryValidator),
  handler: async (ctx, { slug }) => {
    await getCurrentUser(ctx);
    const moduleDoc = await ctx.db
      .query("modules")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!moduleDoc || moduleDoc.status !== "published") return null;
    return stripModule(moduleDoc);
  },
});

function stripModule(doc: Doc<"modules">) {
  return {
    _id: doc._id,
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    agencyTag: doc.agencyTag,
    audience: doc.audience,
    estimatedMinutes: doc.estimatedMinutes,
    order: doc.order,
    status: doc.status,
  };
}
