"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function startTracking(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const strategyId = formData.get("strategyId") as string;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    redirect("/");
  }

  const existing = await prisma.experiment.findFirst({
    where: { userId: user.id, strategyId, status: "active" },
  });

  if (!existing) {
    await prisma.experiment.create({
      data: {
        userId: user.id,
        strategyId,
        status: "active",
      },
    });
  }

  redirect("/dashboard");
}