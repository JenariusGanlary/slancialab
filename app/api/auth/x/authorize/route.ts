import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  buildXAuthorizationUrl,
  generateCodeChallenge,
  generateCodeVerifier,
  generateOAuthState,
} from "@/lib/x-oauth";

const OAUTH_STATE_COOKIE = "x_oauth_state";
const OAUTH_VERIFIER_COOKIE = "x_oauth_verifier";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(
      new URL("/sign-in", "http://localhost:3000")
    );
  }

  const state = generateOAuthState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const authorizationUrl = buildXAuthorizationUrl({
    state,
    codeChallenge,
  });

  const response = NextResponse.redirect(authorizationUrl);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60,
  };

  response.cookies.set(
    OAUTH_STATE_COOKIE,
    state,
    cookieOptions
  );

  response.cookies.set(
    OAUTH_VERIFIER_COOKIE,
    codeVerifier,
    cookieOptions
  );

  return response;
}