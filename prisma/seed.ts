import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../lib/prisma";

const strategies = [
  {
    title: "Reply-Guy Method",
    description:
      "Reply thoughtfully to 10-15 posts a day from bigger accounts in your niche before posting anything of your own. Add real insight, not just agreement — the goal is for people to click your profile because the reply itself was worth reading.",
    nicheTags: [
      "Technology",
      "SaaS & Startups",
      "AI & Automation",
      "Developer & Engineering",
    ],
    stageTags: ["0-1k followers", "1k-10k followers"],
  },
  {
    title: "Curiosity-Gap Hooks",
    description:
      "Open every post with a line that creates a specific, answerable question in the reader's head — a number, a contradiction, or an unfinished thought — so scrolling past feels like missing something.",
    nicheTags: [
      "Technology",
      "SaaS & Startups",
      "AI & Automation",
      "Developer & Engineering",
    ],
    stageTags: ["0-1k followers", "1k-10k followers"],
  },
  {
    title: "Thread Every Tuesday",
    description:
      "Commit to one long-form thread every Tuesday breaking down something you actually did — a decision, a mistake, a process — rather than generic advice. Consistency on a fixed day trains your audience to expect it.",
    nicheTags: [
      "Technology",
      "SaaS & Startups",
      "AI & Automation",
      "Developer & Engineering",
    ],
    stageTags: ["1k-10k followers", "10k+ followers"],
  },
  {
    title: "Build-in-Public Daily Log",
    description:
      "Post one short, specific update a day on what you actually built, shipped, or broke — real numbers and screenshots, not vague progress talk. Boring consistency beats sporadic highlight reels.",
    nicheTags: [
      "SaaS & Startups",
      "Developer & Engineering",
      "Technology",
    ],
    stageTags: ["0-1k followers"],
  },
  {
    title: "Contrarian Take Fridays",
    description:
      "Once a week, post a genuine disagreement with common wisdom in your niche — something you actually believe, argued with real reasoning, not manufactured outrage for engagement.",
    nicheTags: [
      "Technology",
      "SaaS & Startups",
      "AI & Automation",
      "Developer & Engineering",
    ],
    stageTags: ["1k-10k followers"],
  },
  {
    title: "Quote-Tweet Value-Add",
    description:
      "Find posts getting real engagement in your niche and quote-tweet them with a genuinely different angle or a counterpoint — never just 'this.' You're borrowing their audience's attention, not their opinion.",
    nicheTags: [
      "Technology",
      "SaaS & Startups",
      "AI & Automation",
      "Developer & Engineering",
    ],
    stageTags: ["0-1k followers"],
  },
  {
    title: "The Numbered List Post",
    description:
      "Package one real lesson as a tight numbered list (5-7 items, one line each). The structure itself is scannable and highly saveable, which quietly rewards it in the algorithm.",
    nicheTags: [
      "Technology",
      "SaaS & Startups",
      "AI & Automation",
      "Developer & Engineering",
    ],
    stageTags: ["0-1k followers", "1k-10k followers"],
  },
  {
    title: "Screenshot-Proof Posts",
    description:
      "Whenever a real result happens — revenue, a metric, a user comment — post the actual screenshot with one sentence of context. Unedited proof reads as more credible than any polished graphic.",
    nicheTags: [
      "SaaS & Startups",
      "Developer & Engineering",
      "Technology",
    ],
    stageTags: ["1k-10k followers"],
  },
];

const creators = [
  {
    name: "[Placeholder] Solo SaaS Builder",
    handle: "@example_handle_1",
    niche: "Indie SaaS",
    notes:
      "PLACEHOLDER — replace with a real creator you've actually studied. Example pattern: posts a daily build-in-public update, mixes short wins with occasional longer threads breaking down a specific decision.",
    posts: [
      { patternTag: "Short daily update, real numbers, ~150 chars" },
      { patternTag: "Weekly long-form thread, one lesson per thread" },
      { patternTag: "Screenshot-led post, one sentence of context" },
    ],
  },
  {
    name: "[Placeholder] Content Creator Example",
    handle: "@example_handle_2",
    niche: "Content Creator",
    notes:
      "PLACEHOLDER — replace with a real creator. Example pattern: leans on curiosity-gap hooks in the first line, frequently uses numbered lists for tactical advice.",
    posts: [
      { patternTag: "Curiosity-gap hook opener, question-based" },
      { patternTag: "Numbered list, 5-7 items, one line each" },
    ],
  },
  {
    name: "[Placeholder] Contrarian Voice",
    handle: "@example_handle_3",
    niche: "Content Creator",
    notes:
      "PLACEHOLDER — replace with a real creator. Example pattern: weekly contrarian take against common wisdom, reasoned argument rather than outrage-bait.",
    posts: [
      { patternTag: "Contrarian take + reasoned argument, ~280 chars" },
      { patternTag: "Reply-first engagement on bigger accounts before own posts" },
    ],
  },
];

async function main() {
  for (const strategy of strategies) {
    const existing = await prisma.strategy.findFirst({
      where: { title: strategy.title },
    });

    if (existing) {
      await prisma.strategy.update({
        where: { id: existing.id },
        data: strategy,
      });
    } else {
      await prisma.strategy.create({
        data: strategy,
      });
    }
  }

  console.log(`Upserted ${strategies.length} strategies (existing ones preserved).`);

  await prisma.creatorPost.deleteMany({});
  await prisma.creator.deleteMany({});

  for (const creator of creators) {
    await prisma.creator.create({
      data: {
        name: creator.name,
        handle: creator.handle,
        niche: creator.niche,
        notes: creator.notes,
        posts: {
          create: creator.posts,
        },
      },
    });
  }

  console.log(`Seeded ${creators.length} creators.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });