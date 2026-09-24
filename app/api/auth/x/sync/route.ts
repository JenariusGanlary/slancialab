import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { decryptXToken, encryptXToken } from "@/lib/x-token-crypto";
import { refreshXAccessToken } from "@/lib/x-token-refresh";
import {
  buildXPostUrl,
  getCurrentXUser,
  getRecentXUserPosts,
} from "@/lib/x-api";

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
            xUserId: true,
            username: true,
            accessTokenEncrypted: true,
            refreshTokenEncrypted: true,
            tokenExpiresAt: true,
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

    const xAccount = user.xAccount;

    let accessToken = decryptXToken(
      xAccount.accessTokenEncrypted
    );

    /*
     * X access tokens expire.
     *
     * If the current token has expired, use the stored
     * refresh token to obtain a new access token.
     */
    if (
      xAccount.tokenExpiresAt &&
      xAccount.tokenExpiresAt.getTime() <= Date.now()
    ) {
      if (!xAccount.refreshTokenEncrypted) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Your X access token has expired and no refresh token is available. Please reconnect your X account.",
          },
          { status: 401 }
        );
      }

      const refreshToken = decryptXToken(
        xAccount.refreshTokenEncrypted
      );

      const refreshedToken =
        await refreshXAccessToken({
          refreshToken,
        });

      accessToken = refreshedToken.access_token;

      const tokenExpiresAt = new Date(
        Date.now() +
          refreshedToken.expires_in * 1000
      );

      const newRefreshToken =
        refreshedToken.refresh_token
          ? encryptXToken(
              refreshedToken.refresh_token
            )
          : xAccount.refreshTokenEncrypted;

      await prisma.xAccount.update({
        where: {
          id: xAccount.id,
        },
        data: {
          accessTokenEncrypted:
            encryptXToken(accessToken),
          refreshTokenEncrypted:
            newRefreshToken,
          tokenExpiresAt,
          scopes:
            refreshedToken.scope ?? undefined,
        },
      });
    }

    const xUser =
      await getCurrentXUser(accessToken);

    if (xUser.id !== xAccount.xUserId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The connected X account does not match the stored account.",
        },
        { status: 409 }
      );
    }

    const posts = await getRecentXUserPosts({
      accessToken,
      xUserId: xAccount.xUserId,
      maxPosts: 100,
    });

    let created = 0;
    let updated = 0;

    for (const post of posts) {
      const metrics = post.public_metrics;

      const publishedAt = post.created_at
        ? new Date(post.created_at)
        : null;

      const postUrl = buildXPostUrl(
        xUser.username,
        post.id
      );

      const existingPost =
        await prisma.xPost.findUnique({
          where: {
            xPostId: post.id,
          },
          select: {
            id: true,
          },
        });

      await prisma.xPost.upsert({
        where: {
          xPostId: post.id,
        },
        create: {
          xAccountId: xAccount.id,
          xPostId: post.id,
          content: post.text,
          postUrl,
          publishedAt,

          views:
            metrics?.impression_count ?? null,

          likes:
            metrics?.like_count ?? null,

          replies:
            metrics?.reply_count ?? null,

          reposts:
            metrics?.retweet_count ?? null,
        },
        update: {
          xAccountId: xAccount.id,
          content: post.text,
          postUrl,
          publishedAt,

          views:
            metrics?.impression_count ?? null,

          likes:
            metrics?.like_count ?? null,

          replies:
            metrics?.reply_count ?? null,

          reposts:
            metrics?.retweet_count ?? null,
        },
      });

      if (existingPost) {
        updated += 1;
      } else {
        created += 1;
      }
    }

    const totalPosts =
      await prisma.xPost.count({
        where: {
          xAccountId: xAccount.id,
        },
      });

    return NextResponse.json({
      success: true,
      message: "X posts synced successfully.",
      account: {
        xUserId: xUser.id,
        username: xUser.username,
        name: xUser.name,
      },
      sync: {
        fetched: posts.length,
        created,
        updated,
        totalStored: totalPosts,
      },
    });
  } catch (error) {
    console.error(
      "X post sync failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "X post synchronization failed. Please try again.",
      },
      { status: 500 }
    );
  }
}