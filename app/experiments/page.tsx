import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Pause,
  Play,
  Target,
  TrendingUp,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { logCheckIn, updateExperimentStatus } from "../dashboard/actions";
import { AppLayout } from "../components/AppLayout";

function buildChart(checkIns: { followerCount: number }[]) {
  const asc = [...checkIns].reverse();
  const values = asc.map((checkIn) => checkIn.followerCount);

  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const yTop = 15;
  const yBottom = 90;

  const points = values.map((value, index) => ({
    x: index * (500 / (values.length - 1)),
    y: yBottom - ((value - min) / range) * (yBottom - yTop),
  }));

  const path =
    "M" +
    points
      .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
      .join(" L");

  const areaPath = `${path} L ${
    points[points.length - 1].x
  .toFixed(1)},100 L 0,100 Z`;

  return {
    path,
    areaPath,
    end: points[points.length - 1],
  };
}

function getStatusClasses(status: string) {
  switch (status) {
    case "active":
      return "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-400";

    case "paused":
      return "border-amber-400/15 bg-amber-400/[0.06] text-amber-400";

    case "completed":
      return "border-violet-400/15 bg-violet-400/[0.06] text-violet-300";

    default:
      return "border-white/[0.07] bg-white/[0.02] text-slate-500";
  }
}

