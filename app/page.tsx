import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import { Hero } from "./components/landing/Hero";
import { Features } from "./components/landing/Features";
import { HowItWorks } from "./components/landing/HowItWorks";
import { Strategies } from "./components/landing/Strategies";
import { Stats } from "./components/landing/Stats";
import { PricingSection } from "./components/PricingSection";
import { Faq } from "./components/landing/Faq";
import { FinalCta } from "./components/landing/FinalCta";
import { Footer } from "./components/landing/Footer";

export default async function Home() {
  const clerkUser = await currentUser();

  if (clerkUser) {
    const email =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      throw new Error("Authenticated Clerk user does not have an email address.");
    }

    const user = await prisma.user.upsert({
      where: {
        clerkId: clerkUser.id,
      },
      update: {
        email,
      },
      create: {
        clerkId: clerkUser.id,
        email,
      },
    });

    if (user.niche.length === 0 || !user.followerStage) {
      redirect("/onboarding");
    }

    redirect("/strategies");
  }

  const [featuredStrategies, allStrategies] = await Promise.all([
    prisma.strategy.findMany({
      orderBy: { createdAt: "asc" },
      take: 5,
    }),

    prisma.strategy.findMany({
      include: {
        experiments: {
          include: {
            checkIns: {
              orderBy: { loggedAt: "asc" },
            },
          },
        },
      },
    }),
  ]);

  const totalExperiments = allStrategies.reduce(
    (sum, strategy) => sum + strategy.experiments.length,
    0
  );

  const totalCheckIns = allStrategies.reduce(
    (sum, strategy) =>
      sum +
      strategy.experiments.reduce(
        (experimentSum, experiment) =>
          experimentSum + experiment.checkIns.length,
        0
      ),
    0
  );

  const strategyResults = allStrategies.map((strategy) => {
    const growthValues = strategy.experiments
      .filter((experiment) => experiment.checkIns.length >= 2)
      .map(
        (experiment) =>
          experiment.checkIns[experiment.checkIns.length - 1].followerCount -
          experiment.checkIns[0].followerCount
      );

    const avgGrowth = growthValues.length
      ? Math.round(
          growthValues.reduce((a, b) => a + b, 0) / growthValues.length
        )
      : null;

    return {
      title: strategy.title,
      avgGrowth,
      sampleSize: growthValues.length,
    };
  });

  const topStrategy = [...strategyResults]
    .filter((strategy) => strategy.avgGrowth !== null)
    .sort(
      (a, b) =>
        (b.avgGrowth ?? 0) - (a.avgGrowth ?? 0)
    )[0] as
    | {
        title: string;
        avgGrowth: number;
        sampleSize: number;
      }
    | undefined;

  const recentList = [...strategyResults]
    .sort(
      (a, b) =>
        (b.avgGrowth ?? -9999) - (a.avgGrowth ?? -9999)
    )
    .slice(0, 4);

  return (
    <main
      className="dark min-h-screen text-foreground"
      style={{
        background:
          "radial-gradient(900px circle at 90% 5%, rgba(109,94,240,0.10), transparent 55%), radial-gradient(600px circle at 5% 40%, rgba(34,197,94,0.06), transparent 55%), var(--background)",
      }}
    >
      {/* Navbar */}
      <div className="border-b border-border sticky top-0 bg-background/90 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 md:px-12 py-5">
          <div
            className="text-lg font-semibold"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Slancialab
          </div>

          <div className="flex items-center gap-4 md:gap-7">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden lg:inline"
            >
              Product
            </a>

            <a
              href="#strategies"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden lg:inline"
            >
              Strategies
            </a>

            <a
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden lg:inline"
            >
              Pricing
            </a>

            <Link
              href="/leaderboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:inline"
            >
              Leaderboard
            </Link>

            <Link
              href="/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>

            <Link
              href="/sign-up"
              className="rounded-full px-4 md:px-5 py-2.5 text-sm font-semibold bg-accent text-accent-foreground"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <Hero
        totalCheckIns={totalCheckIns}
        topStrategy={topStrategy}
        recentList={recentList}
      />

      {/* Features */}
      <Features />

      {/* How it works */}
      <HowItWorks />

      {/* Strategies */}
      <Strategies strategies={featuredStrategies} />

      {/* Testimonials / Stats */}
      <Stats />

      {/* Pricing */}
      <PricingSection />

      {/* FAQ */}
      <Faq />

      {/* Final CTA */}
      <FinalCta />

      {/* Footer */}
      <Footer />
    </main>
  );
}