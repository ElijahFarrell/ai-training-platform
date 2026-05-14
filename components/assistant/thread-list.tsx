"use client";

import { MessageSquareText } from "lucide-react";

import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Thread = Pick<
  Doc<"assistantThreads">,
  "_id" | "title" | "moduleId" | "lastMessageAt"
>;

interface ThreadListProps {
  threads: Thread[];
  activeThreadId: Id<"assistantThreads"> | null;
  onSelect: (threadId: Id<"assistantThreads">, moduleId?: Id<"modules">) => void;
}

export function ThreadList({ threads, activeThreadId, onSelect }: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          No conversations yet. Start one to grind through a module with the assistant.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-2">
        {threads.map((t) => {
          const active = t._id === activeThreadId;
          return (
            <button
              key={t._id}
              type="button"
              onClick={() => onSelect(t._id, t.moduleId)}
              className={cn(
                "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                active && "bg-secondary",
              )}
            >
              <MessageSquareText className="mt-0.5 size-4 text-muted-foreground" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{t.title || "Untitled conversation"}</span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {formatRelative(t.lastMessageAt)}
                </span>
              </span>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function formatRelative(timestamp: number) {
  if (!timestamp) return "—";
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
