import {
  Search,
  FlaskConical,
  BarChart3,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

function FeatureIcon({
  icon: Icon,
  color,
}: {
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
      style={{
        background: `${color}0D`,
        borderColor: `${color}25`,
      }}
    >
      <Icon size={15} style={{ color }} />
    </div>
  );
}

export function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden border-t border-white/[0.04]"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-[18%] top-1/2 h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-orange-500/[0.025] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* LEFT — CONTENT VISUAL */}
          <div className="relative flex min-h-[340px] items-center justify-center lg:min-h-[370px]">
            {/* Glow behind post */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/[0.08] blur-[90px]" />

            <div className="relative w-full max-w-[440px]">
              {/* X post */}
              <div className="relative rotate-[-4deg] rounded-2xl border border-white/[0.09] bg-[#0d1016] p-5 shadow-2xl shadow-black/30">
                {/* Profile */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-xs font-semibold text-white">
                    A
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-white">
                      Alex Chen
                    </div>

                    <div className="text-[10px] text-slate-600">
                      @alexchen
                    </div>
                  </div>

                  <div className="ml-auto text-[10px] text-slate-600">
                    2h
                  </div>
                </div>

                {/* Post */}
                <p className="mt-5 max-w-[370px] text-sm leading-6 text-slate-300">
                  Day 7 of building in public.
                  <br />
                  <br />
                  Not everything is going smoothly, but here&apos;s what I
                  learned this week... 📕
                </p>

                {/* Engagement */}
                <div className="mt-6 flex items-center justify-between border-t border-white/[0.05] pt-4 text-[10px] text-slate-600">
                  <span>♡ 42</span>
                  <span>↻ 18</span>
                  <span>♡ 312</span>
                  <span>▢ 52</span>
                </div>
              </div>

              {/* Result badge */}
              <div className="absolute -right-2 -top-7 rounded-xl border border-emerald-400/20 bg-[#071914]/95 px-4 py-3 shadow-xl shadow-emerald-500/10">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10">
                    <ArrowUpRight
                      size={14}
                      className="text-emerald-400"
                    />
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-emerald-300">
                      +127 followers
                    </div>

                    <div className="text-[9px] text-emerald-500/70">
                      from this post
                    </div>
                  </div>
                </div>
              </div>

              {/* Connecting arrow */}
              <svg
                className="pointer-events-none absolute right-[95px] top-[52px] h-20 w-20"
                viewBox="0 0 80 80"
                fill="none"
              >
                <path
                  d="M10 65 C25 55 42 40 54 18"
                  stroke="rgba(52,211,153,0.7)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                <path
                  d="M48 20 L55 17 L53 25"
                  stroke="rgba(52,211,153,0.7)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Experiment badge */}
              <div className="absolute -bottom-6 left-2 rounded-lg border border-violet-400/20 bg-[#0b0d13]/95 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-400/10">
                    <FlaskConical
                      size={12}
                      className="text-violet-400"
                    />
                  </div>

                  <div>
                    <div className="text-[9px] text-slate-600">
                      Active experiment
                    </div>

                    <div className="text-[10px] font-medium text-white">
                      Build in Public
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — EXPLANATION */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-violet-400">
              <Sparkles size={12} />
              A better way to grow on X
            </div>

            <h2
              className="max-w-lg text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Stop guessing.
              <br />
              Start{" "}
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                experimenting.
              </span>
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-500">
              Most creators post, check the likes, and move on. Slancialab
              turns your content into experiments so you can understand what
              actually drives growth for your audience.
            </p>

            {/* Feature list */}
            <div className="mt-6 space-y-4">
              {/* 01 */}
              <div className="flex gap-3">
                <FeatureIcon
                  icon={Search}
                  color="#8B5CF6"
                />

                <div>
                  <h3 className="text-xs font-semibold text-white">
                    Discover proven strategies
                  </h3>

                  <p className="mt-1 max-w-md text-[11px] leading-5 text-slate-600">
                    Explore strategies based on creator behavior, niche,
                    audience stage, and real experiment results.
                  </p>
                </div>
              </div>

              {/* 02 */}
              <div className="flex gap-3">
                <FeatureIcon
                  icon={FlaskConical}
                  color="#A78BFA"
                />

                <div>
                  <h3 className="text-xs font-semibold text-white">
                    Run structured experiments
                  </h3>

                  <p className="mt-1 max-w-md text-[11px] leading-5 text-slate-600">
                    Turn an idea into a measurable experiment with a
                    hypothesis, baseline, target, and timeframe.
                  </p>
                </div>
              </div>

              {/* 03 */}
              <div className="flex gap-3">
                <FeatureIcon
                  icon={BarChart3}
                  color="#60A5FA"
                />

                <div>
                  <h3 className="text-xs font-semibold text-white">
                    Measure real results
                  </h3>

                  <p className="mt-1 max-w-md text-[11px] leading-5 text-slate-600">
                    Track followers, engagement, impressions, and other
                    signals instead of relying on one-off viral posts.
                  </p>
                </div>
              </div>

              {/* 04 */}
              <div className="flex gap-3">
                <FeatureIcon
                  icon={Sparkles}
                  color="#34D399"
                />

                <div>
                  <h3 className="text-xs font-semibold text-white">
                    Build your Content DNA
                  </h3>

                  <p className="mt-1 max-w-md text-[11px] leading-5 text-slate-600">
                    Learn which formats, topics, hooks, and strategies
                    consistently work for your audience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}