import {
  Search,
  FlaskConical,
  BarChart3,
  ArrowDownRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover",
    description:
      "Find strategies worth testing based on your niche, audience, and growth stage.",
    color: "#8B5CF6",
    position: "lg:translate-y-7",
  },
  {
    number: "02",
    icon: FlaskConical,
    title: "Experiment",
    description:
      "Turn a strategy into a structured test with a hypothesis, metric, and target.",
    color: "#A78BFA",
    position: "lg:-translate-y-1",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Measure",
    description:
      "Track what happened and compare your results against your baseline.",
    color: "#60A5FA",
    position: "lg:translate-y-7",
  },
  {
    number: "04",
    icon: Search,
    title: "Learn",
    description:
      "Keep what works, discard what doesn't, and decide what to test next.",
    color: "#34D399",
    position: "lg:-translate-y-1",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden"
    >
      {/* Subtle central glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.035] blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-16">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-violet-400">
            The growth loop
          </div>

          <h2
            className="text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Turn content into
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              a growth system.
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
            Every experiment gives you information. Every result makes the
            next experiment smarter.
          </p>
        </div>

        {/* Growth loop */}
        <div className="relative mx-auto mt-10 max-w-5xl">
          {/* Desktop loop path */}
          <svg
            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
            viewBox="0 0 1000 400"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M130 175
                 C190 50 350 45 430 115
                 C500 175 560 185 635 115
                 C710 45 865 65 885 190
                 C905 305 760 355 655 305
                 C565 260 490 255 405 315
                 C315 365 150 330 130 215"
              stroke="rgba(139,92,246,0.18)"
              strokeWidth="1.5"
              strokeDasharray="5 8"
            />

            {/* Return path */}
            <path
              d="M150 260 C125 235 120 205 130 175"
              stroke="rgba(52,211,153,0.35)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Return arrow */}
            <path
              d="M130 175 L122 187 M130 175 L140 183"
              stroke="rgba(52,211,153,0.45)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* Cards */}
          <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className={`group relative ${step.position}`}
                >
                  <div
                    className="relative min-h-[195px] rounded-2xl border border-white/[0.07] bg-[#0d0f15]/90 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14]"
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-medium tracking-[0.18em] text-slate-600">
                        {step.number}
                      </span>

                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl border"
                        style={{
                          background: `${step.color}0D`,
                          borderColor: `${step.color}25`,
                        }}
                      >
                        <Icon
                          size={17}
                          style={{ color: step.color }}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-white">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-[11px] leading-5 text-slate-500">
                        {step.description}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="absolute bottom-4 left-5 flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor: step.color,
                          boxShadow: `0 0 10px ${step.color}`,
                        }}
                      />

                      <span className="text-[8px] uppercase tracking-[0.12em] text-slate-600">
                        Experiment
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom statement */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-white/[0.06] bg-white/[0.015] px-4 py-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10">
              <ArrowDownRight
                size={12}
                className="text-emerald-400"
              />
            </span>

            <span className="text-xs text-slate-500">
              Your data compounds with every experiment.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}