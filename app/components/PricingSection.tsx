"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";

type FeatureValue = string | boolean;

type Feature = {
  name: string;
  free: FeatureValue;
  pro: FeatureValue;
  creator: FeatureValue;
};

const features: Feature[] = [
  {
    name: "Experiments",
    free: "Up to 3",
    pro: "Unlimited",
    creator: "Unlimited",
  },
  {
    name: "Strategy library",
    free: "Basic",
    pro: "Full",
    creator: "Full",
  },
  {
    name: "Manual data entry",
    free: true,
    pro: true,
    creator: true,
  },
  {
    name: "Community access",
    free: true,
    pro: true,
    creator: true,
  },
  {
    name: "Advanced analytics",
    free: false,
    pro: true,
    creator: true,
  },
  {
    name: "AI-powered insights",
    free: false,
    pro: true,
    creator: true,
  },
  {
    name: "Export your data",
    free: false,
    pro: true,
    creator: true,
  },
  {
    name: "Priority support",
    free: false,
    pro: true,
    creator: true,
  },
  {
    name: "Content ideation tools",
    free: false,
    pro: false,
    creator: true,
  },
  {
    name: "Advanced recommendations",
    free: false,
    pro: false,
    creator: true,
  },
  {
    name: "Team collaboration",
    free: false,
    pro: false,
    creator: true,
  },
  {
    name: "Early access to new features",
    free: false,
    pro: false,
    creator: true,
  },
];

const plans = [
  {
    name: "Free",
    description: "Explore the core experimentation loop.",
    monthly: "0",
    yearly: "0",
    key: "free" as const,
    button: "Get Started",
    highlighted: false,
    available: true,
  },
  {
    name: "Pro",
    description: "For creators who want deeper insights.",
    monthly: "12",
    yearly: "9.60",
    key: "pro" as const,
    button: "Coming Soon",
    highlighted: true,
    available: false,
  },
  {
    name: "Creator+",
    description: "For advanced workflows and teams.",
    monthly: "24",
    yearly: "19.20",
    key: "creator" as const,
    button: "Coming Soon",
    highlighted: false,
    available: false,
  },
];

function FeatureRow({
  feature,
  plan,
}: {
  feature: Feature;
  plan: "free" | "pro" | "creator";
}) {
  const value = feature[plan];

  if (value === false) {
    return (
      <li className="flex items-center gap-2.5 text-xs text-slate-700">
        <X
          size={14}
          strokeWidth={2}
          className="shrink-0"
        />

        <span>{feature.name}</span>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2.5 text-xs text-slate-400">
      <Check
        size={14}
        strokeWidth={2}
        className="shrink-0 text-emerald-400"
      />

      <span>
        {feature.name}

        {typeof value === "string" && (
          <span className="text-slate-300"> · {value}</span>
        )}
      </span>
    </li>
  );
}

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section
      id="pricing"
      className="relative overflow-hidden border-t border-white/[0.04]"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute right-[15%] top-1/2 h-[360px] w-[360px] -translate-y-1/2 rounded-full bg-violet-500/[0.025] blur-[130px]" />

      <div className="relative mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
        {/* Header */}
        <div className="mb-9 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-violet-400">
              Pricing
            </div>

            <h2
              className="text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-4xl"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Start free.
              <br />
              Upgrade when you need more.
            </h2>

            <p className="mt-3 max-w-md text-xs leading-5 text-slate-500">
              Explore the experimentation workflow for free. Paid plans will
              unlock deeper analytics, insights, and advanced workflows.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-white/[0.07] bg-[#0d0f15] p-1">
              <button
                type="button"
                onClick={() => setYearly(false)}
                className={`rounded-full px-4 py-2 text-[11px] font-medium transition-all ${
                  !yearly
                    ? "bg-violet-500 text-white"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                Monthly
              </button>

              <button
                type="button"
                onClick={() => setYearly(true)}
                className={`rounded-full px-4 py-2 text-[11px] font-medium transition-all ${
                  yearly
                    ? "bg-violet-500 text-white"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                Yearly
              </button>
            </div>

            <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[9px] font-medium text-emerald-400">
              Save 20%
            </span>
          </div>
        </div>

        {/* Plans */}
        <div className="grid items-stretch gap-3 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex min-h-[560px] flex-col rounded-2xl p-6 transition-all ${
                plan.highlighted
                  ? "border border-violet-400/40 bg-[#10101a] shadow-[0_0_50px_rgba(124,108,247,0.08)]"
                  : "border border-white/[0.07] bg-[#0d0f15]"
              }`}
            >
              {/* Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-2.5 left-5">
                  <span className="rounded-full bg-violet-500 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] text-white">
                    Most popular
                  </span>
                </div>
              )}

              {/* Plan heading */}
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {plan.name}
                </h3>

                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mt-7">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-4xl font-semibold tracking-[-0.03em] text-white"
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    ${yearly ? plan.yearly : plan.monthly}
                  </span>

                  <span className="text-[10px] text-slate-600">
                    / month
                  </span>
                </div>

                {yearly && plan.monthly !== "0" && (
                  <p className="mt-1 text-[9px] text-slate-600">
                    billed annually
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-white/[0.06]" />

              {/* Features */}
              <div className="flex-1">
                <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.14em] text-slate-600">
                  What&apos;s included
                </p>

                <ul className="space-y-3">
                  {features.map((feature) => (
                    <FeatureRow
                      key={feature.name}
                      feature={feature}
                      plan={plan.key}
                    />
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="mt-7">
                {plan.available ? (
                  <Link
                    href="/sign-up"
                    className={`block w-full rounded-xl px-5 py-3 text-center text-xs font-semibold transition-all ${
                      plan.highlighted
                        ? "bg-violet-500 text-white hover:bg-violet-400"
                        : "border border-white/[0.08] text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    {plan.button}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-white/[0.06] px-5 py-3 text-xs font-medium text-slate-600"
                  >
                    {plan.button}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="mt-6 text-center text-[10px] text-slate-700">
          Paid plans are coming soon. Your free account will remain available
          while Slancialab is in early access.
        </p>
      </div>
    </section>
  );
}