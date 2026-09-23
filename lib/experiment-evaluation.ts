export const EVALUATION_STATUSES = [
  "insufficient_data",
  "below_threshold",
  "met_threshold",
] as const;

export type EvaluationStatus = (typeof EVALUATION_STATUSES)[number];

export const PRIMARY_METRICS = [
  "views",
  "likes",
  "replies",
  "reposts",
  "engagement_rate",
  "follower_growth",
] as const;

export type PrimaryMetric = (typeof PRIMARY_METRICS)[number];

export type ExperimentPostMetrics = {
  views?: number | null;
  likes?: number | null;
  replies?: number | null;
  reposts?: number | null;
  engagementRate?: number | null;
};

export type ExperimentPostForEvaluation = {
  id: string;
  metrics: ExperimentPostMetrics;
};

export type ExperimentFollowerMeasurement = {
  id: string;
  followerCount: number;
  loggedAt: Date;
};

export type ExperimentEvaluationInput = {
  primaryMetric: string | null | undefined;
  successThresholdPercent: number | null | undefined;
  posts: ExperimentPostForEvaluation[];
  followerMeasurements?: ExperimentFollowerMeasurement[];
  baselineAverage?: number | null;
};

export type ExperimentEvaluationResult = {
  status: EvaluationStatus;
  primaryMetric: PrimaryMetric | null;
  postsWithMetric: number;
  totalPosts: number;
  baselineAverage: number | null;
  experimentAverage: number | null;
  absoluteChange: number | null;
  percentageChange: number | null;
  successThresholdPercent: number | null;
  message: string;
};

function isPrimaryMetric(value: string): value is PrimaryMetric {
  return PRIMARY_METRICS.includes(value as PrimaryMetric);
}

function getMetricValue(
  post: ExperimentPostForEvaluation,
  metric: PrimaryMetric
): number | null {
  if (metric === "follower_growth") {
    return null;
  }

  const value =
    post.metrics[
      metric === "engagement_rate" ? "engagementRate" : metric
    ];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  if (value < 0) {
    return null;
  }

  return value;
}

function calculateAverage(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return total / values.length;
}

function calculatePercentageChange(
  baseline: number,
  current: number
): number | null {
  if (!Number.isFinite(baseline) || !Number.isFinite(current)) {
    return null;
  }

  if (baseline === 0) {
    return null;
  }

  return ((current - baseline) / baseline) * 100;
}

function evaluateFollowerGrowth(
  input: ExperimentEvaluationInput,
  totalPosts: number
): ExperimentEvaluationResult {
  const measurements = [...(input.followerMeasurements ?? [])]
    .filter(
      (measurement) =>
        typeof measurement.followerCount === "number" &&
        Number.isSafeInteger(measurement.followerCount) &&
        measurement.followerCount >= 0 &&
        measurement.loggedAt instanceof Date &&
        !Number.isNaN(measurement.loggedAt.getTime())
    )
    .sort(
      (a, b) =>
        a.loggedAt.getTime() - b.loggedAt.getTime()
    );

  const threshold =
    typeof input.successThresholdPercent === "number" &&
    Number.isFinite(input.successThresholdPercent) &&
    input.successThresholdPercent >= 0
      ? input.successThresholdPercent
      : null;

  /*
   * Follower growth requires at least two measurements:
   *
   * first CheckIn  -> baseline
   * latest CheckIn -> experiment result
   *
   * We intentionally do not use a single follower count as both
   * baseline and result because that would produce no measurable change.
   */
  if (measurements.length < 2) {
    return {
      status: "insufficient_data",
      primaryMetric: "follower_growth",
      postsWithMetric: 0,
      totalPosts,
      baselineAverage: null,
      experimentAverage: null,
      absoluteChange: null,
      percentageChange: null,
      successThresholdPercent: threshold,
      message:
        "At least two follower measurements are required to evaluate follower growth.",
    };
  }

  const baselineFollowers = measurements[0].followerCount;
  const latestFollowers =
    measurements[measurements.length - 1].followerCount;

  /*
   * For follower_growth:
   *
   * baselineAverage   = starting follower count
   * experimentAverage = latest follower count
   * absoluteChange    = latest - starting
   * percentageChange  = change relative to starting followers
   *
   * This represents observed follower change during the experiment.
   * It does not establish that the experiment caused that change.
   */
  const absoluteChange = latestFollowers - baselineFollowers;

  const percentageChange = calculatePercentageChange(
    baselineFollowers,
    latestFollowers
  );

  if (percentageChange === null) {
    return {
      status: "insufficient_data",
      primaryMetric: "follower_growth",
      postsWithMetric: measurements.length,
      totalPosts,
      baselineAverage: baselineFollowers,
      experimentAverage: latestFollowers,
      absoluteChange,
      percentageChange: null,
      successThresholdPercent: threshold,
      message:
        "The starting follower count is zero, so percentage follower growth cannot be calculated.",
    };
  }

  if (threshold === null) {
    return {
      status: "insufficient_data",
      primaryMetric: "follower_growth",
      postsWithMetric: measurements.length,
      totalPosts,
      baselineAverage: baselineFollowers,
      experimentAverage: latestFollowers,
      absoluteChange,
      percentageChange,
      successThresholdPercent: null,
      message:
        "A valid success threshold is required to evaluate follower growth.",
    };
  }

  const status =
    percentageChange >= threshold
      ? "met_threshold"
      : "below_threshold";

  return {
    status,
    primaryMetric: "follower_growth",
    postsWithMetric: measurements.length,
    totalPosts,
    baselineAverage: baselineFollowers,
    experimentAverage: latestFollowers,
    absoluteChange,
    percentageChange,
    successThresholdPercent: threshold,
    message:
      status === "met_threshold"
        ? `Observed follower growth of ${percentageChange.toFixed(
            2
          )}% met the ${threshold}% success threshold.`
        : `Observed follower growth of ${percentageChange.toFixed(
            2
          )}% is below the ${threshold}% success threshold.`,
  };
}

