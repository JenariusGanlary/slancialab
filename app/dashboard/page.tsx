import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { logCheckIn, updateExperimentStatus } from "./actions";
import { AppLayout } from "../components/AppLayout";

function buildChart(checkIns: { followerCount: number }[]) {
  const asc = [...checkIns].reverse();
  const values = asc.map((c) => c.followerCount);
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const yTop = 15, yBottom = 90;
  const points = values.map((v, i) => ({
    x: i * (500 / (values.length - 1)),
    y: yBottom - ((v - min) / range) * (yBottom - yTop),
  }));

  const path = "M" + points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L");
  const areaPath = `${path} L ${points[points.length - 1].x.toFixed(1)},100 L 0,100 Z`;

  return { path, areaPath, end: points[points.length - 1] };
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      experiments: {
        include: { strategy: true, checkIns: { orderBy: { loggedAt: "desc" } } },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  if (!user) redirect("/");

  const activeCount = user.experiments.filter((e) => e.status === "active").length;
  const totalCheckIns = user.experiments.reduce((sum, e) => sum + e.checkIns.length, 0);

  const best = user.experiments
    .map((e) => {
      const asc = [...e.checkIns].reverse();
      if (asc.length < 2) return null;
      const growth = asc[asc.length - 1].followerCount - asc[0].followerCount;
      return { title: e.strategy.title, growth };
    })
    .filter((r): r is { title: string; growth: number } => r !== null)
    .sort((a, b) => b.growth - a.growth)[0];

  return (
    <AppLayout>
      <main className="px-8 py-10 md:px-12">
        <div className="max-w-5xl mx-auto">
          <h1
            className="text-3xl mb-8"
            style={{ fontFamily: "Fraunces, serif", fontWeight: 600, letterSpacing: "-0.015em" }}
          >
            Dashboard
          </h1>

          {user.experiments.length === 0 ? (
            <div className="rounded-2xl p-10 border border-border bg-surface text-center">
              <h2 className="text-xl mb-3" style={{ fontFamily: "Fraunces, serif", fontWeight: 600 }}>
                Nothing tracked yet
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed">
                Head to the strategy library, pick something that fits your niche, and hit
                &quot;Start tracking&quot; to see your first growth chart here.
              </p>
              <a href="/strategies" className="inline-block rounded-full px-6 py-2.5 text-sm font-semibold bg-accent text-accent-foreground transition-transform active:scale-[0.97]">
                Browse strategies
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="rounded-2xl p-5 border border-border bg-surface">
                  <div className="text-2xl font-semibold">{activeCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">Active experiments</div>
                </div>
                <div className="rounded-2xl p-5 border border-border bg-surface">
                  <div className="text-2xl font-semibold">{totalCheckIns}</div>
                  <div className="text-xs text-muted-foreground mt-1">Check-ins logged</div>
                </div>
                <div className="rounded-2xl p-5 border border-border bg-surface">
                  {best ? (
                    <>
                      <div className="text-2xl font-semibold text-accent">
                        +{best.growth.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">{best.title}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-semibold text-muted-foreground">—</div>
                      <div className="text-xs text-muted-foreground mt-1">Best result</div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {user.experiments.map((exp) => {
                  const latest = exp.checkIns[0];
                  const chart = buildChart(exp.checkIns);

                  return (
                    <div key={exp.id} className="rounded-2xl p-6 border border-border bg-surface">
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-lg" style={{ fontFamily: "Fraunces, serif", fontWeight: 600 }}>
                          {exp.strategy.title}
                        </h2>
                        <span className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground capitalize">
                          {exp.status}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {exp.checkIns.length} check-in{exp.checkIns.length === 1 ? "" : "s"} logged
                        {latest ? ` · latest: ${latest.followerCount.toLocaleString()} followers` : ""}
                      </p>

                      {chart && (
                        <div className="mb-4">
                          <svg viewBox="0 0 500 100" width="100%" height="90" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                            <defs>
                              <linearGradient id={`area-${exp.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <path d={chart.areaPath} fill={`url(#area-${exp.id})`} stroke="none" />
                            <path d={chart.path} fill="none" style={{ stroke: "var(--accent)" }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx={chart.end.x} cy={chart.end.y} r="4" style={{ fill: "var(--accent)" }} />
                          </svg>
                        </div>
                      )}

                      {exp.status === "active" ? (
                        <form action={logCheckIn} className="flex items-center gap-2 mb-3">
                          <input
                            type="hidden"
                            name="experimentId"
                            value={exp.id}
                          />
                          <input
                            type="number"
                            name="followerCount"
                            placeholder="Today's follower count"
                            required
                            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                          />
                          <button
                            type="submit"
                            className="rounded-full px-4 py-2 text-sm font-semibold bg-accent text-accent-foreground transition-transform active:scale-[0.97] whitespace-nowrap"
                          >
                            Log check-in
                          </button>
                        </form>
                      ) : exp.status === "paused" ? (
                        <p className="text-sm text-muted-foreground mb-3">Paused — resume to log a new check-in.</p>
                      ) : null}

                      <div className="flex gap-2 mb-3">
                        {exp.status !== "completed" && (
                          <>
                            <form action={updateExperimentStatus}>
                              <input type="hidden" name="experimentId" value={exp.id} />
                              <input type="hidden" name="status" value={exp.status === "active" ? "paused" : "active"} />
                              <button
                                type="submit"
                                className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {exp.status === "active" ? "Pause" : "Resume"}
                              </button>
                            </form>
                            <form action={updateExperimentStatus}>
                              <input type="hidden" name="experimentId" value={exp.id} />
                              <input type="hidden" name="status" value="completed" />
                              <button
                                type="submit"
                                className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Mark complete
                              </button>
                            </form>
                          </>
                        )}
                      </div>

                      {exp.checkIns.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          {exp.checkIns.slice(0, 3).map((c) => (
                            <div key={c.id} className="flex justify-between text-xs border-t border-border pt-1.5">
                              <span className="text-muted-foreground">{new Date(c.loggedAt).toLocaleDateString()}</span>
                              <span className="text-foreground">{c.followerCount.toLocaleString()} followers</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </AppLayout>
  );
}