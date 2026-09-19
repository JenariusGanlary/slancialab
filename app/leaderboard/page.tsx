import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { AppLayout } from "../components/AppLayout";
import { ThemeToggle } from "../components/ThemeToggle";

export default async function LeaderboardPage() {
  const { userId } = await auth();

  const strategies = await prisma.strategy.findMany({
    include: {
      experiments: {
        include: { checkIns: { orderBy: { loggedAt: "asc" } } },
      },
    },
  });

  const rows = strategies
    .map((s) => {
      const trackedCount = s.experiments.length;
      const growthValues = s.experiments
        .filter((e) => e.checkIns.length >= 2)
        .map((e) => e.checkIns[e.checkIns.length - 1].followerCount - e.checkIns[0].followerCount);
      const avgGrowth = growthValues.length
        ? Math.round(growthValues.reduce((a, b) => a + b, 0) / growthValues.length)
        : null;
      return {
        id: s.id,
        title: s.title,
        trackedCount,
        avgGrowth,
        sampleSize: growthValues.length,
      };
    })
    .sort((a, b) => {
      if (a.avgGrowth === null && b.avgGrowth === null) return 0;
      if (a.avgGrowth === null) return 1;
      if (b.avgGrowth === null) return -1;
      return b.avgGrowth - a.avgGrowth;
    });

  const content = (
    <main className="px-8 py-16 md:px-16">
      <div className="max-w-3xl mx-auto">
        <h1
          className="text-4xl mb-2"
          style={{ fontFamily: "Fraunces, serif", fontWeight: 600, letterSpacing: "-0.015em" }}
        >
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground mb-12">
          What&apos;s actually working, based on real logged results — not opinions.
        </p>

        <div className="flex flex-col gap-4">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl p-6 border border-border bg-surface flex items-center justify-between"
            >
              <div>
                <h2 className="text-lg mb-1" style={{ fontFamily: "Fraunces, serif", fontWeight: 600 }}>
                  {row.title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {row.trackedCount} {row.trackedCount === 1 ? "person" : "people"} tracking this
                </p>
              </div>

              <div className="text-right">
                {row.avgGrowth !== null ? (
                  <>
                    <div
                      className="text-2xl font-semibold"
                      style={{ color: row.avgGrowth >= 0 ? "var(--accent)" : "#A8574A" }}
                    >
                      {row.avgGrowth >= 0 ? "+" : ""}
                      {row.avgGrowth.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      avg. across {row.sampleSize} result{row.sampleSize === 1 ? "" : "s"}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Not enough data yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );

  if (userId) {
    return <AppLayout>{content}</AppLayout>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex justify-between items-center px-6 md:px-12 py-6 border-b border-border max-w-5xl mx-auto">
        <Link href="/" className="text-lg" style={{ fontFamily: "Fraunces, serif", fontWeight: 600 }}>
          Slancialab
        </Link>
        <ThemeToggle />
      </div>
      {content}
    </div>
  );
}