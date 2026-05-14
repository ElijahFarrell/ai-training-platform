/**
 * Deterministic demo-metric generator.
 *
 * The real platform has very few real data points seeded; rather than
 * surface honest-but-empty charts in a demo, we synthesise believable
 * engagement curves anchored to whatever real numbers we do have
 * (learner count, module count). Output is stable for a given input so
 * charts don't flicker between renders.
 *
 * If/when the platform accumulates real telemetry, swap callers over to
 * a Convex query that derives the same shapes from actual events and
 * delete this module — the consumer types are designed to match.
 */

const WEEKS_OF_HISTORY = 12;

export interface WeeklyPoint {
  weekLabel: string;
  weekStart: number;
  activeLearners: number;
  lessonsCompleted: number;
}

export interface ModuleMetricPoint {
  moduleId: string;
  title: string;
  completionRate: number;
  passRate: number;
}

export interface EngagementMetrics {
  weekly: WeeklyPoint[];
  modules: ModuleMetricPoint[];
  totals: {
    weeklyActiveLearners: number;
    learnersWoWChange: number;
    avgCompletionRate: number;
    avgPassRate: number;
  };
}

interface MetricsInput {
  totalLearners: number;
  modules: Array<{ _id: string; title: string }>;
}

export function generateEngagementMetrics({
  totalLearners,
  modules,
}: MetricsInput): EngagementMetrics {
  const baseline = Math.max(totalLearners, 12);

  const weekly = buildWeeklySeries(baseline);
  const moduleMetrics = buildModuleSeries(modules);

  const latest = weekly[weekly.length - 1];
  const prior = weekly[weekly.length - 2];
  const wow = prior
    ? Math.round(((latest.activeLearners - prior.activeLearners) / prior.activeLearners) * 1000) / 10
    : 0;

  const avgCompletion = moduleMetrics.length
    ? Math.round(
        (moduleMetrics.reduce((sum, m) => sum + m.completionRate, 0) / moduleMetrics.length) * 10,
      ) / 10
    : 0;
  const avgPass = moduleMetrics.length
    ? Math.round(
        (moduleMetrics.reduce((sum, m) => sum + m.passRate, 0) / moduleMetrics.length) * 10,
      ) / 10
    : 0;

  return {
    weekly,
    modules: moduleMetrics,
    totals: {
      weeklyActiveLearners: latest.activeLearners,
      learnersWoWChange: wow,
      avgCompletionRate: avgCompletion,
      avgPassRate: avgPass,
    },
  };
}

function buildWeeklySeries(baseline: number): WeeklyPoint[] {
  // Anchor week 0 to the most recent Monday so labels are stable
  // regardless of when the page is rendered within the same week.
  const monday = mostRecentMonday();
  const series: WeeklyPoint[] = [];

  let cumulativeLessons = 0;
  for (let i = WEEKS_OF_HISTORY - 1; i >= 0; i--) {
    const weekStart = monday - i * 7 * 24 * 60 * 60 * 1000;
    const growth = (WEEKS_OF_HISTORY - i) / WEEKS_OF_HISTORY;
    const wobble = pseudoRandom(`week-${i}`) * 0.18 - 0.09;
    const active = Math.max(4, Math.round(baseline * (0.35 + 0.7 * growth + wobble)));
    const newLessons = Math.max(2, Math.round(active * (1.4 + pseudoRandom(`lesson-${i}`) * 0.6)));
    cumulativeLessons += newLessons;

    series.push({
      weekStart,
      weekLabel: formatShortDate(new Date(weekStart)),
      activeLearners: active,
      lessonsCompleted: cumulativeLessons,
    });
  }
  return series;
}

function buildModuleSeries(modules: Array<{ _id: string; title: string }>): ModuleMetricPoint[] {
  return modules.map((m) => {
    const completion = clamp(0.42 + pseudoRandom(`completion-${m._id}`) * 0.5, 0.3, 0.96);
    const pass = clamp(0.55 + pseudoRandom(`pass-${m._id}`) * 0.4, 0.45, 0.98);
    return {
      moduleId: m._id,
      title: m.title,
      completionRate: Math.round(completion * 1000) / 10,
      passRate: Math.round(pass * 1000) / 10,
    };
  });
}

function mostRecentMonday(): number {
  // Hard-coded "now" reference at midnight UTC of today's date so the
  // generator is pure within a single render but still drifts forward
  // across days.
  const now = new Date();
  const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayOfWeek = new Date(utcMidnight).getUTCDay();
  const offsetToMonday = (dayOfWeek + 6) % 7;
  return utcMidnight - offsetToMonday * 24 * 60 * 60 * 1000;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Tiny string-keyed PRNG (xfnv1a + mulberry32). Stable across runs,
// stable across SSR/CSR, no external deps.
function pseudoRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 5);
  h = (h + 0xe6546b64) | 0;
  let t = (h + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
