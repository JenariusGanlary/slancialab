import type { XPatternObservation } from "./aggregation";

export type XPatternSignalLevel =
  | "none"
  | "insufficient"
  | "potential"
  | "emerging"
  | "repeated";

export type XPatternEvidenceLevel =
  | "none"
  | "limited"
  | "early"
  | "developing";

export type XPatternSignal = {
  dimension: XPatternObservation["dimension"];
  dimensionLabel: string;
  value: string;

  postCount: number;
  availableViews: number;

  meanViews: number | null;
  medianViews: number | null;

  sourcePostIds: string[];

  baselineMedianViews: number | null;
  medianLiftPercent: number | null;

  performanceCoverage: number;

  evidenceLevel: XPatternEvidenceLevel;
  evidenceLabel: string;

  signalLevel: XPatternSignalLevel;
  signalLabel: string;
};

type SignalThreshold = {
  minimumPosts: number;
  minimumLiftPercent: number;
  level: Exclude<
    XPatternSignalLevel,
    "none" | "insufficient"
  >;
  label: string;
};

const SIGNAL_THRESHOLDS: SignalThreshold[] = [
  {
    minimumPosts: 2,
    minimumLiftPercent: 10,
    level: "potential",
    label: "Potential pattern",
  },
  {
    minimumPosts: 3,
    minimumLiftPercent: 15,
    level: "emerging",
    label: "Emerging pattern",
  },
  {
    minimumPosts: 5,
    minimumLiftPercent: 20,
    level: "repeated",
    label: "Repeated pattern",
  },
];

function calculateMedian(
  values: number[]
): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (
      (sorted[middle - 1] + sorted[middle]) / 2
    );
  }

  return sorted[middle];
}

function calculateEvidenceLevel(
  postCount: number,
  availableViews: number
): XPatternEvidenceLevel {
  if (postCount === 0) {
    return "none";
  }

  if (availableViews === 0) {
    return "limited";
  }

  if (postCount < 3 || availableViews < 2) {
    return "limited";
  }

  if (postCount < 5 || availableViews < 4) {
    return "early";
  }

  return "developing";
}

function getEvidenceLabel(
  level: XPatternEvidenceLevel
): string {
  switch (level) {
    case "none":
      return "No evidence";

    case "limited":
      return "Limited evidence";

    case "early":
      return "Early evidence";

    case "developing":
      return "Developing evidence";
  }
}

function getSignalThreshold(
  postCount: number,
  medianLiftPercent: number | null
): SignalThreshold | null {
  if (
    medianLiftPercent === null ||
    postCount === 0
  ) {
    return null;
  }

  let matchedThreshold: SignalThreshold | null =
    null;

  for (const threshold of SIGNAL_THRESHOLDS) {
    if (
      postCount >= threshold.minimumPosts &&
      medianLiftPercent >= threshold.minimumLiftPercent
    ) {
      matchedThreshold = threshold;
    }
  }

  return matchedThreshold;
}

function calculateMedianLiftPercent(
  medianViews: number | null,
  baselineMedianViews: number | null
): number | null {
  if (
    medianViews === null ||
    baselineMedianViews === null ||
    baselineMedianViews <= 0
  ) {
    return null;
  }

  return (
    ((medianViews - baselineMedianViews) /
      baselineMedianViews) *
    100
  );
}

export function calculateXPatternSignals(
  observations: XPatternObservation[],
  baselineMedianViews?: number | null
): XPatternSignal[] {
  return observations.map((observation) => {
    const performanceCoverage =
      observation.count > 0
        ? observation.availableViews /
          observation.count
        : 0;

    const effectiveBaseline =
      baselineMedianViews ?? null;

    const medianLiftPercent =
      calculateMedianLiftPercent(
        observation.medianViews,
        effectiveBaseline
      );

    const evidenceLevel =
      calculateEvidenceLevel(
        observation.count,
        observation.availableViews
      );

    const evidenceLabel =
      getEvidenceLabel(evidenceLevel);

    let signalLevel: XPatternSignalLevel =
      "insufficient";

    let signalLabel = "Insufficient evidence";

    const threshold = getSignalThreshold(
      observation.count,
      medianLiftPercent
    );

    if (
      performanceCoverage < 0.5 ||
      threshold === null
    ) {
      signalLevel = "insufficient";
      signalLabel = "Insufficient evidence";
    } else {
      signalLevel = threshold.level;
      signalLabel = threshold.label;
    }

    return {
      dimension: observation.dimension,
      dimensionLabel:
        observation.dimensionLabel,
      value: observation.value,

      postCount: observation.count,
      availableViews: observation.availableViews,

      meanViews: observation.meanViews,
      medianViews: observation.medianViews,

      sourcePostIds:
        observation.sourcePostIds,

      baselineMedianViews:
        effectiveBaseline,
      medianLiftPercent,

      performanceCoverage,

      evidenceLevel,
      evidenceLabel,

      signalLevel,
      signalLabel,
    };
  });
}

export function calculateXPatternBaseline(
  observations: XPatternObservation[]
): number | null {
  const medianValues = observations
    .map((observation) => observation.medianViews)
    .filter(
      (value): value is number =>
        typeof value === "number" &&
        Number.isFinite(value)
    );

  return calculateMedian(medianValues);
}