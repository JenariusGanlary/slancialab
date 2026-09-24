import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { aggregateXPostPatterns } from "@/lib/x-patterns/aggregation";
import {
  calculateXPatternBaseline,
  calculateXPatternSignals,
} from "@/lib/x-patterns/signals";

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

    return NextResponse.json({
      success: true,
      source: {
        posts: posts.length,
        analyzedPosts: posts.length,
      },
      baseline: {
        medianViews: baselineMedianViews,
      },
      observations,
      signals,
    });
  } catch (error) {
    console.error(
      "X post pattern signal pipeline failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "X post pattern signal analysis failed. Please try again.",
      },
      { status: 500 }
    );
  }
}