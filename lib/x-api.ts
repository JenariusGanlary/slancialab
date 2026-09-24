const X_API_BASE_URL = "https://api.x.com/2";

type XApiErrorResponse = {
  title?: string;
  detail?: string;
  type?: string;
  errors?: Array<{
    title?: string;
    detail?: string;
    type?: string;
  }>;
};

export type XUser = {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
  description?: string;
  created_at?: string;
  public_metrics?: {
    followers_count?: number;
    following_count?: number;
    tweet_count?: number;
    listed_count?: number;
  };
};

export type XPost = {
  id: string;
  text: string;
  created_at?: string;
  public_metrics?: {
    retweet_count?: number;
    reply_count?: number;
    like_count?: number;
    quote_count?: number;
    bookmark_count?: number;
    impression_count?: number;
  };
};

type XApiResponse<T> = {
  data?: T;
  includes?: Record<string, unknown>;
  meta?: {
    next_token?: string;
    previous_token?: string;
    result_count?: number;
    newest_id?: string;
    oldest_id?: string;
  };
};

export type XPostsPage = {
  posts: XPost[];
  nextToken: string | null;
  resultCount: number;
};

function getXApiErrorMessage(
  responseBody: XApiErrorResponse | null,
  fallback: string
): string {
  if (responseBody?.detail) {
    return responseBody.detail;
  }

  if (responseBody?.title) {
    return responseBody.title;
  }

  if (
    responseBody?.errors &&
    responseBody.errors.length > 0
  ) {
    const firstError = responseBody.errors[0];

    if (firstError.detail) {
      return firstError.detail;
    }

    if (firstError.title) {
      return firstError.title;
    }
  }

  return fallback;
}

async function xApiRequest<T>(
  endpoint: string,
  accessToken: string
): Promise<T> {
  if (!accessToken) {
    throw new Error("X access token is required.");
  }

  const response = await fetch(
    `${X_API_BASE_URL}${endpoint}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const responseText = await response.text();

    let errorBody: XApiErrorResponse | null = null;

    try {
      errorBody =
        JSON.parse(responseText) as XApiErrorResponse;
    } catch {
      // X may return a non-JSON response.
    }

    const message = getXApiErrorMessage(
      errorBody,
      `X API request failed with status ${response.status}.`
    );

    throw new Error(
      `X API error (${response.status}): ${message}`
    );
  }

  return (await response.json()) as T;
}

export async function getCurrentXUser(
  accessToken: string
): Promise<XUser> {
  const response = await xApiRequest<
    XApiResponse<XUser>
  >(
    "/users/me?user.fields=profile_image_url,description,created_at,public_metrics",
    accessToken
  );

  if (!response.data) {
    throw new Error(
      "X API did not return the authenticated user."
    );
  }

  return response.data;
}

export async function getXUserPosts({
  accessToken,
  xUserId,
  maxResults = 100,
  paginationToken,
}: {
  accessToken: string;
  xUserId: string;
  maxResults?: number;
  paginationToken?: string;
}): Promise<XPostsPage> {
  if (!xUserId) {
    throw new Error("X user ID is required.");
  }

  const safeMaxResults = Math.min(
    Math.max(maxResults, 5),
    100
  );

  const params = new URLSearchParams({
    max_results: String(safeMaxResults),
    "tweet.fields": "created_at,public_metrics",
    exclude: "retweets,replies",
  });

  if (paginationToken) {
    params.set(
      "pagination_token",
      paginationToken
    );
  }

  const response = await xApiRequest<
    XApiResponse<XPost[]>
  >(
    `/users/${encodeURIComponent(
      xUserId
    )}/tweets?${params.toString()}`,
    accessToken
  );

  return {
    posts: response.data ?? [],
    nextToken:
      response.meta?.next_token ?? null,
    resultCount:
      response.meta?.result_count ??
      response.data?.length ??
      0,
  };
}

export async function getRecentXUserPosts({
  accessToken,
  xUserId,
  maxPosts = 100,
}: {
  accessToken: string;
  xUserId: string;
  maxPosts?: number;
}): Promise<XPost[]> {
  const posts: XPost[] = [];

  let paginationToken: string | undefined;

  const safeMaxPosts = Math.min(
    Math.max(maxPosts, 1),
    100
  );

  while (posts.length < safeMaxPosts) {
    const remaining =
      safeMaxPosts - posts.length;

    const page = await getXUserPosts({
      accessToken,
      xUserId,
      maxResults: Math.min(100, remaining),
      paginationToken,
    });

    posts.push(...page.posts);

    if (
      !page.nextToken ||
      page.posts.length === 0
    ) {
      break;
    }

    paginationToken = page.nextToken;
  }

  return posts.slice(0, safeMaxPosts);
}

export function buildXPostUrl(
  username: string,
  postId: string
): string {
  const normalizedUsername =
    username.replace(/^@+/, "");

  return `https://x.com/${encodeURIComponent(
    normalizedUsername
  )}/status/${encodeURIComponent(postId)}`;
}