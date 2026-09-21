import {
  findBestStrategyForResearch,
  matchStrategiesToResearch,
  type StrategyMatchInput,
} from "../lib/strategy-matching";

const strategies: StrategyMatchInput[] = [
  {
    id: "1",
    title: "Reply-Guy Method",
    description:
      "Reply thoughtfully to 10-15 posts a day from bigger accounts in your niche before posting anything of your own.",
    nicheTags: ["Technology"],
    stageTags: ["0-1k followers"],
  },
  {
    id: "2",
    title: "Curiosity-Gap Hooks",
    description:
      "Open every post with a line that creates a specific, answerable question in the reader's head.",
    nicheTags: ["Technology"],
    stageTags: ["0-1k followers"],
  },
  {
    id: "3",
    title: "Thread Every Tuesday",
    description:
      "Commit to one long-form thread every Tuesday breaking down something you actually did.",
    nicheTags: ["Technology"],
    stageTags: ["1k-10k followers"],
  },
  {
    id: "4",
    title: "Build-in-Public Daily Log",
    description:
      "Post one short, specific update a day on what you actually built, shipped, or broke.",
    nicheTags: ["SaaS & Startups"],
    stageTags: ["0-1k followers"],
  },
  {
    id: "5",
    title: "Contrarian Take Fridays",
    description:
      "Once a week, post a genuine disagreement with common wisdom in your niche.",
    nicheTags: ["Technology"],
    stageTags: ["1k-10k followers"],
  },
  {
    id: "6",
    title: "Quote-Tweet Value-Add",
    description:
      "Find posts getting real engagement and quote-tweet them with a genuinely different angle or counterpoint.",
    nicheTags: ["Technology"],
    stageTags: ["0-1k followers"],
  },
  {
    id: "7",
    title: "The Numbered List Post",
    description:
      "Package one real lesson as a tight numbered list.",
    nicheTags: ["Technology"],
    stageTags: ["0-1k followers"],
  },
  {
    id: "8",
    title: "Screenshot-Proof Posts",
    description:
      "Whenever a real result happens, post the actual screenshot with one sentence of context.",
    nicheTags: ["SaaS & Startups"],
    stageTags: ["1k-10k followers"],
  },
];

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }

  console.log(`PASS: ${message}`);
}

function bestTitle(
  pattern: string,
  dimension?: string
): string | null {
  const result = findBestStrategyForResearch(strategies, {
    pattern,
    dimension,
  });

  return result?.strategy.title ?? null;
}

console.log("\n=== Strategy Matching Tests ===\n");

// 1. Reply
assert(
  bestTitle("Reply") === "Reply-Guy Method",
  "Reply pattern recommends Reply-Guy Method"
);

// 2. Curiosity
assert(
  bestTitle("Curiosity") === "Curiosity-Gap Hooks",
  "Curiosity pattern recommends Curiosity-Gap Hooks"
);

// 3. Thread
assert(
  bestTitle("Thread") === "Thread Every Tuesday",
  "Thread pattern recommends Thread Every Tuesday"
);

// 4. Build in public
assert(
  bestTitle("Build-in-Public") === "Build-in-Public Daily Log",
  "Build-in-Public pattern recommends Build-in-Public Daily Log"
);

// 5. Contrarian
assert(
  bestTitle("Contrarian") === "Contrarian Take Fridays",
  "Contrarian pattern recommends Contrarian Take Fridays"
);

// 6. Quote tweet
assert(
  bestTitle("Quote-Tweet") === "Quote-Tweet Value-Add",
  "Quote-Tweet pattern recommends Quote-Tweet Value-Add"
);

// 7. Numbered list
assert(
  bestTitle("Numbered List") === "The Numbered List Post",
  "Numbered List pattern recommends The Numbered List Post"
);

// 8. Screenshot proof
assert(
  bestTitle("Screenshot-Proof") === "Screenshot-Proof Posts",
  "Screenshot-Proof pattern recommends Screenshot-Proof Posts"
);

// 9. Contrarian must NOT recommend Quote-Tweet
assert(
  bestTitle("Contrarian") !== "Quote-Tweet Value-Add",
  "Contrarian does not recommend Quote-Tweet Value-Add"
);

// 10. Contrarian must use canonical strategy
assert(
  bestTitle("Contrarian") === "Contrarian Take Fridays",
  "Contrarian uses the canonical database strategy"
);

// 11. Unknown pattern produces no recommendation
assert(
  bestTitle("Something Completely Unknown") === null,
  "Unknown pattern produces no recommendation"
);

// 12. Question has no strategy in the actual strategy library
assert(
  bestTitle("Question") === null,
  "Question pattern produces no recommendation because no Question strategy exists"
);

// 13. Story has no strategy in the actual strategy library
assert(
  bestTitle("Story") === null,
  "Story pattern produces no recommendation because no Story strategy exists"
);

// 14. Educational has no strategy in the actual strategy library
assert(
  bestTitle("Educational") === null,
  "Educational pattern produces no recommendation because no Educational strategy exists"
);

// 15. Description-only similarity cannot create a match
const descriptionOnlyStrategies: StrategyMatchInput[] = [
  {
    id: "x",
    title: "Some Random Strategy",
    description:
      "Use a contrarian take and challenge common wisdom.",
    nicheTags: [],
    stageTags: [],
  },
];

assert(
  findBestStrategyForResearch(descriptionOnlyStrategies, {
    pattern: "Contrarian",
  }) === null,
  "Description-only similarity does not produce a recommendation"
);

// 16. Matching is independent of strategy ordering
const reversedStrategies = [...strategies].reverse();

assert(
  bestTitle("Contrarian") ===
    findBestStrategyForResearch(reversedStrategies, {
      pattern: "Contrarian",
    })?.strategy.title,
  "Recommendation is independent of strategy ordering"
);

// 17. Only one canonical strategy is returned for each supported pattern
for (const pattern of [
  "Reply",
  "Curiosity",
  "Thread",
  "Build-in-Public",
  "Contrarian",
  "Quote-Tweet",
  "Numbered List",
  "Screenshot-Proof",
]) {
  const matches = matchStrategiesToResearch(strategies, {
    pattern,
  });

  assert(
    matches.length === 1,
    `${pattern} produces exactly one strategy match`
  );
}

console.log("\n=== All strategy matching tests passed. ===\n");