"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function saveProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const niche = formData.getAll("niche") as string[];
  const followerStage = formData.get("followerStage") as string;

  await prisma.user.update({
    where: { clerkId: userId },
    data: { niche, followerStage },
  });

  redirect("/strategies");
}