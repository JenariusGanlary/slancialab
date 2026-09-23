import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { encryptXToken } from "@/lib/x-token-crypto";

const OAUTH_STATE_COOKIE = "x_oauth_state";
const OAUTH_VERIFIER_COOKIE = "x_oauth_verifier";

type XTokenResponse = {
  token_type: string;
  expires_in: number;
  access_token: string;
  scope: string;
  refresh_token?: string;
};

type XUserResponse = {
  data?: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
  };
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function safeCompare(
  expected: string,
  actual: string
): boolean {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    actualBuffer
  );
}

function redirectToSettings(
  request: NextRequest,
  status: "success" | "error",
  message?: string
) {
  const url = new URL("/settings", request.url);

  url.searchParams.set("x", status);

  if (message) {
    url.searchParams.set("message", message);
  }

  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.redirect(
        new URL("/sign-in", request.url)
      );
    }

    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      return redirectToSettings(
        request,
        "error",
        "X authorization was cancelled or denied."
      );
    }

    if (!code || !state) {
      return redirectToSettings(
        request,
        "error",
        "Missing X authorization response."
      );
    }

    const storedState =
      request.cookies.get(OAUTH_STATE_COOKIE)?.value;

    const codeVerifier =
      request.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;

    if (!storedState || !codeVerifier) {
      return redirectToSettings(
        request,
        "error",
        "X authorization session expired. Please try again."
      );
    }

    if (!safeCompare(storedState, state)) {
      return redirectToSettings(
        request,
        "error",
        "Invalid X authorization state."
      );
    }

    const clientId = getRequiredEnv("X_CLIENT_ID");
    const clientSecret = getRequiredEnv("X_CLIENT_SECRET");
    const redirectUri = getRequiredEnv("X_REDIRECT_URI");

    const basicCredentials = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString("base64");

    const tokenBody = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    const tokenResponse = await fetch(
      "https://api.x.com/2/oauth2/token",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicCredentials}`,
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: tokenBody.toString(),
        cache: "no-store",
      }
    );

    if (!tokenResponse.ok) {
      return redirectToSettings(
        request,
        "error",
        "X token exchange failed."
      );
    }

    const tokenData =
      (await tokenResponse.json()) as XTokenResponse;

    if (
      !tokenData.access_token ||
      !tokenData.expires_in
    ) {
      return redirectToSettings(
        request,
        "error",
        "X returned an invalid access token response."
      );
    }

    const userResponse = await fetch(
      "https://api.x.com/2/users/me?user.fields=profile_image_url",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        cache: "no-store",
      }
    );

    if (!userResponse.ok) {
      return redirectToSettings(
        request,
        "error",
        "Could not retrieve the X account."
      );
    }

    const xUser =
      (await userResponse.json()) as XUserResponse;

    if (
      !xUser.data?.id ||
      !xUser.data.username ||
      !xUser.data.name
    ) {
      return redirectToSettings(
        request,
        "error",
        "X returned incomplete account information."
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return redirectToSettings(
        request,
        "error",
        "Slancialab user account was not found."
      );
    }

    const accessTokenEncrypted = encryptXToken(
      tokenData.access_token
    );

    const refreshTokenEncrypted =
      tokenData.refresh_token
        ? encryptXToken(tokenData.refresh_token)
        : null;

    const tokenExpiresAt = new Date(
      Date.now() + tokenData.expires_in * 1000
    );

    await prisma.xAccount.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        xUserId: xUser.data.id,
        username: xUser.data.username,
        displayName: xUser.data.name,
        profileImageUrl:
          xUser.data.profile_image_url ?? null,
        accessTokenEncrypted,
        refreshTokenEncrypted,
        tokenExpiresAt,
        scopes: tokenData.scope ?? null,
      },
      update: {
        xUserId: xUser.data.id,
        username: xUser.data.username,
        displayName: xUser.data.name,
        profileImageUrl:
          xUser.data.profile_image_url ?? null,
        accessTokenEncrypted,
        refreshTokenEncrypted,
        tokenExpiresAt,
        scopes: tokenData.scope ?? null,
      },
    });

    const response = redirectToSettings(
      request,
      "success"
    );

    response.cookies.delete(OAUTH_STATE_COOKIE);
    response.cookies.delete(OAUTH_VERIFIER_COOKIE);

    return response;
  } catch (error) {
    console.error("X OAuth callback error:", error);

    return redirectToSettings(
      request,
      "error",
      "Something went wrong while connecting X."
    );
  }
}