import type { PatternObservation } from "@/lib/pattern-aggregation";

export type PatternSignalLevel =
  | "none"
  | "insufficient"
  | "potential"
  | "emerging"
  | "repeated";

export type PatternSignal = {
  dimension: string;
  dimensionLabel: string;
  value: string;

  count: number;
  availableViews: number;
  performanceCoverage: number;

  meanViews: number | null;
  medianViews: number | null;

  sourcePostIds: string[];

  signalLevel: PatternSignalLevel;
  signalLabel: string;
};

function getPerformanceCoverage(
  count: number,
  availableViews: number
): number {
  if (count === 0) {
    return 0;
  }

  return Math.round((availableViews / count) * 100);
}

function getSignalLevel(
  availableViews: number,
  performanceCoverage: number
): PatternSignalLevel {
  if (availableViews === 0) {
    return "none";
  }

  if (availableViews === 1) {
    return "insufficient";
  }

  if (performanceCoverage < 50) {
    return "insufficient";
  }

  if (availableViews <= 3) {
    return "potential";
  }

  if (availableViews <= 5) {
    return "emerging";
  }

  return "repeated";
}

function getSignalLabel(
  signalLevel: PatternSignalLevel,
  count: number,
  availableViews: number,
  performanceCoverage: number
): string {
  if (signalLevel === "none") {
    return "No performance data";
  }

  if (signalLevel === "insufficient") {
    if (availableViews === 1) {
      return "Insufficient evidence · only 1 measured post";
    }

    if (performanceCoverage < 50) {
      return `Insufficient evidence · ${performanceCoverage}% performance coverage`;
    }

    return `Insufficient evidence · ${availableViews} measured posts`;
  }

  if (signalLevel === "potential") {
    return `Potential pattern · ${count} posts studied · ${availableViews} with performance data`;
  }

  if (signalLevel === "emerging") {
    return `Emerging pattern · ${count} posts studied · ${availableViews} with performance data`;
  }

  return `Repeated pattern · ${count} posts studied · ${availableViews} with performance data`;
}

/**
 * Converts a neutral pattern observation into an evidence-aware signal.
 *
 * This service deliberately does NOT:
 * - compare patterns against a baseline
 * - calculate performance lift
 * - claim that one pattern performs better
 * - generate strategies
 * - generate recommendations
 * - persist signals
 *
 * Signal strength is based on:
 * - number of posts with performance data
 * - performance-data coverage across the observed posts
 *
 * A pattern must have at least 50% performance coverage before
 * it can become a potential, emerging, or repeated signal.
 */
export function evaluatePatternSignal(
  observation: PatternObservation
): PatternSignal {
  const performanceCoverage = getPerformanceCoverage(
    observation.count,
    observation.availableViews
  );

  const signalLevel = getSignalLevel(
    observation.availableViews,
    performanceCoverage
  );

  return {
    dimension: observation.dimension,
    dimensionLabel: observation.dimensionLabel,
    value: observation.value,

    count: observation.count,
    availableViews: observation.availableViews,
    performanceCoverage,

    meanViews: observation.meanViews,
    medianViews: observation.medianViews,

    sourcePostIds: observation.sourcePostIds,

    signalLevel,
    signalLabel: getSignalLabel(
      signalLevel,
      observation.count,
      observation.availableViews,
      performanceCoverage
    ),
  };
}

/**
 * Evaluates all observations without changing their underlying evidence.
 */
export function evaluatePatternSignals(
  observations: PatternObservation[]
): PatternSignal[] {
  return observations.map(evaluatePatternSignal);
}