export function evaluateExperiment(
  input: ExperimentEvaluationInput
): ExperimentEvaluationResult {
  const totalPosts = input.posts.length;

  const metricValue = input.primaryMetric?.trim().toLowerCase();

  if (!metricValue || !isPrimaryMetric(metricValue)) {
    return {
      status: "insufficient_data",
      primaryMetric: null,
      postsWithMetric: 0,
      totalPosts,
      baselineAverage: null,
      experimentAverage: null,
      absoluteChange: null,
      percentageChange: null,
      successThresholdPercent: null,
      message:
        "A valid primary metric is required to evaluate this experiment.",
    };
  }

  /*
   * Follower growth is evaluated from experiment-level CheckIns,
   * not individual ExperimentPost records.
   */
  if (metricValue === "follower_growth") {
    return evaluateFollowerGrowth(input, totalPosts);
  }

  const values = input.posts
    .map((post) => getMetricValue(post, metricValue))
    .filter((value): value is number => value !== null);

  const postsWithMetric = values.length;
  const experimentAverage = calculateAverage(values);

  if (postsWithMetric === 0 || experimentAverage === null) {
    return {
      status: "insufficient_data",
      primaryMetric: metricValue,
      postsWithMetric,
      totalPosts,
      baselineAverage: null,
      experimentAverage: null,
      absoluteChange: null,
      percentageChange: null,
      successThresholdPercent:
        typeof input.successThresholdPercent === "number" &&
        Number.isFinite(input.successThresholdPercent)
          ? input.successThresholdPercent
          : null,
      message: "Not enough performance data to evaluate this experiment.",
    };
  }

  const baselineAverage =
    typeof input.baselineAverage === "number" &&
    Number.isFinite(input.baselineAverage) &&
    input.baselineAverage >= 0
      ? input.baselineAverage
      : null;

  if (baselineAverage === null) {
    return {
      status: "insufficient_data",
      primaryMetric: metricValue,
      postsWithMetric,
      totalPosts,
      baselineAverage: null,
      experimentAverage,
      absoluteChange: null,
      percentageChange: null,
      successThresholdPercent:
        typeof input.successThresholdPercent === "number" &&
        Number.isFinite(input.successThresholdPercent)
          ? input.successThresholdPercent
          : null,
      message:
        "Experiment performance is available, but a baseline is required for comparison.",
    };
  }

  const absoluteChange = experimentAverage - baselineAverage;

  const percentageChange = calculatePercentageChange(
    baselineAverage,
    experimentAverage
  );

  if (percentageChange === null) {
    return {
      status: "insufficient_data",
      primaryMetric: metricValue,
      postsWithMetric,
      totalPosts,
      baselineAverage,
      experimentAverage,
      absoluteChange,
      percentageChange: null,
      successThresholdPercent:
        typeof input.successThresholdPercent === "number" &&
        Number.isFinite(input.successThresholdPercent)
          ? input.successThresholdPercent
          : null,
      message:
        "The baseline is zero, so percentage improvement cannot be calculated.",
    };
  }

  const threshold =
    typeof input.successThresholdPercent === "number" &&
    Number.isFinite(input.successThresholdPercent) &&
    input.successThresholdPercent >= 0
      ? input.successThresholdPercent
      : null;

  if (threshold === null) {
    return {
      status: "insufficient_data",
      primaryMetric: metricValue,
      postsWithMetric,
      totalPosts,
      baselineAverage,
      experimentAverage,
      absoluteChange,
      percentageChange,
      successThresholdPercent: null,
      message:
        "A valid success threshold is required to evaluate the experiment.",
    };
  }

  const status =
    percentageChange >= threshold
      ? "met_threshold"
      : "below_threshold";

  return {
    status,
    primaryMetric: metricValue,
    postsWithMetric,
    totalPosts,
    baselineAverage,
    experimentAverage,
    absoluteChange,
    percentageChange,
    successThresholdPercent: threshold,
    message:
      status === "met_threshold"
        ? `The experiment met the ${threshold}% success threshold.`
        : `The experiment is below the ${threshold}% success threshold.`,
  };
}