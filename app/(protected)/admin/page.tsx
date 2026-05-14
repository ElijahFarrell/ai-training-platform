"use client";

import { useQuery } from "convex/react";
import { ClipboardCheck, GraduationCap, ShieldCheck, UserRoundCog, Users } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { EngagementCharts } from "@/components/admin/engagement-charts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPage() {
  const me = useQuery(api.users.me);
  const overview = useQuery(api.admin.overview);
  const learners = useQuery(api.admin.learnerActivity);

  if (me === undefined) return <Skeleton className="h-64 w-full" />;

  if (me?.role !== "admin") {
    return (
      <Alert variant="destructive">
        <ShieldCheck className="size-5" />
        <AlertTitle>Restricted area</AlertTitle>
        <AlertDescription>
          Only administrators can view this page. If you should have access, ask your training officer to
          promote your account.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Badge variant="accent" className="self-start">
          <ShieldCheck /> Administrator view
        </Badge>
        <h1 className="font-display text-4xl leading-tight tracking-tight">Operations</h1>
        <p className="max-w-2xl text-muted-foreground">
          A demo control surface. Production would add invite issuance, module publishing, and audit log
          export here.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Learners" value={overview?.learners} icon={Users} />
        <StatCard label="Admins" value={overview?.admins} icon={UserRoundCog} />
        <StatCard label="Modules" value={overview?.modules} icon={GraduationCap} />
        <StatCard label="Lessons completed" value={overview?.completedLessons} icon={ClipboardCheck} />
        <StatCard label="Quizzes passed" value={overview?.quizzesPassed} icon={ShieldCheck} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl leading-tight tracking-tight">Adoption & engagement</h2>
        <EngagementCharts totalLearners={overview?.learners} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl leading-tight tracking-tight">Roster activity</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-hidden rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 text-right font-medium">Lessons done</th>
                    <th className="px-4 py-3 text-right font-medium">Quizzes passed</th>
                    <th className="px-4 py-3 text-right font-medium">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {learners === undefined ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    </tr>
                  ) : learners.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                        No learners have signed in yet.
                      </td>
                    </tr>
                  ) : (
                    learners.map((row) => (
                      <tr key={row.userId} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-3 font-medium">{row.displayName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant={row.role === "admin" ? "accent" : "secondary"}>{row.role}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">{row.lessonsCompleted}</td>
                        <td className="px-4 py-3 text-right font-mono">{row.quizzesPassed}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {new Date(row.lastSeenAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | undefined;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {value === undefined ? (
          <Skeleton className="h-7 w-10" />
        ) : (
          <span className="font-display text-3xl leading-tight">{value}</span>
        )}
      </CardContent>
    </Card>
  );
}
