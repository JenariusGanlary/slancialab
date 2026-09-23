import crypto from "crypto";

const X_AUTHORIZE_URL = "https://x.com/i/oauth2/authorize";

const X_SCOPES = [
  "tweet.read",
  "users.read",
  "offline.access",
];

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(
  codeVerifier: string
): string {
  return crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
}

export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getXScopes(): string {
  return X_SCOPES.join(" ");
}

export function buildXAuthorizationUrl({
  state,
  codeChallenge,
}: {
  state: string;
  codeChallenge: string;
}): string {
  const clientId = getRequiredEnv("X_CLIENT_ID");
  const redirectUri = getRequiredEnv("X_REDIRECT_URI");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: getXScopes(),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `${X_AUTHORIZE_URL}?${params.toString()}`;
}