import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Lightbulb,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AppLayout } from "../components/AppLayout";

function getExperimentStats(checkIns: { followerCount: number }[]) {
  const asc = [...checkIns].reverse();

  if (asc.length < 2) {
    return null;
  }

  const starting = asc[0].followerCount;
  const latest = asc[asc.length - 1].followerCount;
  const change = latest - starting;

  const percentage =
    starting > 0 ? (change / starting) * 100 : 0;

  return {
    starting,
    latest,
    change,
    percentage,
    measurements: asc.length,
  };
}

function formatChange(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toLocaleString()}`;
}

function formatPercentage(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export default async function InsightsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    include: {
      experiments: {
        include: {
          strategy: true,
          checkIns: {
            orderBy: {
              loggedAt: "desc",
            },
          },
        },
        orderBy: {
          startedAt: "desc",
        },
      },
    },
  });

  if (!user) {
    redirect("/");
  }

  const experiments = user.experiments;

  const measuredExperiments = experiments
    .map((experiment) => {
      const stats = getExperimentStats(experiment.checkIns);

      if (!stats) return null;

      return {
        id: experiment.id,
        title: experiment.strategy.title,
        description: experiment.strategy.description,
        status: experiment.status,
        startedAt: experiment.startedAt,
        ...stats,
      };
    })
    .filter(
      (
        experiment
      ): experiment is NonNullable<typeof experiment> =>
        experiment !== null
    );

  /*
   * Only active experiments with fewer than two measurements
   * need to be surfaced here.
   *
   * Completed or paused experiments should not appear in
   * "Keep measuring these."
   */
  const unmeasuredExperiments = experiments.filter(
    (experiment) =>
      experiment.status === "active" &&
      experiment.checkIns.length < 2
  );

  const positiveExperiments = measuredExperiments.filter(
    (experiment) => experiment.change > 0
  );

  const negativeExperiments = measuredExperiments.filter(
    (experiment) => experiment.change < 0
  );

  const strongestObserved =
    measuredExperiments.length > 0
      ? [...measuredExperiments].sort(
          (a, b) => b.change - a.change
        )[0]
      : null;

  const averageChange =
    measuredExperiments.length > 0
      ? measuredExperiments.reduce(
          (sum, experiment) => sum + experiment.change,
          0
        ) / measuredExperiments.length
      : null;

  return (
    <AppLayout>
      <main className="min-h-screen bg-[#090a0f] px-5 py-8 sm:px-7 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" />

              <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-600">
                Learning layer
              </span>
            </div>

            <h1
              className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              What have you learned?
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Turn your experiment history into observations you can use
              when deciding what to test next.
            </p>
          </div>

          {experiments.length === 0 ? (
            /* Empty state */
            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d0f15]">
              <div className="relative px-6 py-16 text-center sm:px-10">
                <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-violet-500/[0.06] blur-[100px]" />

                <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.06]">
                  <Lightbulb
                    size={20}
                    className="text-violet-400"
                  />
                </div>

                <h2
                  className="relative mt-5 text-2xl font-semibold tracking-[-0.02em] text-white"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  Your learning starts with your first experiment.
                </h2>

                <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                  Run a strategy, record at least two measurements, and
                  Slancialab will start turning your results into useful
                  observations.
                </p>

                <Link
                  href="/strategies"
                  className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-violet-500 px-6 py-3 text-xs font-semibold text-white transition-all hover:bg-violet-400 active:scale-[0.97]"
                >
                  Explore strategies
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Summary metrics */}
              <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-white/[0.06] bg-[#0d0f15] p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600">
                      Experiments
                    </span>

                    <FlaskConical
                      size={14}
                      className="text-violet-400"
                    />
                  </div>

                  <div className="text-2xl font-semibold tracking-[-0.03em] text-white">
                    {experiments.length}
                  </div>

                  <div className="mt-1 text-[10px] text-slate-600">
                    started
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-400/[0.08] bg-emerald-400/[0.015] p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600">
                      Measured
                    </span>

                    <CheckCircle2
                      size={14}
                      className="text-emerald-400"
                    />
                  </div>

                  <div className="text-2xl font-semibold tracking-[-0.03em] text-emerald-400">
                    {measuredExperiments.length}
                  </div>

                  <div className="mt-1 text-[10px] text-slate-600">
                    2+ measurements
                  </div>
                </div>

                <div className="rounded-xl border border-violet-400/[0.08] bg-violet-400/[0.015] p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600">
                      Positive change
                    </span>

                    <TrendingUp
                      size={14}
                      className="text-violet-400"
                    />
                  </div>

                  <div className="text-2xl font-semibold tracking-[-0.03em] text-violet-300">
                    {positiveExperiments.length}
                  </div>

                  <div className="mt-1 text-[10px] text-slate-600">
                    observed increases
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-[#0d0f15] p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600">
                      Average change
                    </span>

                    {averageChange !== null &&
                    averageChange >= 0 ? (
                      <TrendingUp
                        size={14}
                        className="text-emerald-400"
                      />
                    ) : (
                      <TrendingDown
                        size={14}
                        className="text-rose-400"
                      />
                    )}
                  </div>

                  <div
                    className={`text-2xl font-semibold tracking-[-0.03em] ${
                      averageChange === null
                        ? "text-slate-600"
                        : averageChange >= 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {averageChange !== null
                      ? formatChange(Math.round(averageChange))
                      : "—"}
                  </div>

                  <div className="mt-1 text-[10px] text-slate-600">
                    followers per measured experiment
                  </div>
                </div>
              </div>

              {/* Main observation */}
              {strongestObserved && (
                <section className="mb-8 overflow-hidden rounded-xl border border-violet-400/10 bg-violet-400/[0.025]">
                  <div className="relative p-5 sm:p-6">
                    <div className="pointer-events-none absolute right-0 top-0 h-48 w-72 rounded-full bg-violet-500/[0.07] blur-[80px]" />

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Lightbulb
                            size={13}
                            className="text-violet-400"
                          />

                          <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-violet-400/70">
                            Observed signal
                          </span>
                        </div>

                        <h2
                          className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white"
                          style={{ fontFamily: "Fraunces, serif" }}
                        >
                          {strongestObserved.title}
                        </h2>

                        <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
                          This experiment recorded the largest absolute
                          follower change among your experiments with at
                          least two measurements.
                        </p>
                      </div>

                      <div className="shrink-0 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.035] px-5 py-4 lg:min-w-[180px]">
                        <div className="text-[9px] uppercase tracking-[0.12em] text-slate-600">
                          Recorded change
                        </div>

                        <div className="mt-1 text-2xl font-semibold text-emerald-400">
                          {formatChange(
                            strongestObserved.change
                          )}
                        </div>

                        <div className="mt-1 text-[10px] text-slate-600">
                          {formatPercentage(
                            strongestObserved.percentage
                          )}{" "}
                          from first measurement
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* What the data says */}
              <section className="mb-8">
                <div className="mb-4">
                  <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-600">
                    Your data
                  </div>

                  <h2
                    className="mt-1 text-xl font-semibold tracking-[-0.025em] text-white"
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    What the measurements show
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Positive */}
                  <div className="rounded-xl border border-white/[0.06] bg-[#0d0f15] p-5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/[0.07]">
                        <TrendingUp
                          size={13}
                          className="text-emerald-400"
                        />
                      </div>

                      <div>
                        <div className="text-[9px] uppercase tracking-[0.12em] text-slate-600">
                          Recorded increases
                        </div>

                        <div className="text-sm font-medium text-white">
                          {positiveExperiments.length} experiment
                          {positiveExperiments.length === 1
                            ? ""
                            : "s"}
                        </div>
                      </div>
                    </div>

                    {positiveExperiments.length > 0 ? (
                      <div className="mt-5 space-y-2">
                        {[...positiveExperiments]
                          .sort(
                            (a, b) => b.change - a.change
                          )
                          .slice(0, 4)
                          .map((experiment) => (
                            <div
                              key={experiment.id}
                              className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.01] px-3 py-2.5"
                            >
                              <span className="truncate pr-4 text-[10px] text-slate-400">
                                {experiment.title}
                              </span>

                              <span className="shrink-0 text-[10px] font-medium text-emerald-400">
                                {formatChange(
                                  experiment.change
                                )}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="mt-5 text-xs leading-5 text-slate-600">
                        No measured experiment has recorded an increase
                        yet.
                      </p>
                    )}
                  </div>

                  {/* Declines */}
                  <div className="rounded-xl border border-white/[0.06] bg-[#0d0f15] p-5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-400/[0.07]">
                        <TrendingDown
                          size={13}
                          className="text-rose-400"
                        />
                      </div>

                      <div>
                        <div className="text-[9px] uppercase tracking-[0.12em] text-slate-600">
                          Recorded decreases
                        </div>

                        <div className="text-sm font-medium text-white">
                          {negativeExperiments.length} experiment
                          {negativeExperiments.length === 1
                            ? ""
                            : "s"}
                        </div>
                      </div>
                    </div>

                    {negativeExperiments.length > 0 ? (
                      <div className="mt-5 space-y-2">
                        {[...negativeExperiments]
                          .sort(
                            (a, b) => a.change - b.change
                          )
                          .slice(0, 4)
                          .map((experiment) => (
                            <div
                              key={experiment.id}
                              className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.01] px-3 py-2.5"
                            >
                              <span className="truncate pr-4 text-[10px] text-slate-400">
                                {experiment.title}
                              </span>

                              <span className="shrink-0 text-[10px] font-medium text-rose-400">
                                {formatChange(
                                  experiment.change
                                )}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="mt-5 text-xs leading-5 text-slate-600">
                        No measured experiment has recorded a decrease
                        yet.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Experiments that need more data */}
              {unmeasuredExperiments.length > 0 && (
                <section className="mb-8">
                  <div className="mb-4">
                    <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-amber-400/60">
                      Not enough data yet
                    </div>

                    <h2
                      className="mt-1 text-xl font-semibold tracking-[-0.025em] text-white"
                      style={{ fontFamily: "Fraunces, serif" }}
                    >
                      Keep measuring these
                    </h2>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {unmeasuredExperiments
                      .slice(0, 4)
                      .map((experiment) => (
                        <div
                          key={experiment.id}
                          className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0d0f15] p-4"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-white">
                              {experiment.strategy.title}
                            </div>

                            <div className="mt-1 flex items-center gap-2 text-[9px] text-slate-600">
                              <Clock3 size={10} />

                              {experiment.checkIns.length === 0
                                ? "No measurements yet"
                                : "1 measurement recorded"}
                            </div>
                          </div>

                          <Link
                            href="/experiments"
                            className="ml-4 inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-violet-300 hover:text-violet-200"
                          >
                            Measure
                            <ArrowRight size={11} />
                          </Link>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {/* Experiment history */}
              <section>
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-600">
                      Experiment history
                    </div>

                    <h2
                      className="mt-1 text-xl font-semibold tracking-[-0.025em] text-white"
                      style={{ fontFamily: "Fraunces, serif" }}
                    >
                      Measured results
                    </h2>
                  </div>

                  <Link
                    href="/experiments"
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 transition-colors hover:text-white"
                  >
                    View experiments
                    <ArrowRight size={11} />
                  </Link>
                </div>

                {measuredExperiments.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d0f15]">
                    <div className="hidden grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.7fr] border-b border-white/[0.05] px-5 py-3 text-[9px] uppercase tracking-[0.12em] text-slate-700 sm:grid">
                      <span>Strategy</span>
                      <span>Measurements</span>
                      <span>Starting</span>
                      <span>Latest</span>
                      <span>Change</span>
                    </div>

                    {measuredExperiments.map(
                      (experiment) => (
                        <div
                          key={experiment.id}
                          className="grid gap-3 border-b border-white/[0.04] px-5 py-4 last:border-b-0 sm:grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.7fr] sm:items-center"
                        >
                          <div>
                            <div className="text-xs font-medium text-white">
                              {experiment.title}
                            </div>

                            <div className="mt-1 text-[9px] capitalize text-slate-700">
                              {experiment.status}
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-500">
                            <span className="sm:hidden">
                              Measurements:{" "}
                            </span>
                            {experiment.measurements}
                          </div>

                          <div className="text-[10px] text-slate-500">
                            <span className="sm:hidden">
                              Starting:{" "}
                            </span>
                            {experiment.starting.toLocaleString()}
                          </div>

                          <div className="text-[10px] text-slate-400">
                            <span className="sm:hidden">
                              Latest:{" "}
                            </span>
                            {experiment.latest.toLocaleString()}
                          </div>

                          <div
                            className={`text-[10px] font-medium ${
                              experiment.change >= 0
                                ? "text-emerald-400"
                                : "text-rose-400"
                            }`}
                          >
                            <span className="sm:hidden">
                              Change:{" "}
                            </span>
                            {formatChange(experiment.change)}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] px-5 py-10 text-center">
                    <p className="text-xs text-slate-600">
                      You need at least two measurements in an experiment
                      before a result can appear here.
                    </p>

                    <Link
                      href="/experiments"
                      className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-medium text-violet-300 hover:text-violet-200"
                    >
                      Go to experiments
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                )}
              </section>

              {/* Methodology note */}
              <div className="mt-8 flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.01] px-4 py-4">
                <Target
                  size={13}
                  className="mt-0.5 shrink-0 text-slate-700"
                />

                <p className="text-[9px] leading-4 text-slate-700">
                  These are observed follower-count changes between your
                  recorded measurements. They are signals to investigate,
                  not proof that a strategy caused the change. More
                  measurements and repeated experiments will make your
                  personal playbook more informative.
                </p>
              </div>

              {/* CTA */}
              <div className="mt-8 flex flex-col gap-4 rounded-xl border border-violet-400/10 bg-violet-400/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium text-white">
                    Ready to test another hypothesis?
                  </div>

                  <p className="mt-1 text-[10px] text-slate-600">
                    Pick another strategy and keep building your evidence.
                  </p>
                </div>

                <Link
                  href="/strategies"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-[10px] font-semibold text-white transition-all hover:bg-violet-400 active:scale-[0.97]"
                >
                  Find a strategy
                  <ArrowRight size={12} />
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </AppLayout>
  );
}