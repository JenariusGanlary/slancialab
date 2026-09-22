import Link from "next/link";
import {
  ArrowRight,
  Check,
  FlaskConical,
  Sparkles,
  Target,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { findBestStrategyForResearch } from "@/lib/strategy-matching";
import { startTracking } from "./actions";
import { AppLayout } from "../components/AppLayout";

type StrategiesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function getSignalClasses(signal: string | undefined) {
  switch (signal) {
    case "repeated":
      return {
        badge:
          "border-violet-400/15 bg-violet-400/[0.06] text-violet-300",
        dot: "bg-violet-400",
      };

    case "emerging":
      return {
        badge:
          "border-amber-400/15 bg-amber-400/[0.06] text-amber-300",
        dot: "bg-amber-400",
      };

    case "potential":
      return {
        badge:
          "border-sky-400/15 bg-sky-400/[0.06] text-sky-300",
        dot: "bg-sky-400",
      };

    default:
      return {
        badge:
          "border-white/[0.07] bg-white/[0.02] text-slate-400",
        dot: "bg-slate-500",
      };
  }
}

function ExperimentDefinitionFields({
  prefix,
  hypothesisTemplate,
  protocolTemplate,
  recommendedDurationDays,
  recommendedPostCount,
  primaryMetric,
  successThresholdPercent,
}: {
  prefix: string;
  hypothesisTemplate?: string | null;
  protocolTemplate?: string | null;
  recommendedDurationDays?: number | null;
  recommendedPostCount?: number | null;
  primaryMetric?: string | null;
  successThresholdPercent?: number | null;
}) {
  const validPrimaryMetrics = new Set([
    "views",
    "likes",
    "replies",
    "reposts",
    "engagement_rate",
    "follower_growth",
  ]);

  const resolvedPrimaryMetric =
    primaryMetric && validPrimaryMetrics.has(primaryMetric)
      ? primaryMetric
      : "views";

  return (
    <div className="mt-4 space-y-4 border-t border-white/[0.05] pt-4">
      <div>
        <label
          htmlFor={`${prefix}-hypothesis`}
          className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
        >
          Hypothesis
        </label>

        <textarea
          id={`${prefix}-hypothesis`}
          name="hypothesis"
          rows={3}
          defaultValue={hypothesisTemplate ?? ""}
          placeholder="I expect this strategy to improve..."
          className="w-full resize-none rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-xs leading-5 text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
        />
      </div>

      <div>
        <label
          htmlFor={`${prefix}-protocol`}
          className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
        >
          Experiment protocol
        </label>

        <textarea
          id={`${prefix}-protocol`}
          name="protocol"
          rows={3}
          defaultValue={protocolTemplate ?? ""}
          placeholder="How will you run this experiment?"
          className="w-full resize-none rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-xs leading-5 text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${prefix}-duration`}
            className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
          >
            Duration (days)
          </label>

          <input
            id={`${prefix}-duration`}
            name="durationDays"
            type="number"
            min="1"
            defaultValue={
              recommendedDurationDays ?? undefined
            }
            placeholder="14"
            className="w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-xs text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
          />
        </div>

        <div>
          <label
            htmlFor={`${prefix}-posts`}
            className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
          >
            Planned posts
          </label>

          <input
            id={`${prefix}-posts`}
            name="targetPostCount"
            type="number"
            min="1"
            defaultValue={
              recommendedPostCount ?? undefined
            }
            placeholder="6"
            className="w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-xs text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${prefix}-metric`}
            className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
          >
            Primary metric
          </label>

          <select
            id={`${prefix}-metric`}
            name="primaryMetric"
            defaultValue={resolvedPrimaryMetric}
            className="w-full rounded-lg border border-white/[0.07] bg-[#0d0f15] px-3 py-2.5 text-xs text-slate-300 outline-none transition-colors focus:border-violet-400/30"
          >
            <option value="views">Views</option>
            <option value="likes">Likes</option>
            <option value="replies">Replies</option>
            <option value="reposts">Reposts</option>
            <option value="engagement_rate">Engagement rate</option>
            <option value="follower_growth">Follower growth</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={`${prefix}-threshold`}
            className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
          >
            Success threshold (%)
          </label>

          <input
            id={`${prefix}-threshold`}
            name="successThresholdPercent"
            type="number"
            min="0"
            max="100"
            defaultValue={
              successThresholdPercent ?? undefined
            }
            placeholder="25"
            className="w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-xs text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
          />
        </div>
      </div>

      <p className="text-[9px] leading-5 text-slate-700">
        Recommended values come from this strategy&apos;s experiment template.
        You can adjust them before starting the experiment.
      </p>
    </div>
  );
}

function ResearchHiddenFields({
  researchCreatorId,
  researchDimension,
  researchPattern,
  researchSignal,
  researchPostCount,
  researchMeasuredCount,
  researchEvidence,
}: {
  researchCreatorId?: string;
  researchDimension?: string;
  researchPattern?: string;
  researchSignal?: string;
  researchPostCount?: string;
  researchMeasuredCount?: string;
  researchEvidence?: string;
}) {
  return (
    <>
      {researchCreatorId && (
        <input
          type="hidden"
          name="researchCreatorId"
          value={researchCreatorId}
        />
      )}

      {researchDimension && (
        <input
          type="hidden"
          name="researchDimension"
          value={researchDimension}
        />
      )}

      {researchPattern && (
        <input
          type="hidden"
          name="researchPattern"
          value={researchPattern}
        />
      )}

      {researchSignal && (
        <input
          type="hidden"
          name="researchSignal"
          value={researchSignal}
        />
      )}

      {researchPostCount && (
        <input
          type="hidden"
          name="researchPostCount"
          value={researchPostCount}
        />
      )}

      {researchMeasuredCount && (
        <input
          type="hidden"
          name="researchMeasuredCount"
          value={researchMeasuredCount}
        />
      )}

      {researchEvidence && (
        <input
          type="hidden"
          name="researchEvidence"
          value={researchEvidence}
        />
      )}
    </>
  );
}

export default async function StrategiesPage({
  searchParams,
}: StrategiesPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};

  const researchEnabled =
    getSearchParam(resolvedSearchParams, "research") === "1";

  const researchCreatorId = getSearchParam(
    resolvedSearchParams,
    "researchCreatorId"
  );

  const researchPattern = getSearchParam(
    resolvedSearchParams,
    "researchPattern"
  );

  const researchSignal = getSearchParam(
    resolvedSearchParams,
    "researchSignal"
  );

  const researchPostCount = getSearchParam(
    resolvedSearchParams,
    "researchPostCount"
  );

  const researchMeasuredCount = getSearchParam(
    resolvedSearchParams,
    "researchMeasuredCount"
  );

  const researchEvidence = getSearchParam(
    resolvedSearchParams,
    "researchEvidence"
  );

  const researchDimension = getSearchParam(
    resolvedSearchParams,
    "researchDimension"
  );

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (!user || user.niche.length === 0 || !user.followerStage) {
    redirect("/onboarding");
  }

  const [
    profileStrategies,
    researchCandidateStrategies,
    activeExperiments,
    totalExperiments,
    researchCreator,
  ] = await Promise.all([
    prisma.strategy.findMany({
      where: {
        nicheTags: {
          hasSome: user.niche,
        },
        stageTags: {
          has: user.followerStage,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    researchEnabled && researchPattern
      ? prisma.strategy.findMany({
          where: {
            nicheTags: {
              hasSome: user.niche,
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        })
      : Promise.resolve([]),

    prisma.experiment.findMany({
      where: {
        userId: user.id,
        status: "active",
      },
      select: {
        strategyId: true,
      },
    }),

    prisma.experiment.count({
      where: {
        userId: user.id,
      },
    }),

    researchEnabled && researchCreatorId
      ? prisma.creator.findUnique({
          where: {
            id: researchCreatorId,
          },
          select: {
            name: true,
            handle: true,
          },
        })
      : Promise.resolve(null),
  ]);

  const trackedStrategyIds = new Set(
    activeExperiments.map((experiment) => experiment.strategyId)
  );

  const isFirstVisit = totalExperiments === 0;

  const hasResearchContext =
    researchEnabled &&
    Boolean(
      researchCreatorId &&
        researchPattern &&
        researchSignal &&
        researchPostCount &&
        researchMeasuredCount &&
        researchEvidence
    );

  const strategyCandidates = hasResearchContext
    ? researchCandidateStrategies
    : profileStrategies;

  const recommendedStrategy =
    hasResearchContext && researchPattern
      ? findBestStrategyForResearch(
          strategyCandidates.map((strategy) => ({
            id: strategy.id,
            title: strategy.title,
            description: strategy.description,
            nicheTags: strategy.nicheTags,
            stageTags: strategy.stageTags,
            hypothesisTemplate: strategy.hypothesisTemplate,
            protocolTemplate: strategy.protocolTemplate,
            recommendedDurationDays: strategy.recommendedDurationDays,
            recommendedPostCount: strategy.recommendedPostCount,
            primaryMetric: strategy.primaryMetric,
            successThresholdPercent: strategy.successThresholdPercent,
          })),
          {
            pattern: researchPattern,
            dimension: researchDimension,
          }
        )
      : null;

  const recommendedStrategyId =
    recommendedStrategy?.strategy.id ?? null;

  const otherStrategies = recommendedStrategyId
    ? profileStrategies.filter(
        (strategy) => strategy.id !== recommendedStrategyId
      )
    : profileStrategies;

  const signalClasses = getSignalClasses(researchSignal);

  return (
    <AppLayout>
      <main className="min-h-screen bg-[#090a0f] px-5 py-8 sm:px-7 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" />

              <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-600">
                Strategy library
              </span>
            </div>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1
                  className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  Find your next experiment.
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Choose a strategy that fits your audience, run it
                  consistently, and measure what happens.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <Target size={12} className="text-violet-400" />

                <span className="text-[10px] text-slate-500">
                  {user.followerStage}
                </span>
              </div>
            </div>
          </div>

          {/* Profile context */}
          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-[#0d0f15] p-4">
              <div className="mb-2 text-[9px] font-medium uppercase tracking-[0.14em] text-slate-600">
                Your niche
              </div>

              <div className="flex flex-wrap gap-1.5">
                {user.niche.map((niche) => (
                  <span
                    key={niche}
                    className="rounded-full border border-violet-400/10 bg-violet-400/[0.05] px-2.5 py-1 text-[10px] text-violet-300"
                  >
                    {niche}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#0d0f15] p-4">
              <div className="mb-2 text-[9px] font-medium uppercase tracking-[0.14em] text-slate-600">
                Follower stage
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-400/[0.06]">
                  <Target size={12} className="text-emerald-400" />
                </span>

                <span className="text-xs font-medium text-slate-300">
                  {user.followerStage}
                </span>
              </div>
            </div>
          </div>

          {/* Research context */}
          {researchEnabled && researchPattern && (
            <section className="relative mb-9 overflow-hidden rounded-2xl border border-violet-400/15 bg-violet-400/[0.025]">
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-violet-500/[0.07] blur-[80px]" />

              <div className="relative p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.07]">
                      <Sparkles size={17} className="text-violet-400" />
                    </div>

                    <div>
                      <div className="mb-1 text-[9px] font-medium uppercase tracking-[0.14em] text-violet-400/70">
                        Research finding
                      </div>

                      <h2
                        className="text-lg font-semibold tracking-[-0.02em] text-white"
                        style={{ fontFamily: "Fraunces, serif" }}
                      >
                        Test the {researchPattern} pattern.
                      </h2>

                      <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                        You arrived here from Creator Intelligence. Use this
                        finding as research context when choosing the strategy
                        you want to test on your own account.
                      </p>

                      {researchCreator && (
                        <p className="mt-2 text-[10px] text-slate-600">
                          Research source:{" "}
                          <span className="text-slate-400">
                            {researchCreator.name}
                          </span>{" "}
                          @{researchCreator.handle}
                        </p>
                      )}
                    </div>
                  </div>

                  {recommendedStrategy && (
                    <div className="flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5 text-[9px] font-medium">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${signalClasses.dot}`}
                      />

                      <span className={signalClasses.badge}>
                        {researchSignal ?? "research signal"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Research recommendation */}
          {recommendedStrategy && (
            <section className="relative mb-9 overflow-hidden rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.018]">
              <div className="relative p-5 sm:p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <Check
                        size={13}
                        className="text-emerald-400"
                      />

                      <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-emerald-400/70">
                        Research-backed recommendation
                      </span>
                    </div>

                    <h2
                      className="text-xl font-semibold tracking-[-0.025em] text-white"
                      style={{ fontFamily: "Fraunces, serif" }}
                    >
                      {recommendedStrategy.strategy.title}
                    </h2>

                    <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                      {recommendedStrategy.reason}
                    </p>

                    <p className="mt-3 max-w-2xl text-[10px] leading-5 text-slate-600">
                      The match is based on the observed research pattern. It
                      is a suggested test, not a claim that the strategy will
                      work for your audience.
                    </p>
                  </div>

                  {trackedStrategyIds.has(
                    recommendedStrategy.strategy.id
                  ) ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.05] px-5 py-3 text-[10px] font-semibold text-emerald-300 transition-all hover:bg-emerald-400/[0.08]"
                    >
                      View experiment
                      <ArrowRight size={12} />
                    </Link>
                  ) : (
                    <details className="shrink-0">
                      <summary className="flex cursor-pointer list-none items-center justify-center gap-2 rounded-lg bg-violet-500 px-5 py-3 text-[10px] font-semibold text-white transition-all hover:bg-violet-400">
                        Define experiment
                        <ArrowRight size={12} />
                      </summary>

                      <form
                        action={startTracking}
                        className="mt-3 rounded-xl border border-white/[0.06] bg-black/20 p-4"
                      >
                        <input
                          type="hidden"
                          name="strategyId"
                          value={recommendedStrategy.strategy.id}
                        />

                        <ResearchHiddenFields
                          researchCreatorId={researchCreatorId}
                          researchDimension={researchDimension}
                          researchPattern={researchPattern}
                          researchSignal={researchSignal}
                          researchPostCount={researchPostCount}
                          researchMeasuredCount={researchMeasuredCount}
                          researchEvidence={researchEvidence}
                        />

                        <ExperimentDefinitionFields
                          prefix="recommended"
                          hypothesisTemplate={
                            recommendedStrategy.strategy.hypothesisTemplate
                          }
                          protocolTemplate={
                            recommendedStrategy.strategy.protocolTemplate
                          }
                          recommendedDurationDays={
                            recommendedStrategy.strategy.recommendedDurationDays
                          }
                          recommendedPostCount={
                            recommendedStrategy.strategy.recommendedPostCount
                          }
                          primaryMetric={
                            recommendedStrategy.strategy.primaryMetric
                          }
                          successThresholdPercent={
                            recommendedStrategy.strategy.successThresholdPercent
                          }
                        />

                        <button
                          type="submit"
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-[10px] font-semibold text-white transition-all hover:bg-violet-400 active:scale-[0.99]"
                        >
                          Start this experiment
                          <ArrowRight size={12} />
                        </button>
                      </form>
                    </details>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* First visit */}
          {isFirstVisit && (
            <div className="relative mb-9 overflow-hidden rounded-2xl border border-violet-400/10 bg-violet-400/[0.025]">
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-violet-500/[0.07] blur-[80px]" />

              <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.07]">
                  <Sparkles
                    size={17}
                    className="text-violet-400"
                  />
                </div>

                <div className="flex-1">
                  <div className="mb-1 text-[9px] font-medium uppercase tracking-[0.14em] text-violet-400/70">
                    Your first experiment
                  </div>

                  <h2
                    className="text-lg font-semibold tracking-[-0.02em] text-white"
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    Pick one strategy. Run it. Learn from it.
                  </h2>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                    You don&apos;t need to test everything at once. Start
                    with one strategy, measure the results, and use what you
                    learn to decide what to test next.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section heading */}
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-600">
                {recommendedStrategy
                  ? "Other strategies"
                  : "Recommended for you"}
              </div>

              <h2
                className="mt-1 text-xl font-semibold tracking-[-0.025em] text-white"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                {recommendedStrategy
                  ? "More strategies to experiment with"
                  : "Strategies to experiment with"}
              </h2>
            </div>

            <div className="hidden text-[10px] text-slate-700 sm:block">
              {otherStrategies.length}{" "}
              {otherStrategies.length === 1
                ? "strategy"
                : "strategies"}{" "}
              available
            </div>
          </div>

          {/* Empty state */}
          {otherStrategies.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0d0f15] px-6 py-14 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <FlaskConical
                  size={18}
                  className="text-slate-600"
                />
              </div>

              <h2
                className="mt-5 text-xl font-semibold text-white"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                No other strategies yet.
              </h2>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-600">
                The research finding above already has the closest matching
                strategy from your current library.
              </p>

              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-5 py-2.5 text-[10px] font-medium text-slate-400 transition-all hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-white"
              >
                Back to overview
                <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {otherStrategies.map((strategy) => {
                const isTracking = trackedStrategyIds.has(
                  strategy.id
                );

                const tags = Array.from(
                  new Set([
                    ...strategy.nicheTags,
                    ...strategy.stageTags,
                  ])
                );

                return (
                  <article
                    key={strategy.id}
                    className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d0f15]"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            {isTracking && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1 text-[9px] font-medium text-emerald-400">
                                <Check size={9} />
                                Active
                              </span>
                            )}

                            <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-700">
                              Strategy
                            </span>
                          </div>

                          <h2
                            className="text-xl font-semibold tracking-[-0.025em] text-white"
                            style={{ fontFamily: "Fraunces, serif" }}
                          >
                            {strategy.title}
                          </h2>

                          <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
                            {strategy.description}
                          </p>
                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-400/10 bg-violet-400/[0.05]">
                          <FlaskConical
                            size={15}
                            className="text-violet-400"
                            strokeWidth={1.7}
                          />
                        </div>
                      </div>

                      {tags.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-1.5">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[9px] text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTA */}
                      <div className="mt-6 border-t border-white/[0.05] pt-4">
                        {isTracking ? (
                          <Link
                            href="/dashboard"
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.015] px-4 py-2.5 text-[10px] font-medium text-slate-400 transition-all hover:border-white/[0.12] hover:bg-white/[0.03] hover:text-white"
                          >
                            View experiment
                            <ArrowRight size={12} />
                          </Link>
                        ) : (
                          <details>
                            <summary className="flex cursor-pointer list-none items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-[10px] font-semibold text-white transition-all hover:bg-violet-400 active:scale-[0.99]">
                              Define experiment
                              <ArrowRight size={12} />
                            </summary>

                            <form
                              action={startTracking}
                              className="mt-3 rounded-xl border border-white/[0.06] bg-black/20 p-4"
                            >
                              <input
                                type="hidden"
                                name="strategyId"
                                value={strategy.id}
                              />

                              {hasResearchContext && (
                                <ResearchHiddenFields
                                  researchCreatorId={researchCreatorId}
                                  researchDimension={researchDimension}
                                  researchPattern={researchPattern}
                                  researchSignal={researchSignal}
                                  researchPostCount={researchPostCount}
                                  researchMeasuredCount={
                                    researchMeasuredCount
                                  }
                                  researchEvidence={researchEvidence}
                                />
                              )}

                              <ExperimentDefinitionFields
                                prefix={`strategy-${strategy.id}`}
                                hypothesisTemplate={strategy.hypothesisTemplate}
                                protocolTemplate={strategy.protocolTemplate}
                                recommendedDurationDays={
                                  strategy.recommendedDurationDays
                                }
                                recommendedPostCount={
                                  strategy.recommendedPostCount
                                }
                                primaryMetric={strategy.primaryMetric}
                                successThresholdPercent={
                                  strategy.successThresholdPercent
                                }
                              />

                              <button
                                type="submit"
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-[10px] font-semibold text-white transition-all hover:bg-violet-400 active:scale-[0.99]"
                              >
                                Start experiment
                                <ArrowRight size={12} />
                              </button>
                            </form>
                          </details>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Research → Strategy */}
          <section className="mt-10 rounded-2xl border border-violet-400/[0.08] bg-violet-400/[0.025] p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-400/15 bg-violet-400/[0.07]">
                <Sparkles
                  size={15}
                  className="text-violet-400"
                />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white">
                  Turn research into an experiment
                </h3>

                <p className="mt-1 max-w-xl text-[10px] leading-5 text-slate-600">
                  These patterns are observations, not guarantees. The next
                  step is to turn a pattern into a strategy and test whether it
                  works for your own audience.
                </p>

                <Link
                  href="/strategies"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5 text-[10px] font-medium text-slate-400 transition-all hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white"
                >
                  Explore strategies
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <p className="mt-8 text-[9px] leading-5 text-slate-700">
            Creator research captures observable content patterns. A pattern
            appearing in a creator&apos;s posts does not establish that it
            caused their performance or that it will produce the same result
            for another creator.
          </p>
        </div>
      </main>
    </AppLayout>
  );
}