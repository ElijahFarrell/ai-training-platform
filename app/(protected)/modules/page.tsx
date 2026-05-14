"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ModulesIndexPage() {
  const modules = useQuery(api.modules.listPublished);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Badge variant="outline" className="self-start">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Catalogue</span>
        </Badge>
        <h1 className="font-display text-4xl leading-tight tracking-tight">Training modules</h1>
        <p className="max-w-2xl text-muted-foreground">
          Each module combines vetted video, reading, and source material with a short knowledge check at the end.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {modules === undefined
          ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
          : modules.map((module) => (
              <Card key={module._id} className="flex flex-col">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{module.agencyTag}</Badge>
                    <Badge variant="outline">{module.audience}</Badge>
                    <Badge variant="outline" className="font-mono">
                      {module.estimatedMinutes} min
                    </Badge>
                  </div>
                  <CardTitle className="font-display text-2xl leading-snug tracking-normal">
                    {module.title}
                  </CardTitle>
                  <CardDescription>{module.summary}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button asChild size="sm">
                    <Link href={`/modules/${module.slug}`}>
                      Open module <ArrowRight />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
