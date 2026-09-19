import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProfile } from "./actions";
import { SettingsForm } from "./SettingsForm";
import { AppLayout } from "../components/AppLayout";
import { SignOutButton } from "@clerk/nextjs";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/");

  const strategies = await prisma.strategy.findMany({
    select: { nicheTags: true, stageTags: true },
  });
  const niches = Array.from(new Set(strategies.flatMap((s) => s.nicheTags))).sort();
  const stages = Array.from(new Set(strategies.flatMap((s) => s.stageTags))).sort();

  return (
    <AppLayout>
      <main className="px-8 py-10 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h1
            className="text-3xl mb-2"
            style={{ fontFamily: "Fraunces, serif", fontWeight: 600, letterSpacing: "-0.015em" }}
          >
            Settings
          </h1>
          <p className="text-sm text-muted-foreground mb-10">{user.email}</p>

          <SettingsForm
            niches={niches}
            stages={stages}
            currentNiche={user.niche}
            currentStage={user.followerStage ?? ""}
            action={updateProfile}
          />

          <div className="mt-16 pt-8 border-t border-border">
            <h2 className="text-sm text-muted-foreground mb-4">Account</h2>
            <SignOutButton>
              <button className="text-sm px-5 py-2.5 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors">
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}