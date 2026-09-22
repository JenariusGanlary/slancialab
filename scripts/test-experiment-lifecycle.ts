import {
  canTransitionExperimentStatus,
  isValidExperimentStatus,
  type ExperimentStatus,
} from "../lib/experiment-lifecycle";

type TestCase = {
  name: string;
  actual: boolean;
  expected: boolean;
};

const tests: TestCase[] = [
  {
    name: "active → paused",
    actual: canTransitionExperimentStatus("active", "paused"),
    expected: true,
  },
  {
    name: "active → completed",
    actual: canTransitionExperimentStatus("active", "completed"),
    expected: true,
  },
  {
    name: "paused → active",
    actual: canTransitionExperimentStatus("paused", "active"),
    expected: true,
  },
  {
    name: "paused → completed",
    actual: canTransitionExperimentStatus("paused", "completed"),
    expected: true,
  },
  {
    name: "completed → active",
    actual: canTransitionExperimentStatus("completed", "active"),
    expected: false,
  },
  {
    name: "completed → paused",
    actual: canTransitionExperimentStatus("completed", "paused"),
    expected: false,
  },
  {
    name: "completed → completed",
    actual: canTransitionExperimentStatus("completed", "completed"),
    expected: false,
  },
  {
    name: "active → active",
    actual: canTransitionExperimentStatus("active", "active"),
    expected: false,
  },
  {
    name: "paused → paused",
    actual: canTransitionExperimentStatus("paused", "paused"),
    expected: false,
  },
];

const statusTests: Array<{
  name: string;
  value: string;
  expected: boolean;
}> = [
  {
    name: "active is valid",
    value: "active",
    expected: true,
  },
  {
    name: "paused is valid",
    value: "paused",
    expected: true,
  },
  {
    name: "completed is valid",
    value: "completed",
    expected: true,
  },
  {
    name: "draft is invalid",
    value: "draft",
    expected: false,
  },
  {
    name: "cancelled is invalid",
    value: "cancelled",
    expected: false,
  },
];

let failures = 0;

function assertTest(
  name: string,
  actual: boolean,
  expected: boolean
) {
  if (actual !== expected) {
    failures += 1;

    console.error(
      `❌ ${name} — expected ${expected}, got ${actual}`
    );

    return;
  }

  console.log(`✅ ${name}`);
}

console.log("\nExperiment lifecycle tests\n");

for (const test of tests) {
  assertTest(test.name, test.actual, test.expected);
}

console.log("\nExperiment status validation tests\n");

for (const test of statusTests) {
  assertTest(test.name, isValidExperimentStatus(test.value), test.expected);
}

console.log("\nType compatibility check\n");

const validStatus: ExperimentStatus = "active";

assertTest(
  "ExperimentStatus accepts valid status",
  validStatus === "active",
  true
);

if (failures > 0) {
  console.error(
    `\n❌ ${failures} lifecycle test(s) failed.\n`
  );

  process.exit(1);
}

console.log(
  `\n🎉 All ${tests.length + statusTests.length + 1} lifecycle tests passed.\n`
);