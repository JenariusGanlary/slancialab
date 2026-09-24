const X_TOKEN_URL = "https://api.x.com/2/oauth2/token";

type XRefreshTokenResponse = {
  token_type: string;
  expires_in: number;
  access_token: string;
  scope?: string;
  refresh_token?: string;
};

type XTokenErrorResponse = {
  error?: string;
  error_description?: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export async function refreshXAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<XRefreshTokenResponse> {
  if (!refreshToken) {
    throw new Error("X refresh token is required.");
  }

  const clientId = getRequiredEnv("X_CLIENT_ID");
  const clientSecret = getRequiredEnv("X_CLIENT_SECRET");

  const basicAuth = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const body = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    client_id: clientId,
  });

  const response = await fetch(X_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type":
        "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
    cache: "no-store",
  });

  const responseText = await response.text();

  let responseBody:
    | XRefreshTokenResponse
    | XTokenErrorResponse
    | null = null;

  try {
    responseBody = JSON.parse(responseText) as
      | XRefreshTokenResponse
      | XTokenErrorResponse;
  } catch {
    // X returned a non-JSON response.
  }

  if (!response.ok) {
    const errorMessage =
      responseBody &&
      "error_description" in responseBody &&
      responseBody.error_description
        ? responseBody.error_description
        : responseBody &&
            "error" in responseBody &&
            responseBody.error
          ? responseBody.error
          : `X token refresh failed with status ${response.status}.`;

    throw new Error(
      `X token refresh error (${response.status}): ${errorMessage}`
    );
  }

  if (
    !responseBody ||
    !("access_token" in responseBody) ||
    !responseBody.access_token
  ) {
    throw new Error(
      "X token refresh response did not contain an access token."
    );
  }

  if (
    !("expires_in" in responseBody) ||
    typeof responseBody.expires_in !== "number"
  ) {
    throw new Error(
      "X token refresh response did not contain a valid expiration time."
    );
  }

  return responseBody as XRefreshTokenResponse;
}