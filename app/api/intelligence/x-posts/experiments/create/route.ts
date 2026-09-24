import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { aggregateXPostPatterns } from "@/lib/x-patterns/aggregation";
import {
  calculateXPatternBaseline,
  calculateXPatternSignals,
} from "@/lib/x-patterns/signals";
import {
  matchXPatternSignalsToStrategies,
} from "@/lib/x-patterns/strategy-matching";
import {
  buildXExperimentProposals,
} from "@/lib/x-patterns/experiment-proposal";

type CreateExperimentRequest = {
  strategyId?: string;
};

export async function POST(
  request: Request
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    let body: CreateExperimentRequest;

    try {
      body =
        (await request.json()) as CreateExperimentRequest;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const strategyId =
      typeof body.strategyId === "string"
        ? body.strategyId.trim()
        : "";

    if (!strategyId) {
      return NextResponse.json(
        {
          success: false,
          error: "strategyId is required.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId,
      },
      select: {
        id: true,
        niche: true,
        followerStage: true,
        xAccount: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Slancialab user account was not found.",
        },
        { status: 404 }
      );
    }

    if (!user.xAccount) {
      return NextResponse.json(
        {
          success: false,
          error: "No X account is connected.",
        },
        { status: 400 }
      );
    }

    const strategy =
      await prisma.strategy.findUnique({
        where: {
          id: strategyId,
        },
      });

    if (!strategy) {
      return NextResponse.json(
        {
          success: false,
          error: "Strategy not found.",
        },
        { status: 404 }
      );
    }

    const strategyMatchesNiche =
      strategy.nicheTags.length === 0 ||
      strategy.nicheTags.some((tag) =>
        user.niche.includes(tag)
      );

    if (!strategyMatchesNiche) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This strategy is not available for your current niche profile.",
        },
        { status: 403 }
      );
    }

    const existingExperiment =
      await prisma.experiment.findFirst({
        where: {
          userId: user.id,
          strategyId: strategy.id,
          status: {
            in: ["active", "paused"],
          },
        },
        select: {
          id: true,
          status: true,
          startedAt: true,
        },
      });

    if (existingExperiment) {
      return NextResponse.json(
        {
          success: false,
          error:
            "An active or paused experiment already exists for this strategy.",
          experiment: existingExperiment,
        },
        { status: 409 }
      );
    }

    const posts = await prisma.xPost.findMany({
      where: {
        xAccountId: user.xAccount.id,
        analysis: {
          isNot: null,
        },
      },
      select: {
        id: true,
        views: true,
        analysis: {
          select: {
            hookType: true,
            structure: true,
            contentStyle: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    const observations =
      aggregateXPostPatterns(posts);

    const baselineMedianViews =
      calculateXPatternBaseline(observations);

    const signals = calculateXPatternSignals(
      observations,
      baselineMedianViews
    );

    const strategyMatches =
      matchXPatternSignalsToStrategies(
        signals,
        [strategy]
      );

    if (strategyMatches.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This strategy is not currently supported by a sufficient pattern signal.",
        },
        { status: 422 }
      );
    }

    const proposals =
      buildXExperimentProposals(
        strategyMatches,
        [strategy],
        signals
      );

    const proposal = proposals[0];

    if (!proposal) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No experiment proposal could be generated from the current intelligence.",
        },
        { status: 422 }
      );
    }

    const availableViewCount =
      posts.filter(
        (post) =>
          typeof post.views === "number" &&
          Number.isFinite(post.views)
      ).length;

    const experiment =
      await prisma.experiment.create({
        data: {
          userId: user.id,
          strategyId: strategy.id,

          status: "active",

          hypothesis: proposal.hypothesis,
          protocol: proposal.protocol,

          durationDays:
            proposal.durationDays,

          targetPostCount:
            proposal.targetPostCount,

          primaryMetric:
            proposal.primaryMetric,

          successThresholdPercent:
            proposal.successThresholdPercent,

          baselineAverage:
            null,

          baselineSampleSize:
            availableViewCount > 0
              ? availableViewCount
              : null,

          baselineCapturedAt:
            availableViewCount > 0
              ? new Date()
              : null,
        },
        select: {
          id: true,
          strategyId: true,
          status: true,
          startedAt: true,
          completedAt: true,
          hypothesis: true,
          protocol: true,
          durationDays: true,
          targetPostCount: true,
          primaryMetric: true,
          successThresholdPercent: true,
          baselineAverage: true,
          baselineSampleSize: true,
          baselineCapturedAt: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Experiment created successfully.",

        experiment,

        source: {
          strategyId: strategy.id,
          strategyTitle: strategy.title,

          signalCount: signals.length,
          matchedSignalCount:
            strategyMatches[0]
              ?.matchedSignals.length ?? 0,

          baselineMedianViews,
        },

        proposal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "X experiment creation failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Experiment creation failed. Please try again.",
      },
      { status: 500 }
    );
  }
}