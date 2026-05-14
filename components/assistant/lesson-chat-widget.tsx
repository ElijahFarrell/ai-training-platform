"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ArrowUpRight, Loader2, Sparkles, X } from "lucide-react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AssistantChat } from "@/components/assistant/assistant-chat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LessonChatWidgetProps {
  moduleId: Id<"modules">;
  moduleTitle: string;
}

export function LessonChatWidget({ moduleId, moduleTitle }: LessonChatWidgetProps) {
  const [open, setOpen] = useState(false);
  // Tracks a thread minted by *this* widget when the user first opens it
  // and no prior module-scoped thread exists. Reactive Convex queries
  // will eventually surface the same thread, so this fades naturally.
  const [createdThreadId, setCreatedThreadId] = useState<Id<"assistantThreads"> | null>(null);

  const threads = useQuery(api.assistantThreads.listForCurrentUser);
  const createThread = useMutation(api.assistantThreads.createThread);
  const creatingRef = useRef(false);

  const latestForModule = useMemo(() => {
    if (!threads) return null;
    const scoped = threads.filter((t) => t.moduleId === moduleId);
    if (scoped.length === 0) return null;
    return scoped.reduce((a, b) => (a.lastMessageAt >= b.lastMessageAt ? a : b));
  }, [threads, moduleId]);

  const threadId: Id<"assistantThreads"> | null =
    createdThreadId ?? latestForModule?._id ?? null;

  // Lazy-create only once the user signals real intent by opening the panel,
  // and only if no prior thread for this module is available to reuse.
  useEffect(() => {
    if (!open || threadId || !threads || creatingRef.current) return;
    creatingRef.current = true;
    createThread({ title: `Module Q&A — ${moduleTitle}`, moduleId })
      .then((id) => setCreatedThreadId(id))
      .finally(() => {
        creatingRef.current = false;
      });
  }, [open, threadId, threads, createThread, moduleId, moduleTitle]);

  return (
    <>
      <FloatingButton open={open} onClick={() => setOpen((v) => !v)} />
      <Panel
        open={open}
        onClose={() => setOpen(false)}
        moduleId={moduleId}
        moduleTitle={moduleTitle}
        threadId={threadId}
      />
    </>
  );
}

function FloatingButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={open ? "Close training assistant" : "Open training assistant"}
      aria-expanded={open}
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        open && "pointer-events-none opacity-0",
      )}
    >
      <Sparkles className="size-5" />
    </button>
  );
}

interface PanelProps {
  open: boolean;
  onClose: () => void;
  moduleId: Id<"modules">;
  moduleTitle: string;
  threadId: Id<"assistantThreads"> | null;
}

function Panel({ open, onClose, moduleId, moduleTitle, threadId }: PanelProps) {
  // Close on Escape — mirrors how Dialog primitives behave elsewhere in
  // the app, but without dragging in a full modal overlay (the lesson
  // should remain visible behind the popover).
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label={`Assistant for ${moduleTitle}`}
      className="fixed bottom-6 right-6 z-50 flex w-[calc(100vw-3rem)] max-w-[400px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-foreground/10 sm:right-6"
      style={{ height: "min(640px, calc(100dvh - 3rem))" }}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">Training assistant</span>
            <span className="truncate text-[11px] text-muted-foreground">{moduleTitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Open full assistant view">
            <Link href={`/assistant?module=${moduleId}`}>
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close assistant">
            <X className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        {threadId ? (
          <AssistantChat
            key={threadId}
            threadId={threadId}
            moduleId={moduleId}
            moduleTitle={moduleTitle}
            compact
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-primary" />
            <p>Spinning up your conversation…</p>
          </div>
        )}
      </div>
    </div>
  );
}
