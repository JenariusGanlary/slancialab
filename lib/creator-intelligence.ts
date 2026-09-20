export type CreatorPostForAggregation = {
  id: string;
  creatorId: string;
  views: number | null;
  hookType: string | null;
  structure: string | null;
  topic: string | null;
  tone: string | null;
  format: string | null;
  ctaType: string | null;
  contentStyle: string | null;
  stance: string | null;
  sentenceType: string | null;
  personalization: string | null;
};

export type PatternEvidenceLevel =
  | "none"
  | "limited"
  | "early"
  | "developing";

export type PatternSignalLevel =
  | "none"
  | "insufficient"
  | "potential"
  | "emerging"
  | "repeated";

export type PatternAggregation = {
  value: string;
  postCount: number;
  postsWithViews: number;
  averageViews: number | null;
  medianViews: number | null;
  sourcePostIds: string[];

  sampleSize: number;
  performanceCoverage: number;
  evidenceLevel: PatternEvidenceLevel;
  evidenceLabel: string;

  signalLevel: PatternSignalLevel;
  signalLabel: string;
  baselineMedianViews: number | null;
  medianLiftPercent: number | null;
};

export type PatternDimension = {
  key:
    | "hookType"
    | "structure"
    | "topic"
    | "tone"
    | "format"
    | "ctaType"
    | "contentStyle"
    | "stance"
    | "sentenceType"
    | "personalization";
  label: string;
  patterns: PatternAggregation[];
};

function median(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  }

  return sorted[middle];
}

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}

function getEvidenceLevel(
  postCount: number,
  postsWithViews: number
): PatternEvidenceLevel {
  if (postsWithViews === 0) {
    return "none";
  }

  if (postsWithViews === 1) {
    return "limited";
  }

  if (postsWithViews < 5) {
    return "early";
  }

  return "developing";
}

function getEvidenceLabel(
  postCount: number,
  postsWithViews: number
): string {
  if (postsWithViews === 0) {
    return "No performance data";
  }

  if (postsWithViews === 1) {
    return "Limited evidence · 1 measured post";
  }

  if (postsWithViews < 5) {
    return `Early evidence · ${postsWithViews} measured posts`;
  }

  return `Developing evidence · ${postsWithViews} measured posts`;
}

function getPerformanceCoverage(
  postCount: number,
  postsWithViews: number
) {
  if (postCount === 0) {
    return 0;
  }

  return Math.round((postsWithViews / postCount) * 100);
}

function getMedianLiftPercent(
  patternMedianViews: number | null,
  baselineMedianViews: number | null
) {
  if (
    patternMedianViews === null ||
    baselineMedianViews === null ||
    baselineMedianViews === 0
  ) {
    return null;
  }

  return Math.round(
    ((patternMedianViews - baselineMedianViews) / baselineMedianViews) * 100
  );
}

function getSignalLevel(
  postsWithViews: number,
  performanceCoverage: number,
  medianLiftPercent: number | null
): PatternSignalLevel {
  if (postsWithViews === 0) {
    return "none";
  }

  if (postsWithViews === 1) {
    return "insufficient";
  }

  if (medianLiftPercent === null) {
    return "insufficient";
  }

  if (postsWithViews < 3) {
    return "insufficient";
  }

  if (performanceCoverage < 50) {
    return "insufficient";
  }

  if (postsWithViews >= 5 && medianLiftPercent >= 20) {
    return "repeated";
  }

  if (postsWithViews >= 3 && medianLiftPercent >= 15) {
    return "emerging";
  }

  if (postsWithViews >= 2 && medianLiftPercent >= 10) {
    return "potential";
  }

  return "insufficient";
}

