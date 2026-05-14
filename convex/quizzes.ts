import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

const optionValidator = v.object({ id: v.string(), label: v.string() });

const quizQuestionValidator = v.object({
  _id: v.id("quizQuestions"),
  quizId: v.id("quizzes"),
  prompt: v.string(),
  options: v.array(optionValidator),
  order: v.number(),
});

const quizWithQuestionsValidator = v.object({
  _id: v.id("quizzes"),
  moduleId: v.id("modules"),
  title: v.string(),
  passingScore: v.number(),
  questions: v.array(quizQuestionValidator),
});

export const getForModule = query({
  args: { moduleId: v.id("modules") },
  returns: v.union(v.null(), quizWithQuestionsValidator),
  handler: async (ctx, { moduleId }) => {
    await getCurrentUser(ctx);
    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
      .unique();
    if (!quiz) return null;

    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz_and_order", (q) => q.eq("quizId", quiz._id))
      .collect();

    return {
      _id: quiz._id,
      moduleId: quiz.moduleId,
      title: quiz.title,
      passingScore: quiz.passingScore,
      questions: questions.map((q) => ({
        _id: q._id,
        quizId: q.quizId,
        prompt: q.prompt,
        options: q.options,
        order: q.order,
      })),
    };
  },
});

export const latestAttempt = query({
  args: { quizId: v.id("quizzes") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("quizAttempts"),
      score: v.number(),
      passed: v.boolean(),
      completedAt: v.number(),
    }),
  ),
  handler: async (ctx, { quizId }) => {
    const user = await getCurrentUser(ctx);
    const attempt = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_and_quiz", (q) => q.eq("userId", user._id).eq("quizId", quizId))
      .order("desc")
      .first();
    if (!attempt) return null;
    return {
      _id: attempt._id,
      score: attempt.score,
      passed: attempt.passed,
      completedAt: attempt.completedAt,
    };
  },
});

export const submitAttempt = mutation({
  args: {
    quizId: v.id("quizzes"),
    answers: v.array(
      v.object({
        questionId: v.id("quizQuestions"),
        selectedOptionId: v.string(),
      }),
    ),
  },
  returns: v.object({
    score: v.number(),
    passed: v.boolean(),
    feedback: v.array(
      v.object({
        questionId: v.id("quizQuestions"),
        correctOptionId: v.string(),
        isCorrect: v.boolean(),
        explanation: v.string(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) throw new Error("Quiz not found");

    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz_and_order", (q) => q.eq("quizId", quiz._id))
      .collect();

    const questionById = new Map(questions.map((q) => [q._id.toString(), q]));

    let correct = 0;
    const gradedAnswers: Array<{
      questionId: typeof questions[number]["_id"];
      selectedOptionId: string;
      isCorrect: boolean;
    }> = [];
    const feedback: Array<{
      questionId: typeof questions[number]["_id"];
      correctOptionId: string;
      isCorrect: boolean;
      explanation: string;
    }> = [];

    for (const answer of args.answers) {
      const question = questionById.get(answer.questionId.toString());
      if (!question) continue;
      const isCorrect = question.correctOptionId === answer.selectedOptionId;
      if (isCorrect) correct += 1;
      gradedAnswers.push({
        questionId: question._id,
        selectedOptionId: answer.selectedOptionId,
        isCorrect,
      });
      feedback.push({
        questionId: question._id,
        correctOptionId: question.correctOptionId,
        isCorrect,
        explanation: question.explanation,
      });
    }

    const score = questions.length === 0 ? 0 : Math.round((correct / questions.length) * 100);
    const passed = score >= quiz.passingScore;

    await ctx.db.insert("quizAttempts", {
      quizId: quiz._id,
      moduleId: quiz.moduleId,
      userId: user._id,
      answers: gradedAnswers,
      score,
      passed,
      completedAt: Date.now(),
    });

    return { score, passed, feedback };
  },
});
