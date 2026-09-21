import {
  aggregatePatterns,
  type PatternAggregationPost,
} from "../lib/pattern-aggregation";

function assert(
  condition: boolean,
  message: string
) {
  if (!condition) {
    throw new Error(`❌ ${message}`);
  }
}

function assertEqual<T>(
  actual: T,
  expected: T,
  message: string
) {
  if (actual !== expected) {
    throw new Error(
      `❌ ${message}\n   Expected: ${expected}\n   Received: ${actual}`
    );
  }
}

const dimensions = [
  {
    key: "hookType",
    label: "Hook type",
  },
];

// --------------------------------------------------
// 1. Empty dataset
// --------------------------------------------------

const emptyResult = aggregatePatterns([], dimensions);

assertEqual(
  emptyResult.length,
  0,
  "Empty dataset should produce no observations"
);

console.log("✅ Empty dataset test passed");

// --------------------------------------------------
// 2. One post
// --------------------------------------------------

const onePostResult = aggregatePatterns(
  [
    {
      id: "one-post",
      views: 10_000,
      hookType: "CONTRARIAN",
    },
  ],
  dimensions
);

assertEqual(
  onePostResult.length,
  1,
  "One post should create one observation"
);

assertEqual(
  onePostResult[0].count,
  1,
  "One post should have count 1"
);

assertEqual(
  onePostResult[0].availableViews,
  1,
  "One post should have one available view value"
);

assertEqual(
  onePostResult[0].meanViews,
  10_000,
  "One post mean should equal its views"
);

assertEqual(
  onePostResult[0].medianViews,
  10_000,
  "One post median should equal its views"
);

console.log("✅ Single post test passed");

// --------------------------------------------------
// 3. Two posts
// --------------------------------------------------

const twoPostResult = aggregatePatterns(
  [
    {
      id: "two-post-1",
      views: 10_000,
      hookType: "CONTRARIAN",
    },
    {
      id: "two-post-2",
      views: 20_000,
      hookType: "CONTRARIAN",
    },
  ],
  dimensions
);

assertEqual(
  twoPostResult[0].count,
  2,
  "Two posts should have count 2"
);

assertEqual(
  twoPostResult[0].availableViews,
  2,
  "Two posts should have two available views"
);

assertEqual(
  twoPostResult[0].meanViews,
  15_000,
  "Two post mean should be 15,000"
);

assertEqual(
  twoPostResult[0].medianViews,
  15_000,
  "Two post median should be 15,000"
);

console.log("✅ Two post test passed");

// --------------------------------------------------
// 4. Missing views
// --------------------------------------------------

const missingViewsResult = aggregatePatterns(
  [
    {
      id: "missing-views-1",
      views: 10_000,
      hookType: "CONTRARIAN",
    },
    {
      id: "missing-views-2",
      views: null,
      hookType: "CONTRARIAN",
    },
    {
      id: "missing-views-3",
      views: 30_000,
      hookType: "CONTRARIAN",
    },
  ],
  dimensions
);

assertEqual(
  missingViewsResult[0].count,
  3,
  "Missing views must not remove the post from the pattern count"
);

assertEqual(
  missingViewsResult[0].availableViews,
  2,
  "Only posts with views should count toward available views"
);

assertEqual(
  missingViewsResult[0].meanViews,
  20_000,
  "Mean should ignore missing views"
);

assertEqual(
  missingViewsResult[0].medianViews,
  20_000,
  "Median should ignore missing views"
);

assertEqual(
  missingViewsResult[0].sourcePostIds.length,
  3,
  "All source posts should remain attached"
);

console.log("✅ Missing views test passed");

// --------------------------------------------------
// 5. Missing analysis field
// --------------------------------------------------

const missingAnalysisResult = aggregatePatterns(
  [
    {
      id: "analysis-1",
      views: 10_000,
      hookType: "CONTRARIAN",
    },
    {
      id: "analysis-2",
      views: 20_000,
      hookType: null,
    },
    {
      id: "analysis-3",
      views: 30_000,
      hookType: "STORY",
    },
  ],
  dimensions
);

