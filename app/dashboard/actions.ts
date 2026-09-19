"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function logCheckIn(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return;

  const experimentId = formData.get("experimentId") as string;
  const followerCount = parseInt(formData.get("followerCount") as string, 10);
  if (isNaN(followerCount)) return;

  const experiment = await prisma.experiment.findFirst({
    where: { id: experimentId, userId: user.id },
  });
  if (!experiment) return;

  await prisma.checkIn.create({
    data: { experimentId, followerCount },
  });

  revalidatePath("/dashboard");
}

export async function updateExperimentStatus(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return;

  const experimentId = formData.get("experimentId") as string;
  const status = formData.get("status") as string;

  await prisma.experiment.updateMany({
    where: { id: experimentId, userId: user.id },
    data: { status },
  });

  revalidatePath("/dashboard");
}