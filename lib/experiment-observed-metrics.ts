export const OBSERVED_POST_METRICS = [
  "views",
  "likes",
  "replies",
  "reposts",
] as const;

export type ObservedPostMetric =
  (typeof OBSERVED_POST_METRICS)[number];

export type ObservedPostMetrics = {
  views?: number | null;
  likes?: number | null;
  replies?: number | null;
  reposts?: number | null;
};

export type ExperimentPostForObservedMetrics = {
  id: string;
  metrics: ObservedPostMetrics;
};

export type ObservedMetricSummary = {
  metric: ObservedPostMetric;
  postsWithMetric: number;
  average: number | null;
  total: number | null;
};

export type FollowerGrowthSummary = {
  measurements: number;
  startingFollowers: number | null;
  latestFollowers: number | null;
  absoluteChange: number | null;
  percentageChange: number | null;
};

export type ExperimentObservedMetricsResult = {
  postMetrics: ObservedMetricSummary[];
  followerGrowth: FollowerGrowthSummary;
};

function isValidMetricValue(
  value: number | null | undefined
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function calculateAverage(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function calculatePercentageChange(
  baseline: number,
  current: number
): number | null {
  if (
    !Number.isFinite(baseline) ||
    !Number.isFinite(current) ||
    baseline === 0
  ) {
    return null;
  }

  return ((current - baseline) / baseline) * 100;
}

function getMetricValue(
  post: ExperimentPostForObservedMetrics,
  metric: ObservedPostMetric
): number | null {
  const value = post.metrics[metric];

  return isValidMetricValue(value) ? value : null;
}

function buildPostMetricSummary(
  posts: ExperimentPostForObservedMetrics[],
  metric: ObservedPostMetric
): ObservedMetricSummary {
  const values = posts
    .map((post) => getMetricValue(post, metric))
    .filter((value): value is number => value !== null);

  return {
    metric,
    postsWithMetric: values.length,
    average: calculateAverage(values),
    total:
      values.length > 0
        ? values.reduce((sum, value) => sum + value, 0)
        : null,
  };
}

export function calculateObservedMetrics(input: {
  posts: ExperimentPostForObservedMetrics[];
  followerMeasurements?: {
    followerCount: number;
    loggedAt: Date;
  }[];
}): ExperimentObservedMetricsResult {
  const postMetrics = OBSERVED_POST_METRICS.map((metric) =>
    buildPostMetricSummary(input.posts, metric)
  );

  const measurements = [...(input.followerMeasurements ?? [])]
    .filter(
      (measurement) =>
        Number.isSafeInteger(measurement.followerCount) &&
        measurement.followerCount >= 0 &&
        measurement.loggedAt instanceof Date &&
        !Number.isNaN(measurement.loggedAt.getTime())
    )
    .sort(
      (a, b) =>
        a.loggedAt.getTime() - b.loggedAt.getTime()
    );

  if (measurements.length < 2) {
    return {
      postMetrics,
      followerGrowth: {
        measurements: measurements.length,
        startingFollowers:
          measurements[0]?.followerCount ?? null,
        latestFollowers:
          measurements.at(-1)?.followerCount ?? null,
        absoluteChange: null,
        percentageChange: null,
      },
    };
  }

  const startingFollowers = measurements[0].followerCount;
  const latestFollowers =
    measurements[measurements.length - 1].followerCount;

  return {
    postMetrics,
    followerGrowth: {
      measurements: measurements.length,
      startingFollowers,
      latestFollowers,
      absoluteChange:
        latestFollowers - startingFollowers,
      percentageChange: calculatePercentageChange(
        startingFollowers,
        latestFollowers
      ),
    },
  };
}