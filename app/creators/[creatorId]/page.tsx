import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  FileText,
  Hash,
  Sparkles,
  Users,
  Plus,
  X,
  BarChart3,
  Pencil,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  ContentFormat,
  ContentStyle,
  ContentStructure,
  CtaType,
  HookType,
  Personalization,
  SentenceType,
  Stance,
  Tone,
} from "@prisma/client";
import { AppLayout } from "../../components/AppLayout";
import { aggregateCreatorPostPatterns } from "@/lib/creator-intelligence";

type CreatorPageProps = {
  params: Promise<{
    creatorId: string;
  }>;
};

const hookTypeOptions = [
  { value: "CONTRARIAN", label: "Contrarian" },
  { value: "CURIOSITY", label: "Curiosity" },
  { value: "QUESTION", label: "Question" },
  { value: "STATEMENT", label: "Statement" },
  { value: "STORY", label: "Story" },
  { value: "PROBLEM", label: "Problem" },
  { value: "BENEFIT", label: "Benefit" },
  { value: "OTHER", label: "Other" },
];

const structureOptions = [
  { value: "CLAIM_EXPLANATION", label: "Claim → Explanation" },
  { value: "HOOK_BODY_CTA", label: "Hook → Body → CTA" },
  { value: "PROBLEM_SOLUTION", label: "Problem → Solution" },
  { value: "STORY_LESSON", label: "Story → Lesson" },
  { value: "LIST", label: "List" },
  { value: "FRAMEWORK", label: "Framework" },
  { value: "QUESTION_ANSWER", label: "Question → Answer" },
  { value: "OTHER", label: "Other" },
];

const toneOptions = [
  { value: "NEUTRAL", label: "Neutral" },
  { value: "EDUCATIONAL", label: "Educational" },
  { value: "PROVOCATIVE", label: "Provocative" },
  { value: "CONVERSATIONAL", label: "Conversational" },
  { value: "INSPIRATIONAL", label: "Inspirational" },
  { value: "HUMOROUS", label: "Humorous" },
  { value: "AUTHORITATIVE", label: "Authoritative" },
  { value: "PERSONAL", label: "Personal" },
  { value: "OTHER", label: "Other" },
];

const formatOptions = [
  { value: "OPINION", label: "Opinion" },
  { value: "EDUCATIONAL", label: "Educational" },
  { value: "STORY", label: "Story" },
  { value: "FRAMEWORK", label: "Framework" },
  { value: "LIST", label: "List" },
  { value: "QUESTION", label: "Question" },
  { value: "OBSERVATION", label: "Observation" },
  { value: "THREAD", label: "Thread" },
  { value: "OTHER", label: "Other" },
];

const ctaOptions = [
  { value: "NONE", label: "None" },
  { value: "QUESTION", label: "Question" },
  { value: "FOLLOW", label: "Follow" },
  { value: "REPLY", label: "Reply" },
  { value: "CLICK", label: "Click" },
  { value: "SHARE", label: "Share" },
  { value: "SIGNUP", label: "Sign up" },
  { value: "OTHER", label: "Other" },
];

const contentStyleOptions = [
  { value: "STORY", label: "Story" },
  { value: "EDUCATIONAL", label: "Educational" },
  { value: "OPINION", label: "Opinion" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "PERSONAL", label: "Personal" },
  { value: "FRAMEWORK", label: "Framework" },
  { value: "OBSERVATIONAL", label: "Observational" },
  { value: "OTHER", label: "Other" },
];

const stanceOptions = [
  { value: "CONTRARIAN", label: "Contrarian" },
  { value: "CONVENTIONAL", label: "Conventional" },
  { value: "NEUTRAL", label: "Neutral" },
];

const sentenceTypeOptions = [
  { value: "QUESTION", label: "Question" },
  { value: "STATEMENT", label: "Statement" },
];

const personalizationOptions = [
  { value: "PERSONAL", label: "Personal" },
  { value: "GENERIC", label: "Generic" },
];

