import { startTracking } from "./actions";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppLayout } from "../components/AppLayout";

export default async function StrategiesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user || user.niche.length === 0 || !user.followerStage) {
    redirect("/onboarding");
  }

  const [strategies, activeExperiments, totalExperiments] = await Promise.all([
    prisma.strategy.findMany({
      where: {
        nicheTags: { hasSome: user.niche },
        stageTags: { has: user.followerStage },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.experiment.findMany({
      where: { userId: user.id, status: "active" },
      select: { strategyId: true },
    }),
    prisma.experiment.count({ where: { userId: user.id } }),
  ]);

  const trackedStrategyIds = new Set(activeExperiments.map((e) => e.strategyId));
  const isFirstVisit = totalExperiments === 0;

  return (
    <AppLayout>
      <main className="px-8 py-10 md:px-12">
        <div className="max-w-5xl mx-auto">
          {isFirstVisit && (
            <div className="rounded-2xl p-8 mb-8 border border-border bg-surface">
              <div className="text-sm mb-2 text-accent">Welcome to Slancialab</div>
              <h2 className="text-xl mb-2" style={{ fontFamily: "Fraunces, serif", fontWeight: 600 }}>
                You&apos;re all set up.
              </h2>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                Pick a strategy below and hit &quot;Start tracking&quot; — that&apos;s the whole loop.
                Log a check-in every few days and watch your own growth chart build up.
              </p>
            </div>
          )}

          <h1
            className="text-3xl mb-2"
            style={{ fontFamily: "Fraunces, serif", fontWeight: 600, letterSpacing: "-0.015em" }}
          >
            Strategy Library
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Matched to {user.niche.join(", ")} at {user.followerStage}
          </p>

          {strategies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No strategies match your profile yet — check back soon.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {strategies.map((strategy) => {
                const isTracking = trackedStrategyIds.has(strategy.id);
                return (
                  <div key={strategy.id} className="rounded-2xl p-6 border border-border bg-surface flex flex-col">
                    <h2 className="text-lg mb-2" style={{ fontFamily: "Fraunces, serif", fontWeight: 600 }}>
                      {strategy.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground mb-4 flex-1">
                      {strategy.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {[...strategy.nicheTags, ...strategy.stageTags].map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {isTracking ? (
                      <a href="/dashboard" className="inline-block rounded-full px-6 py-2.5 text-sm font-semibold border border-border text-muted-foreground hover:text-foreground transition-colors text-center">
                        Already tracking — view dashboard
                      </a>
                    ) : (
                      <form action={startTracking}>
                        <input type="hidden" name="strategyId" value={strategy.id} />
                        <button
                          type="submit"
                          className="w-full rounded-full px-6 py-2.5 text-sm font-semibold bg-accent text-accent-foreground transition-transform active:scale-[0.97]"
                        >
                          Start tracking
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}