import {
  evaluateExperiment,
  type ExperimentPostForEvaluation,
} from "../lib/experiment-evaluation";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ ${message}`);
  }

  console.log(`✅ ${message}`);
}

function createPost(
  id: string,
  views?: number
): ExperimentPostForEvaluation {
  return {
    id,
    metrics:
      views === undefined
        ? {}
        : {
            views,
          },
  };
}

console.log("\n🧪 Experiment Evaluation Tests\n");

// 1. No posts
{
  const result = evaluateExperiment({
    primaryMetric: "views",
    successThresholdPercent: 25,
    posts: [],
    baselineAverage: 1000,
  });

  assert(
    result.status === "insufficient_data",
    "No posts → insufficient data"
  );
}

// 2. Posts without performance data
{
  const result = evaluateExperiment({
    primaryMetric: "views",
    successThresholdPercent: 25,
    posts: [
      createPost("post-1"),
      createPost("post-2"),
    ],
    baselineAverage: 1000,
  });

  assert(
    result.status === "insufficient_data",
    "Posts without metrics → insufficient data"
  );
}

// 3. Performance exists but no baseline
{
  const result = evaluateExperiment({
    primaryMetric: "views",
    successThresholdPercent: 25,
    posts: [
      createPost("post-1", 1200),
      createPost("post-2", 1400),
    ],
  });

  assert(
    result.status === "insufficient_data",
    "No baseline → insufficient data"
  );

  assert(
    result.experimentAverage === 1300,
    "Experiment average calculated correctly"
  );
}

// 4. Below threshold
{
  const result = evaluateExperiment({
    primaryMetric: "views",
    successThresholdPercent: 25,
    posts: [
      createPost("post-1", 1100),
      createPost("post-2", 1200),
    ],
    baselineAverage: 1000,
  });

  assert(
    result.status === "below_threshold",
    "Below 25% improvement → below threshold"
  );

  assert(
    result.percentageChange === 15,
    "Percentage change calculated correctly"
  );
}

// 5. Exactly at threshold
{
  const result = evaluateExperiment({
    primaryMetric: "views",
    successThresholdPercent: 25,
    posts: [
      createPost("post-1", 1250),
      createPost("post-2", 1250),
    ],
    baselineAverage: 1000,
  });

  assert(
    result.status === "met_threshold",
    "Exactly 25% improvement → threshold met"
  );

  assert(
    result.percentageChange === 25,
    "Exactly 25% change calculated correctly"
  );
}

// 6. Above threshold
{
  const result = evaluateExperiment({
    primaryMetric: "views",
    successThresholdPercent: 25,
    posts: [
      createPost("post-1", 1400),
      createPost("post-2", 1600),
    ],
    baselineAverage: 1000,
  });

  assert(
    result.status === "met_threshold",
    "Above 25% improvement → threshold met"
  );

  assert(
    result.experimentAverage === 1500,
    "Experiment average calculated correctly"
  );

  assert(
    result.percentageChange === 50,
    "50% improvement calculated correctly"
  );
}

// 7. Follower growth handled separately
{
  const result = evaluateExperiment({
    primaryMetric: "follower_growth",
    successThresholdPercent: 25,
    posts: [
      createPost("post-1", 1000),
    ],
    baselineAverage: 1000,
  });

  assert(
    result.status === "insufficient_data",
    "Follower growth → requires experiment-level measurements"
  );
}

console.log("\n🎉 All experiment evaluation tests passed.\n");