function getSignalLabel(
  signalLevel: PatternSignalLevel,
  medianLiftPercent: number | null
) {
  if (signalLevel === "none") {
    return "No performance signal";
  }

  if (signalLevel === "insufficient") {
    return "Insufficient evidence";
  }

  if (signalLevel === "potential") {
    if (medianLiftPercent === null) {
      return "Potential signal";
    }

    return `Potential signal · ${medianLiftPercent}% above baseline`;
  }

  if (signalLevel === "emerging") {
    if (medianLiftPercent === null) {
      return "Emerging signal";
    }

    return `Emerging signal · ${medianLiftPercent}% above baseline`;
  }

  if (medianLiftPercent === null) {
    return "Repeated signal";
  }

  return `Repeated signal · ${medianLiftPercent}% above baseline`;
}

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const dimensions: Array<{
  key: PatternDimension["key"];
  label: string;
}> = [
  {
    key: "hookType",
    label: "Hook type",
  },
  {
    key: "structure",
    label: "Structure",
  },
  {
    key: "topic",
    label: "Topic",
  },
  {
    key: "tone",
    label: "Tone",
  },
  {
    key: "format",
    label: "Format",
  },
  {
    key: "ctaType",
    label: "CTA type",
  },
  {
    key: "contentStyle",
    label: "Content style",
  },
  {
    key: "stance",
    label: "Stance",
  },
  {
    key: "sentenceType",
    label: "Sentence type",
  },
  {
    key: "personalization",
    label: "Personalization",
  },
];

export function aggregateCreatorPostPatterns(
  posts: CreatorPostForAggregation[]
): PatternDimension[] {
  const allViews = posts
    .map((post) => post.views)
    .filter((views): views is number => views !== null);

  const baselineMedianViews = median(allViews);

  return dimensions
    .map(({ key, label }) => {
      const groups = new Map<
        string,
        {
          postIds: string[];
          views: number[];
        }
      >();

      for (const post of posts) {
        const rawValue = post[key];

        if (!rawValue) {
          continue;
        }

        const value =
          key === "topic"
            ? rawValue.trim()
            : formatEnumLabel(rawValue);

        if (!value) {
          continue;
        }

        const existing = groups.get(value);

        if (existing) {
          existing.postIds.push(post.id);

          if (post.views !== null) {
            existing.views.push(post.views);
          }
        } else {
          groups.set(value, {
            postIds: [post.id],
            views: post.views !== null ? [post.views] : [],
          });
        }
      }

      const patterns = Array.from(groups.entries())
        .map(([value, group]) => {
          const postCount = group.postIds.length;
          const postsWithViews = group.views.length;
          const patternMedianViews = median(group.views);

          const performanceCoverage = getPerformanceCoverage(
            postCount,
            postsWithViews
          );

          const medianLiftPercent = getMedianLiftPercent(
            patternMedianViews,
            baselineMedianViews
          );

          const signalLevel = getSignalLevel(
            postsWithViews,
            performanceCoverage,
            medianLiftPercent
          );

          return {
            value,
            postCount,
            postsWithViews,
            averageViews: average(group.views),
            medianViews: patternMedianViews,
            sourcePostIds: group.postIds,

            sampleSize: postCount,
            performanceCoverage,

            evidenceLevel: getEvidenceLevel(
              postCount,
              postsWithViews
            ),

            evidenceLabel: getEvidenceLabel(
              postCount,
              postsWithViews
            ),

            signalLevel,

            signalLabel: getSignalLabel(
              signalLevel,
              medianLiftPercent
            ),

            baselineMedianViews,
            medianLiftPercent,
          };
        })
        .sort((a, b) => {
          const signalRank: Record<PatternSignalLevel, number> = {
            none: 0,
            insufficient: 1,
            potential: 2,
            emerging: 3,
            repeated: 4,
          };

          if (
            signalRank[b.signalLevel] !==
            signalRank[a.signalLevel]
          ) {
            return (
              signalRank[b.signalLevel] -
              signalRank[a.signalLevel]
            );
          }

          if (b.postCount !== a.postCount) {
            return b.postCount - a.postCount;
          }

          return (
            (b.averageViews ?? 0) -
            (a.averageViews ?? 0)
          );
        });

      return {
        key,
        label,
        patterns,
      };
    })
    .filter(
      (dimension) => dimension.patterns.length > 0
    );
}