import {
  evaluatePatternSignal,
  evaluatePatternSignals,
} from "@/lib/pattern-signals";
import type { PatternObservation } from "@/lib/pattern-aggregation";

function createObservation(
  overrides: Partial<PatternObservation> = {}
): PatternObservation {
  return {
    dimension: "hookType",
    dimensionLabel: "Hook type",
    value: "Contrarian",
    count: 5,
    availableViews: 5,
    meanViews: 20000,
    medianViews: 18000,
    sourcePostIds: [
      "post-1",
      "post-2",
      "post-3",
      "post-4",
      "post-5",
    ],
    ...overrides,
  };
}

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(`❌ ${message}`);
  }
}

function testNoPerformanceData(): void {
  const observation = createObservation({
    count: 3,
    availableViews: 0,
    meanViews: null,
    medianViews: null,
    sourcePostIds: ["post-1", "post-2", "post-3"],
  });

  const signal = evaluatePatternSignal(observation);

  assert(
    signal.signalLevel === "none",
    "Expected no performance data to produce 'none'"
  );

  assert(
    signal.performanceCoverage === 0,
    "Expected 0% performance coverage"
  );

  assert(
    signal.signalLabel === "No performance data",
    "Expected 'No performance data' label"
  );

  console.log("✅ No performance data test passed");
}

function testSingleMeasuredPost(): void {
  const observation = createObservation({
    count: 5,
    availableViews: 1,
    meanViews: 12000,
    medianViews: 12000,
    sourcePostIds: [
      "post-1",
      "post-2",
      "post-3",
      "post-4",
      "post-5",
    ],
  });

  const signal = evaluatePatternSignal(observation);

  assert(
    signal.signalLevel === "insufficient",
    "Expected one measured post to produce 'insufficient'"
  );

  assert(
    signal.performanceCoverage === 20,
    "Expected 20% performance coverage"
  );

  assert(
    signal.signalLabel ===
      "Insufficient evidence · only 1 measured post",
    "Expected single-post insufficient label"
  );

  console.log("✅ Single measured post test passed");
}

function testPotentialPattern(): void {
  const observation = createObservation({
    count: 4,
    availableViews: 2,
    meanViews: 18000,
    medianViews: 18000,
    sourcePostIds: [
      "post-1",
      "post-2",
      "post-3",
      "post-4",
    ],
  });

  const signal = evaluatePatternSignal(observation);

  assert(
    signal.signalLevel === "potential",
    "Expected 2 measured posts with 50% coverage to produce 'potential'"
  );

  assert(
    signal.performanceCoverage === 50,
    "Expected 50% performance coverage"
  );

  assert(
    signal.signalLabel ===
      "Potential pattern · 4 posts studied · 2 with performance data",
    "Expected potential pattern label"
  );

  console.log("✅ Potential pattern test passed");
}

function testEmergingPattern(): void {
  const observation = createObservation({
    count: 6,
    availableViews: 4,
    meanViews: 21000,
    medianViews: 19000,
    sourcePostIds: [
      "post-1",
      "post-2",
      "post-3",
      "post-4",
      "post-5",
      "post-6",
    ],
  });

  const signal = evaluatePatternSignal(observation);

  assert(
    signal.signalLevel === "emerging",
    "Expected 4 measured posts with sufficient coverage to produce 'emerging'"
  );

  assert(
    signal.performanceCoverage === 67,
    "Expected rounded 67% performance coverage"
  );

  assert(
    signal.signalLabel ===
      "Emerging pattern · 6 posts studied · 4 with performance data",
    "Expected emerging pattern label"
  );

  console.log("✅ Emerging pattern test passed");
}

function testRepeatedPattern(): void {
  const observation = createObservation({
    count: 8,
    availableViews: 6,
    meanViews: 24000,
    medianViews: 22000,
    sourcePostIds: [
      "post-1",
      "post-2",
      "post-3",
      "post-4",
      "post-5",
      "post-6",
      "post-7",
      "post-8",
    ],
  });

  const signal = evaluatePatternSignal(observation);

  assert(
    signal.signalLevel === "repeated",
    "Expected 6 measured posts with sufficient coverage to produce 'repeated'"
  );

  assert(
    signal.performanceCoverage === 75,
    "Expected 75% performance coverage"
  );

  assert(
    signal.signalLabel ===
      "Repeated pattern · 8 posts studied · 6 with performance data",
    "Expected repeated pattern label"
  );

  console.log("✅ Repeated pattern test passed");
}

