import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowLeft,
  ArrowUpRight,
  Beaker,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FlaskConical,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  ExternalLink,
  FileText,
  Trash2,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { evaluateExperiment } from "@/lib/experiment-evaluation";
import {
  logCheckIn,
  updateExperimentStatus,
} from "../../dashboard/actions";
import {
  addExperimentPost,
  deleteExperimentPost,
  updateExperimentPostMetrics,
  setExperimentBaseline,
} from "../../strategies/actions";
import { AppLayout } from "../../components/AppLayout";

type PageProps = {
  params: Promise<{
    experimentId: string;
  }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function getStatusLabel(status: string) {
  if (status === "active") return "Active";
  if (status === "paused") return "Paused";
  if (status === "completed") return "Completed";

  return status;
}

function getStatusClasses(status: string) {
  if (status === "active") {
    return "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-400";
  }

  if (status === "paused") {
    return "border-amber-400/20 bg-amber-400/[0.07] text-amber-400";
  }

  return "border-violet-400/20 bg-violet-400/[0.07] text-violet-300";
}

function getSignalClasses(signal: string) {
  if (signal === "potential") {
    return "border-sky-400/15 bg-sky-400/[0.05] text-sky-300";
  }

  if (signal === "emerging") {
    return "border-amber-400/15 bg-amber-400/[0.05] text-amber-300";
  }

  if (signal === "repeated") {
    return "border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300";
  }

  if (signal === "insufficient") {
    return "border-slate-400/10 bg-white/[0.025] text-slate-400";
  }

  return "border-white/[0.06] bg-white/[0.02] text-slate-500";
}

function formatSignal(signal: string) {
  return signal.charAt(0).toUpperCase() + signal.slice(1);
}

function getPrimaryMetricLabel(metric: string | null) {
  if (metric === "views") return "Views";
  if (metric === "likes") return "Likes";
  if (metric === "replies") return "Replies";
  if (metric === "reposts") return "Reposts";
  if (metric === "engagement_rate") return "Engagement rate";
  if (metric === "follower_growth") return "Follower growth";

  return "Not configured";
}

function getEvaluationStatusLabel(status: string) {
  if (status === "met_threshold") return "Threshold met";
  if (status === "below_threshold") return "Below threshold";

  return "Not enough data";
}

function getEvaluationStatusClasses(status: string) {
  if (status === "met_threshold") {
    return "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-400";
  }

  if (status === "below_threshold") {
    return "border-amber-400/20 bg-amber-400/[0.07] text-amber-300";
  }

  return "border-slate-400/10 bg-white/[0.025] text-slate-400";
}

function formatMetricValue(
  value: number | null,
  metric: string | null
) {
  if (value === null) {
    return "—";
  }

  if (metric === "engagement_rate") {
    return `${value.toFixed(1)}%`;
  }

  return formatNumber(Math.round(value));
}

function buildChart(values: number[]) {
  if (values.length === 0) return "";

  if (values.length === 1) {
    return "20,75 180,75";
  }

  const width = 360;
  const height = 150;
  const paddingX = 8;
  const paddingY = 12;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x =
        paddingX +
        (index / (values.length - 1)) * (width - paddingX * 2);

      const y =
        height -
        paddingY -
        ((value - min) / range) * (height - paddingY * 2);

      return `${x},${y}`;
    })
    .join(" ");
}

