import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FlaskConical,
  Play,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

type RecentItem = {
  title: string;
  avgGrowth: number | null;
};

export function Hero({
  totalCheckIns,
  topStrategy,
  recentList,
}: {
  totalCheckIns: number;
  topStrategy: { title: string; avgGrowth: number } | undefined;
  recentList: RecentItem[];
}) {
  return (
    <section className="relative overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[42%] top-[8%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[140px]" />
        <div className="absolute right-[2%] top-[18%] h-[420px] w-[420px] rounded-full bg-purple-500/10 blur-[130px]" />
        <div className="absolute left-[5%] top-[45%] h-[280px] w-[280px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-16 md:px-10 md:pb-12 md:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          {/* LEFT SIDE */}
          <div>
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.08em] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              FOR X CREATORS
            </div>

            {/* Main heading */}
            <h1
              className="max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-[68px]"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Experiment.
              <br />
              Learn.{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Grow.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              Slancialab helps you find proven content strategies, run
              experiments on X, measure real results, and discover what
              actually works for your audience.
            </p>

            {/* CTA buttons */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_35px_rgba(99,102,241,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(99,102,241,0.4)]"
              >
                Start for free
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
              >
                <Play size={15} fill="currentColor" />
                Watch demo
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-7 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["A", "J", "R", "M"].map((letter, index) => (
                  <div
                    key={letter}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0a0b10] bg-gradient-to-br from-slate-500 to-slate-800 text-xs font-semibold text-white"
                    style={{
                      transform: `translateY(${index % 2 === 0 ? 0 : 2}px)`,
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>

              <div>
                <p className="text-sm font-medium text-white">
                  Join 1,000+ creators
                </p>

                <p className="text-xs text-slate-500">
                  experimenting and growing on X
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="relative">
            {/* Handwritten annotation */}
            <div className="absolute -right-1 -top-12 z-20 hidden rotate-[-4deg] md:block">
              <div className="flex items-center gap-2 text-sm italic text-violet-300">
                <span className="leading-5">
                  Turn content
                  <br />
                  into data.
                </span>

                <svg
                  width="58"
                  height="45"
                  viewBox="0 0 58 45"
                  fill="none"
                  className="rotate-[8deg]"
                >
                  <path
                    d="M3 8C25 4 43 10 52 30"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  <path
                    d="M45 27L52 30L49 37"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Dashboard glow */}
            <div className="absolute -inset-5 rounded-[32px] bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-emerald-500/10 blur-2xl" />

            {/* Dashboard */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1118]/95 shadow-2xl shadow-black/40">
              {/* Browser header */}
              <div className="flex h-11 items-center justify-between border-b border-white/[0.07] px-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-blue-500">
                    <FlaskConical size={13} className="text-white" />
                  </div>

                  <span className="text-xs font-semibold text-white">
                    Slancialab
                  </span>
                </div>

                <div className="hidden h-7 w-48 items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.02] px-2.5 sm:flex">
                  <Search size={12} className="text-slate-500" />

                  <span className="text-[10px] text-slate-600">
                    Search strategies, experiments...
                  </span>
                </div>
              </div>

              <div className="flex">
                {/* Sidebar */}
                <div className="hidden w-[105px] shrink-0 border-r border-white/[0.07] p-3 sm:block">
                  <div className="space-y-1">
                    {[
                      {
                        icon: BarChart3,
                        label: "Home",
                        active: true,
                      },
                      {
                        icon: Search,
                        label: "Strategies",
                      },
                      {
                        icon: FlaskConical,
                        label: "Experiments",
                      },
                      {
                        icon: Sparkles,
                        label: "Content",
                      },
                      {
                        icon: TrendingUp,
                        label: "Analytics",
                      },
                    ].map(({ icon: Icon, label, active }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-2 rounded-md px-2 py-2 text-[9px] ${
                          active
                            ? "bg-violet-500/10 text-violet-300"
                            : "text-slate-500"
                        }`}
                      >
                        <Icon size={11} />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="min-w-0 flex-1 p-4 sm:p-5">
                  {/* Greeting */}
                  <div className="mb-4">
                    <p className="text-[10px] text-slate-500">
                      Good morning, Alex 👋
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      Keep experimenting. You're building momentum.
                    </p>
                  </div>

                  {/* Top cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Followers card */}
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
                      <div className="mb-1 text-[10px] text-slate-500">
                        Followers
                      </div>

                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <div className="text-xl font-semibold text-white">
                            17,892
                          </div>

                          <div className="mt-1 text-[9px] font-medium text-emerald-400">
                            ↗ +12.4%
                          </div>
                        </div>

                        {/* Mini chart */}
                        <svg
                          viewBox="0 0 100 42"
                          className="h-12 w-24"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient
                              id="heroChart"
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="0"
                            >
                              <stop
                                offset="0%"
                                stopColor="#6366f1"
                              />

                              <stop
                                offset="100%"
                                stopColor="#34d399"
                              />
                            </linearGradient>
                          </defs>

                          <path
                            d="M2 34 L12 31 L22 33 L32 25 L42 28 L52 19 L62 22 L72 14 L82 16 L98 5"
                            fill="none"
                            stroke="url(#heroChart)"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Experiment card */}
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-slate-500">
                          Active Experiment
                        </div>

                        <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[8px] font-medium text-violet-300">
                          Day 7 of 14
                        </span>
                      </div>

                      <div className="mt-2 text-sm font-semibold text-white">
                        Build in Public
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-violet-500 to-blue-400" />
                      </div>

                      <div className="mt-2 text-right text-[8px] text-slate-500">
                        50%
                      </div>
                    </div>
                  </div>

                  {/* Recent experiments */}
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">
                        Recent Experiments
                      </span>

                      <span className="text-[9px] text-violet-400">
                        View all →
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      {(recentList.length
                        ? recentList.slice(0, 4)
                        : [
                            {
                              title: "Build in Public",
                              avgGrowth: 7.8,
                            },
                            {
                              title: "Educational Threads",
                              avgGrowth: 4.1,
                            },
                            {
                              title: "Personal Stories",
                              avgGrowth: null,
                            },
                            {
                              title: "Contrarian Takes",
                              avgGrowth: -0.4,
                            },
                          ]
                      ).map((item, index) => {
                        const growth = item.avgGrowth;

                        return (
                          <div
                            key={`${item.title}-${index}`}
                            className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-2.5"
                          >
                            <div className="mb-2 truncate text-[9px] font-medium text-slate-300">
                              {item.title}
                            </div>

                            <div
                              className={`text-[10px] font-semibold ${
                                growth === null
                                  ? "text-slate-500"
                                  : growth >= 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                              }`}
                            >
                              {growth === null
                                ? "No lift"
                                : growth >= 0
                                  ? `+${growth}%`
                                  : `${growth}%`}
                            </div>

                            <div
                              className={`mt-2 inline-flex rounded-full px-1.5 py-0.5 text-[7px] ${
                                growth === null || growth < 0
                                  ? "bg-white/[0.05] text-slate-500"
                                  : "bg-emerald-400/10 text-emerald-400"
                              }`}
                            >
                              {growth === null || growth < 0
                                ? "No lift"
                                : "Success"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating result */}
            <div className="absolute -left-5 top-[42%] hidden rounded-xl border border-emerald-400/20 bg-[#071b17]/95 px-4 py-3 shadow-[0_0_35px_rgba(16,185,129,0.18)] sm:block">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10">
                  <TrendingUp
                    size={14}
                    className="text-emerald-400"
                  />
                </div>

                <div>
                  <div className="text-sm font-semibold text-emerald-300">
                    +127 followers
                  </div>

                  <div className="text-[9px] text-slate-500">
                    from this experiment
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom reassurance */}
        <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-6 sm:grid-cols-4">
          {[
            "No credit card required",
            "Free plan available",
            "Built for creators",
            "Real results, not guesswork",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-500"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400/70" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}