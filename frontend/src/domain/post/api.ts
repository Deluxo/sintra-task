import { NEXT_PUBLIC_API_URL } from "../../env";
import type { Product } from "../product/model";
import type { CtaTonePreferences } from "./cta-tone";
import type { SocialMediaPost } from "./model";

interface GeneratePostsResponse {
  posts: SocialMediaPost[];
  generated_at: string;
  count: number;
}

interface ApiErrorBody {
  error?: {
    message?: string;
    fields?: Record<string, string>;
  };
}

/** Carries backend validation messages (and their per-field detail) to the UI. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly fields?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function toApiError(status: number, payload: unknown): ApiError {
  const body = (payload ?? {}) as ApiErrorBody;
  const message = body.error?.message ?? `Request failed (${status})`;
  const details = Object.values(body.error?.fields ?? {}).join(" · ");

  return new ApiError(
    details ? `${message}: ${details}` : message,
    body.error?.fields
  );
}

export async function generatePosts(
  product: Product,
  ctaTone: CtaTonePreferences
): Promise<GeneratePostsResponse> {
  let response: Response;
  try {
    response = await fetch(`${NEXT_PUBLIC_API_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product, ctaTone }),
    });
  } catch {
    throw new ApiError("Could not reach the server. Is the backend running?");
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw toApiError(response.status, payload);
  }

  if (!payload || !Array.isArray(payload.posts)) {
    throw new ApiError("The server returned an unexpected response");
  }

  return payload as GeneratePostsResponse;
}
