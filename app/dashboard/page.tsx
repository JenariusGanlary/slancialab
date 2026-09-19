import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Play,
  Pause,
  Trophy,
  TrendingUp,
  Target,
  Plus,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { logCheckIn, updateExperimentStatus } from "./actions";
import { AppLayout } from "../components/AppLayout";

function buildChart(checkIns: { followerCount: number }[]) {
  const asc = [...checkIns].reverse();
  const values = asc.map((c) => c.followerCount);

  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const yTop = 15;
  const yBottom = 90;

  const points = values.map((v, i) => ({
    x: i * (500 / (values.length - 1)),
    y: yBottom - ((v - min) / range) * (yBottom - yTop),
  }));

  const path =
    "M" +
    points
      .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
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

function getNextStep(
  experiments: {
    status: string;
    checkIns: { followerCount: number }[];
  }[]
) {
  if (experiments.length === 0) {
    return {
      title: "Start your first experiment",
      description:
        "Pick a strategy that fits your content and start collecting real results.",
      action: "Explore strategies",
      href: "/strategies",
      icon: Target,
    };
  }

  const needsCheckIn = experiments.find(
    (experiment) =>
      experiment.status === "active" && experiment.checkIns.length === 0
  );

  if (needsCheckIn) {
    return {
      title: "Log your first result",
      description:
        "You have an active experiment waiting for its first measurement.",
      action: "Log a check-in below",
      href: "#active-experiments",
      icon: Activity,
    };
  }

  const activeExperiment = experiments.find(
    (experiment) => experiment.status === "active"
  );

  if (activeExperiment) {
    return {
      title: "Keep measuring",
      description:
        "Consistent measurements turn individual posts into useful patterns.",
      action: "View experiments",
      href: "#active-experiments",
      icon: TrendingUp,
    };
  }

  return {
    title: "Run another experiment",
    description:
      "Your current experiments are not active. Try another strategy and keep learning.",
    action: "Explore strategies",
    href: "/strategies",
    icon: FlaskConical,
  };
}

export default async function DashboardPage() {
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
            orderBy: { loggedAt: "desc" },
          },
        },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/");
  }

  const experiments = user.experiments;

  const activeCount = experiments.filter(
    (experiment) => experiment.status === "active"
  ).length;

  const completedCount = experiments.filter(
    (experiment) => experiment.status === "completed"
  ).length;

  const totalCheckIns = experiments.reduce(
    (sum, experiment) => sum + experiment.checkIns.length,
    0
  );

  const best = experiments
    .map((experiment) => {
      const asc = [...experiment.checkIns].reverse();

      if (asc.length < 2) return null;

      const growth =
        asc[asc.length - 1].followerCount - asc[0].followerCount;

      return {
        title: experiment.strategy.title,
        growth,
      };
    })
    .filter(
      (result): result is { title: string; growth: number } =>
        result !== null
    )
    .sort((a, b) => b.growth - a.growth)[0];

  const nextStep = getNextStep(
    experiments.map((experiment) => ({
      status: experiment.status,
      checkIns: experiment.checkIns,
    }))
  );

  const NextStepIcon = nextStep.icon;

  return (
    <AppLayout>
      <main className="min-h-screen bg-[#090a0f] px-5 py-8 sm:px-7 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" />
                <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-600">
                  Experiment workspace
                </span>
              </div>

              <h1
                className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Overview
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Track your experiments, measure what happens, and turn results
                into your own growth playbook.
              </p>
            </div>

            <Link
              href="/strategies"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-violet-400 active:scale-[0.97]"
            >
              <Plus size={14} />
              New experiment
            </Link>
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
                    strokeWidth={1.7}
                  />
                </div>

                <h2
                  className="relative mt-5 text-2xl font-semibold tracking-[-0.02em] text-white"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  Your first experiment starts here.
                </h2>

                <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                  Choose a strategy from the library, start tracking it, and
                  come back here to measure what actually happens.
                </p>

                <Link
                  href="/strategies"
                  className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-violet-500 px-6 py-3 text-xs font-semibold text-white transition-all hover:bg-violet-400 active:scale-[0.97]"
                >
                  Explore strategies
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid border-t border-white/[0.05] sm:grid-cols-3">
                <div className="border-b border-white/[0.05] px-5 py-5 text-center sm:border-b-0 sm:border-r">
                  <div className="text-xs font-medium text-white">
                    Discover
                  </div>
                  <div className="mt-1 text-[10px] text-slate-600">
                    Find strategies worth testing
                  </div>
                </div>

                <div className="border-b border-white/[0.05] px-5 py-5 text-center sm:border-b-0 sm:border-r">
                  <div className="text-xs font-medium text-white">
                    Measure
                  </div>
                  <div className="mt-1 text-[10px] text-slate-600">
                    Track real audience response
                  </div>
                </div>

                <div className="px-5 py-5 text-center">
                  <div className="text-xs font-medium text-white">Learn</div>
                  <div className="mt-1 text-[10px] text-slate-600">
                    Build your personal playbook
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Metrics */}
              <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-white/[0.06] bg-[#0d0f15] p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600">
                      Active
                    </span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/[0.07]">
                      <Activity size={13} className="text-emerald-400" />
                    </div>
                  </div>

                  <div className="text-2xl font-semibold tracking-[-0.03em] text-white">
                    {activeCount}
                  </div>

                  <div className="mt-1 text-[10px] text-slate-600">
                    experiments running
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-[#0d0f15] p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600">
                      Measured
                    </span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-400/[0.07]">
                      <TrendingUp size={13} className="text-violet-400" />
                    </div>
                  </div>

                  <div className="text-2xl font-semibold tracking-[-0.03em] text-white">
                    {totalCheckIns}
                  </div>

                  <div className="mt-1 text-[10px] text-slate-600">
                    check-ins logged
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-[#0d0f15] p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600">
                      Completed
                    </span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04]">
                      <CheckCircle2 size={13} className="text-slate-400" />
                    </div>
                  </div>

                  <div className="text-2xl font-semibold tracking-[-0.03em] text-white">
                    {completedCount}
                  </div>

                  <div className="mt-1 text-[10px] text-slate-600">
                    experiments finished
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-[#0d0f15] p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600">
                      Best signal
                    </span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/[0.07]">
                      <Trophy size={13} className="text-amber-400" />
                    </div>
                  </div>

                  {best ? (
                    <>
                      <div className="text-2xl font-semibold tracking-[-0.03em] text-emerald-400">
                        {best.growth >= 0 ? "+" : ""}
                        {best.growth.toLocaleString()}
                      </div>
                      <div className="mt-1 truncate text-[10px] text-slate-600">
                        follower change
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-semibold tracking-[-0.03em] text-slate-600">
                        —
                      </div>
                      <div className="mt-1 text-[10px] text-slate-600">
                        need 2+ measurements
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Next step */}
              <div className="mb-8 overflow-hidden rounded-xl border border-violet-400/10 bg-violet-400/[0.035]">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-400/15 bg-violet-400/[0.07]">
                      <NextStepIcon
                        size={14}
                        className="text-violet-400"
                      />
                    </div>

                    <div>
                      <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-violet-400/70">
                        Suggested next step
                      </div>

                      <div className="mt-1 text-sm font-medium text-white">
                        {nextStep.title}
                      </div>

                      <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                        {nextStep.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={nextStep.href}
                    className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-violet-300 transition-colors hover:text-violet-200"
                  >
                    {nextStep.action}
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Best result */}
              {best && (
                <div className="mb-8 rounded-xl border border-white/[0.06] bg-[#0d0f15] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-600">
                        Strongest measured result
                      </div>
                      <h2
                        className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white"
                        style={{ fontFamily: "Fraunces, serif" }}
                      >
                        {best.title}
                      </h2>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-semibold text-emerald-400">
                        {best.growth >= 0 ? "+" : ""}
                        {best.growth.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-slate-600">
                        follower change
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/[0.04]" />

                  <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-600">
                    <Trophy size={12} className="text-amber-400/70" />
                    Based on experiments with at least two recorded
                    measurements.
                  </div>
                </div>
              )}

              {/* Active experiments */}
              <section id="active-experiments">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-600">
                      Your experiments
                    </div>

                    <h2
                      className="mt-1 text-xl font-semibold tracking-[-0.025em] text-white"
                      style={{ fontFamily: "Fraunces, serif" }}
                    >
                      What you&apos;re testing
                    </h2>
                  </div>

                  <Link
                    href="/strategies"
                    className="hidden items-center gap-1 text-[10px] font-medium text-slate-500 transition-colors hover:text-white sm:flex"
                  >
                    Browse strategies
                    <ArrowRight size={11} />
                  </Link>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {experiments.map((exp) => {
                    const latest = exp.checkIns[0];
                    const chart = buildChart(exp.checkIns);

                    const ascCheckIns = [...exp.checkIns].reverse();

                    const growth =
                      ascCheckIns.length >= 2
                        ? ascCheckIns[ascCheckIns.length - 1]
                            .followerCount -
                          ascCheckIns[0].followerCount
                        : null;

                    return (
                      <div
                        key={exp.id}
                        className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d0f15]"
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="mb-2 flex items-center gap-2">
                                <span
                                  className={`rounded-full border px-2 py-1 text-[9px] font-medium capitalize ${getStatusClasses(
                                    exp.status
                                  )}`}
                                >
                                  {exp.status}
                                </span>

                                {growth !== null && (
                                  <span
                                    className={`text-[9px] font-medium ${
                                      growth >= 0
                                        ? "text-emerald-400"
                                        : "text-rose-400"
                                    }`}
                                  >
                                    {growth >= 0 ? "+" : ""}
                                    {growth.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              <h3
                                className="truncate text-base font-semibold tracking-[-0.015em] text-white"
                                style={{ fontFamily: "Fraunces, serif" }}
                              >
                                {exp.strategy.title}
                              </h3>

                              <p className="mt-1 text-[10px] text-slate-600">
                                {exp.checkIns.length} check-in
                                {exp.checkIns.length === 1 ? "" : "s"} logged
                                {latest
                                  ? ` · ${latest.followerCount.toLocaleString()} followers`
                                  : ""}
                              </p>
                            </div>

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.025]">
                              <FlaskConical
                                size={14}
                                className="text-slate-600"
                              />
                            </div>
                          </div>

                          {chart ? (
                            <div className="mt-5 h-[100px]">
                              <svg
                                viewBox="0 0 500 100"
                                width="100%"
                                height="100%"
                                preserveAspectRatio="none"
                                style={{ overflow: "visible" }}
                              >
                                <defs>
                                  <linearGradient
                                    id={`area-${exp.id}`}
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
                                  fill={`url(#area-${exp.id})`}
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
                            <div className="mt-5 flex h-[100px] items-center justify-center rounded-lg border border-dashed border-white/[0.05] bg-white/[0.01]">
                              <div className="text-center">
                                <Clock3
                                  size={15}
                                  className="mx-auto text-slate-700"
                                />
                                <p className="mt-2 text-[10px] text-slate-600">
                                  Log another check-in to see your trend.
                                </p>
                              </div>
                            </div>
                          )}

                          {exp.status === "active" ? (
                            <form
                              action={logCheckIn}
                              className="mt-4 flex gap-2"
                            >
                              <input
                                type="hidden"
                                name="experimentId"
                                value={exp.id}
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
                          ) : exp.status === "paused" ? (
                            <div className="mt-4 rounded-lg border border-amber-400/[0.08] bg-amber-400/[0.025] px-3 py-2.5 text-[10px] text-amber-400/70">
                              This experiment is paused. Resume it to record
                              another result.
                            </div>
                          ) : null}

                          <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">
                            <div className="flex gap-2">
                              {exp.status !== "completed" && (
                                <>
                                  <form action={updateExperimentStatus}>
                                    <input
                                      type="hidden"
                                      name="experimentId"
                                      value={exp.id}
                                    />

                                    <input
                                      type="hidden"
                                      name="status"
                                      value={
                                        exp.status === "active"
                                          ? "paused"
                                          : "active"
                                      }
                                    />

                                    <button
                                      type="submit"
                                      className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] px-2.5 py-1.5 text-[9px] font-medium text-slate-600 transition-colors hover:border-white/[0.12] hover:text-slate-300"
                                    >
                                      {exp.status === "active" ? (
                                        <Pause size={10} />
                                      ) : (
                                        <Play size={10} />
                                      )}

                                      {exp.status === "active"
                                        ? "Pause"
                                        : "Resume"}
                                    </button>
                                  </form>

                                  <form action={updateExperimentStatus}>
                                    <input
                                      type="hidden"
                                      name="experimentId"
                                      value={exp.id}
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
                              {exp.checkIns.length > 0
                                ? `Last measured ${new Date(
                                    exp.checkIns[0].loggedAt
                                  ).toLocaleDateString()}`
                                : "Awaiting first measurement"}
                            </span>
                          </div>
                        </div>

                        {exp.checkIns.length > 0 && (
                          <div className="border-t border-white/[0.05] bg-white/[0.008]">
                            {exp.checkIns.slice(0, 3).map((checkIn) => (
                              <div
                                key={checkIn.id}
                                className="flex items-center justify-between border-b border-white/[0.035] px-5 py-2.5 last:border-b-0"
                              >
                                <span className="text-[9px] text-slate-600">
                                  {new Date(
                                    checkIn.loggedAt
                                  ).toLocaleDateString()}
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
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </AppLayout>
  );
}