assertEqual(
  missingAnalysisResult.length,
  2,
  "Missing analysis should not create an empty pattern"
);

const contrarian = missingAnalysisResult.find(
  (pattern) => pattern.value === "Contrarian"
);

const story = missingAnalysisResult.find(
  (pattern) => pattern.value === "Story"
);

assert(
  contrarian !== undefined,
  "Contrarian pattern should exist"
);

assert(
  story !== undefined,
  "Story pattern should exist"
);

assertEqual(
  contrarian?.count,
  1,
  "Contrarian should contain one post"
);

assertEqual(
  story?.count,
  1,
  "Story should contain one post"
);

console.log("✅ Missing analysis test passed");

// --------------------------------------------------
// 6. Multiple patterns
// --------------------------------------------------

const multiplePatternsResult = aggregatePatterns(
  [
    {
      id: "multi-1",
      views: 10_000,
      hookType: "CONTRARIAN",
    },
    {
      id: "multi-2",
      views: 20_000,
      hookType: "CONTRARIAN",
    },
    {
      id: "multi-3",
      views: 30_000,
      hookType: "STORY",
    },
    {
      id: "multi-4",
      views: 40_000,
      hookType: "STORY",
    },
  ],
  dimensions
);

assertEqual(
  multiplePatternsResult.length,
  2,
  "Two different patterns should produce two observations"
);

const contrarianPattern =
  multiplePatternsResult.find(
    (pattern) => pattern.value === "Contrarian"
  );

const storyPattern =
  multiplePatternsResult.find(
    (pattern) => pattern.value === "Story"
  );

assert(
  contrarianPattern !== undefined,
  "Contrarian pattern should exist"
);

assert(
  storyPattern !== undefined,
  "Story pattern should exist"
);

assertEqual(
  contrarianPattern?.count,
  2,
  "Contrarian should contain two posts"
);

assertEqual(
  contrarianPattern?.meanViews,
  15_000,
  "Contrarian mean should be 15,000"
);

assertEqual(
  contrarianPattern?.medianViews,
  15_000,
  "Contrarian median should be 15,000"
);

assertEqual(
  storyPattern?.count,
  2,
  "Story should contain two posts"
);

assertEqual(
  storyPattern?.meanViews,
  35_000,
  "Story mean should be 35,000"
);

assertEqual(
  storyPattern?.medianViews,
  35_000,
  "Story median should be 35,000"
);

console.log("✅ Multiple patterns test passed");

// --------------------------------------------------
// 7. Full known dataset
// --------------------------------------------------

const knownDataset: PatternAggregationPost[] = [
  {
    id: "known-1",
    views: 10_000,
    hookType: "CONTRARIAN",
  },
  {
    id: "known-2",
    views: 12_000,
    hookType: "CONTRARIAN",
  },
  {
    id: "known-3",
    views: 18_000,
    hookType: "CONTRARIAN",
  },
  {
    id: "known-4",
    views: 20_000,
    hookType: "CONTRARIAN",
  },
  {
    id: "known-5",
    views: 40_000,
    hookType: "CONTRARIAN",
  },
];

const knownResult = aggregatePatterns(
  knownDataset,
  dimensions
);

const knownPattern = knownResult[0];

assert(knownPattern !== undefined, "Known pattern should exist");

if (!knownPattern) {
  throw new Error("❌ Known pattern should exist");
}

assertEqual(
  knownPattern.count,
  5,
  "Known dataset count should be 5"
);

assertEqual(
  knownPattern.availableViews,
  5,
  "Known dataset should have five available views"
);

assertEqual(
  knownPattern.meanViews,
  20_000,
  "Known dataset mean should be 20,000"
);

assertEqual(
  knownPattern.medianViews,
  18_000,
  "Known dataset median should be 18,000"
);

assertEqual(
  knownPattern.sourcePostIds.length,
  5,
  "Known dataset should preserve five source IDs"
);

console.log("✅ Known dataset test passed");

console.log("");
console.log("🎉 All pattern aggregation tests passed!");