export default async function ExperimentDetailPage({
  params,
}: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { experimentId } = await params;

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (!user) {
    redirect("/");
  }

  const experiment = await prisma.experiment.findFirst({
    where: {
      id: experimentId,
      userId: user.id,
    },
    include: {
      strategy: true,
      researchFinding: {
        include: {
          creator: {
            select: {
              name: true,
              handle: true,
            },
          },
        },
      },
      checkIns: {
        orderBy: {
          loggedAt: "asc",
        },
      },
      posts: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!experiment) {
    notFound();
  }

  const experimentResult = await prisma.experimentResult.findUnique({
    where: {
      experimentId: experiment.id,
    },
  });

  const measurements = experiment.checkIns.map(
    (checkIn) => checkIn.followerCount
  );

  const firstMeasurement = measurements[0] ?? null;

  const latestMeasurement =
    measurements[measurements.length - 1] ?? null;

  const change =
    firstMeasurement !== null && latestMeasurement !== null
      ? latestMeasurement - firstMeasurement
      : null;

  const percentageChange =
    firstMeasurement !== null &&
    latestMeasurement !== null &&
    firstMeasurement !== 0
      ? ((latestMeasurement - firstMeasurement) / firstMeasurement) *
        100
      : null;

  const chartPoints = buildChart(measurements);

  const tags = [
    ...experiment.strategy.nicheTags,
    ...experiment.strategy.stageTags,
  ];

  const researchFinding = experiment.researchFinding;

  const totalViews = experiment.posts.reduce(
    (sum, post) => sum + (post.views ?? 0),
    0
  );

  const totalLikes = experiment.posts.reduce(
    (sum, post) => sum + (post.likes ?? 0),
    0
  );

  const totalReplies = experiment.posts.reduce(
    (sum, post) => sum + (post.replies ?? 0),
    0
  );

  const totalReposts = experiment.posts.reduce(
    (sum, post) => sum + (post.reposts ?? 0),
    0
  );

  const evaluation = evaluateExperiment({
    primaryMetric: experiment.primaryMetric,
    successThresholdPercent: experiment.successThresholdPercent,
    posts: experiment.posts.map((post) => ({
      id: post.id,
      metrics: {
        views: post.views,
        likes: post.likes,
        replies: post.replies,
        reposts: post.reposts,
      },
    })),
    baselineAverage: experiment.baselineAverage,
  });

  const canSetBaseline =
    experiment.status !== "completed" &&
    experiment.primaryMetric !== null &&
    experiment.primaryMetric !== "follower_growth";

  return (
    <AppLayout>
      <main className="min-h-screen bg-[#090a0f]">
        <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
          {/* Back navigation */}
          <div className="mb-8">
            <Link
              href="/experiments"
              className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-600 transition-colors hover:text-slate-300"
            >
              <ArrowLeft size={13} />
              Back to experiments
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-medium ${getStatusClasses(
                    experiment.status
                  )}`}
                >
                  {experiment.status === "active" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}

                  {experiment.status === "paused" && (
                    <Pause size={9} />
                  )}

                  {experiment.status === "completed" && (
                    <Check size={9} />
                  )}

                  {getStatusLabel(experiment.status)}
                </span>

                <span className="text-[10px] text-slate-700">
                  Experiment
                </span>
              </div>

              <h1
                className="text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                {experiment.strategy.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                {experiment.strategy.description}
              </p>

              {tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[9px] text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={13}
                    className="text-slate-600"
                  />

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                      Started
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {formatDate(experiment.startedAt)}
                    </p>
                  </div>
                </div>

                {experiment.completedAt && (
                  <div className="mt-3 flex items-center gap-2 border-t border-white/[0.05] pt-3">
                    <CheckCircle2
                      size={13}
                      className="text-violet-400"
                    />

                    <div>
                      <p className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                        Completed
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatDate(experiment.completedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Experiment definition */}
          {(experiment.hypothesis ||
            experiment.protocol ||
            experiment.durationDays !== null ||
            experiment.targetPostCount !== null ||
            experiment.primaryMetric !== null ||
            experiment.successThresholdPercent !== null) && (
            <section className="mt-8 overflow-hidden rounded-2xl border border-sky-400/[0.10] bg-sky-400/[0.02]">
              <div className="border-b border-white/[0.05] px-5 py-4 md:px-6">
                <div className="flex items-center gap-2">
                  <Target
                    size={13}
                    className="text-sky-400"
                  />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-sky-400/70">
                    Experiment definition
                  </span>
                </div>

                <h2
                  className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  What you are testing
                </h2>
              </div>

              {(experiment.hypothesis || experiment.protocol) && (
                <div className="grid gap-3 p-5 md:p-6 lg:grid-cols-2">
                  {experiment.hypothesis && (
                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">
                      <div className="flex items-center gap-2">
                        <FlaskConical
                          size={13}
                          className="text-sky-400"
                        />

                        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                          Hypothesis
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {experiment.hypothesis}
                      </p>
                    </div>
                  )}

                  {experiment.protocol && (
                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">
                      <div className="flex items-center gap-2">
                        <Beaker
                          size={13}
                          className="text-sky-400"
                        />

                        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                          Protocol
                        </span>
                      </div>

                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">
                        {experiment.protocol}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(experiment.durationDays !== null ||
                experiment.targetPostCount !== null ||
                experiment.primaryMetric !== null ||
                experiment.successThresholdPercent !== null) && (
                <div className="grid gap-2 border-t border-white/[0.05] px-5 py-4 sm:grid-cols-2 lg:grid-cols-4 md:px-6">
                  {experiment.durationDays !== null && (
                    <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                        Duration
                      </div>

                      <div className="mt-1 text-xs font-medium text-slate-300">
                        {experiment.durationDays}{" "}
                        {experiment.durationDays === 1
                          ? "day"
                          : "days"}
                      </div>
                    </div>
                  )}

                  {experiment.targetPostCount !== null && (
                    <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                        Target posts
                      </div>

                      <div className="mt-1 text-xs font-medium text-slate-300">
                        {experiment.posts.length} /{" "}
                        {experiment.targetPostCount}
                      </div>
                    </div>
                  )}

                  {experiment.primaryMetric !== null && (
                    <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                        Primary metric
                      </div>

                      <div className="mt-1 text-xs font-medium text-slate-300">
                        {getPrimaryMetricLabel(
                          experiment.primaryMetric
                        )}
                      </div>
                    </div>
                  )}

                  {experiment.successThresholdPercent !== null && (
                    <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                        Success threshold
                      </div>

                      <div className="mt-1 text-xs font-medium text-slate-300">
                        +{experiment.successThresholdPercent}%
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Research hypothesis */}
          {researchFinding && (
            <section className="mt-8 overflow-hidden rounded-2xl border border-violet-400/[0.10] bg-violet-400/[0.025]">
              <div className="border-b border-white/[0.05] px-5 py-4 md:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-2">
                      <Sparkles
                        size={13}
                        className="text-violet-400"
                      />

                      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-400/70">
                        Research → hypothesis
                      </span>
                    </div>

                    <h2
                      className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white"
                      style={{ fontFamily: "Fraunces, serif" }}
                    >
                      Test the {researchFinding.pattern} pattern.
                    </h2>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      This experiment was inspired by an observed pattern in
                      creator research. The research is a hypothesis to test,
                      not proof that the pattern will produce the same result
                      for your account.
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit shrink-0 items-center rounded-full border px-2.5 py-1 text-[9px] font-medium ${getSignalClasses(
                      researchFinding.signalLevel
                    )}`}
                  >
                    {formatSignal(researchFinding.signalLevel)} signal
                  </span>
                </div>
              </div>

              <div className="grid gap-2 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4 md:px-6">
                <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                  <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                    Pattern
                  </div>

                  <div className="mt-1 text-xs font-medium text-slate-300">
                    {researchFinding.pattern}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                  <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                    Evidence
                  </div>

                  <div className="mt-1 text-xs font-medium text-slate-300">
                    {researchFinding.measuredCount} measured /{" "}
                    {researchFinding.postCount} posts
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                  <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                    Source
                  </div>

                  <div className="mt-1 truncate text-xs font-medium text-slate-300">
                    {researchFinding.creator
                      ? `${researchFinding.creator.name} (@${researchFinding.creator.handle})`
                      : "Creator research"}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                  <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                    Dimension
                  </div>

                  <div className="mt-1 text-xs font-medium text-slate-300">
                    {researchFinding.dimension}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/[0.05] px-5 py-4 md:px-6">
                <div className="flex items-start gap-2.5">
                  <FlaskConical
                    size={13}
                    className="mt-0.5 shrink-0 text-violet-400"
                  />

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-violet-400/60">
                      What this experiment is testing
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Apply the{" "}
                      <span className="font-medium text-slate-300">
                        {researchFinding.pattern}
                      </span>{" "}
                      pattern to your own content and observe how your account
                      responds over the course of the experiment.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Main stats */}
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5">
              <div className="text-[9px] uppercase tracking-[0.14em] text-slate-700">
                Measurements
              </div>

              <div className="mt-3 text-2xl font-medium text-white">
                {measurements.length}
              </div>

              <div className="mt-1 text-[10px] text-slate-700">
                recorded check-ins
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5">
              <div className="text-[9px] uppercase tracking-[0.14em] text-slate-700">
                Starting
              </div>

              <div className="mt-3 text-2xl font-medium text-white">
                {firstMeasurement !== null
                  ? formatNumber(firstMeasurement)
                  : "—"}
              </div>

              <div className="mt-1 text-[10px] text-slate-700">
                followers
              </div>
            </div>

            <div className="rounded-xl border border-emerald-400/[0.08] bg-emerald-400/[0.015] p-5">
              <div className="text-[9px] uppercase tracking-[0.14em] text-slate-700">
                Latest
              </div>

              <div className="mt-3 text-2xl font-medium text-emerald-400">
                {latestMeasurement !== null
                  ? formatNumber(latestMeasurement)
                  : "—"}
              </div>

              <div className="mt-1 text-[10px] text-slate-700">
                followers
              </div>
            </div>

            <div
              className={`rounded-xl border p-5 ${
                change !== null && change < 0
                  ? "border-rose-400/[0.08] bg-rose-400/[0.015]"
                  : "border-violet-400/[0.08] bg-violet-400/[0.015]"
              }`}
            >
              <div className="text-[9px] uppercase tracking-[0.14em] text-slate-700">
                Observed change
              </div>

              <div
                className={`mt-3 flex items-center gap-2 text-2xl font-medium ${
                  change !== null && change < 0
                    ? "text-rose-400"
                    : "text-violet-300"
                }`}
              >
                {change !== null ? (
                  <>
                    {change >= 0 ? "+" : ""}
                    {formatNumber(change)}
                  </>
                ) : (
                  "—"
                )}
              </div>

              <div className="mt-1 text-[10px] text-slate-700">
                {percentageChange !== null
                  ? `${percentageChange >= 0 ? "+" : ""}${percentageChange.toFixed(
                      1
                    )}% from first measurement`
                  : "Need another measurement"}
              </div>
            </div>
          </div>

          {/* Post performance summary */}
          <section className="mt-8 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
            <div className="border-b border-white/[0.05] px-5 py-4 md:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText
                      size={13}
                      className="text-violet-400"
                    />

                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-400/70">
                      Experiment content
                    </span>
                  </div>

                  <h2
                    className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white"
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    Posts and performance
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Content published as part of this experiment and the
                    performance data you have recorded for it.
                  </p>
                </div>

                <div className="text-[10px] text-slate-600">
                  {experiment.posts.length}{" "}
                  {experiment.posts.length === 1 ? "post" : "posts"}
                </div>
              </div>
            </div>

            <div className="grid gap-2 border-b border-white/[0.05] p-4 sm:grid-cols-2 lg:grid-cols-4 md:p-5">
              <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                  Views
                </div>
                <div className="mt-1 text-sm font-medium text-slate-300">
                  {formatNumber(totalViews)}
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                  Likes
                </div>
                <div className="mt-1 text-sm font-medium text-slate-300">
                  {formatNumber(totalLikes)}
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                  Replies
                </div>
                <div className="mt-1 text-sm font-medium text-slate-300">
                  {formatNumber(totalReplies)}
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                  Reposts
                </div>
                <div className="mt-1 text-sm font-medium text-slate-300">
                  {formatNumber(totalReposts)}
                </div>
              </div>
            </div>

            {experiment.posts.length > 0 && (
              <div className="divide-y divide-white/[0.04]">
                {experiment.posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-5 md:p-6"
                  >
                    <div className="flex flex-col gap-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                              {post.publishedAt
                                ? `Published ${formatDateTime(
                                    post.publishedAt
                                  )}`
                                : "Draft / unpublished"}
                            </span>

                            {post.postId && (
                              <span className="rounded-full border border-white/[0.05] bg-white/[0.02] px-2 py-0.5 text-[8px] text-slate-700">
                                ID: {post.postId}
                              </span>
                            )}
                          </div>

                          {post.content && (
                            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">
                              {post.content}
                            </p>
                          )}

                          {!post.content && post.postUrl && (
                            <p className="mt-3 text-xs text-slate-600">
                              Tracked X post
                            </p>
                          )}

                          {post.postUrl && (
                            <a
                              href={post.postUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium text-violet-400 transition-colors hover:text-violet-300"
                            >
                              Open post
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>

                        {experiment.status !== "completed" && (
                          <form action={deleteExperimentPost}>
                            <input
                              type="hidden"
                              name="experimentPostId"
                              value={post.id}
                            />

                            <button
                              type="submit"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/10 bg-rose-400/[0.025] px-2.5 py-2 text-[9px] font-medium text-rose-400/70 transition-colors hover:border-rose-400/20 hover:bg-rose-400/[0.06] hover:text-rose-300"
                            >
                              <Trash2 size={10} />
                              Delete
                            </button>
                          </form>
                        )}
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border border-white/[0.05] bg-[#08090d] p-3">
                          <div className="text-[8px] uppercase tracking-[0.12em] text-slate-700">
                            Views
                          </div>

                          <div className="mt-1 text-xs font-medium text-slate-300">
                            {post.views !== null
                              ? formatNumber(post.views)
                              : "—"}
                          </div>
                        </div>

                        <div className="rounded-lg border border-white/[0.05] bg-[#08090d] p-3">
                          <div className="text-[8px] uppercase tracking-[0.12em] text-slate-700">
                            Likes
                          </div>

                          <div className="mt-1 text-xs font-medium text-slate-300">
                            {post.likes !== null
                              ? formatNumber(post.likes)
                              : "—"}
                          </div>
                        </div>

                        <div className="rounded-lg border border-white/[0.05] bg-[#08090d] p-3">
                          <div className="text-[8px] uppercase tracking-[0.12em] text-slate-700">
                            Replies
                          </div>

                          <div className="mt-1 text-xs font-medium text-slate-300">
                            {post.replies !== null
                              ? formatNumber(post.replies)
                              : "—"}
                          </div>
                        </div>

                        <div className="rounded-lg border border-white/[0.05] bg-[#08090d] p-3">
                          <div className="text-[8px] uppercase tracking-[0.12em] text-slate-700">
                            Reposts
                          </div>

                          <div className="mt-1 text-xs font-medium text-slate-300">
                            {post.reposts !== null
                              ? formatNumber(post.reposts)
                              : "—"}
                          </div>
                        </div>
                      </div>

                      {experiment.status !== "completed" && (
                        <details className="group">
                          <summary className="cursor-pointer list-none text-[9px] font-medium uppercase tracking-[0.12em] text-slate-700 transition-colors hover:text-slate-400">
                            Update performance
                          </summary>

                          <form
                            action={updateExperimentPostMetrics}
                            className="mt-3 grid gap-2 rounded-xl border border-white/[0.05] bg-white/[0.01] p-3 sm:grid-cols-2 lg:grid-cols-4"
                          >
                            <input
                              type="hidden"
                              name="experimentPostId"
                              value={post.id}
                            />

                            <input
                              type="number"
                              name="views"
                              min="0"
                              defaultValue={post.views ?? ""}
                              placeholder="Views"
                              className="rounded-lg border border-white/[0.06] bg-[#08090d] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-700 focus:border-violet-400/30"
                            />

                            <input
                              type="number"
                              name="likes"
                              min="0"
                              defaultValue={post.likes ?? ""}
                              placeholder="Likes"
                              className="rounded-lg border border-white/[0.06] bg-[#08090d] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-700 focus:border-violet-400/30"
                            />

                            <input
                              type="number"
                              name="replies"
                              min="0"
                              defaultValue={post.replies ?? ""}
                              placeholder="Replies"
                              className="rounded-lg border border-white/[0.06] bg-[#08090d] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-700 focus:border-violet-400/30"
                            />

                            <input
                              type="number"
                              name="reposts"
                              min="0"
                              defaultValue={post.reposts ?? ""}
                              placeholder="Reposts"
                              className="rounded-lg border border-white/[0.06] bg-[#08090d] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-700 focus:border-violet-400/30"
                            />

                            <button
                              type="submit"
                              className="sm:col-span-2 lg:col-span-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-violet-500 px-3 py-2.5 text-[10px] font-semibold text-white transition-colors hover:bg-violet-400"
                            >
                              Save performance
                              <Check size={11} />
                            </button>
                          </form>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {experiment.posts.length === 0 && (
              <div className="px-5 py-10 text-center md:px-6">
                <FileText
                  size={18}
                  className="mx-auto text-slate-700"
                />

                <p className="mt-3 text-xs text-slate-600">
                  No posts are attached to this experiment yet.
                </p>

                <p className="mt-1 text-[10px] text-slate-700">
                  Add the content you publish so Slancialab can connect
                  execution with experiment results.
                </p>
              </div>
            )}

            {experiment.status !== "completed" && (
              <div className="border-t border-white/[0.05] p-5 md:p-6">
                <div className="mb-4">
                  <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                    Track a post
                  </div>

                  <p className="mt-1 text-xs text-slate-600">
                    Attach content to this experiment before or after
                    publishing.
                  </p>
                </div>

                <form
                  action={addExperimentPost}
                  className="grid gap-3"
                >
                  <input
                    type="hidden"
                    name="experimentId"
                    value={experiment.id}
                  />

                  <textarea
                    name="content"
                    rows={4}
                    maxLength={10000}
                    placeholder="Paste the post content..."
                    className="w-full resize-none rounded-xl border border-white/[0.07] bg-[#08090d] px-3 py-3 text-xs leading-5 text-white outline-none placeholder:text-slate-700 focus:border-violet-400/30"
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="text"
                      name="postId"
                      maxLength={255}
                      placeholder="X post ID (optional)"
                      className="rounded-lg border border-white/[0.07] bg-[#08090d] px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-700 focus:border-violet-400/30"
                    />

                    <input
                      type="url"
                      name="postUrl"
                      maxLength={2048}
                      placeholder="X post URL (optional)"
                      className="rounded-lg border border-white/[0.07] bg-[#08090d] px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-700 focus:border-violet-400/30"
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="datetime-local"
                      name="publishedAt"
                      className="rounded-lg border border-white/[0.07] bg-[#08090d] px-3 py-2.5 text-xs text-slate-500 outline-none focus:border-violet-400/30"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        name="views"
                        min="0"
                        placeholder="Views"
                        className="rounded-lg border border-white/[0.07] bg-[#08090d] px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-700 focus:border-violet-400/30"
                      />

                      <input
                        type="number"
                        name="likes"
                        min="0"
                        placeholder="Likes"
                        className="rounded-lg border border-white/[0.07] bg-[#08090d] px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-700 focus:border-violet-400/30"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="number"
                      name="replies"
                      min="0"
                      placeholder="Replies"
                      className="rounded-lg border border-white/[0.07] bg-[#08090d] px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-700 focus:border-violet-400/30"
                    />

                    <input
                      type="number"
                      name="reposts"
                      min="0"
                      placeholder="Reposts"
                      className="rounded-lg border border-white/[0.07] bg-[#08090d] px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-700 focus:border-violet-400/30"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-violet-500 px-4 py-2.5 text-[10px] font-semibold text-white transition-colors hover:bg-violet-400"
                  >
                    Add to experiment
                    <ArrowUpRight size={12} />
                  </button>
                </form>
              </div>
            )}
          </section>

          {/* Experiment baseline */}
          <section className="mt-8 overflow-hidden rounded-2xl border border-amber-400/[0.10] bg-amber-400/[0.015]">
            <div className="border-b border-white/[0.05] px-5 py-4 md:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Target
                      size={13}
                      className="text-amber-400"
                    />

                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-400/70">
                      Experiment baseline
                    </span>
                  </div>

                  <h2
                    className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white"
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    Establish the starting point
                  </h2>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
                    The baseline represents your pre-experiment average for
                    the primary metric. Slancialab uses it to compare your
                    experiment against where you started.
                  </p>
                </div>

                {experiment.baselineCapturedAt && (
                  <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-2.5 py-1 text-[9px] font-medium text-emerald-400">
                    <Check size={9} />
                    Baseline captured
                  </span>
                )}
              </div>
            </div>

            {experiment.primaryMetric === "follower_growth" ? (
              <div className="px-5 py-5 md:px-6">
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">
                  <p className="text-xs leading-5 text-slate-500">
                    Follower growth is evaluated from experiment-level
                    follower measurements rather than post-level baseline
                    performance.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-2 p-4 sm:grid-cols-3 md:p-5">
                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-3">
                    <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                      Primary metric
                    </div>

                    <div className="mt-1.5 text-xs font-medium text-slate-300">
                      {getPrimaryMetricLabel(experiment.primaryMetric)}
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-3">
                    <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                      Baseline average
                    </div>

                    <div className="mt-1.5 text-xs font-medium text-slate-300">
                      {experiment.baselineAverage !== null
                        ? formatMetricValue(
                            experiment.baselineAverage,
                            experiment.primaryMetric
                          )
                        : "Not captured"}
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-3">
                    <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                      Sample size
                    </div>

                    <div className="mt-1.5 text-xs font-medium text-slate-300">
                      {experiment.baselineSampleSize !== null
                        ? `${formatNumber(
                            experiment.baselineSampleSize
                          )} posts`
                        : "Not captured"}
                    </div>
                  </div>
                </div>

                {experiment.baselineCapturedAt && (
                  <div className="border-t border-white/[0.05] px-5 py-3 md:px-6">
                    <p className="text-[9px] text-slate-700">
                      Captured {formatDateTime(experiment.baselineCapturedAt)}
                    </p>
                  </div>
                )}

                {canSetBaseline && (
                  <div className="border-t border-white/[0.05] p-5 md:p-6">
                    <div className="mb-4">
                      <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                        {experiment.baselineAverage !== null
                          ? "Update baseline"
                          : "Set baseline"}
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Enter the average performance from posts published
                        before this experiment. This should represent the
                        account&apos;s normal performance before testing the
                        strategy.
                      </p>
                    </div>

                    <form
                      action={setExperimentBaseline}
                      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <input
                        type="hidden"
                        name="experimentId"
                        value={experiment.id}
                      />

                      <div>
                        <label className="mb-1.5 block text-[9px] uppercase tracking-[0.12em] text-slate-700">
                          Average{" "}
                          {getPrimaryMetricLabel(
                            experiment.primaryMetric
                          )}
                        </label>

                        <input
                          type="number"
                          name="baselineAverage"
                          min="0"
                          step="any"
                          required
                          defaultValue={
                            experiment.baselineAverage ?? ""
                          }
                          placeholder={
                            experiment.primaryMetric === "engagement_rate"
                              ? "e.g. 4.5"
                              : "e.g. 1000"
                          }
                          className="w-full rounded-lg border border-white/[0.07] bg-[#08090d] px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-700 focus:border-amber-400/30"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[9px] uppercase tracking-[0.12em] text-slate-700">
                          Posts measured
                        </label>

                        <input
                          type="number"
                          name="baselineSampleSize"
                          min="1"
                          step="1"
                          required
                          defaultValue={
                            experiment.baselineSampleSize ?? ""
                          }
                          placeholder="e.g. 10"
                          className="w-full rounded-lg border border-white/[0.07] bg-[#08090d] px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-700 focus:border-amber-400/30"
                        />
                      </div>

                      <button
                        type="submit"
                        className="self-end inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2.5 text-[10px] font-semibold text-[#090a0f] transition-colors hover:bg-amber-400"
                      >
                        {experiment.baselineAverage !== null
                          ? "Update baseline"
                          : "Set baseline"}
                        <Check size={11} />
                      </button>
                    </form>
                  </div>
                )}

                {!canSetBaseline &&
                  experiment.baselineAverage === null &&
                  experiment.status === "completed" && (
                    <div className="border-t border-white/[0.05] px-5 py-5 md:px-6">
                      <p className="text-xs leading-5 text-slate-600">
                        This experiment is completed and does not have a
                        baseline captured.
                      </p>
                    </div>
                  )}
              </>
            )}
          </section>

          {/* Experiment evaluation */}
          <section className="mt-8 overflow-hidden rounded-2xl border border-emerald-400/[0.10] bg-emerald-400/[0.015]">
            <div className="border-b border-white/[0.05] px-5 py-4 md:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Target
                      size={13}
                      className="text-emerald-400"
                    />

                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-400/70">
                      Experiment evaluation
                    </span>
                  </div>

                  <h2
                    className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white"
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    What did the experiment actually produce?
                  </h2>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
                    Evaluation compares the measured experiment performance
                    against the configured baseline and success threshold.
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit shrink-0 items-center rounded-full border px-2.5 py-1 text-[9px] font-medium ${getEvaluationStatusClasses(
                    evaluation.status
                  )}`}
                >
                  {getEvaluationStatusLabel(evaluation.status)}
                </span>
              </div>
            </div>

            <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4 md:p-5">
              <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-3">
                <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                  Primary metric
                </div>

                <div className="mt-1.5 text-xs font-medium text-slate-300">
                  {getPrimaryMetricLabel(evaluation.primaryMetric)}
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-3">
                <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                  Measured posts
                </div>

                <div className="mt-1.5 text-xs font-medium text-slate-300">
                  {evaluation.postsWithMetric} / {evaluation.totalPosts}
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-3">
                <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                  Experiment average
                </div>

                <div className="mt-1.5 text-xs font-medium text-slate-300">
                  {formatMetricValue(
                    evaluation.experimentAverage,
                    evaluation.primaryMetric
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-3">
                <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                  Success threshold
                </div>

                <div className="mt-1.5 text-xs font-medium text-slate-300">
                  {evaluation.successThresholdPercent !== null
                    ? `+${evaluation.successThresholdPercent}%`
                    : "—"}
                </div>
              </div>
            </div>

            <div className="grid gap-2 border-t border-white/[0.05] p-4 sm:grid-cols-2 md:p-5">
              <div className="rounded-lg border border-white/[0.05] bg-[#08090d] px-3 py-3">
                <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                  Baseline
                </div>

                <div className="mt-1.5 text-xs font-medium text-slate-300">
                  {formatMetricValue(
                    evaluation.baselineAverage,
                    evaluation.primaryMetric
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.05] bg-[#08090d] px-3 py-3">
                <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                  Change
                </div>

                <div
                  className={`mt-1.5 text-xs font-medium ${
                    evaluation.percentageChange !== null &&
                    evaluation.percentageChange >= 0
                      ? "text-emerald-400"
                      : evaluation.percentageChange !== null
                        ? "text-rose-400"
                        : "text-slate-500"
                  }`}
                >
                  {evaluation.percentageChange !== null
                    ? `${
                        evaluation.percentageChange >= 0 ? "+" : ""
                      }${evaluation.percentageChange.toFixed(1)}%`
                    : "—"}
                </div>
              </div>
            </div>

            <div className="border-t border-white/[0.05] px-5 py-4 md:px-6">
              <div className="flex items-start gap-2.5">
                <FlaskConical
                  size={13}
                  className="mt-0.5 shrink-0 text-emerald-400/70"
                />

                <div>
                  <p className="text-xs leading-5 text-slate-400">
                    {evaluation.message}
                  </p>

                  {evaluation.baselineAverage === null &&
                    evaluation.experimentAverage !== null && (
                      <p className="mt-2 text-[10px] leading-5 text-slate-700">
                        Performance has been recorded, but Slancialab needs a
                        valid baseline before it can determine whether the
                        experiment met its success threshold.
                      </p>
                    )}
                </div>
              </div>
            </div>
          </section>

          {/* Chart + experiment controls */}
          <div className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            {/* Chart */}
            <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
              <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.14em] text-slate-700">
                    Growth trend
                  </div>

                  <h2
                    className="mt-1 text-lg font-semibold text-white"
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    Follower measurements
                  </h2>
                </div>

                {change !== null && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                    {change >= 0 ? (
                      <TrendingUp
                        size={12}
                        className="text-emerald-400"
                      />
                    ) : (
                      <TrendingDown
                        size={12}
                        className="text-rose-400"
                      />
                    )}

                    {change >= 0 ? "Increase" : "Decrease"}
                  </div>
                )}
              </div>

              <div className="p-5">
                {measurements.length >= 2 ? (
                  <div className="relative h-[220px] overflow-hidden rounded-xl border border-white/[0.04] bg-[#07080c]">
                    <svg
                      viewBox="0 0 360 150"
                      preserveAspectRatio="none"
                      className="absolute inset-x-4 top-5 h-[170px] w-[calc(100%-2rem)]"
                    >
                      <defs>
                        <linearGradient
                          id="detailChartFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="rgba(139,92,246,0.22)"
                          />

                          <stop
                            offset="100%"
                            stopColor="rgba(139,92,246,0)"
                          />
                        </linearGradient>
                      </defs>

                      <polygon
                        points={`8,150 ${chartPoints} 352,150`}
                        fill="url(#detailChartFill)"
                      />

                      <polyline
                        points={chartPoints}
                        fill="none"
                        stroke="rgba(167,139,250,0.95)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {measurements.map((_, index) => {
                        const width = 360;
                        const paddingX = 8;

                        const x =
                          paddingX +
                          (index / (measurements.length - 1)) *
                            (width - paddingX * 2);

                        const min = Math.min(...measurements);
                        const max = Math.max(...measurements);
                        const range = max - min || 1;

                        const y =
                          150 -
                          12 -
                          ((measurements[index] - min) / range) *
                            (150 - 24);

                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="3.5"
                            fill="#090a0f"
                            stroke="rgba(167,139,250,1)"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </svg>

                    <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[8px] text-slate-700">
                      <span>
                        {experiment.checkIns[0]
                          ? formatShortDate(
                              experiment.checkIns[0].loggedAt
                            )
                          : ""}
                      </span>

                      <span>
                        {experiment.checkIns[
                          experiment.checkIns.length - 1
                        ]
                          ? formatShortDate(
                              experiment.checkIns[
                                experiment.checkIns.length - 1
                              ].loggedAt
                            )
                          : ""}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-white/[0.06] bg-[#07080c]">
                    <div className="text-center">
                      <Clock3
                        size={18}
                        className="mx-auto text-slate-700"
                      />

                      <p className="mt-3 text-xs text-slate-600">
                        {measurements.length === 0
                          ? "No measurements recorded yet."
                          : "Record another check-in to see your trend."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Controls */}
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
              <div className="text-[9px] uppercase tracking-[0.14em] text-slate-700">
                Experiment controls
              </div>

              <h2
                className="mt-1 text-lg font-semibold text-white"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Keep the experiment moving
              </h2>

              <p className="mt-3 text-xs leading-5 text-slate-600">
                Record follower counts as you run the strategy. The
                experiment history will build your evidence over time.
              </p>

              {experiment.status !== "completed" && (
                <form action={logCheckIn} className="mt-6">
                  <input
                    type="hidden"
                    name="experimentId"
                    value={experiment.id}
                  />

                  <label className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-slate-700">
                    Today&apos;s follower count
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="followerCount"
                      min="0"
                      required
                      placeholder="e.g. 1420"
                      className="min-w-0 flex-1 rounded-lg border border-white/[0.07] bg-[#08090d] px-3 py-2.5 text-xs text-white outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30"
                    />

                    <button
                      type="submit"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-500 px-4 py-2.5 text-[10px] font-semibold text-white transition-colors hover:bg-violet-400"
                    >
                      Log result
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 border-t border-white/[0.05] pt-5">
                <div className="flex flex-wrap gap-2">
                  {experiment.status === "active" && (
                    <form action={updateExperimentStatus}>
                      <input
                        type="hidden"
                        name="experimentId"
                        value={experiment.id}
                      />

                      <input
                        type="hidden"
                        name="status"
                        value="paused"
                      />

                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.015] px-3 py-2 text-[10px] font-medium text-slate-500 transition-colors hover:border-white/[0.12] hover:text-slate-300"
                      >
                        <Pause size={11} />
                        Pause
                      </button>
                    </form>
                  )}

                  {experiment.status === "paused" && (
                    <form action={updateExperimentStatus}>
                      <input
                        type="hidden"
                        name="experimentId"
                        value={experiment.id}
                      />

                      <input
                        type="hidden"
                        name="status"
                        value="active"
                      />

                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2 text-[10px] font-medium text-emerald-400 transition-colors hover:bg-emerald-400/[0.08]"
                      >
                        <Play size={11} />
                        Resume
                      </button>
                    </form>
                  )}

                  {experiment.status !== "completed" && (
                    <form action={updateExperimentStatus}>
                      <input
                        type="hidden"
                        name="experimentId"
                        value={experiment.id}
                      />

                      <input
                        type="hidden"
                        name="status"
                        value="completed"
                      />

                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.015] px-3 py-2 text-[10px] font-medium text-slate-500 transition-colors hover:border-white/[0.12] hover:text-slate-300"
                      >
                        <CheckCircle2 size={11} />
                        Complete
                      </button>
                    </form>
                  )}

                  {experiment.status === "completed" && (
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/10 bg-violet-400/[0.04] px-3 py-2 text-[10px] font-medium text-violet-300">
                      <CheckCircle2 size={11} />
                      Experiment completed
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Strategy reference */}
          <section className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.015]">
            <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
              <div>
                <div className="text-[9px] uppercase tracking-[0.14em] text-slate-700">
                  Strategy
                </div>

                <h2
                  className="mt-1 text-lg font-semibold text-white"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  What you are testing
                </h2>
              </div>

              <Link
                href="/strategies"
                className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 transition-colors hover:text-violet-300"
              >
                View strategies
                <ChevronRight size={12} />
              </Link>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-[auto_1fr] md:items-start">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-400/[0.05]">
                <Beaker
                  size={17}
                  className="text-violet-400"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-300">
                  {experiment.strategy.title}
                </p>

                <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-600">
                  {experiment.strategy.description}
                </p>
              </div>
            </div>
          </section>

          {/* Recorded result */}
          <section className="mt-8">
            <div className="mb-4">
              <div className="text-[9px] uppercase tracking-[0.14em] text-slate-700">
                Experiment result
              </div>

              <h2
                className="mt-1 text-2xl font-semibold text-white"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Recorded result
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
              {experimentResult ? (
                <>
                  <div className="flex flex-col gap-4 border-b border-white/[0.04] px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-300">
                        Evaluation recorded {formatDateTime(experimentResult.recordedAt)}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-700">
                        This is the evaluation captured when the experiment was completed.
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[9px] font-medium ${getEvaluationStatusClasses(
                        experimentResult.status
                      )}`}
                    >
                      {getEvaluationStatusLabel(experimentResult.status)}
                    </span>
                  </div>

                  <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4 md:p-5">
                    <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-3">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                        Primary metric
                      </div>
                      <div className="mt-1.5 text-xs font-medium text-slate-300">
                        {getPrimaryMetricLabel(experimentResult.primaryMetric)}
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-3">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                        Posts measured
                      </div>
                      <div className="mt-1.5 text-xs font-medium text-slate-300">
                        {formatNumber(experimentResult.postsMeasured)}
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-3">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                        Baseline average
                      </div>
                      <div className="mt-1.5 text-xs font-medium text-slate-300">
                        {formatMetricValue(
                          experimentResult.baselineAverage,
                          experimentResult.primaryMetric
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-3">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                        Experiment average
                      </div>
                      <div className="mt-1.5 text-xs font-medium text-slate-300">
                        {formatMetricValue(
                          experimentResult.experimentAverage,
                          experimentResult.primaryMetric
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 border-t border-white/[0.05] p-4 sm:grid-cols-3 md:p-5">
                    <div className="rounded-lg border border-white/[0.05] bg-[#08090d] px-3 py-3">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                        Absolute change
                      </div>
                      <div className="mt-1.5 text-xs font-medium text-slate-300">
                        {experimentResult.absoluteChange !== null
                          ? `${experimentResult.absoluteChange >= 0 ? "+" : ""}${formatMetricValue(
                              experimentResult.absoluteChange,
                              experimentResult.primaryMetric
                            )}`
                          : "—"}
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/[0.05] bg-[#08090d] px-3 py-3">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                        Percentage change
                      </div>
                      <div
                        className={`mt-1.5 text-xs font-medium ${
                          experimentResult.percentageChange !== null &&
                          experimentResult.percentageChange >= 0
                            ? "text-emerald-400"
                            : experimentResult.percentageChange !== null
                              ? "text-rose-400"
                              : "text-slate-500"
                        }`}
                      >
                        {experimentResult.percentageChange !== null
                          ? `${experimentResult.percentageChange >= 0 ? "+" : ""}${experimentResult.percentageChange.toFixed(1)}%`
                          : "—"}
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/[0.05] bg-[#08090d] px-3 py-3">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                        Success threshold
                      </div>
                      <div className="mt-1.5 text-xs font-medium text-slate-300">
                        {experimentResult.successThresholdPercent !== null
                          ? `+${experimentResult.successThresholdPercent}%`
                          : "—"}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-5 py-12 text-center">
                  <CheckCircle2
                    size={18}
                    className="mx-auto text-slate-700"
                  />
                  <p className="mt-3 text-xs text-slate-600">
                    No completed result has been recorded yet.
                  </p>
                  <p className="mt-1 text-[10px] text-slate-700">
                    Complete the experiment after valid baseline and performance data are available.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Measurement history */}
                    {/* Follower measurement history */}
          {experiment.checkIns.length > 0 && (
            <section className="mt-8">
              <div className="mb-4">
                <div className="text-[9px] uppercase tracking-[0.14em] text-slate-700">
                  Follower measurements
                </div>

                <h2
                  className="mt-1 text-2xl font-semibold text-white"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  Measurement history
                </h2>

                <p className="mt-1 max-w-xl text-[10px] leading-5 text-slate-600">
                  Timestamped follower counts recorded while running this
                  experiment.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
                <div>
                  {experiment.checkIns
                    .slice()
                    .reverse()
                    .map((checkIn, index) => {
                      const previous =
                        experiment.checkIns[
                          experiment.checkIns.length - 2 - index
                        ];

                      const delta = previous
                        ? checkIn.followerCount -
                          previous.followerCount
                        : null;

                      return (
                        <div
                          key={checkIn.id}
                          className="flex items-center justify-between gap-4 border-b border-white/[0.04] px-5 py-4 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.02]">
                              {index === 0 ? (
                                <Clock3
                                  size={13}
                                  className="text-violet-400"
                                />
                              ) : (
                                <RotateCcw
                                  size={13}
                                  className="text-slate-700"
                                />
                              )}
                            </div>

                            <div>
                              <p className="text-xs font-medium text-slate-400">
                                {formatDate(checkIn.loggedAt)}
                              </p>

                              <p className="mt-0.5 text-[9px] text-slate-700">
                                Check-in #
                                {experiment.checkIns.length - index}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-medium text-slate-300">
                              {formatNumber(
                                checkIn.followerCount
                              )}{" "}
                              followers
                            </p>

                            {delta !== null && (
                              <p
                                className={`mt-0.5 text-[9px] ${
                                  delta >= 0
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {delta >= 0 ? "+" : ""}
                                {formatNumber(delta)} since previous
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </section>
          )}
          {/* Product philosophy */}
          <div className="mt-8 rounded-xl border border-white/[0.05] bg-white/[0.01] px-4 py-3">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-violet-400/10 bg-violet-400/[0.04] text-center text-[9px] leading-5 text-violet-400">
                i
              </div>

              <p className="text-[9px] leading-5 text-slate-700">
                These are observed follower-count changes between your
                recorded measurements. They are signals to investigate, not
                proof that the strategy caused the change. Research findings
                provide hypotheses to test; your own experiment produces the
                evidence for your account.
              </p>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}