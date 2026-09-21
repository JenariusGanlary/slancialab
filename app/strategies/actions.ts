"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function startTracking(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const strategyId = formData.get("strategyId");

  if (typeof strategyId !== "string" || !strategyId) {
    redirect("/strategies");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (!user) {
    redirect("/");
  }

  const strategy = await prisma.strategy.findUnique({
    where: {
      id: strategyId,
    },
    select: {
      id: true,
    },
  });

  if (!strategy) {
    redirect("/strategies");
  }

  /*
   * Prevent duplicate active experiments for the same
   * user + strategy.
   *
   * Completed/paused experiments remain valid history and
   * do not prevent the user from starting the strategy again.
   */
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

  const researchCreatorId = formData.get("researchCreatorId");
  const researchDimension = formData.get("researchDimension");
  const researchPattern = formData.get("researchPattern");
  const researchSignal = formData.get("researchSignal");
  const researchPostCount = formData.get("researchPostCount");
  const researchMeasuredCount = formData.get("researchMeasuredCount");
  const researchEvidence = formData.get("researchEvidence");

  const hasResearchContext =
    typeof researchCreatorId === "string" &&
    researchCreatorId.length > 0 &&
    typeof researchDimension === "string" &&
    researchDimension.length > 0 &&
    typeof researchPattern === "string" &&
    researchPattern.length > 0 &&
    typeof researchSignal === "string" &&
    researchSignal.length > 0 &&
    typeof researchPostCount === "string" &&
    researchPostCount.length > 0 &&
    typeof researchMeasuredCount === "string" &&
    researchMeasuredCount.length > 0 &&
    typeof researchEvidence === "string" &&
    researchEvidence.length > 0;

  /*
   * Create the research finding and experiment together.
   *
   * This prevents an orphan ResearchFinding from being created
   * if the experiment creation fails.
   */
  const experiment = await prisma.$transaction(async (tx) => {
    let researchFindingId: string | undefined;

    if (hasResearchContext) {
      const creator = await tx.creator.findUnique({
        where: {
          id: researchCreatorId,
        },
        select: {
          id: true,
        },
      });

      if (creator) {
        const postCount = Number.parseInt(researchPostCount, 10);
        const measuredCount = Number.parseInt(
          researchMeasuredCount,
          10
        );

        if (
          Number.isFinite(postCount) &&
          Number.isFinite(measuredCount)
        ) {
          const researchFinding = await tx.researchFinding.create({
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

    return tx.experiment.create({
      data: {
        userId: user.id,
        strategyId,
        researchFindingId,
        status: "active",
      },
      select: {
        id: true,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/strategies");
  revalidatePath("/experiments");

  redirect(`/experiments/${experiment.id}`);
}

/**
 * Delete one experiment belonging to the currently authenticated user.
 *
 * IMPORTANT:
 * This does NOT delete:
 * - User
 * - Strategy
 * - Creator
 * - CreatorPost
 * - ResearchFinding
 * - Any other Experiment
 *
 * It only removes:
 * - the selected Experiment
 * - CheckIns belonging to that Experiment
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
    redirect("/");
  }

  /*
   * Ownership check.
   *
   * The experiment must belong to the authenticated user.
   */
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

  /*
   * Delete only the selected experiment and its check-ins.
   *
   * We intentionally do NOT delete the ResearchFinding because
   * research history is valuable data and may be referenced by
   * other future records.
   */
  await prisma.$transaction(async (tx) => {
    await tx.checkIn.deleteMany({
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