import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { saveProfile } from "./actions";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (user && user.niche.length > 0 && user.followerStage) {
    redirect("/strategies");
  }

  const strategies = await prisma.strategy.findMany({
    select: {
      nicheTags: true,
      stageTags: true,
    },
  });

  const niches = Array.from(
    new Set(strategies.flatMap((strategy) => strategy.nicheTags))
  ).sort();

  const stages = Array.from(
    new Set(strategies.flatMap((strategy) => strategy.stageTags))
  ).sort();

  return (
    <main className="min-h-screen w-full bg-[#090B0C]">
      <OnboardingForm
        niches={niches}
        stages={stages}
        action={saveProfile}
      />
    </main>
  );
}