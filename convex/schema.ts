import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const userRole = v.union(v.literal("learner"), v.literal("admin"));

export const lessonType = v.union(
  v.literal("video"),
  v.literal("reading"),
  v.literal("document"),
);

export const progressStatus = v.union(
  v.literal("not_started"),
  v.literal("in_progress"),
  v.literal("completed"),
);

export const moduleStatus = v.union(v.literal("draft"), v.literal("published"));

export const EMBEDDING_DIMENSIONS = 1536;

export default defineSchema({
  users: defineTable({
    workosId: v.string(),
    email: v.string(),
    displayName: v.string(),
    role: userRole,
    lastSeenAt: v.number(),
  })
    .index("by_workos_id", ["workosId"])
    .index("by_email", ["email"]),

  modules: defineTable({
    slug: v.string(),
    title: v.string(),
    summary: v.string(),
    agencyTag: v.string(),
    audience: v.string(),
    estimatedMinutes: v.number(),
    order: v.number(),
    status: moduleStatus,
  })
    .index("by_slug", ["slug"])
    .index("by_status_and_order", ["status", "order"]),

  lessons: defineTable({
    moduleId: v.id("modules"),
    title: v.string(),
    type: lessonType,
    body: v.string(),
    videoUrl: v.optional(v.string()),
    documentTitle: v.optional(v.string()),
    documentUrl: v.optional(v.string()),
    order: v.number(),
  }).index("by_module_and_order", ["moduleId", "order"]),

  lessonChunks: defineTable({
    lessonId: v.id("lessons"),
    moduleId: v.id("modules"),
    text: v.string(),
    embedding: v.array(v.float64()),
  })
    .index("by_lesson", ["lessonId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: EMBEDDING_DIMENSIONS,
      filterFields: ["moduleId", "lessonId"],
    }),

  quizzes: defineTable({
    moduleId: v.id("modules"),
    title: v.string(),
    passingScore: v.number(),
  }).index("by_module", ["moduleId"]),

  quizQuestions: defineTable({
    quizId: v.id("quizzes"),
    prompt: v.string(),
    options: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
      }),
    ),
    correctOptionId: v.string(),
    explanation: v.string(),
    order: v.number(),
  }).index("by_quiz_and_order", ["quizId", "order"]),

  quizAttempts: defineTable({
    quizId: v.id("quizzes"),
    moduleId: v.id("modules"),
    userId: v.id("users"),
    answers: v.array(
      v.object({
        questionId: v.id("quizQuestions"),
        selectedOptionId: v.string(),
        isCorrect: v.boolean(),
      }),
    ),
    score: v.number(),
    passed: v.boolean(),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_module", ["userId", "moduleId"])
    .index("by_user_and_quiz", ["userId", "quizId"]),

  lessonProgress: defineTable({
    userId: v.id("users"),
    moduleId: v.id("modules"),
    lessonId: v.id("lessons"),
    status: progressStatus,
    updatedAt: v.number(),
  })
    .index("by_user_and_lesson", ["userId", "lessonId"])
    .index("by_user_and_module", ["userId", "moduleId"]),

  assistantThreads: defineTable({
    userId: v.id("users"),
    moduleId: v.optional(v.id("modules")),
    title: v.string(),
    createdAt: v.number(),
    lastMessageAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_module", ["userId", "moduleId"]),

  assistantMessages: defineTable({
    threadId: v.id("assistantThreads"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    createdAt: v.number(),
    citations: v.optional(
      v.array(
        v.object({
          lessonId: v.id("lessons"),
          moduleId: v.id("modules"),
          excerpt: v.string(),
        }),
      ),
    ),
  }).index("by_thread", ["threadId"]),
});
