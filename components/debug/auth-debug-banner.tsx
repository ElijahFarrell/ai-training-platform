"use client";

import { useQuery } from "convex/react";
import { useAccessToken, useAuth } from "@workos-inc/authkit-nextjs/components";

import { api } from "@/convex/_generated/api";

function decodeClaims(token: string | null | undefined): Record<string, unknown> | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const padded = parts[1] + "=".repeat((4 - (parts[1].length % 4)) % 4);
    const json = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function AuthDebugBanner() {
  const { user } = useAuth();
  const { accessToken } = useAccessToken();
  const debug = useQuery(api.authDebug.inspect);

  const claims = decodeClaims(accessToken);

  return (
    <details className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
      <summary className="cursor-pointer font-mono font-semibold">
        auth bridge debug — click to expand
      </summary>
      <div className="mt-3 space-y-3 font-mono">
        <section>
          <div className="font-semibold">WorkOS user (browser)</div>
          <pre className="overflow-x-auto whitespace-pre-wrap break-all">
            {user ? JSON.stringify({ id: user.id, email: user.email }, null, 2) : "null"}
          </pre>
        </section>
        <section>
          <div className="font-semibold">Access token claims (decoded, NOT verified)</div>
          <pre className="overflow-x-auto whitespace-pre-wrap break-all">
            {claims ? JSON.stringify(claims, null, 2) : accessToken ? "<could not decode>" : "<no access token in browser>"}
          </pre>
        </section>
        <section>
          <div className="font-semibold">What Convex sees from ctx.auth.getUserIdentity()</div>
          <pre className="overflow-x-auto whitespace-pre-wrap break-all">
            {debug === undefined ? "<loading or query failed — check console>" : debug.identityReceived ? debug.rawJson : "identity = null (JWT rejected by Convex)"}
          </pre>
        </section>
      </div>
    </details>
  );
}
