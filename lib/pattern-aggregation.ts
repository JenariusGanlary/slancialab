export type PatternAggregationPost = {
  id: string;
  views: number | null;
  [key: string]: unknown;
};

export type PatternDimensionConfig = {
  key: string;
  label: string;
  formatValue?: (value: unknown) => string | null;
};

export type PatternObservation = {
  dimension: string;
  dimensionLabel: string;
  value: string;

  count: number;

  availableViews: number;
  meanViews: number | null;
  medianViews: number | null;

  sourcePostIds: string[];
};

function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Math.round(
      (sorted[middle - 1] + sorted[middle]) / 2
    );
  }

  return sorted[middle];
}

function mean(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) /
      values.length
  );
}

function defaultFormatValue(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

/**
 * Aggregates posts into neutral pattern observations.
 *
 * This service deliberately does NOT:
 * - calculate baselines
 * - calculate lift
 * - classify evidence
 * - detect signals
 * - generate strategies
 * - persist aggregate records
 *
 * Missing performance data is ignored for that metric.
 * Missing analysis values are ignored for that dimension.
 */
export function aggregatePatterns(
  posts: PatternAggregationPost[],
  dimensions: PatternDimensionConfig[]
): PatternObservation[] {
  const observations: PatternObservation[] = [];

  for (const dimension of dimensions) {
    const groups = new Map<
      string,
      {
        sourcePostIds: string[];
        views: number[];
      }
    >();

    for (const post of posts) {
      const rawValue = post[dimension.key];

      const value = dimension.formatValue
        ? dimension.formatValue(rawValue)
        : defaultFormatValue(rawValue);

      if (!value) {
        continue;
      }

      const existing = groups.get(value);

      if (existing) {
        existing.sourcePostIds.push(post.id);

        if (post.views != null) {
          existing.views.push(post.views);
        }

        continue;
      }

      groups.set(value, {
        sourcePostIds: [post.id],
        views:
          post.views != null
            ? [post.views]
            : [],
      });
    }

    for (const [value, group] of groups.entries()) {
      observations.push({
        dimension: dimension.key,
        dimensionLabel: dimension.label,
        value,

        count: group.sourcePostIds.length,

        availableViews: group.views.length,
        meanViews: mean(group.views),
        medianViews: median(group.views),

        sourcePostIds: group.sourcePostIds,
      });
    }
  }

  return observations;
}

export const DEFAULT_PATTERN_DIMENSIONS: PatternDimensionConfig[] =
  [
    {
      key: "hookType",
      label: "Hook type",
    },
    {
      key: "structure",
      label: "Structure",
    },
    {
      key: "contentStyle",
      label: "Content style",
    },
  ];