import { v, type Infer } from "convex/values";

import { internalMutation, mutation, type MutationCtx } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

const optionInput = v.object({ id: v.string(), label: v.string() });

const seedQuestionInput = v.object({
  prompt: v.string(),
  options: v.array(optionInput),
  correctOptionId: v.string(),
  explanation: v.string(),
});

const seedQuizInput = v.object({
  title: v.string(),
  passingScore: v.number(),
  questions: v.array(seedQuestionInput),
});

const seedLessonInput = v.object({
  title: v.string(),
  type: v.union(v.literal("video"), v.literal("reading"), v.literal("document")),
  body: v.string(),
  videoUrl: v.optional(v.string()),
  documentTitle: v.optional(v.string()),
  documentUrl: v.optional(v.string()),
});

const seedModuleInput = v.object({
  slug: v.string(),
  title: v.string(),
  summary: v.string(),
  agencyTag: v.string(),
  audience: v.string(),
  estimatedMinutes: v.number(),
  order: v.number(),
  lessons: v.array(seedLessonInput),
  quiz: seedQuizInput,
});

type SeedModuleInput = Infer<typeof seedModuleInput>;

async function applySeed(ctx: MutationCtx, modules: SeedModuleInput[]) {
  let modulesUpserted = 0;
  let lessonsUpserted = 0;
  let questionsUpserted = 0;

  for (const seed of modules) {
    let moduleDoc = await ctx.db
      .query("modules")
      .withIndex("by_slug", (q) => q.eq("slug", seed.slug))
      .unique();

    const modulePayload = {
      slug: seed.slug,
      title: seed.title,
      summary: seed.summary,
      agencyTag: seed.agencyTag,
      audience: seed.audience,
      estimatedMinutes: seed.estimatedMinutes,
      order: seed.order,
      status: "published" as const,
    };

    if (moduleDoc) {
      await ctx.db.patch(moduleDoc._id, modulePayload);
    } else {
      const id = await ctx.db.insert("modules", modulePayload);
      moduleDoc = await ctx.db.get(id);
    }
    if (!moduleDoc) continue;
    modulesUpserted += 1;

    const existingLessons = await ctx.db
      .query("lessons")
      .withIndex("by_module_and_order", (q) => q.eq("moduleId", moduleDoc._id))
      .collect();
    for (const lesson of existingLessons) await ctx.db.delete(lesson._id);

    for (let i = 0; i < seed.lessons.length; i += 1) {
      const lesson = seed.lessons[i];
      await ctx.db.insert("lessons", {
        moduleId: moduleDoc._id,
        title: lesson.title,
        type: lesson.type,
        body: lesson.body,
        videoUrl: lesson.videoUrl,
        documentTitle: lesson.documentTitle,
        documentUrl: lesson.documentUrl,
        order: i,
      });
      lessonsUpserted += 1;
    }

    const existingQuiz = await ctx.db
      .query("quizzes")
      .withIndex("by_module", (q) => q.eq("moduleId", moduleDoc._id))
      .unique();
    let quizId = existingQuiz?._id;
    if (existingQuiz) {
      await ctx.db.patch(existingQuiz._id, {
        title: seed.quiz.title,
        passingScore: seed.quiz.passingScore,
      });
    } else {
      quizId = await ctx.db.insert("quizzes", {
        moduleId: moduleDoc._id,
        title: seed.quiz.title,
        passingScore: seed.quiz.passingScore,
      });
    }
    if (!quizId) continue;

    const existingQuestions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz_and_order", (q) => q.eq("quizId", quizId))
      .collect();
    for (const q of existingQuestions) await ctx.db.delete(q._id);

    for (let i = 0; i < seed.quiz.questions.length; i += 1) {
      const question = seed.quiz.questions[i];
      await ctx.db.insert("quizQuestions", {
        quizId,
        prompt: question.prompt,
        options: question.options,
        correctOptionId: question.correctOptionId,
        explanation: question.explanation,
        order: i,
      });
      questionsUpserted += 1;
    }
  }

  return { modulesUpserted, lessonsUpserted, questionsUpserted };
}

const seedResultValidator = v.object({
  modulesUpserted: v.number(),
  lessonsUpserted: v.number(),
  questionsUpserted: v.number(),
});

export const seedFromAdmin = mutation({
  args: { modules: v.array(seedModuleInput) },
  returns: seedResultValidator,
  handler: async (ctx, { modules }) => {
    await requireAdmin(ctx);
    return applySeed(ctx, modules);
  },
});

export const seedInternal = internalMutation({
  args: { modules: v.array(seedModuleInput) },
  returns: seedResultValidator,
  handler: async (ctx, { modules }) => {
    return applySeed(ctx, modules);
  },
});

export const replaceChunksInternal = internalMutation({
  args: {
    chunks: v.array(
      v.object({
        lessonId: v.id("lessons"),
        moduleId: v.id("modules"),
        text: v.string(),
        embedding: v.array(v.float64()),
      }),
    ),
  },
  returns: v.number(),
  handler: async (ctx, { chunks }) => {
    const lessonIds = new Set<string>();
    for (const chunk of chunks) lessonIds.add(chunk.lessonId);
    for (const lessonIdString of lessonIds) {
      const lessonId = lessonIdString as import("./_generated/dataModel").Id<"lessons">;
      const existing = await ctx.db
        .query("lessonChunks")
        .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
        .collect();
      for (const row of existing) await ctx.db.delete(row._id);
    }

    for (const chunk of chunks) {
      await ctx.db.insert("lessonChunks", chunk);
    }
    return chunks.length;
  },
});
