import Link from "next/link";

export function FinalCta() {
  return (
    <section
      className="relative overflow-hidden border-t border-white/[0.04]"
      style={{
        background:
          "radial-gradient(650px circle at 20% 40%, rgba(124,108,247,0.13), transparent 60%), radial-gradient(650px circle at 80% 60%, rgba(34,197,94,0.09), transparent 60%)",
      }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.06] blur-[110px]" />

      <div className="relative mx-auto max-w-3xl px-6 py-16 text-center md:px-10 md:py-20">
        {/* Eyebrow */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span className="text-[9px] font-medium tracking-[0.14em] text-slate-500">
            START EXPERIMENTING
          </span>
        </div>

        {/* Heading */}
        <h2
          className="text-4xl font-semibold leading-[1.04] tracking-[-0.035em] text-white sm:text-5xl"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Your next post is an
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">
            experiment.
          </span>
        </h2>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-500">
          Stop relying on guesswork. Test what you believe, measure what
          happens, and build your own growth playbook over time.
        </p>

        {/* Actions */}
        <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <Link
            href="/sign-up"
            className="w-full rounded-full bg-violet-500 px-7 py-3 text-xs font-semibold text-white transition-all hover:bg-violet-400 active:scale-[0.97] sm:w-auto"
          >
            Start experimenting →
          </Link>

          <a
            href="#how-it-works"
            className="w-full rounded-full border border-white/[0.08] bg-white/[0.02] px-7 py-3 text-xs font-medium text-slate-400 transition-all hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white sm:w-auto"
          >
            See how it works
          </a>
        </div>

        {/* Reassurance */}
        <p className="mt-4 text-[10px] text-slate-700">
          No credit card required · Free during early access
        </p>
      </div>
    </section>
  );
}