function ExperimentCard({
  experiment,
}: {
  experiment: {
    id: string;
    status: string;
    strategy: {
      title: string;
      description: string;
      nicheTags: string[];
      stageTags: string[];
    };
    checkIns: {
      id: string;
      followerCount: number;
      loggedAt: Date;
    }[];
  };
}) {
  const latest = experiment.checkIns[0];
  const chart = buildChart(experiment.checkIns);
  const ascCheckIns = [...experiment.checkIns].reverse();

  const growth =
    ascCheckIns.length >= 2
      ? ascCheckIns[ascCheckIns.length - 1].followerCount -
        ascCheckIns[0].followerCount
      : null;

  const firstCount = ascCheckIns[0]?.followerCount;
  const latestCount = latest?.followerCount;

  return (
    <article className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d0f15]">
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[9px] font-medium capitalize ${getStatusClasses(
                  experiment.status
                )}`}
              >
                {experiment.status}
              </span>

              {growth !== null && (
                <span
                  className={`text-[9px] font-medium ${
                    growth >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {growth >= 0 ? "+" : ""}
                  {growth.toLocaleString()} followers
                </span>
              )}
            </div>

            <h2
              className="text-xl font-semibold tracking-[-0.025em] text-white"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              {experiment.strategy.title}
            </h2>

            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
              {experiment.strategy.description}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/experiments/${experiment.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/15 bg-violet-400/[0.06] px-3 py-2 text-[11px] font-medium text-violet-300 transition-all hover:border-violet-400/30 hover:bg-violet-400/[0.1] hover:text-violet-200"
            >
              View experiment
              <ArrowRight size={12} />
            </Link>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-400/10 bg-violet-400/[0.05]">
              <FlaskConical
                size={15}
                className="text-violet-400"
                strokeWidth={1.7}
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {[
            ...new Set([
              ...experiment.strategy.nicheTags,
              ...experiment.strategy.stageTags,
            ]),
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/[0.05] bg-white/[0.015] px-2.5 py-1 text-[9px] text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Measurement summary */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-3">
            <div className="text-[9px] uppercase tracking-[0.1em] text-slate-700">
              Check-ins
            </div>

            <div className="mt-1 text-sm font-semibold text-slate-300">
              {experiment.checkIns.length}
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-3">
            <div className="text-[9px] uppercase tracking-[0.1em] text-slate-700">
              Starting
            </div>

            <div className="mt-1 text-sm font-semibold text-slate-300">
              {firstCount !== undefined
                ? firstCount.toLocaleString()
                : "—"}
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-3">
            <div className="text-[9px] uppercase tracking-[0.1em] text-slate-700">
              Latest
            </div>

            <div className="mt-1 text-sm font-semibold text-slate-300">
              {latestCount !== undefined
                ? latestCount.toLocaleString()
                : "—"}
            </div>
          </div>
        </div>

        {/* Chart */}
        {chart ? (
          <div className="mt-5 h-[130px] rounded-lg border border-white/[0.04] bg-[#090a0f] px-3 py-3">
            <svg
              viewBox="0 0 500 100"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              style={{ overflow: "visible" }}
            >
              <defs>
                <linearGradient
                  id={`experiment-area-${experiment.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#8b7cf6"
                    stopOpacity="0.22"
                  />

                  <stop
                    offset="100%"
                    stopColor="#8b7cf6"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              <path
                d={chart.areaPath}
                fill={`url(#experiment-area-${experiment.id})`}
                stroke="none"
              />

              <path
                d={chart.path}
                fill="none"
                stroke="#8b7cf6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <circle
                cx={chart.end.x}
                cy={chart.end.y}
                r="3.5"
                fill="#8b7cf6"
              />
            </svg>
          </div>
        ) : (
          <div className="mt-5 flex h-[130px] items-center justify-center rounded-lg border border-dashed border-white/[0.05] bg-white/[0.01]">
            <div className="text-center">
              <Clock3
                size={16}
                className="mx-auto text-slate-700"
              />

              <p className="mt-2 text-[10px] text-slate-600">
                Log a second check-in to reveal your growth trend.
              </p>
            </div>
          </div>
        )}

        {/* Check-in */}
        {experiment.status === "active" ? (
          <form
            action={logCheckIn}
            className="mt-4 flex gap-2"
          >
            <input
              type="hidden"
              name="experimentId"
              value={experiment.id}
            />

            <input
              type="number"
              name="followerCount"
              placeholder="Today's follower count"
              required
              className="min-w-0 flex-1 rounded-lg border border-white/[0.07] bg-[#090a0f] px-3 py-2.5 text-xs text-white outline-none placeholder:text-slate-700 transition-colors focus:border-violet-400/30"
            />

            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-violet-500 px-3.5 py-2.5 text-[10px] font-semibold text-white transition-all hover:bg-violet-400 active:scale-[0.97]"
            >
              <Activity size={12} />
              Log result
            </button>
          </form>
        ) : experiment.status === "paused" ? (
          <div className="mt-4 rounded-lg border border-amber-400/[0.08] bg-amber-400/[0.025] px-3 py-2.5 text-[10px] text-amber-400/70">
            This experiment is paused. Resume it to record another
            result.
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-violet-400/[0.07] bg-violet-400/[0.02] px-3 py-2.5 text-[10px] text-violet-300/60">
            Experiment completed. Your recorded results remain available
            below.
          </div>
        )}

        {/* Controls */}
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">
          <div className="flex gap-2">
            {experiment.status !== "completed" && (
              <>
                <form action={updateExperimentStatus}>
                  <input
                    type="hidden"
                    name="experimentId"
                    value={experiment.id}
                  />

                  <input
                    type="hidden"
                    name="status"
                    value={
                      experiment.status === "active"
                        ? "paused"
                        : "active"
                    }
                  />

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] px-2.5 py-1.5 text-[9px] font-medium text-slate-600 transition-colors hover:border-white/[0.12] hover:text-slate-300"
                  >
                    {experiment.status === "active" ? (
                      <Pause size={10} />
                    ) : (
                      <Play size={10} />
                    )}

                    {experiment.status === "active"
                      ? "Pause"
                      : "Resume"}
                  </button>
                </form>

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
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] px-2.5 py-1.5 text-[9px] font-medium text-slate-600 transition-colors hover:border-white/[0.12] hover:text-slate-300"
                  >
                    <CheckCircle2 size={10} />
                    Complete
                  </button>
                </form>
              </>
            )}
          </div>

          <span className="text-[9px] text-slate-700">
            {latest
              ? `Last measured ${new Date(
                  latest.loggedAt
                ).toLocaleDateString()}`
              : "Awaiting first measurement"}
          </span>
        </div>
      </div>

      {/* Recent measurements */}
      {experiment.checkIns.length > 0 && (
        <div className="border-t border-white/[0.05] bg-white/[0.008]">
          <div className="flex items-center gap-2 border-b border-white/[0.04] px-5 py-3">
            <TrendingUp size={11} className="text-slate-700" />

            <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600">
              Measurement history
            </span>
          </div>

          {experiment.checkIns.slice(0, 5).map((checkIn) => (
            <div
              key={checkIn.id}
              className="flex items-center justify-between border-b border-white/[0.035] px-5 py-2.5 last:border-b-0"
            >
              <span className="text-[9px] text-slate-600">
                {new Date(checkIn.loggedAt).toLocaleDateString()}
              </span>

              <span className="text-[10px] font-medium text-slate-400">
                {checkIn.followerCount.toLocaleString()}

                <span className="ml-1 font-normal text-slate-700">
                  followers
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default async function ExperimentsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
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

  const activeExperiments = experiments.filter(
    (experiment) => experiment.status === "active"
  );

  const pausedExperiments = experiments.filter(
    (experiment) => experiment.status === "paused"
  );

  const completedExperiments = experiments.filter(
    (experiment) => experiment.status === "completed"
  );

  const totalCheckIns = experiments.reduce(
    (sum, experiment) => sum + experiment.checkIns.length,
    0
  );

  return (
    <AppLayout>
      <main className="min-h-screen bg-[#090a0f] px-5 py-8 sm:px-7 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,124,246,0.55)]" />

                <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-600">
                  Experiment workspace
                </span>
              </div>

              <h1
                className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Your experiments.
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Run experiments, record what happens, and keep the results
                that help you understand your growth.
              </p>
            </div>

            <Link
              href="/strategies"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-violet-400 active:scale-[0.97]"
            >
              <Target size={13} />
              Find a strategy
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Summary */}
          <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-white/[0.06] bg-[#0d0f15] p-4">
              <div className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600">
                Total
              </div>

              <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                {experiments.length}
              </div>

              <div className="mt-1 text-[10px] text-slate-700">
                experiments
              </div>
            </div>

            <div className="rounded-xl border border-emerald-400/[0.08] bg-emerald-400/[0.015] p-4">
              <div className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600">
                Active
              </div>

              <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-emerald-400">
                {activeExperiments.length}
              </div>

              <div className="mt-1 text-[10px] text-slate-700">
                currently running
              </div>
            </div>

            <div className="rounded-xl border border-amber-400/[0.08] bg-amber-400/[0.015] p-4">
              <div className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600">
                Paused
              </div>

              <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-amber-400">
                {pausedExperiments.length}
              </div>

              <div className="mt-1 text-[10px] text-slate-700">
                waiting to resume
              </div>
            </div>

            <div className="rounded-xl border border-violet-400/[0.08] bg-violet-400/[0.015] p-4">
              <div className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600">
                Measured
              </div>

              <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-violet-300">
                {totalCheckIns}
              </div>

              <div className="mt-1 text-[10px] text-slate-700">
                check-ins recorded
              </div>
            </div>
          </div>

          {/* Empty state */}
          {experiments.length === 0 ? (
            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d0f15]">
              <div className="relative px-6 py-16 text-center sm:px-10">
                <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-violet-500/[0.06] blur-[100px]" />

                <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.06]">
                  <FlaskConical
                    size={20}
                    className="text-violet-400"
                  />
                </div>

                <h2
                  className="relative mt-5 text-2xl font-semibold tracking-[-0.02em] text-white"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  Nothing is being tested yet.
                </h2>

                <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                  Choose a strategy from the library and start your first
                  experiment. Your measurements will appear here as you
                  collect them.
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
            <div className="space-y-10">
              {/* Active */}
              {activeExperiments.length > 0 && (
                <section>
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-emerald-400/60">
                        Currently running
                      </div>

                      <h2
                        className="mt-1 text-xl font-semibold tracking-[-0.025em] text-white"
                        style={{ fontFamily: "Fraunces, serif" }}
                      >
                        Active experiments
                      </h2>
                    </div>

                    <span className="text-[10px] text-slate-700">
                      {activeExperiments.length} running
                    </span>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {activeExperiments.map((experiment) => (
                      <ExperimentCard
                        key={experiment.id}
                        experiment={experiment}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Paused */}
              {pausedExperiments.length > 0 && (
                <section>
                  <div className="mb-4">
                    <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-amber-400/60">
                      On hold
                    </div>

                    <h2
                      className="mt-1 text-xl font-semibold tracking-[-0.025em] text-white"
                      style={{ fontFamily: "Fraunces, serif" }}
                    >
                      Paused experiments
                    </h2>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {pausedExperiments.map((experiment) => (
                      <ExperimentCard
                        key={experiment.id}
                        experiment={experiment}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Completed */}
              {completedExperiments.length > 0 && (
                <section>
                  <div className="mb-4">
                    <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-violet-400/60">
                      Finished
                    </div>

                    <h2
                      className="mt-1 text-xl font-semibold tracking-[-0.025em] text-white"
                      style={{ fontFamily: "Fraunces, serif" }}
                    >
                      Completed experiments
                    </h2>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {completedExperiments.map((experiment) => (
                      <ExperimentCard
                        key={experiment.id}
                        experiment={experiment}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}   