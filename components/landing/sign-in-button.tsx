"use client";

import { ArrowRight } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

import { Button } from "@/components/ui/button";

export function LandingSignInButton() {
  const { refreshAuth } = useAuth();

  return (
    <Button
      type="button"
      size="lg"
      onClick={() => {
        void refreshAuth({ ensureSignedIn: true });
      }}
    >
      Sign in with agency credentials <ArrowRight />
    </Button>
  );
}
