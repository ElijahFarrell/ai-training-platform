"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { AuthKitProvider, useAccessToken, useAuth } from "@workos-inc/authkit-nextjs/components";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <AuthKitProvider>
        <ConvexMisconfiguredNotice>{children}</ConvexMisconfiguredNotice>
      </AuthKitProvider>
    );
  }

  return (
    <AuthKitProvider>
      <ConvexProviderWithAuth client={convex} useAuth={useAuthFromAuthKit}>
        {children}
      </ConvexProviderWithAuth>
    </AuthKitProvider>
  );
}

function useAuthFromAuthKit() {
  const { user, loading: isLoading } = useAuth();
  const { getAccessToken, refresh } = useAccessToken();

  const isAuthenticated = !!user;

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken?: boolean } = {}): Promise<string | null> => {
      if (!user) {
        return null;
      }
      try {
        if (forceRefreshToken) {
          return (await refresh()) ?? null;
        }
        return (await getAccessToken()) ?? null;
      } catch (error) {
        console.error("Failed to fetch WorkOS access token", error);
        return null;
      }
    },
    [user, refresh, getAccessToken],
  );

  return useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      fetchAccessToken,
    }),
    [isLoading, isAuthenticated, fetchAccessToken],
  );
}

function ConvexMisconfiguredNotice({ children }: { children: ReactNode }) {
  if (typeof window !== "undefined") {
    console.warn(
      "[ai-training-platform] NEXT_PUBLIC_CONVEX_URL is not set. Convex client disabled. Run `npx convex dev` to provision one.",
    );
  }
  return <>{children}</>;
}
