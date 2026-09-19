import Link from "next/link";
import {
  Rocket,
  BookOpen,
  Heart,
  Zap,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";

const icons = [
  Rocket,
  BookOpen,
  Heart,
  Zap,
  MessageCircle,
];

const colors = [
  "#F97316",
  "#EC4899",
  "#EF4444",
  "#EAB308",
  "#3B82F6",
];

type StrategyItem = {
  id: string;
  title: string;
  description: string;
  nicheTags: string[];
  stageTags: string[];
};

export function Strategies({
  strategies,
}: {
  strategies: StrategyItem[];
}) {
  return (
    <section
      id="strategies"
      className="relative overflow-hidden border-t border-white/[0.04]"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute right-[12%] top-1/2 h-[320px] w-[320px] -translate-y-1/2 rounded-full bg-violet-500/[0.025] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
        {/* Header */}
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <div className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-violet-400">
              Strategy library
            </div>

            <h2
              className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Explore popular strategies
            </h2>

            <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
              Start with a strategy worth testing. Then use your own data to
              discover what works for you.
            </p>
          </div>

          <Link
            href="/sign-up"
            className="hidden shrink-0 items-center gap-1.5 text-xs font-medium text-violet-400 transition-colors hover:text-violet-300 sm:flex"
          >
            Explore the library
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {/* Strategy cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {strategies.slice(0, 5).map((strategy, index) => {
            const Icon = icons[index % icons.length];
            const color = colors[index % colors.length];

            return (
              <div
                key={strategy.id}
                className="group relative min-h-[175px] overflow-hidden rounded-xl border border-white/[0.07] bg-[#0d0f15] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-[#0f1118]"
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-30"
                  style={{ backgroundColor: color }}
                />

                {/* Icon */}
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-lg border"
                  style={{
                    background: `${color}0D`,
                    borderColor: `${color}22`,
                  }}
                >
                  <Icon
                    size={14}
                    style={{ color }}
                  />
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="mt-4 text-xs font-semibold leading-5 text-white">
                    {strategy.title}
                  </h3>

                  <p className="mt-1.5 line-clamp-3 text-[10px] leading-4 text-slate-500">
                    {strategy.description}
                  </p>
                </div>

                {/* Bottom metadata */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span
                    className="rounded-full px-2 py-1 text-[8px] font-medium"
                    style={{
                      background: `${color}12`,
                      color,
                    }}
                  >
                    Strategy
                  </span>

                  <span className="flex items-center gap-1 text-[9px] text-slate-700 transition-colors group-hover:text-slate-400">
                    Explore
                    <ArrowUpRight size={10} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="mt-5 sm:hidden">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 transition-colors hover:text-violet-300"
          >
            Explore the full strategy library
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}