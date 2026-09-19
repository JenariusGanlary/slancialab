"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FlaskConical,
  BarChart3,
  Lightbulb,
} from "lucide-react";

const insights = [
  {
    icon: FlaskConical,
    label: "EXPERIMENT",
    title: "Stop treating every post like a guess.",
    description:
      "Turn a content idea into a deliberate experiment with a hypothesis, target metric, and clear outcome.",
    color: "#8B5CF6",
  },
  {
    icon: BarChart3,
    label: "MEASURE",
    title: "Look beyond individual posts.",
    description:
      "Track your results over time and compare experiments against your own baseline to uncover meaningful patterns.",
    color: "#60A5FA",
  },
  {
    icon: Lightbulb,
    label: "LEARN",
    title: "Turn results into your playbook.",
    description:
      "Every experiment adds another piece of evidence about what resonates with your audience and what to test next.",
    color: "#34D399",
  },
];

export function Stats() {
  const [current, setCurrent] = useState(0);

  const previous = () => {
    setCurrent((prev) =>
      prev === 0 ? insights.length - 1 : prev - 1
    );
  };

  const next = () => {
    setCurrent((prev) =>
      prev === insights.length - 1 ? 0 : prev + 1
    );
  };

  const insight = insights[current];
  const Icon = insight.icon;

  return (
    <section className="relative overflow-hidden border-t border-white/[0.04]">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-[20%] top-1/2 h-[320px] w-[320px] -translate-y-1/2 rounded-full bg-violet-500/[0.025] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">

          {/* LEFT — Philosophy */}
          <div>
            <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-violet-400">
              Built around learning
            </div>

            <h2
              className="text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-4xl"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Your audience is
              <br />
              giving you data.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
              Slancialab helps you turn that data into better decisions.
              Instead of chasing viral posts, build a system that gets
              smarter every time you publish.
            </p>

            {/* Core loop */}
            <div className="mt-7 flex flex-wrap items-center gap-2">
              {[
                { label: "Experiment", color: "#8B5CF6" },
                { label: "Measure", color: "#60A5FA" },
                { label: "Learn", color: "#34D399" },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: `0 0 8px ${item.color}`,
                    }}
                  />

                  <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500">
                    {item.label}
                  </span>

                  {index < 2 && (
                    <span className="ml-1 text-slate-700">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Insight carousel */}
          <div>
            <div className="rounded-2xl border border-white/[0.07] bg-[#0d0f15]/90 p-6 backdrop-blur-sm sm:p-7">

              {/* Card header */}
              <div className="flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl border"
                  style={{
                    background: `${insight.color}0D`,
                    borderColor: `${insight.color}25`,
                  }}
                >
                  <Icon
                    size={18}
                    style={{ color: insight.color }}
                  />
                </div>

                <span
                  className="text-[9px] font-medium tracking-[0.16em]"
                  style={{ color: insight.color }}
                >
                  {insight.label}
                </span>
              </div>

              {/* Content */}
              <div className="mt-8 min-h-[145px]">
                <h3
                  className="max-w-lg text-2xl font-semibold leading-[1.15] tracking-[-0.025em] text-white sm:text-3xl"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  {insight.title}
                </h3>

                <p className="mt-4 max-w-lg text-sm leading-6 text-slate-500">
                  {insight.description}
                </p>
              </div>

              {/* Progress */}
              <div className="mt-7 flex items-center gap-1.5">
                {insights.map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    aria-label={`Show ${item.label} insight`}
                    onClick={() => setCurrent(index)}
                    className="group relative h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]"
                  >
                    <span
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                        index === current ? "w-full" : "w-0"
                      }`}
                      style={{
                        backgroundColor:
                          index === current
                            ? item.color
                            : "transparent",
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="mt-5 flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
                  {String(current + 1).padStart(2, "0")} /{" "}
                  {String(insights.length).padStart(2, "0")}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={previous}
                    aria-label="Previous insight"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] text-slate-500 transition-colors hover:border-white/[0.14] hover:bg-white/[0.03] hover:text-white"
                  >
                    <ArrowLeft size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next insight"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] text-slate-500 transition-colors hover:border-white/[0.14] hover:bg-white/[0.03] hover:text-white"
                  >
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}