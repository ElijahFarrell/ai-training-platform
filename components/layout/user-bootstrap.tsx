"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";

interface UserBootstrapProps {
  email: string;
  displayName: string;
  children: React.ReactNode;
}

export function UserBootstrap({ email, displayName, children }: UserBootstrapProps) {
  const upsert = useMutation(api.users.upsertFromIdentity);

  useEffect(() => {
    void upsert({ email, displayName }).catch((err) => {
      console.error("Failed to upsert user", err);
    });
  }, [email, displayName, upsert]);

  return <>{children}</>;
}
