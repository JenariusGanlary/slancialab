type CheckInValidationResult =
  | {
      valid: true;
      followerCount: number;
    }
  | {
      valid: false;
    };

function validateFollowerCount(
  value: unknown
): CheckInValidationResult {
  if (typeof value !== "string") {
    return { valid: false };
  }

  const normalizedValue = value.trim();

  if (!/^\d+$/.test(normalizedValue)) {
    return { valid: false };
  }

  const followerCount = Number(normalizedValue);

  if (
    !Number.isSafeInteger(followerCount) ||
    followerCount < 0
  ) {
    return { valid: false };
  }

  return {
    valid: true,
    followerCount,
  };
}

function canLogCheckIn(status: string): boolean {
  return status === "active" || status === "paused";
}

type TestCase = {
  name: string;
  actual: boolean;
  expected: boolean;
};

const followerCountTests: TestCase[] = [
  {
    name: "0 followers is valid",
    actual: validateFollowerCount("0").valid,
    expected: true,
  },
  {
    name: "positive follower count is valid",
    actual: validateFollowerCount("1250").valid,
    expected: true,
  },
  {
    name: "whitespace around count is accepted",
    actual: validateFollowerCount(" 1250 ").valid,
    expected: true,
  },
  {
    name: "decimal follower count is rejected",
    actual: validateFollowerCount("1250.5").valid,
    expected: false,
  },
  {
    name: "negative follower count is rejected",
    actual: validateFollowerCount("-100").valid,
    expected: false,
  },
  {
    name: "text mixed with number is rejected",
    actual: validateFollowerCount("1250abc").valid,
    expected: false,
  },
  {
    name: "empty follower count is rejected",
    actual: validateFollowerCount("").valid,
    expected: false,
  },
  {
    name: "whitespace-only follower count is rejected",
    actual: validateFollowerCount("   ").valid,
    expected: false,
  },
  {
    name: "non-string follower count is rejected",
    actual: validateFollowerCount(1250).valid,
    expected: false,
  },
];

const statusTests: TestCase[] = [
  {
    name: "active experiment allows check-in",
    actual: canLogCheckIn("active"),
    expected: true,
  },
  {
    name: "paused experiment allows check-in",
    actual: canLogCheckIn("paused"),
    expected: true,
  },
  {
    name: "completed experiment rejects check-in",
    actual: canLogCheckIn("completed"),
    expected: false,
  },
  {
    name: "unknown experiment status rejects check-in",
    actual: canLogCheckIn("draft"),
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

console.log("\nFollower count validation tests\n");

for (const test of followerCountTests) {
  assertTest(test.name, test.actual, test.expected);
}

console.log("\nExperiment status check-in tests\n");

for (const test of statusTests) {
  assertTest(test.name, test.actual, test.expected);
}

if (failures > 0) {
  console.error(
    `\n❌ ${failures} check-in test(s) failed.\n`
  );

  process.exit(1);
}

console.log(
  `\n🎉 All ${
    followerCountTests.length + statusTests.length
  } check-in tests passed.\n`
);