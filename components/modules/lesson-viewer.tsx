"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { CheckCircle2, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Lesson = Pick<
  Doc<"lessons">,
  "_id" | "title" | "type" | "body" | "videoUrl" | "documentTitle" | "documentUrl"
>;

type ProgressRow = {
  status: "not_started" | "in_progress" | "completed";
};

interface LessonViewerProps {
  lesson: Lesson;
  moduleId: Id<"modules">;
  progress: ProgressRow | null;
}

export function LessonViewer({ lesson, moduleId, progress }: LessonViewerProps) {
  const mark = useMutation(api.progress.markLesson);
  const completed = progress?.status === "completed";

  useEffect(() => {
    if (!progress || progress.status === "not_started") {
      void mark({
        moduleId,
        lessonId: lesson._id,
        status: "in_progress",
      }).catch(() => undefined);
    }
  }, [lesson._id, moduleId, progress, mark]);

  return (
    <Card>
      <CardHeader className="gap-2">
        <Badge variant="outline" className="self-start text-[10px] uppercase tracking-[0.16em]">
          {lesson.type === "video" ? "Video lesson" : lesson.type === "reading" ? "Reading" : "Reference"}
        </Badge>
        <CardTitle className="font-display text-3xl leading-tight">{lesson.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {lesson.type === "video" && lesson.videoUrl ? (
          <div className="aspect-video w-full overflow-hidden rounded-md border border-border bg-black">
            <iframe
              src={lesson.videoUrl}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : null}

        {lesson.type === "document" && lesson.documentUrl ? (
          <a
            href={lesson.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md border border-border bg-muted/50 px-4 py-3 transition-colors hover:bg-muted"
          >
            <FileText className="size-5 text-primary" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                {lesson.documentTitle ?? "Reference document"}
              </span>
              <span className="text-xs text-muted-foreground">Open in new tab</span>
            </div>
            <ExternalLink className="ml-auto size-4 text-muted-foreground" />
          </a>
        ) : null}

        <div className="space-y-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {lesson.body}
        </div>

        <div className="flex items-center justify-end gap-2">
          {completed ? (
            <Badge variant="success">
              <CheckCircle2 /> Completed
            </Badge>
          ) : (
            <Button
              size="sm"
              onClick={async () => {
                await mark({
                  moduleId,
                  lessonId: lesson._id,
                  status: "completed",
                });
                toast.success("Lesson marked complete");
              }}
            >
              Mark as complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
