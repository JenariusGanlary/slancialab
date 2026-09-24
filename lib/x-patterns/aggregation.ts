import type {
  ContentStyle,
  ContentStructure,
  HookType,
  XPost,
  XPostAnalysis,
} from ".prisma/client";

export type XPostWithAnalysis = Pick<
  XPost,
  "id" | "views"
> & {
  analysis: Pick<
    XPostAnalysis,
    "hookType" | "structure" | "contentStyle"
  > | null;
};

export type XPatternDimension =
  | "hookType"
  | "structure"
  | "contentStyle";

export type XPatternObservation = {
  dimension: XPatternDimension;
  dimensionLabel: string;
  value: string;
  count: number;
  availableViews: number;
  meanViews: number | null;
  medianViews: number | null;
  sourcePostIds: string[];
};

type PatternBucket = {
  dimension: XPatternDimension;
  value: string;
  views: number[];
  sourcePostIds: string[];
};

const DIMENSION_LABELS: Record<
  XPatternDimension,
  string
> = {
  hookType: "Hook Type",
  structure: "Structure",
  contentStyle: "Content Style",
};

function median(values: number[]): number | null {
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

function mean(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce(
    (sum, value) => sum + value,
    0
  );

  return total / values.length;
}

function addToBucket(
  buckets: Map<string, PatternBucket>,
  dimension: XPatternDimension,
  value: string,
  post: XPostWithAnalysis
): void {
  const key = `${dimension}:${value}`;

  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = {
      dimension,
      value,
      views: [],
      sourcePostIds: [],
    };

    buckets.set(key, bucket);
  }

  bucket.sourcePostIds.push(post.id);

  if (
    typeof post.views === "number" &&
    Number.isFinite(post.views)
  ) {
    bucket.views.push(post.views);
  }
}

export function aggregateXPostPatterns(
  posts: XPostWithAnalysis[]
): XPatternObservation[] {
  const buckets = new Map<string, PatternBucket>();

  for (const post of posts) {
    const analysis = post.analysis;

    if (!analysis) {
      continue;
    }

    if (analysis.hookType) {
      addToBucket(
        buckets,
        "hookType",
        analysis.hookType,
        post
      );
    }

    if (analysis.structure) {
      addToBucket(
        buckets,
        "structure",
        analysis.structure,
        post
      );
    }

    if (analysis.contentStyle) {
      addToBucket(
        buckets,
        "contentStyle",
        analysis.contentStyle,
        post
      );
    }
  }

  return Array.from(buckets.values()).map(
    (bucket) => ({
      dimension: bucket.dimension,
      dimensionLabel:
        DIMENSION_LABELS[bucket.dimension],
      value: bucket.value,
      count: bucket.sourcePostIds.length,
      availableViews: bucket.views.length,
      meanViews: mean(bucket.views),
      medianViews: median(bucket.views),
      sourcePostIds: bucket.sourcePostIds,
    })
  );
}

export function getXPostPatternDimensions(): {
  dimension: XPatternDimension;
  label: string;
}[] {
  return (
    Object.entries(DIMENSION_LABELS) as [
      XPatternDimension,
      string,
    ][]
  ).map(([dimension, label]) => ({
    dimension,
    label,
  }));
}

export type XPostAnalysisDimensionValue =
  | HookType
  | ContentStructure
  | ContentStyle;