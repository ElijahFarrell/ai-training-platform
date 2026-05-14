"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

import { Button } from "@/components/ui/button";

export function SignOutMenu() {
  const { signOut } = useAuth();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Sign out"
      onClick={() => void signOut()}
    >
      <LogOut />
    </Button>
  );
}
