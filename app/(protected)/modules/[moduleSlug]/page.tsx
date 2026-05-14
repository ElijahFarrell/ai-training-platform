"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "convex/react";
import { ArrowRight, Sparkles } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { LessonChatWidget } from "@/components/assistant/lesson-chat-widget";
import { LessonViewer } from "@/components/modules/lesson-viewer";
import { ModuleSidebar } from "@/components/modules/module-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ModulePageProps {
  params: Promise<{ moduleSlug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default function ModulePage({ params, searchParams }: ModulePageProps) {
  const { moduleSlug } = use(params);
  const { lesson: lessonParam } = use(searchParams);

  const moduleDoc = useQuery(api.modules.getBySlug, { slug: moduleSlug });
  const lessons = useQuery(
    api.lessons.listForModule,
    moduleDoc ? { moduleId: moduleDoc._id } : "skip",
  );
  const progress = useQuery(
    api.progress.forModule,
    moduleDoc ? { moduleId: moduleDoc._id } : "skip",
  );
  const quiz = useQuery(
    api.quizzes.getForModule,
    moduleDoc ? { moduleId: moduleDoc._id } : "skip",
  );

  if (moduleDoc === null) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 p-10 text-center">
          <h2 className="font-display text-2xl">Module not found</h2>
          <p className="text-muted-foreground">Try returning to the catalogue.</p>
          <Button asChild variant="outline" className="self-center">
            <Link href="/modules">Back to catalogue</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (moduleDoc === undefined || lessons === undefined) {
    return <Skeleton className="h-64 w-full" />;
  }

  const activeLesson =
    (lessonParam ? lessons.find((l) => l._id === lessonParam) : undefined) ?? lessons[0] ?? null;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{moduleDoc.agencyTag}</Badge>
          <Badge variant="outline">{moduleDoc.audience}</Badge>
          <Badge variant="outline" className="font-mono">
            {moduleDoc.estimatedMinutes} min
          </Badge>
        </div>
        <h1 className="font-display text-4xl leading-tight tracking-tight text-balance">
          {moduleDoc.title}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{moduleDoc.summary}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="accent" size="sm">
            <Link href={`/assistant?module=${moduleDoc._id}`}>
              <Sparkles /> Ask the assistant about this module
            </Link>
          </Button>
          {quiz ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/modules/${moduleDoc.slug}/quiz`}>
                Take the quiz <ArrowRight />
              </Link>
            </Button>
          ) : null}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <ModuleSidebar
          moduleSlug={moduleDoc.slug}
          lessons={lessons}
          activeLessonId={activeLesson?._id ?? null}
          progress={progress ?? []}
        />
        {activeLesson ? (
          <LessonViewer
            lesson={activeLesson}
            moduleId={moduleDoc._id}
            progress={progress?.find((p) => p.lessonId === activeLesson._id) ?? null}
          />
        ) : (
          <Card>
            <CardContent className="p-10">
              <p className="text-muted-foreground">This module has no lessons yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <LessonChatWidget moduleId={moduleDoc._id} moduleTitle={moduleDoc.title} />
    </div>
  );
}
