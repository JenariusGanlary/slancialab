"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  evaluateExperiment,
  type ExperimentPostForEvaluation,
} from "@/lib/experiment-evaluation";
import {
  canTransitionExperimentStatus,
  isValidExperimentStatus,
  type ExperimentStatus,
} from "@/lib/experiment-lifecycle";

export async function logCheckIn(formData: FormData) {
  const { userId } = await auth();

  if (!userId) return;

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (!user) return;

  const experimentId = formData.get("experimentId");

  if (typeof experimentId !== "string" || !experimentId.trim()) {
    return;
  }

  const followerCountValue = formData.get("followerCount");

  if (typeof followerCountValue !== "string") {
    return;
  }

  const normalizedFollowerCount = followerCountValue.trim();

  if (!/^\d+$/.test(normalizedFollowerCount)) {
    return;
  }

  const followerCount = Number(normalizedFollowerCount);

  if (
    !Number.isSafeInteger(followerCount) ||
    followerCount < 0
  ) {
    return;
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

  if (!experiment) return;

  /*
   * Follower measurements belong to a running experiment.
   * Completed experiments are immutable.
   */
  if (
    experiment.status !== "active" &&
    experiment.status !== "paused"
  ) {
    return;
  }

  await prisma.checkIn.create({
    data: {
      experimentId: experiment.id,
      followerCount,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/experiments");
  revalidatePath(`/experiments/${experiment.id}`);
}

export async function updateExperimentStatus(formData: FormData) {
  const { userId } = await auth();

  if (!userId) return;

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (!user) return;

  const experimentId = formData.get("experimentId");
  const requestedStatus = formData.get("status");

  if (
    typeof experimentId !== "string" ||
    !experimentId.trim() ||
    typeof requestedStatus !== "string" ||
    !isValidExperimentStatus(requestedStatus)
  ) {
    return;
  }

  const experiment = await prisma.experiment.findFirst({
    where: {
      id: experimentId,
      userId: user.id,
    },
    select: {
      id: true,
      status: true,
      completedAt: true,
      primaryMetric: true,
      successThresholdPercent: true,
      baselineAverage: true,
      baselineSampleSize: true,
      posts: {
        select: {
          id: true,
          views: true,
          likes: true,
          replies: true,
          reposts: true,
        },
      },
      checkIns: {
        select: {
          id: true,
          followerCount: true,
          loggedAt: true,
        },
        orderBy: {
          loggedAt: "asc",
        },
      },
    },
  });

  if (!experiment) return;

  const currentStatus: ExperimentStatus | null =
    isValidExperimentStatus(experiment.status)
      ? experiment.status
      : null;

  if (!currentStatus) {
    return;
  }

  if (
    !canTransitionExperimentStatus(
      currentStatus,
      requestedStatus
    )
  ) {
    return;
  }

  /*
   * Completing an experiment creates an immutable ExperimentResult
   * snapshot before marking the experiment as completed.
   */
  if (requestedStatus === "completed") {
    const posts: ExperimentPostForEvaluation[] =
      experiment.posts.map((post) => ({
        id: post.id,
        metrics: {
          views: post.views,
          likes: post.likes,
          replies: post.replies,
          reposts: post.reposts,
        },
      }));

    const evaluation = evaluateExperiment({
      primaryMetric: experiment.primaryMetric,
      successThresholdPercent:
        experiment.successThresholdPercent,
      posts,
      baselineAverage: experiment.baselineAverage,
      followerMeasurements: experiment.checkIns,
    });

    /*
     * Do not record a final result when the experiment
     * does not contain enough information to evaluate.
     */
    if (
      evaluation.status === "insufficient_data" ||
      !evaluation.primaryMetric
    ) {
      return;
    }

    const primaryMetric = evaluation.primaryMetric;

    await prisma.$transaction(async (tx) => {
      await tx.experimentResult.create({
        data: {
          experimentId: experiment.id,
          status: evaluation.status,
          primaryMetric,
          postsMeasured: evaluation.postsWithMetric,
          baselineAverage: evaluation.baselineAverage,
          baselineSampleSize: experiment.baselineSampleSize,
          experimentAverage: evaluation.experimentAverage,
          absoluteChange: evaluation.absoluteChange,
          percentageChange: evaluation.percentageChange,
          successThresholdPercent:
            evaluation.successThresholdPercent,
        },
      });

      await tx.experiment.update({
        where: {
          id: experiment.id,
        },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });
    });
  } else {
    await prisma.experiment.update({
      where: {
        id: experiment.id,
      },
      data: {
        status: requestedStatus,
        completedAt: null,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/experiments");
  revalidatePath(`/experiments/${experiment.id}`);
}