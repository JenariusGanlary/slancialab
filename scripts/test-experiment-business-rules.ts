import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

/*
 * SCOPE NOTE:
 *
 * startTracking, deleteExperiment, logCheckIn, and
 * updateExperimentStatus all call Clerk's auth() as their first
 * line. auth() throws when invoked outside a real Next.js
 * server/request context - confirmed directly via a throwaway
 * diagnostic script (since deleted). They cannot be called from a
 * standalone script.
 *
 * This test therefore reproduces the exact Prisma queries and
 * transaction shapes those actions already use (copied from the
 * real files, not reinvented) to verify the underlying data model
 * and query behavior. Rule 9 is the one exception: it calls the
 * real, unguarded, exported canTransitionExperimentStatus function
 * directly.
 *
 * This is real evidence about data-model correctness. It is NOT
 * proof that the Clerk-auth gate itself is enforced at runtime -
 * that remains a manual-verification item until a real
 * server-based integration test exists.
 */

let failures = 0;

function assertTest(name: string, actual: unknown, expected: unknown) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);

  if (!pass) {
    failures += 1;
    console.error(
      "FAIL: " + name + " - expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual)
    );
    return;
  }

  console.log("PASS: " + name);
}

async function main() {
  const { prisma } = await import("../lib/prisma");
  const { canTransitionExperimentStatus } = await import(
    "../lib/experiment-lifecycle"
  );

  const suffix = Date.now();

  console.log("");
  console.log("=== Experiment Business Rule Tests ===");
  console.log("");
  console.log("Setting up disposable test data...");
  console.log("");

  const strategy = await prisma.strategy.create({
    data: {
      title: "TEST_STRATEGY_" + suffix,
      description: "Disposable strategy for automated business-rule tests.",
      nicheTags: [],
      stageTags: [],
    },
  });

  const userA = await prisma.user.create({
    data: {
      clerkId: "test_clerk_a_" + suffix,
      email: "test-a-" + suffix + "@example.invalid",
    },
  });

  const userB = await prisma.user.create({
    data: {
      clerkId: "test_clerk_b_" + suffix,
      email: "test-b-" + suffix + "@example.invalid",
    },
  });

  const creator = await prisma.creator.create({
    data: {
      name: "Test Creator " + suffix,
      handle: "test_creator_" + suffix,
      niche: "Technology",
      notes: "Disposable creator for automated tests.",
    },
  });

  const researchFinding = await prisma.researchFinding.create({
    data: {
      creatorId: creator.id,
      dimension: "Hook Type",
      pattern: "Test Pattern",
      signalLevel: "emerging",
      postCount: 5,
      measuredCount: 5,
      evidenceLabel: "Test evidence",
    },
  });

  try {
    // Rule 1: duplicate active experiment detection
    const experimentA1 = await prisma.experiment.create({
      data: {
        userId: userA.id,
        strategyId: strategy.id,
        status: "active",
      },
    });

    const duplicateCheck = await prisma.experiment.findFirst({
      where: {
        userId: userA.id,
        strategyId: strategy.id,
        status: "active",
      },
      select: { id: true },
    });

    assertTest(
      "Rule 1: active-experiment lookup finds the existing active experiment for the same user+strategy",
      duplicateCheck?.id,
      experimentA1.id
    );

    // Rule 2: strategy reusable after completion
    await prisma.experiment.update({
      where: { id: experimentA1.id },
      data: { status: "completed", completedAt: new Date() },
    });

    const afterCompletionCheck = await prisma.experiment.findFirst({
      where: {
        userId: userA.id,
        strategyId: strategy.id,
        status: "active",
      },
      select: { id: true },
    });

    assertTest(
      "Rule 2: no active-experiment match once the experiment is completed (strategy reusable)",
      afterCompletionCheck,
      null
    );

    // Rules 5, 6, 7, 3: deletion cascade + preservation + reuse
    const experimentA2 = await prisma.experiment.create({
      data: {
        userId: userA.id,
        strategyId: strategy.id,
        status: "active",
        researchFindingId: researchFinding.id,
      },
    });

    await prisma.checkIn.create({
      data: { experimentId: experimentA2.id, followerCount: 1000 },
    });

    await prisma.$transaction(async (tx) => {
      await tx.checkIn.deleteMany({
        where: { experimentId: experimentA2.id },
      });
      await tx.experimentPost.deleteMany({
        where: { experimentId: experimentA2.id },
      });
      await tx.experiment.delete({ where: { id: experimentA2.id } });
    });

    const remainingCheckIns = await prisma.checkIn.count({
      where: { experimentId: experimentA2.id },
    });

    assertTest(
      "Rule 5: deleting an experiment deletes its check-ins",
      remainingCheckIns,
      0
    );

    const strategyStillExists = await prisma.strategy.findUnique({
      where: { id: strategy.id },
      select: { id: true },
    });

    assertTest(
      "Rule 6: deleting an experiment preserves the underlying Strategy",
      strategyStillExists?.id,
      strategy.id
    );

    const findingStillExists = await prisma.researchFinding.findUnique({
      where: { id: researchFinding.id },
      select: { id: true },
    });

    assertTest(
      "Rule 7: deleting an experiment preserves the ResearchFinding",
      findingStillExists?.id,
      researchFinding.id
    );

    const afterDeletionCheck = await prisma.experiment.findFirst({
      where: {
        userId: userA.id,
        strategyId: strategy.id,
        status: "active",
      },
      select: { id: true },
    });

    assertTest(
      "Rule 3: no active-experiment match once the experiment is deleted (strategy reusable)",
      afterDeletionCheck,
      null
    );

    // Rule 4: cross-user ownership isolation
    const experimentA3 = await prisma.experiment.create({
      data: {
        userId: userA.id,
        strategyId: strategy.id,
        status: "active",
      },
    });

    const crossUserLookup = await prisma.experiment.findFirst({
      where: {
        id: experimentA3.id,
        userId: userB.id,
      },
      select: { id: true },
    });

    assertTest(
      "Rule 4: an ownership-scoped lookup by User B cannot find User A's experiment",
      crossUserLookup,
      null
    );

    const correctOwnerLookup = await prisma.experiment.findFirst({
      where: {
        id: experimentA3.id,
        userId: userA.id,
      },
      select: { id: true },
    });

    assertTest(
      "Rule 4b: the same ownership-scoped lookup by the real owner (User A) succeeds",
      correctOwnerLookup?.id,
      experimentA3.id
    );

    // Rule 8: completed experiment rejects new check-ins
    await prisma.experiment.update({
      where: { id: experimentA3.id },
      data: { status: "completed", completedAt: new Date() },
    });

    const completedExperiment = await prisma.experiment.findUnique({
      where: { id: experimentA3.id },
      select: { status: true },
    });

    const wouldRejectCheckIn =
      completedExperiment !== null &&
      completedExperiment.status !== "active" &&
      completedExperiment.status !== "paused";

    assertTest(
      "Rule 8: logCheckIn's guard condition correctly rejects a completed experiment",
      wouldRejectCheckIn,
      true
    );

    // Rule 9: invalid status transition rejected (real production function)
    assertTest(
      "Rule 9: canTransitionExperimentStatus rejects completed to active for a real completed experiment",
      canTransitionExperimentStatus("completed", "active"),
      false
    );

    assertTest(
      "Rule 9b: canTransitionExperimentStatus allows active to paused as a control case",
      canTransitionExperimentStatus("active", "paused"),
      true
    );
  } finally {
    console.log("");
    console.log("Cleaning up disposable test data...");
    console.log("");

    await prisma.checkIn.deleteMany({
      where: { experiment: { userId: { in: [userA.id, userB.id] } } },
    });
    await prisma.experimentPost.deleteMany({
      where: { experiment: { userId: { in: [userA.id, userB.id] } } },
    });
    await prisma.experimentResult.deleteMany({
      where: { experiment: { userId: { in: [userA.id, userB.id] } } },
    });
    await prisma.experiment.deleteMany({
      where: { userId: { in: [userA.id, userB.id] } },
    });
    await prisma.researchFinding.deleteMany({
      where: { id: researchFinding.id },
    });
    await prisma.creator.deleteMany({ where: { id: creator.id } });
    await prisma.strategy.deleteMany({ where: { id: strategy.id } });
    await prisma.user.deleteMany({
      where: { id: { in: [userA.id, userB.id] } },
    });

    console.log("Cleanup complete.");
    console.log("");
  }

  if (failures > 0) {
    console.error("FAILURES: " + failures + " business-rule test(s) failed.");
    process.exit(1);
  }

  console.log("ALL TESTS PASSED: experiment business-rule tests passed.");
}

main();
