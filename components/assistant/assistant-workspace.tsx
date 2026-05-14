"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Plus, Sparkles } from "lucide-react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AssistantChat } from "@/components/assistant/assistant-chat";
import { ThreadList } from "@/components/assistant/thread-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AssistantWorkspaceProps {
  initialThreadId: string | null;
  initialModuleId: string | null;
}

export function AssistantWorkspace({ initialThreadId, initialModuleId }: AssistantWorkspaceProps) {
  const threads = useQuery(api.assistantThreads.listForCurrentUser);
  const modules = useQuery(api.modules.listPublished);
  const createThread = useMutation(api.assistantThreads.createThread);

  const [userSelectedThreadId, setUserSelectedThreadId] = useState<Id<"assistantThreads"> | null>(
    initialThreadId ? (initialThreadId as Id<"assistantThreads">) : null,
  );
  const [scopeModuleOverride, setScopeModuleOverride] = useState<Id<"modules"> | null>(
    initialModuleId ? (initialModuleId as Id<"modules">) : null,
  );

  const activeThread = useMemo(() => {
    if (!threads) return null;
    if (userSelectedThreadId) {
      return threads.find((t) => t._id === userSelectedThreadId) ?? null;
    }
    return threads[0] ?? null;
  }, [threads, userSelectedThreadId]);

  const scopeModuleId = activeThread?.moduleId ?? scopeModuleOverride ?? null;

  const activeModuleTitle = useMemo(() => {
    if (!scopeModuleId) return null;
    return modules?.find((m) => m._id === scopeModuleId)?.title ?? null;
  }, [scopeModuleId, modules]);

  const handleNewThread = useCallback(async () => {
    const id = await createThread({
      title: "New conversation",
      moduleId: scopeModuleOverride ?? undefined,
    });
    setUserSelectedThreadId(id);
  }, [createThread, scopeModuleOverride]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Badge variant="outline" className="self-start">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">AI assistant</span>
        </Badge>
        <h1 className="font-display text-4xl leading-tight tracking-tight">Module-grounded assistant</h1>
        <p className="max-w-2xl text-muted-foreground">
          Answers are drawn only from your enrolled training material. If the curriculum does not cover your
          question, the assistant will say so rather than guess.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-4">
          <Button onClick={handleNewThread} className="justify-start" variant="outline">
            <Plus /> New conversation
          </Button>
          <ThreadList
            threads={threads ?? []}
            activeThreadId={activeThread?._id ?? null}
            onSelect={(id, moduleId) => {
              setUserSelectedThreadId(id);
              setScopeModuleOverride(moduleId ?? null);
            }}
          />
        </div>

        <div className="flex min-h-[60dvh] flex-col">
          {activeThread ? (
            <AssistantChat
              key={activeThread._id}
              threadId={activeThread._id}
              moduleId={activeThread.moduleId ?? null}
              moduleTitle={activeModuleTitle}
            />
          ) : (
            <Card className="flex flex-1 items-center justify-center">
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <Sparkles className="size-6 text-primary" />
                <p className="max-w-sm text-muted-foreground">
                  Start a new conversation to ask the assistant about any module you are enrolled in.
                </p>
                <Button onClick={handleNewThread}>
                  <Plus /> New conversation
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
