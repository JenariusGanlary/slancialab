import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { prisma } = await import("../lib/prisma");

  const strategies = await prisma.strategy.findMany({
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${strategies.length} strategy rows.\n`);

  for (const s of strategies) {
    console.log(`- ${s.title}`);
    console.log(`    id: ${s.id}`);
    console.log(`    createdAt: ${s.createdAt.toISOString()}`);
    console.log(`    hypothesisTemplate: ${s.hypothesisTemplate ? "SET" : "NULL"}`);
    console.log(`    recommendedPostCount: ${s.recommendedPostCount ?? "NULL"}`);
    console.log("");
  }

  const counts = new Map<string, number>();
  for (const s of strategies) counts.set(s.title, (counts.get(s.title) ?? 0) + 1);
  const dupes = [...counts.entries()].filter(([, n]) => n > 1);

  console.log(
    dupes.length
      ? `⚠️ Duplicate titles: ${dupes.map(([t, n]) => `${t} (${n}x)`).join(", ")}`
      : "✅ No duplicate strategy titles."
  );

  await prisma.$disconnect();
}

main();
