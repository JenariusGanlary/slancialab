"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Is Slancialab free?",
    a: "The core experimentation workflow is free during early access. You can explore strategies, create experiments, track check-ins, and learn from your results without paying.",
  },
  {
    q: "Why do I have to manually enter my follower count?",
    a: "Automatic syncing with X requires API access and additional infrastructure. Manual check-ins keep the core product simple and accessible. Automatic syncing is planned for a future paid feature.",
  },
  {
    q: "Is my data private?",
    a: "Your experiments, check-ins, and dashboard data are private to you. Public strategy insights can use aggregated data without exposing your individual experiments or dashboard.",
  },
  {
    q: "How is Slancialab different from other growth tools?",
    a: "Most tools focus on showing analytics after you post. Slancialab is built around experimentation: choose a strategy, define what you're testing, measure the result, learn from it, and use that information to decide what to test next.",
  },
  {
    q: "Do I need to be an experienced creator?",
    a: "No. Slancialab is designed for creators at different stages. Start with a simple experiment, learn from the result, and gradually build a content system around what works for your audience.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative overflow-hidden border-t border-white/[0.04]"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.02] blur-[120px]" />

      <div className="relative mx-auto max-w-3xl px-6 py-14 md:px-10 md:py-16">
        {/* Heading */}
        <div className="mb-8 text-center">
          <div className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-violet-400">
            FAQ
          </div>

          <h2
            className="text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-4xl"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Frequently asked questions
          </h2>

          <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-slate-500">
            Everything you need to know about getting started with
            Slancialab.
          </p>
        </div>

        {/* FAQ list */}
        <div className="border-t border-white/[0.07]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.q}
                className="border-b border-white/[0.07]"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-4.5 text-left"
                >
                  <span className="text-sm font-medium text-white transition-colors">
                    {faq.q}
                  </span>

                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                      isOpen
                        ? "border-violet-400/40 bg-violet-400/10 text-violet-300"
                        : "border-white/[0.08] text-slate-600 hover:border-white/[0.15] hover:text-slate-400"
                    }`}
                  >
                    <Plus
                      size={14}
                      className={`transition-transform duration-200 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    />
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-200 ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 pb-4"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pr-10 text-xs leading-5 text-slate-500">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}