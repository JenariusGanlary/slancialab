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
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AppLayout } from "../../components/AppLayout";

type CreatorPageProps = {
  params: Promise<{
    creatorId: string;
  }>;
};

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

    if (!content || !patternTag) {
      return;
    }

    await prisma.creatorPost.create({
      data: {
        creatorId,
        postUrl: postUrl || null,
        content,
        patternTag,
        observation: observation || null,
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
          <section className="mt-5 grid gap-3 sm:grid-cols-3">
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
                <Users size={13} className="text-sky-400" />

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

                  <div className="absolute right-0 top-11 z-30 w-[360px] rounded-2xl border border-white/[0.08] bg-[#0d0f16] p-5 shadow-2xl shadow-black/50">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          Add studied post
                        </h3>

                        <p className="mt-1 text-[10px] leading-5 text-slate-600">
                          Capture the evidence behind a pattern you noticed
                          from this creator.
                        </p>
                      </div>

                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.02] text-slate-600">
                        <X size={12} />
                      </span>
                    </div>

                    <form action={addPost} className="mt-5 space-y-3">
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
                          Pattern
                        </label>

                        <input
                          id="pattern-tag"
                          name="patternTag"
                          type="text"
                          required
                          placeholder="e.g. Short daily update, real numbers"
                          className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 text-xs text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
                        />
                      </div>

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
                  Add a studied post to capture the content, pattern, and
                  observation behind your creator research.
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

                          <span className="h-1 w-1 rounded-full bg-slate-700" />

                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-400/[0.05] px-2 py-1 text-[9px] font-medium text-emerald-400/70">
                            <Hash size={9} />
                            {post.patternTag}
                          </span>
                        </div>

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
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between border-t border-white/[0.05] pt-3">
                        <p className="text-[9px] leading-5 text-slate-700">
                          Captured{" "}
                          {post.createdAt.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>

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
                  These patterns are observations, not guarantees. The next
                  step is to turn a pattern into a strategy and test whether it
                  works for your own audience.
                </p>

                <Link
                  href="/strategies"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-violet-500 px-3.5 py-2.5 text-[10px] font-semibold text-white transition-all hover:bg-violet-400"
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