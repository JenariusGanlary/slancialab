import type {
  Strategy,
} from ".prisma/client";

import type {
  XPatternSignal,
} from "./signals";

export type XStrategyMatch = {
  strategyId: string;
  strategyTitle: string;
  strategyDescription: string;

  matchedDimensions: string[];
  matchedSignals: string[];

  relevanceScore: number;

  hypothesisTemplate: string | null;
  protocolTemplate: string | null;

  recommendedDurationDays: number | null;
  recommendedPostCount: number | null;
  primaryMetric: string | null;
  successThresholdPercent: number | null;
};

type StrategyLike = Pick<
  Strategy,
  | "id"
  | "title"
  | "description"
  | "nicheTags"
  | "stageTags"
  | "hypothesisTemplate"
  | "protocolTemplate"
  | "recommendedDurationDays"
  | "recommendedPostCount"
  | "primaryMetric"
  | "successThresholdPercent"
>;

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function valueMatchesText(
  value: string,
  text: string
): boolean {
  const normalizedValue = normalize(value);
  const normalizedText = normalize(text);

  if (!normalizedValue || !normalizedText) {
    return false;
  }

  return normalizedText.includes(normalizedValue);
}

function getSignalWeight(
  signal: XPatternSignal
): number {
  switch (signal.signalLevel) {
    case "repeated":
      return 4;

    case "emerging":
      return 3;

    case "potential":
      return 2;

    case "insufficient":
    case "none":
    default:
      return 0;
  }
}

function isActionableSignal(
  signal: XPatternSignal
): boolean {
  return (
    signal.signalLevel === "potential" ||
    signal.signalLevel === "emerging" ||
    signal.signalLevel === "repeated"
  );
}

function getStrategySearchText(
  strategy: StrategyLike
): string {
  return [
    strategy.title,
    strategy.description,
    strategy.hypothesisTemplate ?? "",
    strategy.protocolTemplate ?? "",
    ...strategy.nicheTags,
    ...strategy.stageTags,
  ]
    .filter(Boolean)
    .join(" ");
}

function calculateStrategyMatch(
  strategy: StrategyLike,
  signals: XPatternSignal[]
): XStrategyMatch | null {
  const strategyText =
    getStrategySearchText(strategy);

  const matchedDimensions = new Set<string>();
  const matchedSignals: string[] = [];

  let relevanceScore = 0;

  for (const signal of signals) {
    if (!isActionableSignal(signal)) {
      continue;
    }

    const signalText = [
      signal.dimension,
      signal.dimensionLabel,
      signal.value,
    ].join(" ");

    if (
      valueMatchesText(
        signal.value,
        strategyText
      ) ||
      valueMatchesText(
        signal.dimensionLabel,
        strategyText
      )
    ) {
      const weight =
        getSignalWeight(signal);

      relevanceScore += weight;

      matchedDimensions.add(
        signal.dimension
      );

      matchedSignals.push(
        `${signal.dimensionLabel}: ${signal.value}`
      );

      continue;
    }

    if (
      valueMatchesText(
        signalText,
        strategyText
      )
    ) {
      const weight =
        getSignalWeight(signal);

      relevanceScore += Math.max(
        weight - 1,
        1
      );

      matchedDimensions.add(
        signal.dimension
      );

      matchedSignals.push(
        `${signal.dimensionLabel}: ${signal.value}`
      );
    }
  }

  if (relevanceScore <= 0) {
    return null;
  }

  return {
    strategyId: strategy.id,
    strategyTitle: strategy.title,
    strategyDescription:
      strategy.description,

    matchedDimensions:
      Array.from(matchedDimensions),

    matchedSignals,

    relevanceScore,

    hypothesisTemplate:
      strategy.hypothesisTemplate,

    protocolTemplate:
      strategy.protocolTemplate,

    recommendedDurationDays:
      strategy.recommendedDurationDays,

    recommendedPostCount:
      strategy.recommendedPostCount,

    primaryMetric:
      strategy.primaryMetric,

    successThresholdPercent:
      strategy.successThresholdPercent,
  };
}

export function matchXPatternSignalsToStrategies(
  signals: XPatternSignal[],
  strategies: StrategyLike[]
): XStrategyMatch[] {
  const matches: XStrategyMatch[] = [];

  for (const strategy of strategies) {
    const match = calculateStrategyMatch(
      strategy,
      signals
    );

    if (match) {
      matches.push(match);
    }
  }

  return matches.sort(
    (a, b) =>
      b.relevanceScore -
      a.relevanceScore
  );
}