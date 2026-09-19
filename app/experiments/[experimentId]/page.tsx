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
  Pause,
  Play,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  logCheckIn,
  updateExperimentStatus,
} from "../../dashboard/actions";
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
      checkIns: {
        orderBy: {
          loggedAt: "asc",
        },
      },
    },
  });

  if (!experiment) {
    notFound();
  }

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
              </div>
            </div>
          </div>

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
                <form
                  action={logCheckIn}
                  className="mt-6"
                >
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

          {/* Measurement history */}
          <section className="mt-8">
            <div className="mb-4">
              <div className="text-[9px] uppercase tracking-[0.14em] text-slate-700">
                Measurement history
              </div>

              <h2
                className="mt-1 text-2xl font-semibold text-white"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Recorded results
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
              {experiment.checkIns.length > 0 ? (
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
              ) : (
                <div className="px-5 py-12 text-center">
                  <Clock3
                    size={18}
                    className="mx-auto text-slate-700"
                  />

                  <p className="mt-3 text-xs text-slate-600">
                    No measurements have been recorded yet.
                  </p>

                  <p className="mt-1 text-[10px] text-slate-700">
                    Log your first follower count above to start
                    building the experiment history.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Product philosophy */}
          <div className="mt-8 rounded-xl border border-white/[0.05] bg-white/[0.01] px-4 py-3">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-violet-400/10 bg-violet-400/[0.04] text-center text-[9px] leading-5 text-violet-400">
                i
              </div>

              <p className="text-[9px] leading-5 text-slate-700">
                These are observed follower-count changes between your
                recorded measurements. They are signals to investigate,
                not proof that the strategy caused the change.
              </p>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}