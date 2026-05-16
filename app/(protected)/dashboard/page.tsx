"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { ArrowRight, ClipboardList, GraduationCap, Sparkles } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { AuthDebugBanner } from "@/components/debug/auth-debug-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const me = useQuery(api.users.me);
  const modules = useQuery(api.modules.listPublished);
  const progress = useQuery(api.progress.summary);

  const progressByModule = useMemo(() => {
    const map = new Map<string, { completed: number; total: number; lastTouchedAt: number }>();
    if (!progress) return map;
    for (const row of progress) {
      map.set(row.moduleId, {
        completed: row.completedLessons,
        total: row.totalLessons,
        lastTouchedAt: row.lastTouchedAt,
      });
    }
    return map;
  }, [progress]);

  const isLoading = me === undefined || modules === undefined || progress === undefined;

  return (
    <div className="flex flex-col gap-10">
      <AuthDebugBanner />
      <header className="flex flex-col gap-3">
        <Badge variant="outline" className="self-start">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Dashboard</span>
        </Badge>
        <h1 className="font-display text-4xl leading-tight tracking-tight">
          Welcome back{me?.displayName ? `, ${me.displayName.split(" ")[0]}` : ""}.
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Resume your current training, or pick up a new module. The AI assistant is grounded in the same
          curriculum, so it will only answer from material you are authorized to read.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={GraduationCap}
          label="Modules available"
          value={modules?.length ?? 0}
          loading={isLoading}
        />
        <StatCard
          icon={ClipboardList}
          label="Lessons completed"
          value={progress?.reduce((sum, p) => sum + p.completedLessons, 0) ?? 0}
          loading={isLoading}
        />
        <StatCard
          icon={Sparkles}
          label="Modules with progress"
          value={progress?.filter((p) => p.completedLessons > 0).length ?? 0}
          loading={isLoading}
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl leading-tight tracking-tight">Your training catalogue</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/modules">
              View all <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {isLoading
            ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)
            : (modules ?? []).map((module) => {
                const summary = progressByModule.get(module._id);
                const completed = summary?.completed ?? 0;
                const total = summary?.total ?? 0;
                const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
                return (
                  <Card key={module._id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{module.agencyTag}</Badge>
                        <Badge variant="outline">{module.audience}</Badge>
                      </div>
                      <CardTitle className="font-display text-2xl leading-snug tracking-normal">
                        {module.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">{module.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto flex flex-col gap-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-mono">{module.estimatedMinutes} min</span>
                        <span className="font-mono">
                          {completed}/{total || "—"} lessons
                        </span>
                      </div>
                      <Progress value={percent} />
                      <Button asChild size="sm" className="self-start">
                        <Link href={`/modules/${module.slug}`}>
                          {completed === 0 ? "Start module" : completed === total ? "Review" : "Continue"} <ArrowRight />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <span className="flex size-10 items-center justify-center rounded-md border border-border bg-secondary text-primary">
          <Icon className="size-4" />
        </span>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
          {loading ? (
            <Skeleton className="h-6 w-12" />
          ) : (
            <span className="font-display text-2xl leading-tight">{value}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
