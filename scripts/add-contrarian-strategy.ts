import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { prisma } = await import("../lib/prisma");

  const title = "Contrarian Hook Test";

  const existing = await prisma.strategy.findFirst({
    where: {
      title,
    },
    select: {
      id: true,
    },
  });

  const data = {
    title,
    description:
      "Open posts with a clear contrarian position that challenges a common assumption, then measure how your own audience responds.",
    nicheTags: [
      "Technology",
      "SaaS & Startups",
      "AI & Automation",
      "Developer & Engineering",
    ],
    stageTags: [
      "0-1k followers",
      "1-10k followers",
    ],
  };

  const strategy = existing
    ? await prisma.strategy.update({
        where: {
          id: existing.id,
        },
        data,
      })
    : await prisma.strategy.create({
        data,
      });

  console.log(
    existing
      ? `Strategy updated: ${strategy.title}`
      : `Strategy created: ${strategy.title}`
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});