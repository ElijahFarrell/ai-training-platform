import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action, internalAction, internalQuery } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getCurrentUser } from "./lib/auth";

const EMBEDDING_DIMENSIONS = 1536;
const DEFAULT_LIMIT = 6;
const DEFAULT_EMBEDDING_MODEL = "openai/text-embedding-3-small";
const AI_GATEWAY_EMBEDDINGS_URL = "https://ai-gateway.vercel.sh/v1/embeddings";

type RetrievedChunk = {
  text: string;
  excerpt: string;
  lessonId: Id<"lessons">;
  moduleId: Id<"modules">;
  lessonTitle: string;
  moduleTitle: string;
  score: number;
};

type HydratedChunk = {
  _id: Id<"lessonChunks">;
  text: string;
  lessonId: Id<"lessons">;
  moduleId: Id<"modules">;
  lessonTitle: string;
  moduleTitle: string;
};

const retrievedChunkValidator = v.object({
  text: v.string(),
  excerpt: v.string(),
  lessonId: v.id("lessons"),
  moduleId: v.id("modules"),
  lessonTitle: v.string(),
  moduleTitle: v.string(),
  score: v.number(),
});

export const retrieveContext = action({
  args: {
    query: v.string(),
    moduleId: v.optional(v.id("modules")),
    limit: v.optional(v.number()),
  },
  returns: v.array(retrievedChunkValidator),
  handler: async (ctx, { query, moduleId, limit }): Promise<RetrievedChunk[]> => {
    if (!query.trim()) return [];

    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      console.warn(
        "AI_GATEWAY_API_KEY is not set on the Convex deployment. Skipping retrieval.",
      );
      return [];
    }

    const embedding = await embedQuery(query, apiKey);
    if (!embedding) return [];

    const limitValue = Math.min(Math.max(limit ?? DEFAULT_LIMIT, 1), 32);

    const results = await ctx.vectorSearch("lessonChunks", "by_embedding", {
      vector: embedding,
      limit: limitValue,
      filter: moduleId ? (q) => q.eq("moduleId", moduleId) : undefined,
    });

    if (results.length === 0) return [];

    const hydrated: HydratedChunk[] = await ctx.runQuery(internal.retrieval.hydrateChunks, {
      ids: results.map((r) => r._id),
    });

    return results
      .map((r): RetrievedChunk | null => {
        const row = hydrated.find((h: HydratedChunk) => h._id === r._id);
        if (!row) return null;
        return {
          text: row.text,
          excerpt: row.text.slice(0, 320).replace(/\s+/g, " ").trim(),
          lessonId: row.lessonId,
          moduleId: row.moduleId,
          lessonTitle: row.lessonTitle,
          moduleTitle: row.moduleTitle,
          score: r._score,
        };
      })
      .filter((x): x is RetrievedChunk => x !== null);
  },
});

export const hydrateChunks = internalQuery({
  args: { ids: v.array(v.id("lessonChunks")) },
  returns: v.array(
    v.object({
      _id: v.id("lessonChunks"),
      text: v.string(),
      lessonId: v.id("lessons"),
      moduleId: v.id("modules"),
      lessonTitle: v.string(),
      moduleTitle: v.string(),
    }),
  ),
  handler: async (ctx, { ids }) => {
    const moduleCache = new Map<string, string>();
    const lessonCache = new Map<string, string>();
    const result = [] as Array<{
      _id: Id<"lessonChunks">;
      text: string;
      lessonId: Id<"lessons">;
      moduleId: Id<"modules">;
      lessonTitle: string;
      moduleTitle: string;
    }>;

    for (const id of ids) {
      const row = await ctx.db.get(id);
      if (!row) continue;
      let lessonTitle = lessonCache.get(row.lessonId);
      if (!lessonTitle) {
        const lesson = await ctx.db.get(row.lessonId);
        lessonTitle = lesson?.title ?? "";
        lessonCache.set(row.lessonId, lessonTitle);
      }
      let moduleTitle = moduleCache.get(row.moduleId);
      if (!moduleTitle) {
        const moduleDoc = await ctx.db.get(row.moduleId);
        moduleTitle = moduleDoc?.title ?? "";
        moduleCache.set(row.moduleId, moduleTitle);
      }
      result.push({
        _id: row._id,
        text: row.text,
        lessonId: row.lessonId,
        moduleId: row.moduleId,
        lessonTitle,
        moduleTitle,
      });
    }
    return result;
  },
});

