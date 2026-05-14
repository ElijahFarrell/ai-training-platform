import { Database, Sparkles, Terminal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignOutMenu } from "@/components/layout/sign-out-menu";

interface ConvexSetupRequiredProps {
  userEmail: string;
}

const STEPS: Array<{ command: string; description: string }> = [
  {
    command: "npx convex dev",
    description:
      "Provisions a free dev deployment, generates types, and writes NEXT_PUBLIC_CONVEX_URL into .env.local. Leave it running.",
  },
  {
    command: 'npx convex env set WORKOS_CLIENT_ID "<your client id>"',
    description: "Lets Convex validate the WorkOS JWT (used by convex/auth.config.ts).",
  },
  {
    command: 'npx convex env set AI_GATEWAY_API_KEY "<your gateway key>"',
    description: "Used by the embedding action when indexing lesson content.",
  },
  {
    command: "npx convex run bootstrap:run",
    description:
      "Seeds the demo modules, lessons, and quizzes, then chunks every lesson and writes the vector index.",
  },
];

export function ConvexSetupRequired({ userEmail }: ConvexSetupRequiredProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-display text-base tracking-tight">FATI</span>
          <Separator orientation="vertical" className="mx-2 h-5" />
          <span className="text-xs text-muted-foreground">Signed in as {userEmail}</span>
        </div>
        <SignOutMenu />
      </header>

      <div className="flex flex-1 items-start justify-center px-6 py-16">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col gap-6 p-10">
            <div className="flex flex-col gap-3">
              <Badge variant="outline" className="self-start">
                <Database /> Backend not connected
              </Badge>
              <h1 className="font-display text-3xl leading-tight tracking-tight">
                You&rsquo;re signed in. The platform needs a Convex backend before it can serve modules.
              </h1>
              <p className="text-sm text-muted-foreground">
                WorkOS handled authentication. The next four commands stand up the data layer (modules,
                lessons, quizzes, progress, assistant threads, vector index). The landing page and sign-in
                already work without Convex — this screen is the first protected one.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-md border border-dashed border-border bg-muted/40 p-5">
              {STEPS.map((step, index) => (
                <div key={step.command} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-secondary font-mono text-xs">
                      {index + 1}
                    </span>
                    <Terminal className="size-3.5 text-muted-foreground" />
                    <code className="font-mono text-xs">{step.command}</code>
                  </div>
                  <p className="pl-8 text-xs text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              The README has the full sequence including required env variables for the Next.js side
              (<code className="font-mono">.env.local</code>) and the Convex deployment.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
