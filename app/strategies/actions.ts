"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

const MAX_HYPOTHESIS_LENGTH = 1000;
const MAX_PROTOCOL_LENGTH = 2000;
const MAX_POST_CONTENT_LENGTH = 10000;
const MAX_POST_URL_LENGTH = 2048;
const MAX_POST_ID_LENGTH = 255;

const VALID_PRIMARY_METRICS = [
  "views",
  "likes",
  "replies",
  "reposts",
  "engagement_rate",
  "follower_growth",
] as const;

function cleanOptionalText(
  value: FormDataEntryValue | null,
  maxLength: number
) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (trimmed.length > maxLength) {
    return undefined;
  }

  return trimmed;
}

function parseOptionalNonNegativeInt(
  value: FormDataEntryValue | null
) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const parsed = Number.parseInt(value.trim(), 10);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function parseOptionalPositiveInt(
  value: FormDataEntryValue | null
) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const parsed = Number.parseInt(value.trim(), 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function parseRequiredNonNegativeNumber(
  value: FormDataEntryValue | null
) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const parsed = Number(value.trim());

  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function parseRequiredPositiveInt(
  value: FormDataEntryValue | null
) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const parsed = Number.parseInt(value.trim(), 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

export async function startTracking(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const strategyId = formData.get("strategyId");

  if (typeof strategyId !== "string" || !strategyId.trim()) {
    redirect("/strategies");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  /*
   * Strategy is the reusable experiment template.
   *
   * User-provided experiment values take precedence.
   * Strategy recommendations are used when the corresponding
   * experiment field is left blank.
   */
  const strategy = await prisma.strategy.findUnique({
    where: {
      id: strategyId,
    },
    select: {
      id: true,
      hypothesisTemplate: true,
      protocolTemplate: true,
      recommendedDurationDays: true,
      recommendedPostCount: true,
      primaryMetric: true,
      successThresholdPercent: true,
    },
  });

  if (!strategy) {
    redirect("/strategies");
  }

  const existing = await prisma.experiment.findFirst({
    where: {
      userId: user.id,
      strategyId,
      status: "active",
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    redirect(`/experiments/${existing.id}`);
  }

  const hypothesis =
    cleanOptionalText(
      formData.get("hypothesis"),
      MAX_HYPOTHESIS_LENGTH
    ) ?? strategy.hypothesisTemplate ?? undefined;

  const protocol =
    cleanOptionalText(
      formData.get("protocol"),
      MAX_PROTOCOL_LENGTH
    ) ?? strategy.protocolTemplate ?? undefined;

  const durationDays =
    parseOptionalPositiveInt(
      formData.get("durationDays")
    ) ?? strategy.recommendedDurationDays ?? undefined;

  const targetPostCount =
    parseOptionalPositiveInt(
      formData.get("targetPostCount")
    ) ?? strategy.recommendedPostCount ?? undefined;

  const successThresholdPercent =
    parseOptionalNonNegativeInt(
      formData.get("successThresholdPercent")
    ) ??
    strategy.successThresholdPercent ??
    undefined;

  const primaryMetricValue = cleanOptionalText(
    formData.get("primaryMetric"),
    50
  );

  const submittedPrimaryMetric =
    primaryMetricValue &&
    VALID_PRIMARY_METRICS.includes(
      primaryMetricValue as (typeof VALID_PRIMARY_METRICS)[number]
    )
      ? primaryMetricValue
      : undefined;

  const strategyPrimaryMetric =
    strategy.primaryMetric &&
    VALID_PRIMARY_METRICS.includes(
      strategy.primaryMetric as (typeof VALID_PRIMARY_METRICS)[number]
    )
      ? strategy.primaryMetric
      : undefined;

  const primaryMetric =
    submittedPrimaryMetric ??
    strategyPrimaryMetric ??
    undefined;

  const researchCreatorId = formData.get("researchCreatorId");
  const researchDimension = formData.get("researchDimension");
  const researchPattern = formData.get("researchPattern");
  const researchSignal = formData.get("researchSignal");
  const researchPostCount = formData.get("researchPostCount");
  const researchMeasuredCount = formData.get(
    "researchMeasuredCount"
  );
  const researchEvidence = formData.get("researchEvidence");

  const hasResearchContext =
    typeof researchCreatorId === "string" &&
    researchCreatorId.trim().length > 0 &&
    typeof researchDimension === "string" &&
    researchDimension.trim().length > 0 &&
    typeof researchPattern === "string" &&
    researchPattern.trim().length > 0 &&
    typeof researchSignal === "string" &&
    researchSignal.trim().length > 0 &&
    typeof researchPostCount === "string" &&
    researchPostCount.trim().length > 0 &&
    typeof researchMeasuredCount === "string" &&
    researchMeasuredCount.trim().length > 0 &&
    typeof researchEvidence === "string" &&
    researchEvidence.trim().length > 0;

  let researchFindingId: string | undefined;

  if (hasResearchContext) {
    const creator = await prisma.creator.findUnique({
      where: {
        id: researchCreatorId,
      },
      select: {
        id: true,
      },
    });

    if (creator) {
      const postCount = Number.parseInt(
        researchPostCount,
        10
      );

      const measuredCount = Number.parseInt(
        researchMeasuredCount,
        10
      );

      if (
        Number.isInteger(postCount) &&
        Number.isInteger(measuredCount) &&
        postCount >= 0 &&
        measuredCount >= 0 &&
        measuredCount <= postCount
      ) {
        const researchFinding =
          await prisma.researchFinding.create({
            data: {
              creatorId: creator.id,
              dimension: researchDimension,
              pattern: researchPattern,
              signalLevel: researchSignal,
              postCount,
              measuredCount,
              evidenceLabel: researchEvidence,
            },
            select: {
              id: true,
            },
          });

        researchFindingId = researchFinding.id;
      }
    }
  }

  const experimentData = {
    userId: user.id,
    strategyId,
    status: "active" as const,

    ...(researchFindingId
      ? {
          researchFindingId,
        }
      : {}),

    ...(hypothesis
      ? {
          hypothesis,
        }
      : {}),

    ...(protocol
      ? {
          protocol,
        }
      : {}),

    ...(durationDays !== undefined
      ? {
          durationDays,
        }
      : {}),

    ...(targetPostCount !== undefined
      ? {
          targetPostCount,
        }
      : {}),

    ...(primaryMetric
      ? {
          primaryMetric,
        }
      : {}),

    ...(successThresholdPercent !== undefined
      ? {
          successThresholdPercent,
        }
      : {}),
  };

  const experiment = await prisma.experiment.create({
    data: experimentData,
    select: {
      id: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/strategies");
  revalidatePath("/experiments");

  redirect(`/experiments/${experiment.id}`);
}

/**
 * Set the baseline for an experiment.
 *
 * The baseline is explicitly captured before or during the experiment.
 * It is never calculated from the experiment's own posts.
 */
export async function setExperimentBaseline(
  formData: FormData
) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const experimentId = formData.get("experimentId");

  if (
    typeof experimentId !== "string" ||
    !experimentId.trim()
  ) {
    return;
  }

  const baselineAverage = parseRequiredNonNegativeNumber(
    formData.get("baselineAverage")
  );

  const baselineSampleSize = parseRequiredPositiveInt(
    formData.get("baselineSampleSize")
  );

  if (
    baselineAverage === undefined ||
    baselineSampleSize === undefined
  ) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  const experiment = await prisma.experiment.findFirst({
    where: {
      id: experimentId,
      userId: user.id,
    },
    select: {
      id: true,
      status: true,
      primaryMetric: true,
    },
  });

  if (!experiment) {
    return;
  }

  if (experiment.status === "completed") {
    return;
  }

  if (!experiment.primaryMetric) {
    return;
  }

  if (experiment.primaryMetric === "follower_growth") {
    return;
  }

  await prisma.experiment.update({
    where: {
      id: experiment.id,
    },
    data: {
      baselineAverage,
      baselineSampleSize,
      baselineCapturedAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/experiments");
  revalidatePath(`/experiments/${experiment.id}`);
}

/**
 * Add a post to an experiment.
 *
 * This is intentionally limited to posts owned by the
 * authenticated user's experiment.
 *
 * The action stores post identity/content and optional
 * performance data. It does not publish anything to X.
 */
export async function addExperimentPost(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const experimentId = formData.get("experimentId");

  if (
    typeof experimentId !== "string" ||
    !experimentId.trim()
  ) {
    return;
  }

  const postId = cleanOptionalText(
    formData.get("postId"),
    MAX_POST_ID_LENGTH
  );

  const postUrl = cleanOptionalText(
    formData.get("postUrl"),
    MAX_POST_URL_LENGTH
  );

  const content = cleanOptionalText(
    formData.get("content"),
    MAX_POST_CONTENT_LENGTH
  );

  const publishedAtValue = cleanOptionalText(
    formData.get("publishedAt"),
    100
  );

  const viewsValue = cleanOptionalText(
    formData.get("views"),
    20
  );

  const likesValue = cleanOptionalText(
    formData.get("likes"),
    20
  );

  const repliesValue = cleanOptionalText(
    formData.get("replies"),
    20
  );

  const repostsValue = cleanOptionalText(
    formData.get("reposts"),
    20
  );

  if (!postId && !postUrl && !content) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  const experiment = await prisma.experiment.findFirst({
    where: {
      id: experimentId,
      userId: user.id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!experiment) {
    return;
  }

  if (experiment.status === "completed") {
    return;
  }

  const views = viewsValue
    ? Number.parseInt(viewsValue, 10)
    : undefined;

  const likes = likesValue
    ? Number.parseInt(likesValue, 10)
    : undefined;

  const replies = repliesValue
    ? Number.parseInt(repliesValue, 10)
    : undefined;

  const reposts = repostsValue
    ? Number.parseInt(repostsValue, 10)
    : undefined;

  for (const value of [
    views,
    likes,
    replies,
    reposts,
  ]) {
    if (
      value !== undefined &&
      (!Number.isInteger(value) || value < 0)
    ) {
      return;
    }
  }

  let publishedAt: Date | undefined;

  if (publishedAtValue) {
    const parsedDate = new Date(publishedAtValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return;
    }

    publishedAt = parsedDate;
  }

  if (postId || postUrl) {
    const duplicate =
      await prisma.experimentPost.findFirst({
        where: {
          experimentId: experiment.id,
          OR: [
            ...(postId ? [{ postId }] : []),
            ...(postUrl ? [{ postUrl }] : []),
          ],
        },
        select: {
          id: true,
        },
      });

    if (duplicate) {
      return;
    }
  }

  await prisma.experimentPost.create({
    data: {
      experimentId: experiment.id,
      ...(postId ? { postId } : {}),
      ...(postUrl ? { postUrl } : {}),
      ...(content ? { content } : {}),
      ...(publishedAt ? { publishedAt } : {}),
      ...(views !== undefined ? { views } : {}),
      ...(likes !== undefined ? { likes } : {}),
      ...(replies !== undefined ? { replies } : {}),
      ...(reposts !== undefined ? { reposts } : {}),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/experiments");
  revalidatePath(`/experiments/${experiment.id}`);
}

/**
 * Delete one ExperimentPost belonging to the currently
 * authenticated user's experiment.
 */
export async function deleteExperimentPost(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const experimentPostId = formData.get("experimentPostId");

  if (
    typeof experimentPostId !== "string" ||
    !experimentPostId.trim()
  ) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  const experimentPost = await prisma.experimentPost.findFirst({
    where: {
      id: experimentPostId,
      experiment: {
        userId: user.id,
      },
    },
    select: {
      id: true,
      experimentId: true,
    },
  });

  if (!experimentPost) {
    return;
  }

  await prisma.experimentPost.delete({
    where: {
      id: experimentPost.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/experiments");
  revalidatePath(
    `/experiments/${experimentPost.experimentId}`
  );
}

/**
 * Update performance metrics for an ExperimentPost.
 */
export async function updateExperimentPostMetrics(
  formData: FormData
) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const experimentPostId = formData.get("experimentPostId");

  if (
    typeof experimentPostId !== "string" ||
    !experimentPostId.trim()
  ) {
    return;
  }

  const viewsValue = cleanOptionalText(
    formData.get("views"),
    20
  );

  const likesValue = cleanOptionalText(
    formData.get("likes"),
    20
  );

  const repliesValue = cleanOptionalText(
    formData.get("replies"),
    20
  );

  const repostsValue = cleanOptionalText(
    formData.get("reposts"),
    20
  );

  const views = viewsValue
    ? Number.parseInt(viewsValue, 10)
    : null;

  const likes = likesValue
    ? Number.parseInt(likesValue, 10)
    : null;

  const replies = repliesValue
    ? Number.parseInt(repliesValue, 10)
    : null;

  const reposts = repostsValue
    ? Number.parseInt(repostsValue, 10)
    : null;

  for (const value of [
    views,
    likes,
    replies,
    reposts,
  ]) {
    if (
      value !== null &&
      (!Number.isInteger(value) || value < 0)
    ) {
      return;
    }
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  const experimentPost =
    await prisma.experimentPost.findFirst({
      where: {
        id: experimentPostId,
        experiment: {
          userId: user.id,
        },
      },
      select: {
        id: true,
        experimentId: true,
        experiment: {
          select: {
            status: true,
          },
        },
      },
    });

  if (!experimentPost) {
    return;
  }

  if (experimentPost.experiment.status === "completed") {
    return;
  }

  await prisma.experimentPost.update({
    where: {
      id: experimentPost.id,
    },
    data: {
      views,
      likes,
      replies,
      reposts,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/experiments");
  revalidatePath(
    `/experiments/${experimentPost.experimentId}`
  );
}

/**
 * Delete one experiment belonging to the currently authenticated user.
 */
export async function deleteExperiment(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const experimentId = formData.get("experimentId");

  if (typeof experimentId !== "string" || !experimentId) {
    redirect("/experiments");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    redirect("/experiments");
  }

  const experiment = await prisma.experiment.findFirst({
    where: {
      id: experimentId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!experiment) {
    redirect("/experiments");
  }

  await prisma.$transaction(async (tx) => {
    await tx.checkIn.deleteMany({
      where: {
        experimentId: experiment.id,
      },
    });

    await tx.experimentPost.deleteMany({
      where: {
        experimentId: experiment.id,
      },
    });

    await tx.experiment.delete({
      where: {
        id: experiment.id,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/strategies");
  revalidatePath("/experiments");
  revalidatePath(`/experiments/${experiment.id}`);

  redirect("/experiments");
}