function optionalInt(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();

  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function optionalDate(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();

  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function optionalEnum<T extends string>(
  formData: FormData,
  name: string,
  allowedValues: readonly T[]
): T | null {
  const value = String(formData.get(name) ?? "").trim();

  if (!value) {
    return null;
  }

  return allowedValues.includes(value as T) ? (value as T) : null;
}

function formatEnumLabel(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDateTimeLocal(value: Date | null | undefined) {
  if (!value) {
    return "";
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function buildStrategyResearchHref({
  creatorId,
  creatorName,
  dimension,
  pattern,
}: {
  creatorId: string;
  creatorName: string;
  dimension: string;
  pattern: {
    value: string;
    signalLevel: string;
    medianLiftPercent: number | null;
    postCount: number;
    postsWithViews: number;
    evidenceLabel: string;
  };
}) {
  const params = new URLSearchParams({
    research: "1",
    researchCreatorId: creatorId,
    researchCreatorName: creatorName,
    researchDimension: dimension,
    researchPattern: pattern.value,
    researchSignal: pattern.signalLevel,
    researchPostCount: String(pattern.postCount),
    researchMeasuredCount: String(pattern.postsWithViews),
    researchEvidence: pattern.evidenceLabel,
  });

  if (pattern.medianLiftPercent !== null) {
    params.set("researchLift", String(pattern.medianLiftPercent));
  }

  return `/strategies?${params.toString()}`;
}

export default async function CreatorPage({ params }: CreatorPageProps) {
  const { creatorId } = await params;

  const creator = await prisma.creator.findUnique({
    where: {
      id: creatorId,
    },
    include: {
      posts: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!creator) {
    notFound();
  }

  async function addPost(formData: FormData) {
    "use server";

    const postUrl = String(formData.get("postUrl") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const patternTag = String(formData.get("patternTag") ?? "").trim();
    const observation = String(formData.get("observation") ?? "").trim();
    const researchNotes = String(formData.get("researchNotes") ?? "").trim();

    const hookType = optionalEnum(
      formData,
      "hookType",
      Object.values(HookType)
    );

    const structure = optionalEnum(
      formData,
      "structure",
      Object.values(ContentStructure)
    );

    const tone = optionalEnum(formData, "tone", Object.values(Tone));

    const format = optionalEnum(
      formData,
      "format",
      Object.values(ContentFormat)
    );

    const ctaType = optionalEnum(
      formData,
      "ctaType",
      Object.values(CtaType)
    );

    const contentStyle = optionalEnum(
      formData,
      "contentStyle",
      Object.values(ContentStyle)
    );

    const stance = optionalEnum(
      formData,
      "stance",
      Object.values(Stance)
    );

    const sentenceType = optionalEnum(
      formData,
      "sentenceType",
      Object.values(SentenceType)
    );

    const personalization = optionalEnum(
      formData,
      "personalization",
      Object.values(Personalization)
    );

    const contentLength = optionalInt(formData, "contentLength");
    const views = optionalInt(formData, "views");
    const likes = optionalInt(formData, "likes");
    const replies = optionalInt(formData, "replies");
    const reposts = optionalInt(formData, "reposts");
    const publishedAt = optionalDate(formData, "publishedAt");

    if (!content) {
      return;
    }

    await prisma.creatorPost.create({
      data: {
        creatorId,
        postUrl: postUrl || null,
        content,
        patternTag: patternTag || null,
        observation: observation || null,
        researchNotes: researchNotes || null,
        publishedAt,
        views,
        likes,
        replies,
        reposts,
        hookType,
        structure,
        topic: String(formData.get("topic") ?? "").trim() || null,
        tone,
        format,
        ctaType,
        contentLength,
        contentStyle,
        stance,
        sentenceType,
        personalization,
      },
    });

    redirect(`/creators/${creatorId}`);
  }

  async function updatePost(formData: FormData) {
    "use server";

    const postId = String(formData.get("postId") ?? "").trim();

    if (!postId) {
      return;
    }

    const existingPost = await prisma.creatorPost.findFirst({
      where: {
        id: postId,
        creatorId,
      },
    });

    if (!existingPost) {
      return;
    }

    const postUrl = String(formData.get("postUrl") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const patternTag = String(formData.get("patternTag") ?? "").trim();
    const observation = String(formData.get("observation") ?? "").trim();
    const researchNotes = String(formData.get("researchNotes") ?? "").trim();

    const hookType = optionalEnum(
      formData,
      "hookType",
      Object.values(HookType)
    );

    const structure = optionalEnum(
      formData,
      "structure",
      Object.values(ContentStructure)
    );

    const tone = optionalEnum(formData, "tone", Object.values(Tone));

    const format = optionalEnum(
      formData,
      "format",
      Object.values(ContentFormat)
    );

    const ctaType = optionalEnum(
      formData,
      "ctaType",
      Object.values(CtaType)
    );

    const contentStyle = optionalEnum(
      formData,
      "contentStyle",
      Object.values(ContentStyle)
    );

    const stance = optionalEnum(
      formData,
      "stance",
      Object.values(Stance)
    );

    const sentenceType = optionalEnum(
      formData,
      "sentenceType",
      Object.values(SentenceType)
    );

    const personalization = optionalEnum(
      formData,
      "personalization",
      Object.values(Personalization)
    );

    const contentLength = optionalInt(formData, "contentLength");
    const views = optionalInt(formData, "views");
    const likes = optionalInt(formData, "likes");
    const replies = optionalInt(formData, "replies");
    const reposts = optionalInt(formData, "reposts");
    const publishedAt = optionalDate(formData, "publishedAt");

    if (!content) {
      return;
    }

    await prisma.creatorPost.update({
      where: {
        id: postId,
      },
      data: {
        postUrl: postUrl || null,
        content,
        patternTag: patternTag || null,
        observation: observation || null,
        researchNotes: researchNotes || null,
        publishedAt,
        views,
        likes,
        replies,
        reposts,
        hookType,
        structure,
        topic: String(formData.get("topic") ?? "").trim() || null,
        tone,
        format,
        ctaType,
        contentLength,
        contentStyle,
        stance,
        sentenceType,
        personalization,
      },
    });

    redirect(`/creators/${creatorId}`);
  }

  const patterns = Array.from(
    new Set(
      creator.posts
        .map((post) => post.patternTag)
        .filter(Boolean)
    )
  );

  const initials = creator.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const xUrl = `https://x.com/${creator.handle.replace(/^@/, "")}`;

  const totalViews = creator.posts.reduce(
    (sum, post) => sum + (post.views ?? 0),
    0
  );

  const postsWithViews = creator.posts.filter(
    (post) => post.views !== null
  );

  const averageViews =
    postsWithViews.length > 0
      ? Math.round(totalViews / postsWithViews.length)
      : null;

  const patternIntelligence = aggregateCreatorPostPatterns(
    creator.posts.map((post) => ({
      id: post.id,
      creatorId: post.creatorId,
      views: post.views,
      hookType: post.hookType,
      structure: post.structure,
      topic: post.topic,
      tone: post.tone,
      format: post.format,
      ctaType: post.ctaType,
      contentStyle: post.contentStyle,
      stance: post.stance,
      sentenceType: post.sentenceType,
      personalization: post.personalization,
    }))
  );

  return (
    <AppLayout>
      <main className="min-h-screen">
        <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
          {/* Back */}
          <Link
            href="/creators"
            className="mb-8 inline-flex items-center gap-2 text-[10px] font-medium text-slate-600 transition-colors hover:text-slate-300"
          >
            <ArrowLeft size={13} />
            Back to creators
          </Link>

          {/* Creator header */}
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 md:p-7">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-400/[0.07] text-sm font-semibold text-violet-300">
                  {initials}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1
                      className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl"
                      style={{ fontFamily: "Fraunces, serif" }}
                    >
                      {creator.name}
                    </h1>

                    <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[9px] font-medium text-slate-500">
                      {creator.niche}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-600">
                    @{creator.handle.replace(/^@/, "")}
                  </p>

                  {creator.notes && (
                    <p className="mt-4 max-w-2xl text-xs leading-6 text-slate-500">
                      {creator.notes}
                    </p>
                  )}
                </div>
              </div>

              <a
                href={xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5 text-[10px] font-medium text-slate-400 transition-all hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white"
              >
                View on X
                <ArrowUpRight size={12} />
              </a>
            </div>
          </section>

          {/* Research summary */}
          <section className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
              <div className="flex items-center gap-2">
                <FileText size={13} className="text-violet-400" />

                <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-700">
                  Posts studied
                </span>
              </div>

              <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                {creator.posts.length}
              </div>

              <p className="mt-1 text-[10px] text-slate-600">
                Posts captured in research
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
              <div className="flex items-center gap-2">
                <Hash size={13} className="text-emerald-400" />

                <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-700">
                  Patterns
                </span>
              </div>

              <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                {patterns.length}
              </div>

              <p className="mt-1 text-[10px] text-slate-600">
                Distinct patterns identified
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={13} className="text-sky-400" />

                <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-700">
                  Avg. views
                </span>
              </div>

              <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                {averageViews !== null
                  ? averageViews.toLocaleString("en-IN")
                  : "—"}
              </div>

              <p className="mt-1 text-[10px] text-slate-600">
                Across posts with view data
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
              <div className="flex items-center gap-2">
                <Users size={13} className="text-violet-400" />

                <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-700">
                  Research source
                </span>
              </div>

              <div className="mt-3 text-sm font-semibold text-white">
                Creator intelligence
              </div>

              <p className="mt-1 text-[10px] text-slate-600">
                Used to inform future experiments
              </p>
            </div>
          </section>

          {/* Patterns */}
          <section className="mt-10">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-400" />

                <h2 className="text-sm font-semibold text-white">
                  Patterns observed
                </h2>
              </div>

              <p className="mt-1 text-[10px] text-slate-600">
                Repeated or notable patterns captured while studying this
                creator.
              </p>
            </div>

            {patterns.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.07] bg-white/[0.01] px-5 py-8 text-center">
                <p className="text-xs text-slate-600">
                  No patterns have been recorded yet.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {patterns.map((pattern) => (
                  <div
                    key={pattern}
                    className="rounded-lg border border-emerald-400/[0.08] bg-emerald-400/[0.04] px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Hash size={11} className="text-emerald-400/70" />

                      <span className="text-[10px] font-medium text-emerald-300/80">
                        {pattern}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pattern intelligence */}
          <section className="mt-10">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-sky-400" />

                <h2 className="text-sm font-semibold text-white">
                  Pattern intelligence
                </h2>
              </div>

              <p className="mt-1 max-w-2xl text-[10px] leading-5 text-slate-600">
                Structured patterns aggregated from the posts you have studied.
                Performance is descriptive only and does not establish causation.
              </p>
            </div>

            {patternIntelligence.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.07] bg-white/[0.01] px-5 py-8 text-center">
                <p className="text-xs text-slate-600">
                  Classify more studied posts to build pattern intelligence.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {patternIntelligence.map((dimension) => (
                  <div
                    key={dimension.key}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-[11px] font-semibold text-slate-300">
                          {dimension.label}
                        </h3>

                        <p className="mt-1 text-[9px] text-slate-700">
                          Grouped by structured analysis
                        </p>
                      </div>

                      <span className="text-[9px] text-slate-700">
                        {dimension.patterns.length}{" "}
                        {dimension.patterns.length === 1
                          ? "pattern"
                          : "patterns"}
                      </span>
                    </div>

                    <div className="mt-3 overflow-x-auto">
                      <div className="min-w-[620px]">
                        <div className="grid grid-cols-[1.4fr_0.45fr_0.65fr_0.8fr_0.8fr_0.85fr_1.25fr] gap-3 border-b border-white/[0.05] px-3 pb-2">
                          <span className="text-[8px] font-medium uppercase tracking-[0.1em] text-slate-700">
                            Pattern
                          </span>

                          <span className="text-[8px] font-medium uppercase tracking-[0.1em] text-slate-700">
                            Posts
                          </span>

                          <span className="text-[8px] font-medium uppercase tracking-[0.1em] text-slate-700">
                            Measured
                          </span>

                          <span className="text-[8px] font-medium uppercase tracking-[0.1em] text-slate-700">
                            Avg. views
                          </span>

                          <span className="text-[8px] font-medium uppercase tracking-[0.1em] text-slate-700">
                            Median
                          </span>

                          <span className="text-[8px] font-medium uppercase tracking-[0.1em] text-slate-700">
                            Lift
                          </span>

                          <span className="text-[8px] font-medium uppercase tracking-[0.1em] text-slate-700">
                            Signal
                          </span>
                        </div>

                        <div className="divide-y divide-white/[0.04]">
                          {dimension.patterns.map((pattern) => (
                            <div
                              key={`${dimension.key}-${pattern.value}`}
                              className="grid grid-cols-[1.4fr_0.45fr_0.65fr_0.8fr_0.8fr_0.85fr_1.25fr] items-center gap-3 px-3 py-3"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-[10px] font-medium text-slate-300">
                                  {pattern.value}
                                </p>

                                <p className="mt-1 text-[8px] text-slate-700">
                                  {pattern.sourcePostIds.length} source{" "}
                                  {pattern.sourcePostIds.length === 1
                                    ? "post"
                                    : "posts"}
                                </p>
                              </div>

                              <span className="text-[10px] text-slate-400">
                                {pattern.postCount}
                              </span>

                              <div className="min-w-0">
                                <span className="text-[10px] text-slate-400">
                                  {pattern.postsWithViews}
                                </span>

                                <p className="mt-1 text-[8px] text-slate-700">
                                  {pattern.performanceCoverage}% coverage
                                </p>
                              </div>

                              <span className="text-[10px] font-medium text-slate-300">
                                {pattern.averageViews !== null
                                  ? pattern.averageViews.toLocaleString("en-IN")
                                  : "—"}
                              </span>

                              <div className="min-w-0">
                                <span className="text-[10px] font-medium text-slate-300">
                                  {pattern.medianViews !== null
                                    ? pattern.medianViews.toLocaleString("en-IN")
                                    : "—"}
                                </span>

                                {pattern.baselineMedianViews !== null && (
                                  <p className="mt-1 text-[8px] text-slate-700">
                                    Baseline {pattern.baselineMedianViews.toLocaleString("en-IN")}
                                  </p>
                                )}
                              </div>

                              <div className="min-w-0">
                                {pattern.medianLiftPercent !== null ? (
                                  <span
                                    className={`text-[10px] font-semibold ${
                                      pattern.medianLiftPercent > 0
                                        ? "text-emerald-300"
                                        : pattern.medianLiftPercent < 0
                                          ? "text-rose-300"
                                          : "text-slate-500"
                                    }`}
                                  >
                                    {pattern.medianLiftPercent > 0 ? "+" : ""}
                                    {pattern.medianLiftPercent}%
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-700">
                                    —
                                  </span>
                                )}

                                <p className="mt-1 text-[8px] text-slate-700">
                                  vs baseline
                                </p>
                              </div>

                              <div className="min-w-0">
                                <span
                                  className={`inline-flex max-w-full rounded-md border px-2 py-1 text-[8px] font-medium ${
                                    pattern.signalLevel === "repeated"
                                      ? "border-emerald-400/10 bg-emerald-400/[0.05] text-emerald-300/80"
                                      : pattern.signalLevel === "emerging"
                                        ? "border-sky-400/10 bg-sky-400/[0.05] text-sky-300/80"
                                        : pattern.signalLevel === "potential"
                                          ? "border-amber-400/10 bg-amber-400/[0.05] text-amber-300/80"
                                          : "border-white/[0.06] bg-white/[0.02] text-slate-600"
                                  }`}
                                  title={pattern.signalLabel}
                                >
                                  {pattern.signalLevel === "repeated"
                                    ? "Repeated"
                                    : pattern.signalLevel === "emerging"
                                      ? "Emerging"
                                      : pattern.signalLevel === "potential"
                                        ? "Potential"
                                        : pattern.signalLevel === "none"
                                          ? "No signal"
                                          : "Insufficient"}
                                </span>

                                <p className="mt-1 truncate text-[8px] text-slate-700">
                                  {pattern.evidenceLabel}
                                </p>

                                {pattern.signalLevel !== "none" &&
                                  pattern.signalLevel !== "insufficient" && (
                                    <Link
                                      href={buildStrategyResearchHref({
                                        creatorId: creator.id,
                                        creatorName: creator.name,
                                        dimension: dimension.label,
                                        pattern,
                                      })}
                                      className="mt-2 inline-flex items-center gap-1 text-[8px] font-medium text-violet-400/80 transition-colors hover:text-violet-300"
                                    >
                                      Test this pattern
                                      <ArrowUpRight size={9} />
                                    </Link>
                                  )}
                              </div>

                              <details className="col-span-7 mt-1 rounded-lg border border-white/[0.05] bg-white/[0.01]">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5">
                                  <span className="text-[8px] font-medium uppercase tracking-[0.1em] text-slate-600">
                                    View source posts
                                  </span>
                                  <span className="text-[8px] text-slate-700">
                                    {pattern.sourcePostIds.length}{" "}
                                    {pattern.sourcePostIds.length === 1
                                      ? "post"
                                      : "posts"}
                                  </span>
                                </summary>

                                <div className="space-y-2 border-t border-white/[0.04] px-3 py-3">
                                  {pattern.sourcePostIds.map((sourcePostId) => {
                                    const sourcePost = creator.posts.find(
                                      (post) => post.id === sourcePostId
                                    );

                                    if (!sourcePost) {
                                      return null;
                                    }

                                    return (
                                      <div
                                        key={sourcePost.id}
                                        className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-3"
                                      >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                          <div className="min-w-0">
                                            <p className="text-[10px] leading-5 text-slate-400">
                                              {sourcePost.content}
                                            </p>

                                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[8px] text-slate-700">
                                              <span>
                                                Views {sourcePost.views !== null
                                                  ? sourcePost.views.toLocaleString("en-IN")
                                                  : "—"}
                                              </span>
                                              <span>
                                                Likes {sourcePost.likes !== null
                                                  ? sourcePost.likes.toLocaleString("en-IN")
                                                  : "—"}
                                              </span>
                                              <span>
                                                Replies {sourcePost.replies !== null
                                                  ? sourcePost.replies.toLocaleString("en-IN")
                                                  : "—"}
                                              </span>
                                              <span>
                                                Reposts {sourcePost.reposts !== null
                                                  ? sourcePost.reposts.toLocaleString("en-IN")
                                                  : "—"}
                                              </span>
                                            </div>

                                            {sourcePost.publishedAt && (
                                              <p className="mt-1 text-[8px] text-slate-700">
                                                Published{" "}
                                                {sourcePost.publishedAt.toLocaleDateString("en-IN", {
                                                  day: "numeric",
                                                  month: "short",
                                                  year: "numeric",
                                                })}
                                              </p>
                                            )}
                                          </div>

                                          {sourcePost.postUrl && (
                                            <a
                                              href={sourcePost.postUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex shrink-0 items-center gap-1 text-[8px] font-medium text-slate-600 transition-colors hover:text-violet-400"
                                            >
                                              Open post
                                              <ArrowUpRight size={10} />
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </details>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Posts */}
          <section className="mt-10">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Posts studied
                </h2>

                <p className="mt-1 text-[10px] text-slate-600">
                  The evidence behind the patterns identified above.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-700">
                  {creator.posts.length}{" "}
                  {creator.posts.length === 1 ? "post" : "posts"}
                </span>

                <details className="relative">
                  <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg bg-violet-500 px-3.5 py-2.5 text-[10px] font-semibold text-white transition-all hover:bg-violet-400">
                    <Plus size={12} />
                    Add post
                  </summary>

                  <div className="absolute right-0 top-11 z-30 max-h-[80vh] w-[380px] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0d0f16] p-5 shadow-2xl shadow-black/50">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          Add studied post
                        </h3>

                        <p className="mt-1 text-[10px] leading-5 text-slate-600">
                          Capture the post, performance data, and manually
                          classify its content structure.
                        </p>
                      </div>

                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.02] text-slate-600">
                        <X size={12} />
                      </span>
                    </div>

                    <form action={addPost} className="mt-5 space-y-4">
                      <div>
                        <label
                          htmlFor="post-url"
                          className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                        >
                          X post URL
                        </label>

                        <input
                          id="post-url"
                          name="postUrl"
                          type="url"
                          placeholder="https://x.com/username/status/..."
                          className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 text-xs text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="published-at"
                          className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                        >
                          Published date
                        </label>

                        <input
                          id="published-at"
                          name="publishedAt"
                          type="datetime-local"
                          className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 text-xs text-slate-300 outline-none transition-colors focus:border-violet-400/30 focus:bg-white/[0.03]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="post-content"
                          className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                        >
                          Post content
                        </label>

                        <textarea
                          id="post-content"
                          name="content"
                          required
                          rows={5}
                          placeholder="Paste the creator's post here..."
                          className="w-full resize-none rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-xs leading-5 text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="pattern-tag"
                          className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                        >
                          Research pattern
                        </label>

                        <input
                          id="pattern-tag"
                          name="patternTag"
                          type="text"
                          placeholder="e.g. Contrarian hook"
                          className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 text-xs text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
                        />
                      </div>

                      <div className="border-t border-white/[0.05] pt-4">
                        <div className="mb-3">
                          <p className="text-[10px] font-semibold text-white">
                            Performance
                          </p>
                          <p className="mt-1 text-[9px] leading-4 text-slate-700">
                            Enter the metrics visible on the studied post.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Field
                            id="views"
                            name="views"
                            label="Views"
                            type="number"
                            min="0"
                            placeholder="12000"
                          />

                          <Field
                            id="likes"
                            name="likes"
                            label="Likes"
                            type="number"
                            min="0"
                            placeholder="420"
                          />

                          <Field
                            id="replies"
                            name="replies"
                            label="Replies"
                            type="number"
                            min="0"
                            placeholder="35"
                          />

                          <Field
                            id="reposts"
                            name="reposts"
                            label="Reposts"
                            type="number"
                            min="0"
                            placeholder="80"
                          />
                        </div>
                      </div>

                      <div className="border-t border-white/[0.05] pt-4">
                        <div className="mb-3">
                          <p className="text-[10px] font-semibold text-white">
                            Content analysis
                          </p>
                          <p className="mt-1 text-[9px] leading-4 text-slate-700">
                            Manually classify the post. AI analysis will use
                            these same fields later.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <SelectField
                            id="hook-type"
                            name="hookType"
                            label="Hook type"
                            options={hookTypeOptions}
                          />

                          <SelectField
                            id="structure"
                            name="structure"
                            label="Structure"
                            options={structureOptions}
                          />

                          <Field
                            id="topic"
                            name="topic"
                            label="Topic"
                            placeholder="e.g. SaaS, fitness, AI"
                          />

                          <SelectField
                            id="tone"
                            name="tone"
                            label="Tone"
                            options={toneOptions}
                          />

                          <SelectField
                            id="format"
                            name="format"
                            label="Format"
                            options={formatOptions}
                          />

                          <SelectField
                            id="cta-type"
                            name="ctaType"
                            label="CTA"
                            options={ctaOptions}
                          />

                          <Field
                            id="content-length"
                            name="contentLength"
                            label="Content length"
                            type="number"
                            min="0"
                            placeholder="Characters"
                          />

                          <SelectField
                            id="content-style"
                            name="contentStyle"
                            label="Content style"
                            options={contentStyleOptions}
                          />

                          <SelectField
                            id="stance"
                            name="stance"
                            label="Stance"
                            options={stanceOptions}
                          />

                          <SelectField
                            id="sentence-type"
                            name="sentenceType"
                            label="Sentence type"
                            options={sentenceTypeOptions}
                          />

                          <SelectField
                            id="personalization"
                            name="personalization"
                            label="Personalization"
                            options={personalizationOptions}
                          />
                        </div>
                      </div>

                      <div className="border-t border-white/[0.05] pt-4">
                        <div>
                          <label
                            htmlFor="post-observation"
                            className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                          >
                            Research observation
                          </label>

                          <textarea
                            id="post-observation"
                            name="observation"
                            rows={3}
                            placeholder="What specifically did you notice about this post?"
                            className="w-full resize-none rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-xs leading-5 text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
                          />
                        </div>

                        <div className="mt-3">
                          <label
                            htmlFor="research-notes"
                            className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                          >
                            Research notes
                          </label>

                          <textarea
                            id="research-notes"
                            name="researchNotes"
                            rows={3}
                            placeholder="Additional notes about why you saved or classified this post..."
                            className="w-full resize-none rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-xs leading-5 text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-violet-500 text-[11px] font-semibold text-white transition-all hover:bg-violet-400 active:scale-[0.98]"
                      >
                        Save studied post
                        <ArrowUpRight size={12} />
                      </button>
                    </form>
                  </div>
                </details>
              </div>
            </div>

            {creator.posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.01] px-6 py-12 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <FileText size={16} className="text-slate-600" />
                </div>

                <h3 className="mt-4 text-sm font-medium text-slate-400">
                  No posts studied yet.
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-[10px] leading-5 text-slate-600">
                  Add a studied post to capture the content, performance,
                  analysis, and observation behind your creator research.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {creator.posts.map((post, index) => (
                  <article
                    key={post.id}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 transition-colors hover:border-white/[0.09]"
                  >
                    <div className="flex flex-col gap-5">
                      {/* Post header */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-700">
                            Post {index + 1}
                          </span>

                          {post.patternTag && (
                            <>
                              <span className="h-1 w-1 rounded-full bg-slate-700" />

                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-400/[0.05] px-2 py-1 text-[9px] font-medium text-emerald-400/70">
                                <Hash size={9} />
                                {post.patternTag}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {post.postUrl && (
                            <a
                              href={post.postUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[10px] font-medium text-slate-500 transition-all hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white"
                            >
                              View post
                              <ExternalLink size={11} />
                            </a>
                          )}

                          <details className="relative">
                            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[10px] font-medium text-slate-500 transition-all hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white">
                              <Pencil size={10} />
                              Edit
                            </summary>

                            <div className="absolute right-0 top-10 z-30 max-h-[80vh] w-[380px] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0d0f16] p-5 shadow-2xl shadow-black/50">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="text-sm font-semibold text-white">
                                    Edit studied post
                                  </h3>

                                  <p className="mt-1 text-[10px] leading-5 text-slate-600">
                                    Update the research data or correct your
                                    manual classification.
                                  </p>
                                </div>

                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.02] text-slate-600">
                                  <X size={12} />
                                </span>
                              </div>

                              <form
                                action={updatePost}
                                className="mt-5 space-y-4"
                              >
                                <input
                                  type="hidden"
                                  name="postId"
                                  value={post.id}
                                />

                                <div>
                                  <label
                                    htmlFor={`edit-post-url-${post.id}`}
                                    className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                                  >
                                    X post URL
                                  </label>

                                  <input
                                    id={`edit-post-url-${post.id}`}
                                    name="postUrl"
                                    type="url"
                                    defaultValue={post.postUrl ?? ""}
                                    placeholder="https://x.com/username/status/..."
                                    className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 text-xs text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
                                  />
                                </div>

                                <div>
                                  <label
                                    htmlFor={`edit-published-at-${post.id}`}
                                    className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                                  >
                                    Published date
                                  </label>

                                  <input
                                    id={`edit-published-at-${post.id}`}
                                    name="publishedAt"
                                    type="datetime-local"
                                    defaultValue={formatDateTimeLocal(
                                      post.publishedAt
                                    )}
                                    className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 text-xs text-slate-300 outline-none transition-colors focus:border-violet-400/30 focus:bg-white/[0.03]"
                                  />
                                </div>

                                <div>
                                  <label
                                    htmlFor={`edit-content-${post.id}`}
                                    className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                                  >
                                    Post content
                                  </label>

                                  <textarea
                                    id={`edit-content-${post.id}`}
                                    name="content"
                                    required
                                    rows={5}
                                    defaultValue={post.content ?? ""}
                                    className="w-full resize-none rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-xs leading-5 text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
                                  />
                                </div>

                                <div>
                                  <label
                                    htmlFor={`edit-pattern-tag-${post.id}`}
                                    className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                                  >
                                    Research pattern
                                  </label>

                                  <input
                                    id={`edit-pattern-tag-${post.id}`}
                                    name="patternTag"
                                    type="text"
                                    defaultValue={post.patternTag ?? ""}
                                    placeholder="e.g. Contrarian hook"
                                    className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 text-xs text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
                                  />
                                </div>

                                <div className="border-t border-white/[0.05] pt-4">
                                  <div className="mb-3">
                                    <p className="text-[10px] font-semibold text-white">
                                      Performance
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <Field
                                      id={`edit-views-${post.id}`}
                                      name="views"
                                      label="Views"
                                      type="number"
                                      min="0"
                                      defaultValue={
                                        post.views?.toString() ?? ""
                                      }
                                    />

                                    <Field
                                      id={`edit-likes-${post.id}`}
                                      name="likes"
                                      label="Likes"
                                      type="number"
                                      min="0"
                                      defaultValue={
                                        post.likes?.toString() ?? ""
                                      }
                                    />

                                    <Field
                                      id={`edit-replies-${post.id}`}
                                      name="replies"
                                      label="Replies"
                                      type="number"
                                      min="0"
                                      defaultValue={
                                        post.replies?.toString() ?? ""
                                      }
                                    />

                                    <Field
                                      id={`edit-reposts-${post.id}`}
                                      name="reposts"
                                      label="Reposts"
                                      type="number"
                                      min="0"
                                      defaultValue={
                                        post.reposts?.toString() ?? ""
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="border-t border-white/[0.05] pt-4">
                                  <div className="mb-3">
                                    <p className="text-[10px] font-semibold text-white">
                                      Content analysis
                                    </p>
                                  </div>

                                  <div className="space-y-3">
                                    <SelectField
                                      id={`edit-hook-type-${post.id}`}
                                      name="hookType"
                                      label="Hook type"
                                      options={hookTypeOptions}
                                      defaultValue={post.hookType ?? ""}
                                    />

                                    <SelectField
                                      id={`edit-structure-${post.id}`}
                                      name="structure"
                                      label="Structure"
                                      options={structureOptions}
                                      defaultValue={post.structure ?? ""}
                                    />

                                    <Field
                                      id={`edit-topic-${post.id}`}
                                      name="topic"
                                      label="Topic"
                                      defaultValue={post.topic ?? ""}
                                      placeholder="e.g. SaaS, fitness, AI"
                                    />

                                    <SelectField
                                      id={`edit-tone-${post.id}`}
                                      name="tone"
                                      label="Tone"
                                      options={toneOptions}
                                      defaultValue={post.tone ?? ""}
                                    />

                                    <SelectField
                                      id={`edit-format-${post.id}`}
                                      name="format"
                                      label="Format"
                                      options={formatOptions}
                                      defaultValue={post.format ?? ""}
                                    />

                                    <SelectField
                                      id={`edit-cta-type-${post.id}`}
                                      name="ctaType"
                                      label="CTA"
                                      options={ctaOptions}
                                      defaultValue={post.ctaType ?? ""}
                                    />

                                    <Field
                                      id={`edit-content-length-${post.id}`}
                                      name="contentLength"
                                      label="Content length"
                                      type="number"
                                      min="0"
                                      defaultValue={
                                        post.contentLength?.toString() ?? ""
                                      }
                                      placeholder="Characters"
                                    />

                                    <SelectField
                                      id={`edit-content-style-${post.id}`}
                                      name="contentStyle"
                                      label="Content style"
                                      options={contentStyleOptions}
                                      defaultValue={
                                        post.contentStyle ?? ""
                                      }
                                    />

                                    <SelectField
                                      id={`edit-stance-${post.id}`}
                                      name="stance"
                                      label="Stance"
                                      options={stanceOptions}
                                      defaultValue={post.stance ?? ""}
                                    />

                                    <SelectField
                                      id={`edit-sentence-type-${post.id}`}
                                      name="sentenceType"
                                      label="Sentence type"
                                      options={sentenceTypeOptions}
                                      defaultValue={
                                        post.sentenceType ?? ""
                                      }
                                    />

                                    <SelectField
                                      id={`edit-personalization-${post.id}`}
                                      name="personalization"
                                      label="Personalization"
                                      options={personalizationOptions}
                                      defaultValue={
                                        post.personalization ?? ""
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="border-t border-white/[0.05] pt-4">
                                  <div>
                                    <label
                                      htmlFor={`edit-observation-${post.id}`}
                                      className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                                    >
                                      Research observation
                                    </label>

                                    <textarea
                                      id={`edit-observation-${post.id}`}
                                      name="observation"
                                      rows={3}
                                      defaultValue={post.observation ?? ""}
                                      className="w-full resize-none rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-xs leading-5 text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
                                    />
                                  </div>

                                  <div className="mt-3">
                                    <label
                                      htmlFor={`edit-research-notes-${post.id}`}
                                      className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                                    >
                                      Research notes
                                    </label>

                                    <textarea
                                      id={`edit-research-notes-${post.id}`}
                                      name="researchNotes"
                                      rows={3}
                                      defaultValue={post.researchNotes ?? ""}
                                      className="w-full resize-none rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-xs leading-5 text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
                                    />
                                  </div>
                                </div>

                                <button
                                  type="submit"
                                  className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-violet-500 text-[11px] font-semibold text-white transition-all hover:bg-violet-400 active:scale-[0.98]"
                                >
                                  Save changes
                                  <ArrowUpRight size={12} />
                                </button>
                              </form>
                            </div>
                          </details>
                        </div>
                      </div>

                      {/* Actual post */}
                      <div className="rounded-xl border border-white/[0.05] bg-black/20 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-violet-400/15 bg-violet-400/[0.07] text-[8px] font-semibold text-violet-300">
                            {initials}
                          </div>

                          <div>
                            <p className="text-[10px] font-medium text-slate-300">
                              {creator.name}
                            </p>

                            <p className="text-[8px] text-slate-700">
                              @{creator.handle.replace(/^@/, "")}
                            </p>
                          </div>
                        </div>

                        {post.content ? (
                          <p className="whitespace-pre-wrap text-xs leading-6 text-slate-300">
                            {post.content}
                          </p>
                        ) : (
                          <p className="text-xs italic leading-6 text-slate-700">
                            Post content has not been captured yet.
                          </p>
                        )}
                      </div>

                      {/* Performance */}
                      {(post.views !== null ||
                        post.likes !== null ||
                        post.replies !== null ||
                        post.reposts !== null) && (
                        <div className="rounded-xl border border-sky-400/[0.07] bg-sky-400/[0.02] p-4">
                          <div className="flex items-center gap-2">
                            <BarChart3
                              size={12}
                              className="text-sky-400"
                            />

                            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-sky-300/70">
                              Performance
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <Metric
                              label="Views"
                              value={post.views}
                            />
                            <Metric
                              label="Likes"
                              value={post.likes}
                            />
                            <Metric
                              label="Replies"
                              value={post.replies}
                            />
                            <Metric
                              label="Reposts"
                              value={post.reposts}
                            />
                          </div>
                        </div>
                      )}

                      {/* Structured analysis */}
                      {(post.hookType ||
                        post.structure ||
                        post.topic ||
                        post.tone ||
                        post.format ||
                        post.ctaType ||
                        post.contentLength !== null ||
                        post.contentStyle ||
                        post.stance ||
                        post.sentenceType ||
                        post.personalization) && (
                        <div className="rounded-xl border border-emerald-400/[0.07] bg-emerald-400/[0.02] p-4">
                          <div className="flex items-center gap-2">
                            <Sparkles
                              size={12}
                              className="text-emerald-400"
                            />

                            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-300/70">
                              Structured analysis
                            </span>
                          </div>

                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <AnalysisValue
                              label="Hook"
                              value={formatEnumLabel(post.hookType)}
                            />

                            <AnalysisValue
                              label="Structure"
                              value={formatEnumLabel(post.structure)}
                            />

                            <AnalysisValue
                              label="Topic"
                              value={post.topic}
                            />

                            <AnalysisValue
                              label="Tone"
                              value={formatEnumLabel(post.tone)}
                            />

                            <AnalysisValue
                              label="Format"
                              value={formatEnumLabel(post.format)}
                            />

                            <AnalysisValue
                              label="CTA"
                              value={formatEnumLabel(post.ctaType)}
                            />

                            <AnalysisValue
                              label="Content length"
                              value={
                                post.contentLength !== null
                                  ? `${post.contentLength} characters`
                                  : null
                              }
                            />

                            <AnalysisValue
                              label="Content style"
                              value={formatEnumLabel(post.contentStyle)}
                            />

                            <AnalysisValue
                              label="Stance"
                              value={formatEnumLabel(post.stance)}
                            />

                            <AnalysisValue
                              label="Sentence type"
                              value={formatEnumLabel(post.sentenceType)}
                            />

                            <AnalysisValue
                              label="Personalization"
                              value={formatEnumLabel(post.personalization)}
                            />
                          </div>
                        </div>
                      )}

                      {/* Observation */}
                      <div className="rounded-xl border border-violet-400/[0.07] bg-violet-400/[0.025] p-4">
                        <div className="flex items-center gap-2">
                          <Sparkles
                            size={12}
                            className="text-violet-400"
                          />

                          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-300/70">
                            Research observation
                          </span>
                        </div>

                        {post.observation ? (
                          <p className="mt-2 text-xs leading-6 text-slate-400">
                            {post.observation}
                          </p>
                        ) : (
                          <p className="mt-2 text-[10px] italic leading-5 text-slate-700">
                            No observation recorded for this post yet.
                          </p>
                        )}

                        {post.researchNotes && (
                          <div className="mt-4 border-t border-white/[0.05] pt-3">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                              Research notes
                            </p>

                            <p className="mt-2 text-xs leading-6 text-slate-500">
                              {post.researchNotes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-col gap-2 border-t border-white/[0.05] pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          <p className="text-[9px] leading-5 text-slate-700">
                            Captured{" "}
                            {post.createdAt.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>

                          {post.publishedAt && (
                            <p className="text-[9px] leading-5 text-slate-700">
                              Published{" "}
                              {post.publishedAt.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>

                        {post.postUrl && (
                          <a
                            href={post.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-600 transition-colors hover:text-violet-400"
                          >
                            Open source
                            <ArrowUpRight size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Research → Strategy */}
          <section className="mt-10 rounded-2xl border border-violet-400/[0.08] bg-violet-400/[0.025] p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-400/15 bg-violet-400/[0.07]">
                <Sparkles size={15} className="text-violet-400" />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white">
                  Turn research into an experiment
                </h3>

                <p className="mt-1 max-w-xl text-[10px] leading-5 text-slate-600">
                  A potential, emerging, or repeated signal can be carried into
                  the strategy workflow as a research-backed hypothesis.
                </p>

                <p className="mt-3 max-w-xl text-[9px] leading-5 text-slate-700">
                  Select <span className="text-slate-500">Test this pattern</span>
                  on a signal above to preserve the creator, pattern, evidence,
                  and performance context.
                </p>

                <Link
                  href="/strategies"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5 text-[10px] font-medium text-slate-400 transition-all hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white"
                >
                  Explore strategies
                  <ArrowUpRight size={12} />
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

function Field({
  id,
  name,
  label,
  type = "text",
  placeholder,
  defaultValue,
  min,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  min?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        min={min}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 text-xs text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
      />
    </div>
  );
}

function SelectField({
  id,
  name,
  label,
  options,
  defaultValue = "",
}: {
  id: string;
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
      >
        {label}
      </label>

      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="h-9 w-full rounded-lg border border-white/[0.07] bg-[#11131b] px-3 text-xs text-slate-300 outline-none transition-colors focus:border-violet-400/30"
      >
        <option value="">Not classified</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.1em] text-slate-700">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-300">
        {value !== null ? value.toLocaleString("en-IN") : "—"}
      </p>
    </div>
  );
}

function AnalysisValue({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2">
      <p className="text-[8px] uppercase tracking-[0.1em] text-slate-700">
        {label}
      </p>

      <p className="mt-1 text-[10px] font-medium text-slate-300">
        {value || "Not classified"}
      </p>
    </div>
  );
}