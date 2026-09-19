import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-14">
          {/* Brand */}
          <div>
            <div
              className="text-xl font-semibold tracking-[-0.02em] text-white"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Slancialab
            </div>

            <p className="mt-3 max-w-xs text-xs leading-5 text-slate-500">
              An experimentation engine for X creators who want to stop
              guessing and start learning what actually works.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span className="text-[10px] uppercase tracking-[0.1em] text-slate-600">
                Built for creators
              </span>
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="mb-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Product
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <a
                href="#features"
                className="text-slate-500 transition-colors hover:text-white"
              >
                Features
              </a>

              <a
                href="#strategies"
                className="text-slate-500 transition-colors hover:text-white"
              >
                Strategies
              </a>

              <a
                href="#pricing"
                className="text-slate-500 transition-colors hover:text-white"
              >
                Pricing
              </a>

              <Link
                href="/leaderboard"
                className="text-slate-500 transition-colors hover:text-white"
              >
                Leaderboard
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <div className="mb-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Resources
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <a
                href="#faq"
                className="text-slate-500 transition-colors hover:text-white"
              >
                FAQ
              </a>

              <span className="text-slate-700">Blog · Coming soon</span>

              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1 text-slate-500 transition-colors hover:text-white"
              >
                Get started
                <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>

          {/* Early Access */}
          <div>
            <div className="mb-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Early access
            </div>

            <p className="max-w-xs text-xs leading-5 text-slate-500">
              Join Slancialab and start building your own growth system
              through experimentation.
            </p>

            <Link
              href="/sign-up"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-4 py-2.5 text-[11px] font-medium text-violet-300 transition-all hover:border-violet-400/30 hover:bg-violet-400/[0.1] hover:text-violet-200"
            >
              Get started for free
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.05] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-slate-700">
            © 2026 Slancialab. Built in public.
          </p>

          <p className="text-[10px] text-slate-700">
            Experiment. Learn. Grow.
          </p>
        </div>
      </div>
    </footer>
  );
}