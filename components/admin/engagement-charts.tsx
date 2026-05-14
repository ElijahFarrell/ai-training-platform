"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { Activity, ArrowDown, ArrowUp, BookCheck, Target } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";

import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { generateEngagementMetrics } from "@/lib/admin/fake-metrics";

interface EngagementChartsProps {
  totalLearners: number | undefined;
}

export function EngagementCharts({ totalLearners }: EngagementChartsProps) {
  const modules = useQuery(api.modules.listPublished);

  const metrics = useMemo(() => {
    if (totalLearners === undefined || modules === undefined) return null;
    return generateEngagementMetrics({
      totalLearners,
      modules: modules.map((m) => ({ _id: m._id, title: m.title })),
    });
  }, [totalLearners, modules]);

  if (!metrics) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full" />
        ))}
      </div>
    );
  }

  const { weekly, modules: moduleSeries, totals } = metrics;
  const isUp = totals.learnersWoWChange >= 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Demo metrics · synthesised for illustration
        </p>
        <Badge variant="outline" className="text-[10px] uppercase tracking-[0.16em]">
          {isUp ? <ArrowUp /> : <ArrowDown />}
          {Math.abs(totals.learnersWoWChange).toFixed(1)}% WoW
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          icon={Activity}
          title="Weekly active learners"
          caption={`${totals.weeklyActiveLearners} this week`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekly} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="learnersFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="weekLabel"
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />
              <YAxis
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                width={32}
                allowDecimals={false}
              />
              <Tooltip content={(props) => <MetricTooltip {...props} valueLabel="Active learners" />} />
              <Area
                type="monotone"
                dataKey="activeLearners"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#learnersFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          icon={BookCheck}
          title="Lessons completed (cumulative)"
          caption={`${weekly[weekly.length - 1].lessonsCompleted} total`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekly} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="weekLabel"
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={(props) => <MetricTooltip {...props} valueLabel="Lessons" />} />
              <Line
                type="monotone"
                dataKey="lessonsCompleted"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={{ r: 2, stroke: "var(--accent)", fill: "var(--accent)" }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          icon={Target}
          title="Completion rate by module"
          caption={`${totals.avgCompletionRate.toFixed(1)}% average`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={moduleSeries}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="title"
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                width={140}
                tickFormatter={truncate(18)}
              />
              <Tooltip
                content={(props) => <MetricTooltip {...props} valueLabel="Completion" suffix="%" />}
              />
              <Bar dataKey="completionRate" radius={[0, 4, 4, 0]}>
                {moduleSeries.map((entry, idx) => (
                  <Cell
                    key={entry.moduleId}
                    fill={idx % 2 === 0 ? "var(--primary)" : "var(--accent)"}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          icon={BookCheck}
          title="Quiz pass rate by module"
          caption={`${totals.avgPassRate.toFixed(1)}% average`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moduleSeries} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="title"
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                interval={0}
                tickFormatter={truncate(10)}
              />
              <YAxis
                domain={[0, 100]}
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                width={38}
              />
              <Tooltip
                content={(props) => <MetricTooltip {...props} valueLabel="Pass rate" suffix="%" />}
              />
              <Bar dataKey="passRate" fill="var(--primary)" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

const CHART_MARGIN = { top: 8, right: 16, left: 0, bottom: 8 };

const AXIS_TICK = {
  fill: "var(--muted-foreground)",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
};

const truncate = (max: number) => (raw: unknown) => {
  const s = typeof raw === "string" ? raw : String(raw ?? "");
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};

function ChartCard({
  icon: Icon,
  title,
  caption,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  caption?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        {caption ? <span className="font-mono text-xs text-muted-foreground">{caption}</span> : null}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">{children}</div>
      </CardContent>
    </Card>
  );
}

function MetricTooltip({
  active,
  payload,
  label,
  valueLabel,
  suffix = "",
}: TooltipContentProps & { valueLabel: string; suffix?: string }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono">
        {valueLabel}:{" "}
        <span className="text-foreground">
          {value}
          {suffix}
        </span>
      </div>
    </div>
  );
}
