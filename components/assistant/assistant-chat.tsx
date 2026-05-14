"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { useMutation, useQuery } from "convex/react";
import { Send, Sparkles } from "lucide-react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AssistantChatProps {
  threadId: Id<"assistantThreads">;
  moduleId: Id<"modules"> | null;
  moduleTitle: string | null;
  /**
   * Drop the Card chrome and internal header so the chat can be nested
   * inside a host that already provides those (e.g. the lesson popover).
   */
  compact?: boolean;
}

export function AssistantChat({ threadId, moduleId, moduleTitle, compact = false }: AssistantChatProps) {
  const persisted = useQuery(api.assistantThreads.messagesForThread, { threadId });
  const appendMessage = useMutation(api.assistantThreads.appendMessage);

  const initialMessages = useMemo<UIMessage[]>(() => {
    if (!persisted) return [];
    return persisted.map((m) => ({
      id: m._id,
      role: m.role,
      parts: [{ type: "text", text: m.content }],
    })) as UIMessage[];
  }, [persisted]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages, moduleId: moduleId ?? undefined },
        }),
      }),
    [moduleId],
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    id: threadId,
    transport,
    onFinish: async ({ message }) => {
      const text = collectText(message);
      if (!text) return;
      await appendMessage({
        threadId,
        role: "assistant",
        content: text,
      });
    },
  });

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, setMessages]);

  const [input, setInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, status]);

  const isLoading = persisted === undefined;
  const isBusy = status === "streaming" || status === "submitted";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isBusy) return;
    setInput("");

    await appendMessage({ threadId, role: "user", content: trimmed });
    void sendMessage({ text: trimmed });
  }

  const body = (
    <>
      {compact ? null : (
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-primary" />
            <span className="font-medium">Training assistant</span>
          </div>
          {moduleTitle ? (
            <Badge variant="secondary" className="text-xs">
              Scoped to: {moduleTitle}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              All modules
            </Badge>
          )}
        </div>
      )}

      <div
        ref={scrollerRef}
        className={cn(
          "flex-1 overflow-y-auto py-4",
          compact ? "px-4" : "px-6",
        )}
      >
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-16 w-2/3 self-end" />
            </>
          ) : messages.length === 0 ? (
            <EmptyState moduleTitle={moduleTitle} compact={compact} />
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}
          {status === "submitted" ? (
            <div className="self-start rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Searching the curriculum…
            </div>
          ) : null}
        </div>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center gap-2 border-t border-border bg-background py-3",
          compact ? "px-3" : "px-4",
        )}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={moduleTitle ? `Ask about ${moduleTitle}…` : "Ask the assistant…"}
          disabled={isBusy}
        />
        <Button type="submit" disabled={!input.trim() || isBusy} size={compact ? "icon" : "default"}>
          <Send />
          {compact ? null : "Send"}
        </Button>
      </form>
    </>
  );

  if (compact) {
    return <div className="flex flex-1 flex-col">{body}</div>;
  }

  return (
    <Card className="flex flex-1 flex-col">
      <CardContent className="flex flex-1 flex-col gap-4 p-0">{body}</CardContent>
    </Card>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const text = collectText(message);
  const isUser = message.role === "user";
  return (
    <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
      <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {isUser ? "You" : "Assistant"}
      </span>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-md px-3 py-2 text-sm leading-relaxed",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        {text}
      </div>
    </div>
  );
}

function EmptyState({
  moduleTitle,
  compact = false,
}: {
  moduleTitle: string | null;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border border-dashed border-border bg-muted/30 text-sm text-muted-foreground",
        compact ? "p-4 text-xs" : "p-6",
      )}
    >
      <p>
        Ask anything about{" "}
        <span className="font-medium text-foreground">{moduleTitle ?? "your enrolled modules"}</span>. The
        assistant searches the curriculum and answers with citations to the source lesson.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>What does OMB M-24-10 require for rights-impacting AI uses?</li>
        <li>How do I structure a prompt to reduce hallucinations?</li>
        <li>When should I escalate an AI use case to my Chief AI Officer?</li>
      </ul>
    </div>
  );
}

function collectText(message: UIMessage): string {
  const parts = (message as unknown as { parts?: Array<{ type: string; text?: string }> }).parts;
  if (Array.isArray(parts)) {
    return parts
      .filter((p) => p.type === "text" && typeof p.text === "string")
      .map((p) => p.text)
      .join("\n");
  }
  const content = (message as unknown as { content?: string }).content;
  return typeof content === "string" ? content : "";
}
