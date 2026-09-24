import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  analyzeXPost,
  toXPostAnalysisCreateData,
} from "@/lib/x-post-analysis";

export async function POST() {
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
        analysis: null,
      },
      select: {
        id: true,
        content: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    if (posts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No unanalyzed X posts found.",
        analysis: {
          processed: 0,
          analyzed: 0,
          failed: 0,
        },
      });
    }

    let analyzed = 0;
    let failed = 0;

    for (const post of posts) {
      try {
        const result = analyzeXPost({
          xPostId: post.id,
          content: post.content ?? "",
        });

        const analysisData =
          toXPostAnalysisCreateData(result);

        await prisma.xPostAnalysis.create({
          data: analysisData,
        });

        analyzed += 1;
      } catch (error) {
        console.error(
          `Failed to analyze X post ${post.id}:`,
          error
        );

        await prisma.xPostAnalysis
          .create({
            data: {
              xPostId: post.id,
              status: "FAILED",
              analysisVersion: "1.0",
              analysisModel: "deterministic",
            },
          })
          .catch((analysisError) => {
            console.error(
              `Failed to record analysis failure for X post ${post.id}:`,
              analysisError
            );
          });

        failed += 1;
      }
    }

    return NextResponse.json({
      success: true,
      message: "X post analysis completed.",
      analysis: {
        processed: posts.length,
        analyzed,
        failed,
      },
    });
  } catch (error) {
    console.error(
      "X post analysis pipeline failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "X post analysis failed. Please try again.",
      },
      { status: 500 }
    );
  }
}