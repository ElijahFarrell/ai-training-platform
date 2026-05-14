"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { CheckCircle2, RotateCcw, ShieldAlert, XCircle } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type Question = {
  _id: Id<"quizQuestions">;
  prompt: string;
  options: { id: string; label: string }[];
};

interface QuizFormProps {
  quiz: {
    _id: Id<"quizzes">;
    title: string;
    passingScore: number;
    questions: Question[];
  };
}

type FeedbackRow = {
  questionId: Id<"quizQuestions">;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string;
};

type Result = {
  score: number;
  passed: boolean;
  feedback: FeedbackRow[];
};

export function QuizForm({ quiz }: QuizFormProps) {
  const submit = useMutation(api.quizzes.submitAttempt);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit() {
    const missing = quiz.questions.find((q) => !answers[q._id]);
    if (missing) {
      toast.error("Please answer every question before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = await submit({
        quizId: quiz._id,
        answers: quiz.questions.map((q) => ({
          questionId: q._id,
          selectedOptionId: answers[q._id],
        })),
      });
      setResult(payload);
      if (payload.passed) toast.success(`Passed with ${payload.score}%`);
      else toast.error(`Score ${payload.score}% — keep going`);
    } catch (err) {
      console.error(err);
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setAnswers({});
    setResult(null);
  }

  const feedbackByQuestion = new Map<string, FeedbackRow>();
  if (result) {
    for (const fb of result.feedback) feedbackByQuestion.set(fb.questionId, fb);
  }

  return (
    <div className="flex flex-col gap-6">
      {result ? (
        <Alert variant={result.passed ? "success" : "destructive"}>
          {result.passed ? <CheckCircle2 className="size-5" /> : <ShieldAlert className="size-5" />}
          <AlertTitle>
            {result.passed ? "Module complete" : "Not yet"} · {result.score}%
          </AlertTitle>
          <AlertDescription>
            {result.passed
              ? "Nice work. Your administrator can see this attempt in the activity log."
              : `You need at least ${quiz.passingScore}% to pass. Review the explanations below and try again.`}
          </AlertDescription>
        </Alert>
      ) : null}

      {quiz.questions.map((question, index) => {
        const feedback = feedbackByQuestion.get(question._id);
        const selected = answers[question._id];
        return (
          <Card key={question._id}>
            <CardHeader>
              <Badge variant="outline" className="self-start text-[10px] uppercase tracking-[0.16em]">
                Question {index + 1} of {quiz.questions.length}
              </Badge>
              <CardTitle className="text-lg leading-relaxed font-normal text-foreground">
                {question.prompt}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selected ?? ""}
                onValueChange={(value) =>
                  setAnswers((prev) => ({ ...prev, [question._id]: value }))
                }
                disabled={Boolean(result)}
              >
                {question.options.map((option) => {
                  const isSelected = selected === option.id;
                  const isCorrect = feedback?.correctOptionId === option.id;
                  const showAsCorrect = feedback && isCorrect;
                  const showAsIncorrect = feedback && isSelected && !feedback.isCorrect;
                  return (
                    <Label
                      key={option.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted",
                        isSelected && !feedback && "border-primary bg-primary/5",
                        showAsCorrect && "border-success bg-success/10",
                        showAsIncorrect && "border-destructive bg-destructive/10",
                      )}
                    >
                      <RadioGroupItem value={option.id} className="mt-0.5" />
                      <span className="flex-1 text-sm leading-relaxed">{option.label}</span>
                      {showAsCorrect ? <CheckCircle2 className="size-4 text-success" /> : null}
                      {showAsIncorrect ? <XCircle className="size-4 text-destructive" /> : null}
                    </Label>
                  );
                })}
              </RadioGroup>
              {feedback ? (
                <div className="mt-4 rounded-md border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Why: </span>
                  {feedback.explanation}
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex items-center gap-3">
        {result ? (
          <Button onClick={reset} variant="outline">
            <RotateCcw /> Retake quiz
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Grading…" : "Submit quiz"}
          </Button>
        )}
      </div>
    </div>
  );
}