function testCoverageGuard(): void {
  const observation = createObservation({
    count: 7,
    availableViews: 3,
    meanViews: 16000,
    medianViews: 15000,
    sourcePostIds: [
      "post-1",
      "post-2",
      "post-3",
      "post-4",
      "post-5",
      "post-6",
      "post-7",
    ],
  });

  const signal = evaluatePatternSignal(observation);

  assert(
    signal.performanceCoverage === 43,
    "Expected 3/7 performance coverage to round to 43%"
  );

  assert(
    signal.signalLevel === "insufficient",
    "Expected below-50% performance coverage to remain 'insufficient'"
  );

  assert(
    signal.signalLabel ===
      "Insufficient evidence · 43% performance coverage",
    "Expected insufficient-coverage label"
  );

  console.log("✅ Performance coverage guard test passed");
}

function testCoverageBoundary(): void {
  const observation = createObservation({
    count: 6,
    availableViews: 3,
    meanViews: 18000,
    medianViews: 17000,
    sourcePostIds: [
      "post-1",
      "post-2",
      "post-3",
      "post-4",
      "post-5",
      "post-6",
    ],
  });

  const signal = evaluatePatternSignal(observation);

  assert(
    signal.performanceCoverage === 50,
    "Expected 3/6 performance coverage to equal exactly 50%"
  );

  assert(
    signal.signalLevel === "potential",
    "Expected exactly 50% coverage to satisfy the coverage guard"
  );

  console.log("✅ 50% coverage boundary test passed");
}

function testEvidencePreservation(): void {
  const observation = createObservation({
    dimension: "contentStyle",
    dimensionLabel: "Content style",
    value: "Educational",
    count: 5,
    availableViews: 4,
    meanViews: 22000,
    medianViews: 20000,
    sourcePostIds: [
      "post-a",
      "post-b",
      "post-c",
      "post-d",
      "post-e",
    ],
  });

  const signal = evaluatePatternSignal(observation);

  assert(
    signal.dimension === observation.dimension,
    "Expected dimension to be preserved"
  );

  assert(
    signal.dimensionLabel === observation.dimensionLabel,
    "Expected dimension label to be preserved"
  );

  assert(
    signal.value === observation.value,
    "Expected pattern value to be preserved"
  );

  assert(
    signal.count === observation.count,
    "Expected post count to be preserved"
  );

  assert(
    signal.availableViews === observation.availableViews,
    "Expected available views to be preserved"
  );

  assert(
    signal.meanViews === observation.meanViews,
    "Expected mean views to be preserved"
  );

  assert(
    signal.medianViews === observation.medianViews,
    "Expected median views to be preserved"
  );

  assert(
    JSON.stringify(signal.sourcePostIds) ===
      JSON.stringify(observation.sourcePostIds),
    "Expected source post IDs to be preserved"
  );

  console.log("✅ Evidence preservation test passed");
}

function testMultipleObservations(): void {
  const observations: PatternObservation[] = [
    createObservation({
      dimension: "hookType",
      dimensionLabel: "Hook type",
      value: "Contrarian",
      count: 6,
      availableViews: 4,
    }),
    createObservation({
      dimension: "hookType",
      dimensionLabel: "Hook type",
      value: "Question",
      count: 3,
      availableViews: 1,
    }),
    createObservation({
      dimension: "contentStyle",
      dimensionLabel: "Content style",
      value: "Educational",
      count: 8,
      availableViews: 6,
    }),
  ];

  const signals = evaluatePatternSignals(observations);

  assert(
    signals.length === 3,
    "Expected all observations to be evaluated"
  );

  assert(
    signals[0].signalLevel === "emerging",
    "Expected first observation to be emerging"
  );

  assert(
    signals[1].signalLevel === "insufficient",
    "Expected second observation to be insufficient"
  );

  assert(
    signals[2].signalLevel === "repeated",
    "Expected third observation to be repeated"
  );

  console.log("✅ Multiple observations test passed");
}

function testMissingPerformanceDoesNotCount(): void {
  const observation = createObservation({
    count: 7,
    availableViews: 3,
    meanViews: 15000,
    medianViews: 12000,
    sourcePostIds: [
      "post-1",
      "post-2",
      "post-3",
      "post-4",
      "post-5",
      "post-6",
      "post-7",
    ],
  });

  const signal = evaluatePatternSignal(observation);

  assert(
    signal.count === 7,
    "Expected all 7 posts to remain in the observation count"
  );

  assert(
    signal.availableViews === 3,
    "Expected only 3 posts to count as measured"
  );

  assert(
    signal.performanceCoverage === 43,
    "Expected 3 measured out of 7 posts to equal 43% coverage"
  );

  assert(
    signal.signalLevel === "insufficient",
    "Expected low performance coverage to produce 'insufficient'"
  );

  console.log("✅ Missing performance data handling test passed");
}

function runTests(): void {
  testNoPerformanceData();
  testSingleMeasuredPost();
  testPotentialPattern();
  testEmergingPattern();
  testRepeatedPattern();
  testCoverageGuard();
  testCoverageBoundary();
  testEvidencePreservation();
  testMultipleObservations();
  testMissingPerformanceDoesNotCount();

  console.log("\n🎉 All pattern signal tests passed!");
}

runTests();