"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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

  const researchCreatorId = formData.get("researchCreatorId");
  const researchDimension = formData.get("researchDimension");
  const researchPattern = formData.get("researchPattern");
  const researchSignal = formData.get("researchSignal");
  const researchPostCount = formData.get("researchPostCount");
  const researchMeasuredCount = formData.get("researchMeasuredCount");
  const researchEvidence = formData.get("researchEvidence");
  const researchLift = formData.get("researchLift");

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

  const existing = await prisma.experiment.findFirst({
    where: {
      userId: user.id,
      strategyId,
      status: "active",
    },
  });

  if (!existing) {
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
        const postCount = Number.parseInt(researchPostCount, 10);
        const measuredCount = Number.parseInt(researchMeasuredCount, 10);

        const parsedLift =
          typeof researchLift === "string" && researchLift.length > 0
            ? Number.parseInt(researchLift, 10)
            : null;

        if (
          Number.isFinite(postCount) &&
          Number.isFinite(measuredCount)
        ) {
          const researchFinding = await prisma.researchFinding.create({
            data: {
              creatorId: creator.id,
              dimension: researchDimension,
              pattern: researchPattern,
              signalLevel: researchSignal,
              postCount,
              measuredCount,
              evidenceLabel: researchEvidence,
              medianLiftPercent:
                parsedLift !== null && Number.isFinite(parsedLift)
                  ? parsedLift
                  : null,
            },
            select: {
              id: true,
            },
          });

          researchFindingId = researchFinding.id;
        }
      }
    }

    await prisma.experiment.create({
      data: {
        userId: user.id,
        strategyId,
        researchFindingId,
        status: "active",
      },
    });
  }

  redirect("/dashboard");
}