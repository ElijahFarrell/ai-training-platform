import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

export type AuthCtx = QueryCtx | MutationCtx;

export class UnauthenticatedError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "UnauthenticatedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function getCurrentUser(ctx: AuthCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new UnauthenticatedError();

  const workosId = identity.subject;
  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_id", (q) => q.eq("workosId", workosId))
    .unique();

  if (!user) {
    throw new ForbiddenError(
      "Your account is not provisioned. Ask an administrator to add you to the training roster.",
    );
  }

  return user;
}

export async function getCurrentUserOrNull(ctx: AuthCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return ctx.db
    .query("users")
    .withIndex("by_workos_id", (q) => q.eq("workosId", identity.subject))
    .unique();
}

export async function requireAdmin(ctx: AuthCtx): Promise<Doc<"users">> {
  const user = await getCurrentUser(ctx);
  if (user.role !== "admin") {
    throw new ForbiddenError("Admin role required");
  }
  return user;
}