type LessonForIndexing = {
  _id: Id<"lessons">;
  moduleId: Id<"modules">;
  body: string;
};

type ChunkRecord = {
  lessonId: Id<"lessons">;
  moduleId: Id<"modules">;
  text: string;
  embedding: number[];
};

async function buildChunkRecords(
  lessons: LessonForIndexing[],
  apiKey: string,
): Promise<ChunkRecord[]> {
  const chunks: ChunkRecord[] = [];
  for (const lesson of lessons) {
    const segments = chunkLessonBody(lesson.body);
    if (segments.length === 0) continue;
    const embeddings = await embedBatch(segments, apiKey);
    for (let i = 0; i < segments.length; i += 1) {
      const embedding = embeddings[i];
      if (!embedding) continue;
      chunks.push({
        lessonId: lesson._id,
        moduleId: lesson.moduleId,
        text: segments[i],
        embedding,
      });
    }
  }
  return chunks;
}

export const reindexAllLessons = action({
  args: {},
  returns: v.object({ chunksIndexed: v.number() }),
  handler: async (ctx): Promise<{ chunksIndexed: number }> => {
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      throw new Error("AI_GATEWAY_API_KEY must be set on the Convex deployment.");
    }

    const me: { isAdmin: boolean } = await ctx.runQuery(internal.retrieval.meIfAdmin, {});
    if (!me.isAdmin) {
      throw new Error("Only admins can reindex training content.");
    }

    const lessons: LessonForIndexing[] = await ctx.runQuery(
      internal.retrieval.allLessonsForIndexing,
      {},
    );
    const chunks = await buildChunkRecords(lessons, apiKey);

    await ctx.runMutation(internal.seed.replaceChunksInternal, { chunks });
    return { chunksIndexed: chunks.length };
  },
});

export const reindexAllLessonsInternal = internalAction({
  args: {},
  returns: v.object({ chunksIndexed: v.number() }),
  handler: async (ctx): Promise<{ chunksIndexed: number }> => {
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) throw new Error("AI_GATEWAY_API_KEY must be set on the Convex deployment.");

    const lessons: LessonForIndexing[] = await ctx.runQuery(
      internal.retrieval.allLessonsForIndexing,
      {},
    );
    const chunks = await buildChunkRecords(lessons, apiKey);

    await ctx.runMutation(internal.seed.replaceChunksInternal, { chunks });
    return { chunksIndexed: chunks.length };
  },
});

export const allLessonsForIndexing = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("lessons"),
      moduleId: v.id("modules"),
      body: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const lessons = await ctx.db.query("lessons").collect();
    return lessons.map((l) => ({ _id: l._id, moduleId: l.moduleId, body: l.body }));
  },
});

export const meIfAdmin = internalQuery({
  args: {},
  returns: v.object({ isAdmin: v.boolean() }),
  handler: async (ctx) => {
    try {
      const user = await getCurrentUser(ctx);
      return { isAdmin: user.role === "admin" };
    } catch {
      return { isAdmin: false };
    }
  },
});

function chunkLessonBody(body: string): string[] {
  const cleaned = body.replace(/\r\n/g, "\n").trim();
  if (!cleaned) return [];

  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const TARGET = 600;
  const MAX = 900;
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const candidate = current ? `${current}\n\n${para}` : para;
    if (candidate.length <= TARGET) {
      current = candidate;
      continue;
    }
    if (candidate.length <= MAX && current.length < TARGET / 2) {
      current = candidate;
      continue;
    }
    if (current) chunks.push(current);
    current = para;
  }
  if (current) chunks.push(current);

  return chunks;
}

async function embedQuery(query: string, apiKey: string): Promise<number[] | null> {
  const embeddings = await embedBatch([query], apiKey);
  return embeddings[0] ?? null;
}

async function embedBatch(input: string[], apiKey: string): Promise<number[][]> {
  if (input.length === 0) return [];

  const model = process.env.EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL;

  const response = await fetch(AI_GATEWAY_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI Gateway embeddings error ${response.status}: ${text}`);
  }

  const payload = (await response.json()) as {
    data: Array<{ embedding: number[] }>;
  };
  return payload.data.map((d) => d.embedding);
}
