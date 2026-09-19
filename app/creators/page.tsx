import Link from "next/link";
import { Search, Users, ArrowRight, Sparkles, Plus, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AppLayout } from "../components/AppLayout";
import { redirect } from "next/navigation";

export default async function CreatorsPage() {
  async function createCreator(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const handle = String(formData.get("handle") ?? "").trim();
    const niche = String(formData.get("niche") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();

    if (!name || !handle || !niche) {
      return;
    }

    const normalizedHandle = handle.replace(/^@+/, "");

    const creator = await prisma.creator.create({
      data: {
        name,
        handle: normalizedHandle,
        niche,
        notes,
      },
    });

    redirect(`/creators/${creator.id}`);
  }

  const creators = await prisma.creator.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      posts: true,
    },
  });

  const totalPosts = creators.reduce(
    (total, creator) => total + creator.posts.length,
    0
  );

  const totalNiches = new Set(creators.map((creator) => creator.niche)).size;

  return (
    <AppLayout>
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
          {/* Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-400/15 bg-violet-400/[0.07]">
                  <Users size={14} className="text-violet-400" />
                </span>

                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Creator Intelligence
                </span>
              </div>

              <h1
                className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Study what creators are doing.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Explore creators, study their posts, and identify patterns you
                can turn into your own experiments.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 sm:flex">
                <Sparkles size={13} className="text-emerald-400" />
                <span className="text-[10px] text-slate-500">
                  Research → Strategy → Experiment
                </span>
              </div>

              <details className="relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg bg-violet-500 px-3.5 py-2.5 text-[11px] font-semibold text-white transition-all hover:bg-violet-400">
                  <Plus size={13} />
                  Add creator
                </summary>

                <div className="absolute right-0 top-12 z-20 w-[340px] rounded-2xl border border-white/[0.08] bg-[#0d0f16] p-5 shadow-2xl shadow-black/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-semibold text-white">
                        Add creator
                      </h2>

                      <p className="mt-1 text-[10px] leading-4 text-slate-600">
                        Add someone you want to study and build into your
                        research library.
                      </p>
                    </div>

                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.02] text-slate-600">
                      <X size={12} />
                    </span>
                  </div>

                  <form action={createCreator} className="mt-5 space-y-3">
                    <div>
                      <label
                        htmlFor="creator-name"
                        className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                      >
                        Creator name
                      </label>

                      <input
                        id="creator-name"
                        name="name"
                        type="text"
                        required
                        placeholder="e.g. Justin Welsh"
                        className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 text-xs text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="creator-handle"
                        className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                      >
                        X handle
                      </label>

                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-700">
                          @
                        </span>

                        <input
                          id="creator-handle"
                          name="handle"
                          type="text"
                          required
                          placeholder="justinwelsh"
                          className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.02] pl-7 pr-3 text-xs text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="creator-niche"
                        className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                      >
                        Niche
                      </label>

                      <input
                        id="creator-niche"
                        name="niche"
                        type="text"
                        required
                        placeholder="e.g. SaaS, AI, Creator Economy"
                        className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 text-xs text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="creator-notes"
                        className="mb-1.5 block text-[9px] font-medium uppercase tracking-[0.12em] text-slate-600"
                      >
                        Research notes
                      </label>

                      <textarea
                        id="creator-notes"
                        name="notes"
                        rows={3}
                        placeholder="What do you want to understand about this creator?"
                        className="w-full resize-none rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-xs leading-5 text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-violet-400/30 focus:bg-white/[0.03]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-violet-500 text-[11px] font-semibold text-white transition-all hover:bg-violet-400 active:scale-[0.98]"
                    >
                      Add to research library
                      <ArrowRight size={12} />
                    </button>
                  </form>
                </div>
              </details>
            </div>
          </div>

          {/* Search */}
          <div className="mt-8">
            <div className="relative max-w-md">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-700"
              />

              <input
                type="text"
                placeholder="Search creators..."
                className="h-10 w-full rounded-lg border border-white/[0.07] bg-white/[0.02] pl-9 pr-4 text-xs text-slate-300 outline-none placeholder:text-slate-700 transition-colors focus:border-violet-400/25 focus:bg-white/[0.03]"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
              <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-700">
                Creators
              </div>

              <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                {creators.length}
              </div>

              <div className="mt-1 text-[10px] text-slate-600">
                In your research library
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
              <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-700">
                Posts studied
              </div>

              <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                {totalPosts}
              </div>

              <div className="mt-1 text-[10px] text-slate-600">
                Patterns captured from posts
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
              <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-700">
                Niches
              </div>

              <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                {totalNiches}
              </div>

              <div className="mt-1 text-[10px] text-slate-600">
                Different creator categories
              </div>
            </div>
          </div>

          {/* Creator library */}
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Creator library
                </h2>

                <p className="mt-1 text-[10px] text-slate-600">
                  People worth studying for your next experiment.
                </p>
              </div>

              <span className="text-[10px] text-slate-700">
                {creators.length} creator{creators.length === 1 ? "" : "s"}
              </span>
            </div>

            {creators.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.01] px-6 py-16 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <Users size={17} className="text-slate-600" />
                </div>

                <h3 className="mt-4 text-sm font-medium text-slate-300">
                  Your creator library is empty.
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-600">
                  Creators you study will appear here. Start by finding
                  creators whose content you want to understand.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {creators.map((creator) => (
                  <Link
                    key={creator.id}
                    href={`/creators/${creator.id}`}
                    className="group rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 transition-all hover:border-violet-400/15 hover:bg-white/[0.025]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-400/15 bg-violet-400/[0.07] text-xs font-semibold text-violet-300">
                          {creator.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-white">
                            {creator.name}
                          </h3>

                          <p className="mt-0.5 truncate text-[10px] text-slate-600">
                            @{creator.handle}
                          </p>
                        </div>
                      </div>

                      <ArrowRight
                        size={14}
                        className="shrink-0 text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-violet-400"
                      />
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[9px] font-medium text-slate-500">
                        {creator.niche}
                      </span>

                      <span className="text-[9px] text-slate-700">
                        {creator.posts.length}{" "}
                        {creator.posts.length === 1 ? "post" : "posts"} studied
                      </span>
                    </div>

                    {creator.notes && (
                      <p className="mt-4 line-clamp-2 text-[10px] leading-5 text-slate-600">
                        {creator.notes}
                      </p>
                    )}

                    {creator.posts.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {Array.from(
                          new Set(
                            creator.posts
                              .map((post) => post.patternTag)
                              .filter(Boolean)
                          )
                        )
                          .slice(0, 3)
                          .map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-emerald-400/[0.05] px-2 py-1 text-[8px] font-medium text-emerald-400/70"
                            >
                              #{tag}
                            </span>
                          ))}
                      </div>
                    )}

                    <div className="mt-5 border-t border-white/[0.05] pt-3">
                      <span className="text-[9px] font-medium text-slate-700 transition-colors group-hover:text-violet-400">
                        Study creator →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}