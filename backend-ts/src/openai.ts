import OpenAI from "openai";
import { SocialMediaPost } from "./types";
import { OPENAI_API_KEY } from "./env";
import { llmResponseSchema, normalizeGeneratedPosts } from "./schema";
import { config } from "./config";

const SYSTEM_PROMPT = `You are a social media copywriter helping small businesses promote their products.

Always respond with a JSON object of shape {"posts": [{"platform": "...", "content": "..."}]}.
The "platform" value must be lowercase and exactly one of "twitter", "instagram", "linkedin".
Never wrap the JSON in markdown and never add commentary outside it.`;

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: OPENAI_API_KEY,
      timeout: 30000, // 30 second timeout
      maxRetries: 2,
    });
  }

  return client;
}

export async function callOpenAI(prompt: string): Promise<SocialMediaPost[]> {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: config.generation.model,
    temperature: config.generation.temperature,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("The model returned an empty response");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(content);
  } catch {
    throw new Error("The model returned malformed JSON");
  }

  const parsed = llmResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("The model returned an unexpected response shape");
  }

  const posts = normalizeGeneratedPosts(parsed.data.posts);
  if (!posts.length) {
    throw new Error("The model returned no usable posts");
  }

  return posts;
}
