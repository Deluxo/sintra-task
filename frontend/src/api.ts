import { NEXT_PUBLIC_API_URL } from "./env";
import type { SocialMediaPost } from "./domain/post/model";

interface Product {
  name: string;
  description: string;
  price: number;
  category?: string;
}

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
