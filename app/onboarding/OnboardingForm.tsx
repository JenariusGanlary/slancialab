"use client";

import { useMemo, useState } from "react";

type OnboardingFormProps = {
  niches: string[];
  stages: string[];
  action: (formData: FormData) => void | Promise<void>;
};

type Category = {
  name: string;
  description: string;
  symbol: string;
};

const CORE_CATEGORIES: Category[] = [
  {
    name: "Technology",
    description: "Software, tools, platforms",
    symbol: "⌘",
  },
  {
    name: "SaaS & Startups",
    description: "Products, startups, indie hacking",
    symbol: "◇",
  },
  {
    name: "AI & Automation",
    description: "AI, agents, automation",
    symbol: "✦",
  },
  {
    name: "Developer & Engineering",
    description: "Code, systems, engineering",
    symbol: "</>",
  },
  {
    name: "Data & Analytics",
    description: "Data, BI, analytics, insights",
    symbol: "▥",
  },
  {
    name: "Finance & Investing",
    description: "Markets, investing, personal finance",
    symbol: "₿",
  },
  {
    name: "Business & Entrepreneurship",
    description: "Founders, business, operations",
    symbol: "◇",
  },
  {
    name: "Marketing & Growth",
    description: "Marketing, growth, distribution",
    symbol: "↗",
  },
  {
    name: "Content & Creator Economy",
    description: "Creators, media, audience building",
    symbol: "◎",
  },
  {
    name: "Design & Creativity",
    description: "Design, branding, visual creativity",
    symbol: "✧",
  },
  {
    name: "Product & Product Management",
    description: "Product thinking, UX, roadmaps",
    symbol: "□",
  },
  {
    name: "E-commerce",
    description: "Online stores, DTC, marketplaces",
    symbol: "◇",
  },
  {
    name: "Crypto & Web3",
    description: "Crypto, blockchain, web3",
    symbol: "₿",
  },
  {
    name: "Career & Education",
    description: "Learning, skills, career growth",
    symbol: "△",
  },
  {
    name: "Productivity",
    description: "Systems, habits, workflows",
    symbol: "＋",
  },
  {
    name: "Health & Fitness",
    description: "Training, nutrition, wellness",
    symbol: "♡",
  },
  {
    name: "Personal Development",
    description: "Mindset, discipline, self-improvement",
    symbol: "✦",
  },
  {
    name: "Lifestyle",
    description: "Life, routines, minimalism",
    symbol: "○",
  },
  {
    name: "Science",
    description: "Research, discovery, science",
    symbol: "⚗",
  },
  {
    name: "Gaming",
    description: "Games, gaming culture, esports",
    symbol: "◇",
  },
  {
    name: "Sports",
    description: "Sports, performance, athletics",
    symbol: "◉",
  },
  {
    name: "Travel",
    description: "Travel, destinations, experiences",
    symbol: "↗",
  },
  {
    name: "Real Estate",
    description: "Property, housing, real estate",
    symbol: "□",
  },
  {
    name: "News & Media",
    description: "Media, journalism, current events",
    symbol: "≡",
  },
  {
    name: "Relationships",
    description: "Communication, dating, family",
    symbol: "♡",
  },
  {
    name: "Other",
    description: "Something else you're building around",
    symbol: "•••",
  },
];

const GOALS = [
  {
    value: "Grow my audience",
    title: "Grow my audience",
    description: "Reach more of the right people on X.",
    symbol: "↗",
  },
  {
    value: "Build authority",
    title: "Build authority",
    description: "Become known for something specific.",
    symbol: "◎",
  },
  {
    value: "Get customers",
    title: "Get customers",
    description: "Turn attention into real opportunities.",
    symbol: "◇",
  },
  {
    value: "Build in public",
    title: "Build in public",
    description: "Share the journey and attract people along the way.",
    symbol: "◌",
  },
  {
    value: "Monetize my audience",
    title: "Monetize my audience",
    description: "Build an audience that can support a business.",
    symbol: "₿",
  },
  {
    value: "Learn what works",
    title: "Learn what works",
    description: "Stop guessing and understand your own signals.",
    symbol: "✦",
  },
  {
    value: "I'm figuring it out",
    title: "I'm figuring it out",
    description: "I want Slancialab to help me find the direction.",
    symbol: "?",
  },
];

