"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;

  const niche = formData.getAll("niche") as string[];
  const followerStage = formData.get("followerStage") as string;

  await prisma.user.update({
    where: { clerkId: userId },
    data: { niche, followerStage },
  });

  revalidatePath("/settings");
  revalidatePath("/strategies");
}