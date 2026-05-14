import { redirect } from "next/navigation";
import { getSignInUrl, withAuth } from "@workos-inc/authkit-nextjs";

import { AppShell } from "@/components/layout/app-shell";
import { ConvexSetupRequired } from "@/components/layout/convex-setup-required";
import { UserBootstrap } from "@/components/layout/user-bootstrap";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await withAuth();

  if (!user) {
    const signInUrl = await getSignInUrl();
    redirect(signInUrl);
  }

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return <ConvexSetupRequired userEmail={user.email} />;
  }

  return (
    <UserBootstrap
      email={user.email}
      displayName={
        [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0] || "Trainee"
      }
    >
      <AppShell email={user.email}>{children}</AppShell>
    </UserBootstrap>
  );
}