const FIRST_ACTIONS = [
  {
    value: "Study creators",
    title: "Study creators",
    description: "See what people in my space are already doing.",
    symbol: "◎",
  },
  {
    value: "Run an experiment",
    title: "Run an experiment",
    description: "Turn an idea into something I can actually test.",
    symbol: "⚗",
  },
  {
    value: "Understand my content",
    title: "Understand my content",
    description: "Find patterns in what I've already published.",
    symbol: "⌁",
  },
  {
    value: "Find my strategy",
    title: "Find my strategy",
    description: "Help me figure out what I should test first.",
    symbol: "✦",
  },
  {
    value: "I'm not sure yet",
    title: "I'm not sure yet",
    description: "That's exactly why I'm here.",
    symbol: "?",
  },
];

const FALLBACK_STAGES = [
  "Just getting started",
  "Under 1K followers",
  "1K–10K followers",
  "10K–50K followers",
  "50K–100K followers",
  "100K+ followers",
];

function ArrowRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 9H14.5M10 4.5L14.5 9L10 13.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14.5 9H3.5M8 4.5L3.5 9L8 13.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8.2L6.7 11.2L12.7 4.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OnboardingForm({
  niches,
  stages,
  action,
}: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [followerStage, setFollowerStage] = useState("");
  const [goal, setGoal] = useState("");
  const [firstAction, setFirstAction] = useState("");
  const [search, setSearch] = useState("");

  const totalSteps = 5;

  const availableStages =
    stages.length > 0 ? stages : FALLBACK_STAGES;

  const categories = useMemo(() => {
    const existing = new Set(
      CORE_CATEGORIES.map((item) => item.name)
    );

    const databaseCategories: Category[] = niches
      .filter((niche) => !existing.has(niche))
      .map((niche) => ({
        name: niche,
        description:
          "Explore creators and strategies in this space",
        symbol: "✦",
      }));

    return [...CORE_CATEGORIES, ...databaseCategories];
  }, [niches]);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return categories;
    }

    return categories.filter(
      (category) =>
        category.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        category.description
          .toLowerCase()
          .includes(normalizedSearch)
    );
  }, [categories, search]);

  const toggleNiche = (name: string) => {
    setSelectedNiches((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  };

  const canContinue =
    step === 1
      ? selectedNiches.length > 0
      : step === 2
        ? Boolean(followerStage)
        : step === 3
          ? Boolean(goal)
          : step === 4
            ? Boolean(firstAction)
            : true;

  const nextStep = () => {
    if (!canContinue) return;

    setSearch("");

    if (step < totalSteps) {
      setStep((current) => current + 1);
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setSearch("");
      setStep((current) => current - 1);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-89px)] w-full overflow-hidden">
      <style>{`
        @keyframes slanciaFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slanciaFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slanciaGlow {
          0%, 100% {
            opacity: .28;
          }
          50% {
            opacity: .5;
          }
        }

        @keyframes slanciaFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -10px, 0);
          }
        }

        .slancia-step-enter {
          animation: slanciaFadeUp .55s cubic-bezier(.22, 1, .36, 1) both;
        }

        .slancia-fade {
          animation: slanciaFade .7s ease both;
        }

        .slancia-glow {
          animation: slanciaGlow 7s ease-in-out infinite;
        }

        .slancia-float {
          animation: slanciaFloat 8s ease-in-out infinite;
        }

        .slancia-option {
          transition:
            border-color .25s ease,
            background-color .25s ease,
            transform .25s ease,
            box-shadow .25s ease;
        }

        .slancia-option:hover {
          transform: translateY(-2px);
        }

        .slancia-button {
          transition:
            transform .2s ease,
            box-shadow .25s ease,
            background-color .25s ease,
            opacity .2s ease;
        }

        .slancia-button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .slancia-button:active:not(:disabled) {
          transform: translateY(0);
        }

        /*
         * SHORT LAPTOP / 13-INCH DISPLAY MODE
         *
         * Targets shorter browser viewports such as:
         * 1366x768
         * 1280x720
         * 1280x800 with browser chrome
         *
         * The design stays the same, but vertical spacing
         * becomes more compact so the footer and primary
         * controls remain visible.
         */
        @media (max-height: 820px) and (min-width: 1024px) {
          .slancia-short-header {
            padding-bottom: 12px !important;
          }

          .slancia-short-main {
            padding-top: 22px !important;
            padding-bottom: 18px !important;
          }

          .slancia-short-grid {
            gap: 28px !important;
            padding-top: 22px !important;
          }

          .slancia-short-left {
            padding-right: 34px !important;
          }

          .slancia-short-eyebrow {
            margin-bottom: 16px !important;
          }

          .slancia-short-heading {
            font-size: clamp(3rem, 4.8vw, 4.8rem) !important;
            line-height: .84 !important;
          }

          .slancia-short-description {
            margin-top: 20px !important;
            font-size: 13px !important;
            line-height: 1.6 !important;
          }

          .slancia-short-secondary {
            margin-top: 12px !important;
            font-size: 11px !important;
            line-height: 1.55 !important;
          }

          .slancia-short-editorial {
            margin-top: 18px !important;
          }

          .slancia-short-step-header {
            margin-bottom: 18px !important;
            padding-bottom: 12px !important;
          }

          .slancia-short-step-title {
            font-size: clamp(1.7rem, 2.8vw, 2.8rem) !important;
          }

          .slancia-short-step-copy {
            margin-bottom: 16px !important;
            font-size: 12px !important;
            line-height: 1.55 !important;
          }

          .slancia-short-search {
            margin-bottom: 12px !important;
          }

          .slancia-short-category-grid {
            max-height: 38vh !important;
            gap: 8px !important;
          }

          .slancia-short-category-card {
            min-height: 94px !important;
            padding: 14px !important;
          }

          .slancia-short-category-card .category-card-content {
            margin-top: 14px !important;
          }

          .slancia-short-option-grid {
            gap: 8px !important;
          }

          .slancia-short-option-card {
            min-height: 94px !important;
            padding: 16px !important;
          }

          .slancia-short-option-card .option-card-content {
            margin-top: 16px !important;
          }

          .slancia-short-footer {
            margin-top: 16px !important;
            padding-top: 12px !important;
          }

          .slancia-short-footer-note {
            margin-top: 10px !important;
          }

          .slancia-short-button {
            height: 44px !important;
          }
        }

        /*
         * VERY SHORT LAPTOP MODE
         *
         * Prevents the composition from becoming vertically
         * cramped on 720px-ish browser viewports.
         */
        @media (max-height: 740px) and (min-width: 1024px) {
          .slancia-very-short-main {
            padding-top: 14px !important;
            padding-bottom: 12px !important;
          }

          .slancia-very-short-grid {
            gap: 20px !important;
            padding-top: 16px !important;
          }

          .slancia-very-short-left {
            padding-right: 24px !important;
          }

          .slancia-very-short-heading {
            font-size: clamp(2.7rem, 4vw, 4rem) !important;
          }

          .slancia-very-short-description {
            margin-top: 14px !important;
            font-size: 12px !important;
          }

          .slancia-very-short-editorial {
            display: none !important;
          }

          .slancia-very-short-step-header {
            margin-bottom: 12px !important;
          }

          .slancia-very-short-step-title {
            font-size: clamp(1.5rem, 2.4vw, 2.3rem) !important;
          }

          .slancia-very-short-category-grid {
            max-height: 33vh !important;
          }

          .slancia-very-short-footer {
            margin-top: 10px !important;
            padding-top: 10px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .slancia-step-enter,
          .slancia-fade,
          .slancia-glow,
          .slancia-float {
            animation: none !important;
          }

          .slancia-option,
          .slancia-button {
            transition: none !important;
          }
        }
      `}</style>

      {/* Cinematic image layer */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/onboarding-nebula.png')",
          opacity: 0.34,
        }}
      />

      {/* Dark cinematic treatment */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,9,10,0.76)_0%,rgba(7,9,10,0.58)_34%,rgba(7,9,10,0.9)_67%,rgba(7,9,10,0.97)_100%)]" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_55%,rgba(217,164,65,0.12),transparent_30%),radial-gradient(circle_at_78%_72%,rgba(113,97,168,0.09),transparent_32%)]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#080A0B] via-[#080A0B]/70 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#080A0B] via-[#080A0B]/70 to-transparent" />

      {/* Main experience */}
      <div
        className="
          relative z-10 mx-auto flex min-h-[calc(100vh-89px)]
          w-full max-w-[1500px] flex-col
          px-5 pb-8 pt-4
          sm:px-8
          lg:px-12
          slancia-short-main
          slancia-very-short-main
        "
      >
        {/* Top workspace bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.07] pb-5 slancia-short-header">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D9A441]/30 bg-[#0B0D0E]/70 text-[#D9A441] shadow-[0_0_35px_rgba(217,164,65,0.08)] backdrop-blur-xl">
              <span className="text-base">✦</span>
            </div>

            <div>
              <div
                className="text-[15px] font-semibold tracking-[-0.02em] text-[#F0EBE1]"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Slancialab
              </div>

              <div className="mt-0.5 text-[8px] uppercase tracking-[0.24em] text-[#636A68]">
                Growth experimentation system
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <div className="text-right">
              <div className="text-[8px] uppercase tracking-[0.25em] text-[#6A706E]">
                Getting started
              </div>

              <div className="mt-1 text-[11px] text-[#9A9F9D]">
                {step === 1
                  ? "Your space"
                  : step === 2
                    ? "Your starting point"
                    : step === 3
                      ? "Your direction"
                      : step === 4
                        ? "Your first move"
                        : "Your experiment path"}
              </div>
            </div>

            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map(
                (_, index) => (
                  <div
                    key={index}
                    className={`h-[3px] w-8 rounded-full transition-all duration-500 ${
                      index + 1 <= step
                        ? "bg-[#D9A441] shadow-[0_0_12px_rgba(217,164,65,0.45)]"
                        : "bg-white/[0.09]"
                    }`}
                  />
                )
              )}
            </div>

            <div className="font-mono text-[10px] tracking-[0.12em] text-[#777D7A]">
              0{step} / 05
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="
            grid flex-1 grid-cols-1 gap-10 pt-8
            lg:grid-cols-[minmax(360px,0.72fr)_minmax(650px,1.28fr)]
            lg:gap-16 lg:pt-12
            slancia-short-grid
            slancia-very-short-grid
          "
        >
          {/* LEFT EDITORIAL PANEL */}
          <aside
            className="
              relative flex flex-col justify-between
              border-b border-white/[0.07]
              pb-8
              lg:border-b-0 lg:border-r lg:pb-0 lg:pr-14
              slancia-short-left
              slancia-very-short-left
            "
          >
            <div>
              <div className="mb-7 flex items-center gap-3 slancia-short-eyebrow">
                <div className="h-px w-8 bg-[#D9A441]" />

                <span className="text-[9px] uppercase tracking-[0.28em] text-[#8A8171]">
                  {step === 1
                    ? "Build with evidence"
                    : step === 2
                      ? "Know your starting point"
                      : step === 3
                        ? "Define the direction"
                        : step === 4
                          ? "Choose your first move"
                          : "Your lab is ready"}
                </span>
              </div>

              <div className="slancia-fade">
                <h1
                  className="
                    max-w-[570px]
                    text-[clamp(3.8rem,6vw,6.8rem)]
                    leading-[0.84]
                    tracking-[-0.065em]
                    text-[#F1ECE2]
                    slancia-short-heading
                    slancia-very-short-heading
                  "
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  {step === 1 && (
                    <>
                      Stop
                      <br />
                      guessing.
                      <br />
                      <div className="h-5 sm:h-7" />

                      <span className="bg-gradient-to-r from-[#D9A441] via-[#E7B650] to-[#B68AD7] bg-clip-text text-transparent">
                        Start
                        <br />
                        experimenting.
                      </span>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      Know
                      <br />
                      where you
                      <br />
                      <span className="bg-gradient-to-r from-[#D9A441] to-[#C995D8] bg-clip-text text-transparent">
                        stand.
                      </span>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      Give your
                      <br />
                      growth a
                      <br />
                      <span className="bg-gradient-to-r from-[#D9A441] via-[#E7B650] to-[#B68AD7] bg-clip-text text-transparent">
                        direction.
                      </span>
                    </>
                  )}

                  {step === 4 && (
                    <>
                      Turn
                      <br />
                      curiosity
                      <br />
                      <span className="bg-gradient-to-r from-[#D9A441] to-[#B68AD7] bg-clip-text text-transparent">
                        into action.
                      </span>
                    </>
                  )}

                  {step === 5 && (
                    <>
                      Your
                      <br />
                      growth
                      <br />
                      <span className="bg-gradient-to-r from-[#D9A441] via-[#E7B650] to-[#B68AD7] bg-clip-text text-transparent">
                        starts here.
                      </span>
                    </>
                  )}
                </h1>

                <p
                  className="
                    mt-8 max-w-[510px]
                    text-[15px] leading-7 text-[#949A97]
                    slancia-short-description
                    slancia-very-short-description
                  "
                >
                  {step === 1 &&
                    "Your growth on X shouldn't depend on whatever the algorithm happens to reward today."}

                  {step === 2 &&
                    "Every creator starts somewhere. Your stage gives Slancialab the context to make the experiments useful."}

                  {step === 3 &&
                    "Growth means different things to different people. Tell us what outcome would actually matter to you."}

                  {step === 4 &&
                    "There is no perfect place to start. Pick the path that feels most useful right now."}

                  {step === 5 &&
                    "You give us the context. Slancialab gives you a system for discovering, testing, measuring, and learning."}
                </p>

                <p
                  className="
                    mt-5 max-w-[500px]
                    text-[13px] leading-6 text-[#646B68]
                    slancia-short-secondary
                  "
                >
                  {step === 1 &&
                    "We'll use this to surface creators, patterns, strategies, and experiments that are actually relevant to you."}

                  {step === 2 &&
                    "This isn't a judgment. It's simply a baseline so the system knows what kind of evidence to show you."}

                  {step === 3 &&
                    "Your goal helps us distinguish between experiments that look interesting and experiments that move you forward."}

                  {step === 4 &&
                    "You can change this later. The point is to give your first session a direction instead of another blank dashboard."}

                  {step === 5 &&
                    "Nothing is locked in. Your profile can evolve as your audience, content, and goals evolve."}
                </p>
              </div>
            </div>

            {/* Editorial footer */}
            <div className="mt-10 hidden lg:block slancia-short-editorial slancia-very-short-editorial">
              <div className="mb-8 flex max-w-[520px] border-t border-white/[0.07] pt-6">
                <div className="flex-1">
                  <div className="text-2xl text-[#EEE8DD]">
                    01
                  </div>
                  <div className="mt-1 text-[8px] uppercase tracking-[0.24em] text-[#5F6663]">
                    Discover
                  </div>
                </div>

                <div className="border-l border-white/[0.07] pl-8">
                  <div className="text-2xl text-[#EEE8DD]">
                    02
                  </div>
                  <div className="mt-1 text-[8px] uppercase tracking-[0.24em] text-[#5F6663]">
                    Experiment
                  </div>
                </div>

                <div className="border-l border-white/[0.07] pl-8">
                  <div className="text-2xl text-[#EEE8DD]">
                    03
                  </div>
                  <div className="mt-1 text-[8px] uppercase tracking-[0.24em] text-[#5F6663]">
                    Learn
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[8px] uppercase tracking-[0.25em] text-[#626966]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D9A441] shadow-[0_0_12px_rgba(217,164,65,0.65)]" />
                Growth with evidence
              </div>
            </div>
          </aside>

          {/* RIGHT INTERACTION PANEL */}
          <section className="relative min-w-0">
            <div
              key={step}
              className="slancia-step-enter flex h-full flex-col"
            >
              {/* STEP HEADER */}
              <div
                className="
                  mb-8 flex items-end justify-between
                  border-b border-white/[0.07] pb-5
                  slancia-short-step-header
                  slancia-very-short-step-header
                "
              >
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#D9A441]">
                      Step 0{step}
                    </span>

                    <div className="h-px w-12 bg-[#D9A441]/50" />
                  </div>

                  <h2
                    className="
                      max-w-[850px]
                      text-[clamp(2rem,3.5vw,4rem)]
                      leading-[0.96]
                      tracking-[-0.045em]
                      text-[#F0EBE1]
                      slancia-short-step-title
                      slancia-very-short-step-title
                    "
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    {step === 1 &&
                      "What are you here to build?"}

                    {step === 2 &&
                      "Where are you starting from?"}

                    {step === 3 &&
                      "What are you trying to achieve?"}

                    {step === 4 &&
                      "What should we help you do first?"}

                    {step === 5 &&
                      "Ready to build your growth system?"}
                  </h2>
                </div>

                <div className="hidden text-right lg:block">
                  <div className="text-[8px] uppercase tracking-[0.25em] text-[#555C59]">
                    Profile setup
                  </div>

                  <div className="mt-2 font-mono text-[10px] text-[#7D8380]">
                    0{step} / 05
                  </div>
                </div>
              </div>

              {/* STEP 1 */}
              {step === 1 && (
                <div className="flex min-h-0 flex-1 flex-col">
                  <p
                    className="
                      mb-7 max-w-[850px]
                      text-[14px] leading-6 text-[#777E7B]
                      slancia-short-step-copy
                    "
                  >
                    Choose every area you genuinely want to create
                    around. We'll use this to surface creators,
                    patterns, strategies, and experiments that are
                    actually relevant to you.
                  </p>

                  <div className="mb-5 flex flex-col gap-3 sm:flex-row slancia-short-search">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6B716E]">
                        ⌕
                      </span>

                      <input
                        value={search}
                        onChange={(event) =>
                          setSearch(event.target.value)
                        }
                        placeholder="Search a category..."
                        className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/25 pl-11 pr-4 text-sm text-[#ECE7DC] outline-none backdrop-blur-md placeholder:text-[#4F5653] transition focus:border-[#D9A441]/45 focus:bg-black/35"
                      />
                    </div>

                    <div className="flex h-12 items-center rounded-xl border border-white/[0.09] bg-black/25 px-4 text-[10px] uppercase tracking-[0.18em] text-[#666D6A] backdrop-blur-md">
                      {selectedNiches.length > 0
                        ? `${selectedNiches.length} selected`
                        : "Select multiple"}
                    </div>
                  </div>

                  <div
                    className="
                      grid max-h-[52vh]
                      grid-cols-1 gap-3 overflow-y-auto pr-1
                      sm:grid-cols-2
                      xl:grid-cols-3
                      slancia-short-category-grid
                      slancia-very-short-category-grid
                    "
                  >
                    {filteredCategories.map((category) => {
                      const selected =
                        selectedNiches.includes(category.name);

                      return (
                        <button
                          key={category.name}
                          type="button"
                          onClick={() =>
                            toggleNiche(category.name)
                          }
                          className={`slancia-option group relative rounded-2xl border text-left slancia-short-category-card ${
                            selected
                              ? "border-[#D9A441]/75 bg-[#D9A441]/[0.075] shadow-[0_0_35px_rgba(217,164,65,0.08)]"
                              : "border-white/[0.085] bg-black/20 hover:border-white/[0.18] hover:bg-white/[0.025]"
                          } min-h-[122px] p-5`}
                        >
                          <div className="flex items-start justify-between">
                            <span
                              className={`text-[15px] ${
                                selected
                                  ? "text-[#D9A441]"
                                  : "text-[#8E9491]"
                              }`}
                            >
                              {category.symbol}
                            </span>

                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md border text-[#080A0B] transition ${
                                selected
                                  ? "border-[#D9A441] bg-[#D9A441]"
                                  : "border-white/[0.18] bg-transparent"
                              }`}
                            >
                              {selected && <CheckMark />}
                            </span>
                          </div>

                          <div className="mt-7 category-card-content">
                            <div className="text-[14px] font-medium tracking-[-0.01em] text-[#E5E0D6]">
                              {category.name}
                            </div>

                            <div className="mt-1.5 text-[11px] leading-5 text-[#656C69]">
                              {category.description}
                            </div>
                          </div>

                          {selected && (
                            <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-[#D9A441] to-transparent" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {filteredCategories.length === 0 && (
                    <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-white/[0.09] text-sm text-[#666D6A]">
                      No category matches that search.
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="flex flex-1 flex-col">
                  <p
                    className="
                      mb-8 max-w-[780px]
                      text-[14px] leading-6 text-[#777E7B]
                      slancia-short-step-copy
                    "
                  >
                    Tell us roughly where you are today. This gives
                    your experiments the right baseline and keeps
                    comparisons meaningful.
                  </p>

                  <div className="grid max-w-[900px] grid-cols-1 gap-3 sm:grid-cols-2 slancia-short-option-grid">
                    {availableStages.map((stage, index) => {
                      const selected =
                        followerStage === stage;

                      return (
                        <button
                          key={stage}
                          type="button"
                          onClick={() =>
                            setFollowerStage(stage)
                          }
                          className={`slancia-option group relative rounded-2xl border p-6 text-left slancia-short-option-card ${
                            selected
                              ? "border-[#D9A441]/75 bg-[#D9A441]/[0.075] shadow-[0_0_35px_rgba(217,164,65,0.08)]"
                              : "border-white/[0.085] bg-black/20 hover:border-white/[0.18] hover:bg-white/[0.025]"
                          } min-h-[120px]`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-mono text-[10px] tracking-[0.2em] text-[#D9A441]/70">
                              0{index + 1}
                            </span>

                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md border text-[#080A0B] ${
                                selected
                                  ? "border-[#D9A441] bg-[#D9A441]"
                                  : "border-white/[0.18]"
                              }`}
                            >
                              {selected && <CheckMark />}
                            </span>
                          </div>

                          <div className="mt-8 text-[16px] text-[#E5E0D6] option-card-content">
                            {stage}
                          </div>

                          <div className="mt-1 text-[11px] text-[#626966]">
                            Your current X starting point
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#555C59]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9A441]" />
                    You can update this later
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="flex flex-1 flex-col">
                  <p
                    className="
                      mb-8 max-w-[800px]
                      text-[14px] leading-6 text-[#777E7B]
                      slancia-short-step-copy
                    "
                  >
                    There isn't one definition of growth. Pick the
                    outcome that matters most to you right now —
                    we'll use it to shape your experiments.
                  </p>

                  <div className="grid max-w-[1000px] grid-cols-1 gap-3 md:grid-cols-2 slancia-short-option-grid">
                    {GOALS.map((item) => {
                      const selected =
                        goal === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() =>
                            setGoal(item.value)
                          }
                          className={`slancia-option relative rounded-2xl border p-6 text-left slancia-short-option-card ${
                            selected
                              ? "border-[#D9A441]/75 bg-[#D9A441]/[0.075] shadow-[0_0_35px_rgba(217,164,65,0.08)]"
                              : "border-white/[0.085] bg-black/20 hover:border-white/[0.18] hover:bg-white/[0.025]"
                          } min-h-[132px]`}
                        >
                          <div className="flex items-start justify-between">
                            <span
                              className={`text-lg ${
                                selected
                                  ? "text-[#D9A441]"
                                  : "text-[#777E7B]"
                              }`}
                            >
                              {item.symbol}
                            </span>

                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md border text-[#080A0B] ${
                                selected
                                  ? "border-[#D9A441] bg-[#D9A441]"
                                  : "border-white/[0.18]"
                              }`}
                            >
                              {selected && <CheckMark />}
                            </span>
                          </div>

                          <div className="mt-7 text-[15px] text-[#E5E0D6] option-card-content">
                            {item.title}
                          </div>

                          <div className="mt-1.5 max-w-[380px] text-[11px] leading-5 text-[#626966]">
                            {item.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="flex flex-1 flex-col">
                  <p
                    className="
                      mb-8 max-w-[800px]
                      text-[14px] leading-6 text-[#777E7B]
                      slancia-short-step-copy
                    "
                  >
                    Your first session should answer a real question,
                    not leave you staring at another dashboard. Where
                    would you like to begin?
                  </p>

                  <div className="grid max-w-[1000px] grid-cols-1 gap-3 md:grid-cols-2 slancia-short-option-grid">
                    {FIRST_ACTIONS.map((item) => {
                      const selected =
                        firstAction === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() =>
                            setFirstAction(item.value)
                          }
                          className={`slancia-option relative rounded-2xl border p-6 text-left slancia-short-option-card ${
                            selected
                              ? "border-[#D9A441]/75 bg-[#D9A441]/[0.075] shadow-[0_0_35px_rgba(217,164,65,0.08)]"
                              : "border-white/[0.085] bg-black/20 hover:border-white/[0.18] hover:bg-white/[0.025]"
                          } min-h-[142px]`}
                        >
                          <div className="flex items-start justify-between">
                            <span
                              className={`text-lg ${
                                selected
                                  ? "text-[#D9A441]"
                                  : "text-[#777E7B]"
                              }`}
                            >
                              {item.symbol}
                            </span>

                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md border text-[#080A0B] ${
                                selected
                                  ? "border-[#D9A441] bg-[#D9A441]"
                                  : "border-white/[0.18]"
                              }`}
                            >
                              {selected && <CheckMark />}
                            </span>
                          </div>

                          <div className="mt-8 text-[15px] text-[#E5E0D6] option-card-content">
                            {item.title}
                          </div>

                          <div className="mt-1.5 max-w-[390px] text-[11px] leading-5 text-[#626966]">
                            {item.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5 */}
              {step === 5 && (
                <div className="flex flex-1 flex-col">
                  <p
                    className="
                      mb-8 max-w-[800px]
                      text-[14px] leading-6 text-[#777E7B]
                      slancia-short-step-copy
                    "
                  >
                    Here's the context we'll use to personalize your
                    first experiments. Nothing is permanent — your
                    profile should evolve as you learn.
                  </p>

                  <div className="grid max-w-[1000px] gap-3 slancia-short-option-grid">
                    <div className="rounded-2xl border border-white/[0.08] bg-black/25 p-6 backdrop-blur-md">
                      <div className="text-[8px] uppercase tracking-[0.24em] text-[#626966]">
                        Your space
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedNiches.map((niche) => (
                          <span
                            key={niche}
                            className="rounded-full border border-[#D9A441]/20 bg-[#D9A441]/[0.06] px-3 py-1.5 text-[11px] text-[#D9A441]"
                          >
                            {niche}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/[0.08] bg-black/25 p-6">
                        <div className="text-[8px] uppercase tracking-[0.24em] text-[#626966]">
                          Starting point
                        </div>

                        <div className="mt-4 text-[15px] text-[#E5E0D6]">
                          {followerStage}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/[0.08] bg-black/25 p-6">
                        <div className="text-[8px] uppercase tracking-[0.24em] text-[#626966]">
                          Main direction
                        </div>

                        <div className="mt-4 text-[15px] text-[#E5E0D6]">
                          {goal}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#D9A441]/20 bg-[#D9A441]/[0.035] p-6">
                      <div className="text-[8px] uppercase tracking-[0.24em] text-[#D9A441]/70">
                        First move
                      </div>

                      <div className="mt-4 text-[17px] text-[#F0EBE1]">
                        {firstAction}
                      </div>

                      <div className="mt-2 text-[11px] leading-5 text-[#676E6B]">
                        Slancialab will use this as the starting
                        point for your first session.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER CONTROLS */}
              <div
                className="
                  mt-8 border-t border-white/[0.07] pt-5
                  slancia-short-footer
                  slancia-very-short-footer
                "
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={previousStep}
                        className="group flex h-11 items-center gap-3 rounded-full border border-white/[0.1] bg-black/20 px-5 text-[11px] uppercase tracking-[0.18em] text-[#777E7B] transition hover:border-white/[0.2] hover:text-[#E5E0D6]"
                      >
                        <ArrowLeft />
                        Back
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-[#555C59]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#D9A441] shadow-[0_0_10px_rgba(217,164,65,0.5)]" />
                        About a minute
                      </div>
                    )}

                    <div className="hidden text-[9px] uppercase tracking-[0.18em] text-[#4F5653] sm:block">
                      Your profile can be changed anytime
                    </div>
                  </div>

                  {step < totalSteps ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!canContinue}
                      className={`slancia-button flex h-12 items-center justify-center gap-5 rounded-full px-7 text-[12px] font-medium slancia-short-button ${
                        canContinue
                          ? "bg-[#D9A441] text-[#090B0C] shadow-[0_10px_35px_rgba(217,164,65,0.18)] hover:bg-[#E6B34E] hover:shadow-[0_15px_45px_rgba(217,164,65,0.25)]"
                          : "cursor-not-allowed border border-white/[0.08] bg-white/[0.035] text-[#555C59]"
                      }`}
                    >
                      Continue
                      <ArrowRight />
                    </button>
                  ) : (
                    <form action={action}>
                      {selectedNiches.map((niche) => (
                        <input
                          key={niche}
                          type="hidden"
                          name="niche"
                          value={niche}
                        />
                      ))}

                      <input
                        type="hidden"
                        name="followerStage"
                        value={followerStage}
                      />

                      <input
                        type="hidden"
                        name="goal"
                        value={goal}
                      />

                      <input
                        type="hidden"
                        name="firstAction"
                        value={firstAction}
                      />

                      <button
                        type="submit"
                        disabled={!canContinue}
                        className="slancia-button flex h-12 items-center justify-center gap-5 rounded-full bg-[#D9A441] px-8 text-[12px] font-medium text-[#090B0C] shadow-[0_10px_35px_rgba(217,164,65,0.2)] hover:bg-[#E6B34E] hover:shadow-[0_15px_50px_rgba(217,164,65,0.28)] disabled:cursor-not-allowed disabled:opacity-50 slancia-short-button"
                      >
                        Enter Slancialab
                        <ArrowRight />
                      </button>
                    </form>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between text-[8px] uppercase tracking-[0.24em] text-[#454C49] slancia-short-footer-note">
                  <span>
                    Slancialab · Growth with evidence
                  </span>

                  <span className="hidden sm:block">
                    Experiment · Learn · Grow
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}