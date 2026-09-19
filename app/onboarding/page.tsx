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

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (user && user.niche.length > 0 && user.followerStage) {
    redirect("/strategies");
  }

  const strategies = await prisma.strategy.findMany({
    select: { nicheTags: true, stageTags: true },
  });

  const niches = Array.from(new Set(strategies.flatMap((s) => s.nicheTags))).sort();
  const stages = Array.from(new Set(strategies.flatMap((s) => s.stageTags))).sort();

  return (
    <main
      className="min-h-screen flex items-center justify-center px-8 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(1000px circle at 90% 0%, rgba(217,164,65,0.13), transparent 60%), radial-gradient(600px circle at 0% 100%, rgba(15,110,106,0.06), transparent 60%), linear-gradient(160deg, #16191B 0%, #0C0F11 100%)",
        color: "#ECE7DC",
      }}
    >
      <svg width="0" height="0" style={{ position: "absolute", overflow: "hidden" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.03 0" />
        </filter>
      </svg>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ filter: "url(#grain)", mixBlendMode: "overlay", opacity: 0.15 }}
      />

      <div
        className="w-full max-w-md rounded-2xl p-10 border relative"
        style={{
          background: "rgba(255,255,255,0.032)",
          backdropFilter: "blur(24px)",
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: "0 24px 50px -28px rgba(0,0,0,0.65)",
        }}
      >
        <div
          className="text-lg mb-8"
          style={{
            fontFamily: "Fraunces, serif",
            fontWeight: 600,
            background: "linear-gradient(135deg, #F4F0E6, #C9A465)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Slancialab
        </div>

        <OnboardingForm niches={niches} stages={stages} action={saveProfile} />
      </div>
    </main>
  );
}