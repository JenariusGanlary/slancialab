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

  const researchLift = getSearchParam(
    resolvedSearchParams,
    "researchLift"
  );

  const researchDimension = getSearchParam(
    resolvedSearchParams,
    "researchDimension"
  );

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user || user.niche.length === 0 || !user.followerStage) {
    redirect("/onboarding");
  }

  const [strategies, activeExperiments, totalExperiments, researchCreator] =
    await Promise.all([
      prisma.strategy.findMany({
        where: {
          nicheTags: { hasSome: user.niche },
          stageTags: { has: user.followerStage },
        },
        orderBy: { createdAt: "asc" },
      }),

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
            where: { id: researchCreatorId },
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
                  Matched to your profile
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
                    </div>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-2.5 py-1.5 text-[9px] font-medium capitalize text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {researchSignal ?? "research"} signal
                  </span>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                    <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                      Pattern
                    </div>

                    <div className="mt-1 text-xs font-medium text-slate-300">
                      {researchPattern}
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                    <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                      Evidence
                    </div>

                    <div className="mt-1 text-xs font-medium text-slate-300">
                      {researchMeasuredCount ?? "—"} measured /{" "}
                      {researchPostCount ?? "—"} posts
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                    <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                      Signal
                    </div>

                    <div className="mt-1 text-xs font-medium capitalize text-slate-300">
                      {researchSignal ?? "—"}
                      {researchLift ? ` · ${researchLift}% lift` : ""}
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                    <div className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                      Source
                    </div>

                    <div className="mt-1 truncate text-xs font-medium text-slate-300">
                      {researchCreator
                        ? `${researchCreator.name} (@${researchCreator.handle})`
                        : "Creator research"}
                    </div>
                  </div>
                </div>

                {researchEvidence && (
                  <div className="mt-3 text-[10px] text-slate-600">
                    {researchEvidence}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* First visit */}
          {isFirstVisit && (
            <div className="relative mb-9 overflow-hidden rounded-2xl border border-violet-400/10 bg-violet-400/[0.025]">
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-violet-500/[0.07] blur-[80px]" />

              <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.07]">
                  <Sparkles size={17} className="text-violet-400" />
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
                    You don&apos;t need to test everything at once. Start with
                    one strategy, measure the results, and use what you learn to
                    decide what to test next.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section heading */}
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-600">
                Recommended for you
              </div>

              <h2
                className="mt-1 text-xl font-semibold tracking-[-0.025em] text-white"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Strategies to experiment with
              </h2>
            </div>

            <div className="hidden text-[10px] text-slate-700 sm:block">
              {strategies.length}{" "}
              {strategies.length === 1 ? "strategy" : "strategies"} available
            </div>
          </div>

          {/* Empty state */}
          {strategies.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0d0f15] px-6 py-14 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <FlaskConical size={18} className="text-slate-600" />
              </div>

              <h2
                className="mt-5 text-xl font-semibold text-white"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                No matching strategies yet.
              </h2>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-600">
                We don&apos;t have strategies matching your current niche and
                follower stage yet. Check back as the library grows.
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
              {strategies.map((strategy) => {
                const isTracking = trackedStrategyIds.has(strategy.id);

                const tags = Array.from(
                  new Set([...strategy.nicheTags, ...strategy.stageTags])
                );

                return (
                  <article
                    key={strategy.id}
                    className={`group relative flex flex-col overflow-hidden rounded-xl border bg-[#0d0f15] transition-all ${
                      isTracking
                        ? "border-emerald-400/10"
                        : "border-white/[0.06] hover:border-violet-400/15"
                    }`}
                  >
                    {/* Top accent */}
                    <div
                      className={`absolute left-0 top-0 h-px w-full ${
                        isTracking
                          ? "bg-gradient-to-r from-emerald-400/50 via-emerald-400/10 to-transparent"
                          : "bg-gradient-to-r from-violet-400/40 via-violet-400/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                      }`}
                    />

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      {/* Card header */}
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-400/10 bg-violet-400/[0.05]">
                          <FlaskConical
                            size={15}
                            className="text-violet-400"
                            strokeWidth={1.7}
                          />
                        </div>

                        {isTracking ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-2.5 py-1.5 text-[9px] font-medium text-emerald-400">
                            <Check size={10} />
                            Currently tracking
                          </span>
                        ) : (
                          <span className="rounded-full border border-white/[0.05] bg-white/[0.015] px-2.5 py-1.5 text-[9px] text-slate-700">
                            Experiment
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        className="text-xl font-semibold tracking-[-0.025em] text-white"
                        style={{ fontFamily: "Fraunces, serif" }}
                      >
                        {strategy.title}
                      </h3>

                      {/* Description */}
                      <p className="mt-2 flex-1 text-xs leading-5 text-slate-500">
                        {strategy.description}
                      </p>

                      {/* Tags */}
                      <div className="mt-5 flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/[0.05] bg-white/[0.015] px-2.5 py-1 text-[9px] text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

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
                          <form action={startTracking}>
                            <input
                              type="hidden"
                              name="strategyId"
                              value={strategy.id}
                            />

                            {hasResearchContext && (
                              <>
                                <input
                                  type="hidden"
                                  name="researchCreatorId"
                                  value={researchCreatorId ?? ""}
                                />

                                <input
                                  type="hidden"
                                  name="researchPattern"
                                  value={researchPattern ?? ""}
                                />

                                <input
                                  type="hidden"
                                  name="researchDimension"
                                  value={researchDimension ?? ""}
                                />

                                <input
                                  type="hidden"
                                  name="researchSignal"
                                  value={researchSignal ?? ""}
                                />

                                <input
                                  type="hidden"
                                  name="researchPostCount"
                                  value={researchPostCount ?? ""}
                                />

                                <input
                                  type="hidden"
                                  name="researchMeasuredCount"
                                  value={researchMeasuredCount ?? ""}
                                />

                                <input
                                  type="hidden"
                                  name="researchEvidence"
                                  value={researchEvidence ?? ""}
                                />

                                <input
                                  type="hidden"
                                  name="researchLift"
                                  value={researchLift ?? ""}
                                />
                              </>
                            )}

                            <button
                              type="submit"
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-[10px] font-semibold text-white transition-all hover:bg-violet-400 active:scale-[0.99]"
                            >
                              Start experiment
                              <ArrowRight size={12} />
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}