"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { QuizForm } from "@/components/quiz/quiz-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface QuizPageProps {
  params: Promise<{ moduleSlug: string }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const { moduleSlug } = use(params);

  const moduleDoc = useQuery(api.modules.getBySlug, { slug: moduleSlug });
  const quiz = useQuery(
    api.quizzes.getForModule,
    moduleDoc ? { moduleId: moduleDoc._id } : "skip",
  );
  const latest = useQuery(
    api.quizzes.latestAttempt,
    quiz ? { quizId: quiz._id } : "skip",
  );

  if (moduleDoc === null || quiz === null) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 p-10 text-center">
          <h2 className="font-display text-2xl">Quiz not available</h2>
          <Button asChild variant="outline" className="self-center">
            <Link href="/modules">Back to catalogue</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (moduleDoc === undefined || quiz === undefined) {
    return <Skeleton className="h-72 w-full" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <Button asChild variant="ghost" size="sm" className="self-start">
        <Link href={`/modules/${moduleDoc.slug}`}>
          <ArrowLeft /> Back to module
        </Link>
      </Button>

      <header className="flex flex-col gap-3">
        <Badge variant="outline" className="self-start">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Knowledge check</span>
        </Badge>
        <h1 className="font-display text-4xl leading-tight tracking-tight">{quiz.title}</h1>
        <p className="max-w-2xl text-muted-foreground">
          Pass with at least {quiz.passingScore}% to mark this module as complete. You can retake the quiz as
          many times as you need.
        </p>
        {latest ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Last attempt:
            <Badge variant={latest.passed ? "success" : "destructive"}>
              {latest.score}% · {latest.passed ? "Passed" : "Not passed"}
            </Badge>
          </div>
        ) : null}
      </header>

      <QuizForm quiz={quiz} />
    </div>
  );
}
