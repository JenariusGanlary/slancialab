"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function saveProfile(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const niche = formData.getAll("niche").filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  );

  const followerStageValue = formData.get("followerStage");
  const goalValue = formData.get("goal");
  const firstActionValue = formData.get("firstAction");

  const followerStage =
    typeof followerStageValue === "string" && followerStageValue.trim()
      ? followerStageValue
      : null;

  const goal =
    typeof goalValue === "string" && goalValue.trim()
      ? goalValue
      : null;

  const firstAction =
    typeof firstActionValue === "string" && firstActionValue.trim()
      ? firstActionValue
      : null;

  await prisma.user.update({
    where: {
      clerkId: userId,
    },
    data: {
      niche,
      followerStage,
      goal,
      firstAction,
    },
  });

  redirect("/strategies");
}