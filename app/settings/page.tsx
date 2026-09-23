import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProfile } from "./actions";
import { SettingsForm } from "./SettingsForm";
import { AppLayout } from "../components/AppLayout";
import { SignOutButton } from "@clerk/nextjs";
import {
  Mail,
  SlidersHorizontal,
  UserRound,
  LogOut,
  Link2,
  ExternalLink,
} from "lucide-react";

type SettingsPageProps = {
  searchParams: Promise<{
    x?: string;
    message?: string;
  }>;
};

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      xAccount: {
        select: {
          username: true,
          displayName: true,
          profileImageUrl: true,
          xUserId: true,
          scopes: true,
          tokenExpiresAt: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/");
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

  const params = await searchParams;

  const xStatus = params.x;
  const xMessage = params.message;

  const xAccount = user.xAccount;

  return (
    <AppLayout>
      <main className="relative min-h-full overflow-hidden px-6 py-8 md:px-10 md:py-10 lg:px-12">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#7161A8]/[0.035] blur-[140px]" />

          <div className="absolute -bottom-60 left-1/3 h-[500px] w-[500px] rounded-full bg-[#D9A441]/[0.025] blur-[150px]" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Page header */}
          <header className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9A441] shadow-[0_0_10px_rgba(217,164,65,0.6)]" />

              <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#686F7B]">
                Your lab
              </span>
            </div>

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <h1
                  className="text-4xl font-semibold tracking-[-0.035em] text-[#ECE7DC] md:text-5xl"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  Settings
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#737B88]">
                  Shape the context Slancialab uses to personalize your
                  strategies and experiments.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#565D68]">
                <Mail className="h-3.5 w-3.5" />
                <span>{user.email}</span>
              </div>
            </div>
          </header>

          {/* Profile section */}
          <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0D0F13]/80 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            {/* Section header */}
            <div className="border-b border-white/[0.06] px-6 py-5 md:px-7">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D9A441]/20 bg-[#D9A441]/[0.05]">
                  <UserRound className="h-4 w-4 text-[#D9A441]" />
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#D9A441]/70">
                    Experiment profile
                  </p>

                  <h2
                    className="mt-1 text-xl font-semibold tracking-[-0.02em] text-[#ECE7DC]"
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    Your growth context
                  </h2>

                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#626A76]">
                    These preferences determine which strategies are surfaced
                    for you. Change them as your audience and goals evolve.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile form */}
            <div className="px-6 py-7 md:px-7 md:py-8">
              <SettingsForm
                niches={niches}
                stages={stages}
                currentNiche={user.niche}
                currentStage={user.followerStage ?? ""}
                action={updateProfile}
              />
            </div>
          </section>

          {/* Intelligence section */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0D0F13]/60">
            <div className="flex flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-7">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#7161A8]/20 bg-[#7161A8]/[0.06]">
                  <SlidersHorizontal className="h-4 w-4 text-[#A996D9]" />
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#8171A8]">
                    Experiment system
                  </p>

                  <h2
                    className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#E7E3DB]"
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    Personalization is active
                  </h2>

                  <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#626A76]">
                    Your profile is currently being used to match strategies
                    to your niche and follower stage.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-1.5 md:self-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />

                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-300/70">
                  Active
                </span>
              </div>
            </div>
          </section>

          {/* X account section */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0D0F13]/60">
            <div className="border-b border-white/[0.05] px-6 py-5 md:px-7">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/[0.05]">
                  <Link2 className="h-4 w-4 text-sky-300" />
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-sky-300/70">
                    Creator data
                  </p>

                  <h2
                    className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#E7E3DB]"
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    X account
                  </h2>

                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#626A76]">
                    Connect your X account so Slancialab can work with your
                    creator data and experiment performance.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 md:px-7">
              {xStatus === "success" && (
                <div className="mb-5 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-4 py-3">
                  <p className="text-xs text-emerald-300/80">
                    X account connected successfully.
                  </p>
                </div>
              )}

              {xStatus === "error" && (
                <div className="mb-5 rounded-xl border border-red-400/10 bg-red-400/[0.04] px-4 py-3">
                  <p className="text-xs text-red-300/80">
                    {xMessage ||
                      "Something went wrong while connecting your X account."}
                  </p>
                </div>
              )}

              {xAccount ? (
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    {xAccount.profileImageUrl ? (
                      <img
                        src={xAccount.profileImageUrl}
                        alt=""
                        className="h-11 w-11 rounded-full border border-white/[0.08]"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-sm font-medium text-[#8A919D]">
                        X
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-[#D8D4CC]">
                        {xAccount.displayName}
                      </p>

                      <p className="mt-1 text-xs text-[#626A76]">
                        @{xAccount.username}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />

                        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-emerald-300/70">
                          Connected
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href="/api/auth/x/authorize"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-[#858C97] transition-all hover:border-sky-400/20 hover:bg-sky-400/[0.04] hover:text-sky-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Reconnect X
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-[#C7C3BB]">
                      No X account connected
                    </p>

                    <p className="mt-1 max-w-xl text-xs leading-5 text-[#565D68]">
                      Connect your account to unlock X-based research,
                      publishing, and performance measurement.
                    </p>
                  </div>

                  <a
                    href="/api/auth/x/authorize"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[0.04] px-4 py-2.5 text-xs font-medium text-sky-300 transition-all hover:border-sky-300/30 hover:bg-sky-400/[0.08]"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Connect X
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Account section */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0D0F13]/60">
            <div className="border-b border-white/[0.05] px-6 py-5 md:px-7">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#686F7B]">
                Account
              </p>

              <h2
                className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#E7E3DB]"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Account access
              </h2>
            </div>

            <div className="flex flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-7">
              <div>
                <p className="text-sm text-[#C7C3BB]">{user.email}</p>

                <p className="mt-1 text-xs text-[#565D68]">
                  Sign out of your Slancialab workspace.
                </p>
              </div>

              <SignOutButton>
                <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-[#777F8A] transition-all hover:border-red-400/20 hover:bg-red-400/[0.04] hover:text-red-300">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </SignOutButton>
            </div>
          </section>

          {/* Footer detail */}
          <div className="flex items-center justify-between px-1 pb-8 pt-7">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#3F454E]">
              Slancialab · Growth with evidence
            </p>

            <p className="text-[9px] uppercase tracking-[0.2em] text-[#3F454E]">
              Profile can evolve anytime
            </p>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}