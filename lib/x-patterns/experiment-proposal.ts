import type { Strategy } from ".prisma/client";

import type { XPatternSignal } from "./signals";
import type { XStrategyMatch } from "./strategy-matching";

export type XExperimentProposal = {
  strategyId: string;
  strategyTitle: string;
  strategyDescription: string;

  hypothesis: string;
  protocol: string;

  durationDays: number;
  targetPostCount: number;

  primaryMetric: string;
  successThresholdPercent: number;

  supportingSignals: string[];

  confidence: "low" | "medium" | "high";
};

type StrategyProposalInput = Pick<
  Strategy,
  | "id"
  | "title"
  | "description"
  | "hypothesisTemplate"
  | "protocolTemplate"
  | "recommendedDurationDays"
  | "recommendedPostCount"
  | "primaryMetric"
  | "successThresholdPercent"
>;

function replaceTemplateVariables(
  template: string,
  signal: XPatternSignal
): string {
  return template
    .replace(
      /\{dimension\}/gi,
      signal.dimensionLabel
    )
    .replace(
      /\{value\}/gi,
      signal.value
    )
    .replace(
      /\{signal\}/gi,
      `${signal.dimensionLabel}: ${signal.value}`
    )
    .replace(
      /\{lift\}/gi,
      signal.medianLiftPercent !== null
        ? `${signal.medianLiftPercent.toFixed(1)}%`
        : "an observed performance difference"
    );
}

function buildDefaultHypothesis(
  strategy: StrategyProposalInput,
  signal: XPatternSignal
): string {
  const liftText =
    signal.medianLiftPercent !== null
      ? `showed an observed median view difference of ${signal.medianLiftPercent.toFixed(1)}% compared with the current baseline`
      : "showed an observed performance signal";

  return `Using ${signal.value} as part of the "${strategy.title}" strategy may improve ${strategy.primaryMetric ?? "post performance"}, because ${signal.dimensionLabel.toLowerCase()} "${signal.value}" ${liftText}.`;
}

function buildDefaultProtocol(
  strategy: StrategyProposalInput,
  signal: XPatternSignal
): string {
  const duration =
    strategy.recommendedDurationDays ?? 14;

  const postCount =
    strategy.recommendedPostCount ?? 10;

  return `For ${duration} days, publish ${postCount} posts using the "${strategy.title}" strategy while deliberately incorporating ${signal.dimensionLabel.toLowerCase()} "${signal.value}". Keep the rest of the content approach as consistent as practical. Record the primary metric for each post and compare the experiment results with the baseline after the experiment ends.`;
}

function getConfidence(
  signal: XPatternSignal
): XExperimentProposal["confidence"] {
  if (signal.signalLevel === "repeated") {
    return "high";
  }

  if (signal.signalLevel === "emerging") {
    return "medium";
  }

  return "low";
}

function getRecommendedSignal(
  signals: XPatternSignal[],
  strategyMatch: XStrategyMatch
): XPatternSignal | null {
  const matchingSignals = signals.filter(
    (signal) =>
      strategyMatch.matchedSignals.includes(
        `${signal.dimensionLabel}: ${signal.value}`
      )
  );

  if (matchingSignals.length === 0) {
    return null;
  }

  return [...matchingSignals].sort(
    (a, b) => {
      const levelWeight = {
        repeated: 4,
        emerging: 3,
        potential: 2,
        insufficient: 1,
        none: 0,
      };

      const weightDifference =
        levelWeight[b.signalLevel] -
        levelWeight[a.signalLevel];

      if (weightDifference !== 0) {
        return weightDifference;
      }

      const liftA =
        a.medianLiftPercent ?? 0;

      const liftB =
        b.medianLiftPercent ?? 0;

      return liftB - liftA;
    }
  )[0];
}

export function buildXExperimentProposal(
  strategyMatch: XStrategyMatch,
  strategy: StrategyProposalInput,
  signals: XPatternSignal[]
): XExperimentProposal | null {
  const signal = getRecommendedSignal(
    signals,
    strategyMatch
  );

  if (!signal) {
    return null;
  }

  const hypothesis =
    strategy.hypothesisTemplate
      ? replaceTemplateVariables(
          strategy.hypothesisTemplate,
          signal
        )
      : buildDefaultHypothesis(
          strategy,
          signal
        );

  const protocol =
    strategy.protocolTemplate
      ? replaceTemplateVariables(
          strategy.protocolTemplate,
          signal
        )
      : buildDefaultProtocol(
          strategy,
          signal
        );

  const durationDays =
    strategy.recommendedDurationDays ?? 14;

  const targetPostCount =
    strategy.recommendedPostCount ?? 10;

  const primaryMetric =
    strategy.primaryMetric ?? "views";

  const successThresholdPercent =
    strategy.successThresholdPercent ?? 20;

  return {
    strategyId: strategy.id,
    strategyTitle: strategy.title,
    strategyDescription:
      strategy.description,

    hypothesis,
    protocol,

    durationDays,
    targetPostCount,

    primaryMetric,
    successThresholdPercent,

    supportingSignals:
      strategyMatch.matchedSignals,

    confidence: getConfidence(signal),
  };
}

export function buildXExperimentProposals(
  strategyMatches: XStrategyMatch[],
  strategies: StrategyProposalInput[],
  signals: XPatternSignal[]
): XExperimentProposal[] {
  const strategyMap = new Map(
    strategies.map((strategy) => [
      strategy.id,
      strategy,
    ])
  );

  const proposals: XExperimentProposal[] = [];

  for (const strategyMatch of strategyMatches) {
    const strategy = strategyMap.get(
      strategyMatch.strategyId
    );

    if (!strategy) {
      continue;
    }

    const proposal =
      buildXExperimentProposal(
        strategyMatch,
        strategy,
        signals
      );

    if (proposal) {
      proposals.push(proposal);
    }
  }

  return proposals;
}