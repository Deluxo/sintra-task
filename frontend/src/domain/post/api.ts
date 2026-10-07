import { NEXT_PUBLIC_API_URL } from "../../env";
import type { Product, SocialMediaPost } from "./model";

interface GeneratePostsResponse {
  posts: SocialMediaPost[];
  generated_at: string;
  count: number;
}

export async function generatePosts(
  product: Product
): Promise<GeneratePostsResponse> {
  const response = await fetch(
    `${NEXT_PUBLIC_API_URL}/api/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product }),
    }
  );

  return response.json();
}
