"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function saveProfile(formData: FormData) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  const niche = formData
    .getAll("niche")
    .filter(
      (value): value is string =>
        typeof value === "string" &&
        value.trim().length > 0
    );

  const followerStageValue =
    formData.get("followerStage");

  const goalValue =
    formData.get("goal");

  const firstActionValue =
    formData.get("firstAction");

  const followerStage =
    typeof followerStageValue === "string" &&
    followerStageValue.trim()
      ? followerStageValue
      : null;

  const goal =
    typeof goalValue === "string" &&
    goalValue.trim()
      ? goalValue
      : null;

  const firstAction =
    typeof firstActionValue === "string" &&
    firstActionValue.trim()
      ? firstActionValue
      : null;

  const existingUser =
    await prisma.user.findUnique({
      where: {
        clerkId,
      },
      select: {
        id: true,
      },
    });

  if (existingUser) {
    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        niche,
        followerStage,
        goal,
        firstAction,
      },
    });
  } else {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      redirect("/");
    }

    const email =
      clerkUser.emailAddresses.find(
        (emailAddress) =>
          emailAddress.id ===
          clerkUser.primaryEmailAddressId
      )?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      throw new Error(
        "No email address is available for the authenticated Clerk user."
      );
    }

    await prisma.user.create({
      data: {
        clerkId,
        email,
        niche,
        followerStage,
        goal,
        firstAction,
      },
    });
  }

  redirect("/strategies");
}