export type StrategyMatchInput = {
  id: string;
  title: string;
  description: string;
  nicheTags: string[];
  stageTags: string[];
};

export type StrategyMatchContext = {
  pattern: string;
  dimension?: string | null;
};

export type StrategyMatch = {
  strategy: StrategyMatchInput;
  score: number;
  reason: string;
};

type StrategyRule = {
  strategyTitle: string;
  patterns: string[];
  reason: string;
};

/*
 * These rules intentionally map research patterns to the
 * actual strategies defined in prisma/seed.ts.
 *
 * Important:
 * - No description-only fuzzy matching.
 * - No generic keyword matching across unrelated strategies.
 * - A research pattern must map to an explicit strategy.
 *
 * This keeps the recommendation layer deterministic and prevents
 * strategies such as Quote-Tweet Value-Add from accidentally
 * winning a Contrarian pattern.
 */
const STRATEGY_RULES: StrategyRule[] = [
  {
    strategyTitle: "Reply-Guy Method",
    patterns: [
      "reply",
      "reply driven",
      "reply-driven",
      "conversation",
      "comment",
    ],
    reason:
      "This strategy gives you a direct way to test reply-driven and conversational content with your own audience.",
  },

  {
    strategyTitle: "Curiosity-Gap Hooks",
    patterns: [
      "curiosity",
      "curiosity gap",
      "curiosity-gap",
      "open loop",
    ],
    reason:
      "This strategy gives you a direct way to test curiosity-driven openings in your own content.",
  },

  {
    strategyTitle: "Thread Every Tuesday",
    patterns: [
      "thread",
      "long form thread",
      "long-form thread",
    ],
    reason:
      "This strategy turns the observed thread format into a structured experiment on your own account.",
  },

  {
    strategyTitle: "Build-in-Public Daily Log",
    patterns: [
      "build in public",
      "build-in-public",
      "build in public lesson",
      "build-in-public lesson",
      "build log",
      "daily log",
      "public build",
    ],
    reason:
      "This strategy gives you a direct way to test build-in-public content with your own audience.",
  },

  {
    strategyTitle: "Contrarian Take Fridays",
    patterns: [
      "contrarian",
      "contrarian take",
      "contrarian hook",
    ],
    reason:
      "This strategy gives you a direct way to test the observed contrarian pattern in your own content.",
  },

  {
    strategyTitle: "Quote-Tweet Value-Add",
    patterns: [
      "quote-tweet",
      "quote tweet",
      "quote",
    ],
    reason:
      "This strategy gives you a direct way to test quote-driven value-add content with your own audience.",
  },

  {
    strategyTitle: "The Numbered List Post",
    patterns: [
      "list",
      "numbered",
      "numbered list",
      "list based",
      "list-based",
    ],
    reason:
      "This strategy directly tests the observed list-based content structure.",
  },

  {
    strategyTitle: "Screenshot-Proof Posts",
    patterns: [
      "screenshot",
      "screenshot proof",
      "screenshot-proof",
      "proof",
      "proof post",
      "social proof",
    ],
    reason:
      "This strategy gives you a direct way to test screenshot-backed proof and real-result content.",
  },
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesNormalizedPhrase(
  source: string,
  phrase: string
): boolean {
  return source.includes(normalize(phrase));
}

function getStrategyRule(pattern: string): StrategyRule | null {
  const normalizedPattern = normalize(pattern);

  if (!normalizedPattern) {
    return null;
  }

  for (const rule of STRATEGY_RULES) {
    for (const candidatePattern of rule.patterns) {
      const normalizedCandidate = normalize(candidatePattern);

      if (
        normalizedPattern === normalizedCandidate ||
        normalizedPattern.includes(normalizedCandidate)
      ) {
        return rule;
      }
    }
  }

  return null;
}

function getDimensionBonus(
  strategy: StrategyMatchInput,
  context: StrategyMatchContext
): number {
  if (!context.dimension) {
    return 0;
  }

  const dimension = normalize(context.dimension);
  const title = normalize(strategy.title);

  if (dimension === "hook type" && title.includes("hook")) {
    return 20;
  }

  if (
    dimension === "structure" &&
    (
      title.includes("list") ||
      title.includes("thread")
    )
  ) {
    return 20;
  }

  if (
    dimension === "content style" &&
    (
      title.includes("build") ||
      title.includes("story") ||
      title.includes("public")
    )
  ) {
    return 10;
  }

  return 0;
}

function scoreStrategy(
  strategy: StrategyMatchInput,
  context: StrategyMatchContext
): StrategyMatch | null {
  const rule = getStrategyRule(context.pattern);

  if (!rule) {
    return null;
  }

  const strategyTitle = normalize(strategy.title);
  const expectedTitle = normalize(rule.strategyTitle);

  /*
   * The strategy title must explicitly match the strategy assigned
   * to this research pattern.
   *
   * This is intentionally strict.
   *
   * Example:
   *
   * Contrarian
   *   → Contrarian Take Fridays       ✅
   *
   * Contrarian
   *   → Quote-Tweet Value-Add         ❌
   *
   * Contrarian
   *   → Contrarian Hook Test          ❌
   *
   * The last one is a temporary database test strategy and is not
   * part of the canonical strategy taxonomy.
   */
  if (strategyTitle !== expectedTitle) {
    return null;
  }

  const score = 100 + getDimensionBonus(strategy, context);

  return {
    strategy,
    score,
    reason: rule.reason,
  };
}

export function matchStrategiesToResearch(
  strategies: StrategyMatchInput[],
  context: StrategyMatchContext
): StrategyMatch[] {
  return strategies
    .map((strategy) => scoreStrategy(strategy, context))
    .filter((match): match is StrategyMatch => match !== null)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.strategy.title.localeCompare(b.strategy.title);
    });
}

export function findBestStrategyForResearch(
  strategies: StrategyMatchInput[],
  context: StrategyMatchContext
): StrategyMatch | null {
  return matchStrategiesToResearch(strategies, context)[0] ?? null;
}