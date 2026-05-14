import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { withAuth } from "@workos-inc/authkit-nextjs";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingSignInButton } from "@/components/landing/sign-in-button";

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Vetted curriculum",
    body: "Curated AI training tracks, written and reviewed by federally cleared subject matter experts.",
  },
  {
    icon: LockKeyhole,
    title: "Invitation-only access",
    body: "Closed registration via WorkOS AuthKit. Only emails approved by your agency administrator can enter.",
  },
  {
    icon: Sparkles,
    title: "Module-aware assistant",
    body: "Built-in AI assistant grounded in your enrolled training material — citations, no hallucinations from outside content.",
  },
];

export default async function Home() {
  const { user } = await withAuth();

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-noise opacity-50" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pt-24 pb-32 md:pt-32 md:pb-40">
          <div className="flex flex-col gap-6">
            <Badge variant="outline" className="self-start">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Federal AI Training Institute
              </span>
            </Badge>

            <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-balance md:text-7xl">
              AI fluency for the
              <br />
              <span className="italic text-primary">people serving the public.</span>
            </h1>

            <p className="max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
              A closed-access learning platform for federal employees. Watch reviewed video modules,
              read reference material, take quizzes, and ask an AI assistant trained on the curriculum
              itself — never the open internet.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {user ? (
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Continue to dashboard <ArrowRight />
                  </Link>
                </Button>
              ) : (
                <LandingSignInButton />
              )}
              <p className="text-xs text-muted-foreground">
                Access by invitation. Contact your training officer to be added to the roster.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {TRUST_PILLARS.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="bg-card/60 backdrop-blur">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex size-10 items-center justify-center rounded-md border border-border bg-secondary text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-semibold tracking-tight">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <span>© Federal AI Training Institute · Demo environment</span>
          <span className="font-mono">v0.1 · authenticated via WorkOS AuthKit</span>
        </div>
      </footer>
    </main>
  );
}
