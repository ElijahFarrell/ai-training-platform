"use client";

import { use } from "react";

import { AssistantWorkspace } from "@/components/assistant/assistant-workspace";

interface AssistantPageProps {
  searchParams: Promise<{
    thread?: string;
    module?: string;
  }>;
}

export default function AssistantPage({ searchParams }: AssistantPageProps) {
  const { thread, module: moduleId } = use(searchParams);

  return <AssistantWorkspace initialThreadId={thread ?? null} initialModuleId={moduleId ?? null} />;
}
