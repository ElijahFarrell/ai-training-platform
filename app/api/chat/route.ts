import { ConvexHttpClient } from "convex/browser";
import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from "ai";
import { toAISdkStream } from "@mastra/ai-sdk";
import { withAuth } from "@workos-inc/authkit-nextjs";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { trainingAssistant } from "@/lib/mastra";
import {
  buildGroundedSystemAddendum,
  type RetrievedChunk,
} from "@/lib/mastra/build-grounded-prompt";

export const runtime = "nodejs";

interface ChatRequestBody {
  messages: UIMessage[];
  moduleId?: Id<"modules">;
}

export async function POST(req: Request) {
  const auth = await withAuth();
  if (!auth.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return new Response("Convex deployment URL not configured.", { status: 500 });
  }

  const body = (await req.json()) as ChatRequestBody;
  const { messages, moduleId } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Bad Request", { status: 400 });
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const userText = extractText(lastUserMessage);

  let chunks: RetrievedChunk[] = [];
  try {
    const convex = new ConvexHttpClient(convexUrl);
    if (auth.accessToken) convex.setAuth(auth.accessToken);
    chunks = await convex.action(api.retrieval.retrieveContext, {
      query: userText,
      moduleId,
    });
  } catch (error) {
    console.error("Retrieval failed", error);
  }

  const groundedAddendum = buildGroundedSystemAddendum(chunks);

  const stream = await trainingAssistant.stream(messages, {
    system: groundedAddendum,
  });

  const uiMessageStream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      const aisStream = toAISdkStream(stream, { from: "agent", version: "v6" });
      const reader = aisStream.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) await writer.write(value);
        }
      } finally {
        reader.releaseLock();
      }
    },
  });

  return createUIMessageStreamResponse({ stream: uiMessageStream });
}

function extractText(message: UIMessage | undefined): string {
  if (!message) return "";
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
