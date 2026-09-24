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

export async function GET() {
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
          error: "Slancialab user account was not found.",
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

    const strategies =
      await prisma.strategy.findMany({
        where: {
          OR: [
            {
              nicheTags: {
                hasSome: user.niche,
              },
            },
            {
              nicheTags: {
                isEmpty: true,
              },
            },
          ],
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    const matches =
      matchXPatternSignalsToStrategies(
        signals,
        strategies
      );

    return NextResponse.json({
      success: true,

      source: {
        posts: posts.length,
        analyzedPosts: posts.length,
      },

      baseline: {
        medianViews: baselineMedianViews,
      },

      signals,

      userProfile: {
        niche: user.niche,
        followerStage:
          user.followerStage,
      },

      strategies: matches,
    });
  } catch (error) {
    console.error(
      "X post strategy matching failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "X post strategy matching failed. Please try again.",
      },
      { status: 500 }
    );
  }
}