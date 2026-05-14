"use client";

import Link from "next/link";
import { CheckCircle2, Circle, FileText, PlayCircle } from "lucide-react";

import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Lesson = Pick<Doc<"lessons">, "_id" | "title" | "type" | "order">;
type ProgressRow = {
  lessonId: Id<"lessons">;
  status: "not_started" | "in_progress" | "completed";
};

interface ModuleSidebarProps {
  moduleSlug: string;
  lessons: Lesson[];
  activeLessonId: Id<"lessons"> | null;
  progress: ProgressRow[];
}

const ICONS = {
  video: PlayCircle,
  reading: FileText,
  document: FileText,
} as const;

export function ModuleSidebar({ moduleSlug, lessons, activeLessonId, progress }: ModuleSidebarProps) {
  const statusByLesson = new Map(progress.map((p) => [p.lessonId, p.status]));

  return (
    <Card className="h-fit lg:sticky lg:top-6">
      <CardContent className="flex flex-col gap-1 p-3">
        {lessons.map((lesson, index) => {
          const Icon = ICONS[lesson.type];
          const status = statusByLesson.get(lesson._id) ?? "not_started";
          const isActive = lesson._id === activeLessonId;
          return (
            <Link
              key={lesson._id}
              href={`/modules/${moduleSlug}?lesson=${lesson._id}`}
              className={cn(
                "flex items-start gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted",
                isActive && "bg-secondary",
              )}
            >
              <span className="mt-0.5 text-muted-foreground">
                {status === "completed" ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <Circle className="size-4" />
                )}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <Icon className="size-3" />
                  Lesson {index + 1}
                </span>
                <span className="truncate">{lesson.title}</span>
              </span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
