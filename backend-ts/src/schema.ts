import { z } from "zod";
import { ctaToneSchema, PLATFORMS } from "./cta-tone";
import type { Platform, SocialMediaPost } from "./types";

const MAX = {
  name: 120,
  description: 2000,
  category: 80,
} as const;

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(MAX.name, `Product name must be ${MAX.name} characters or fewer`),
  description: z
    .string()
    .trim()
    .min(1, "Product description is required")
    .max(
      MAX.description,
      `Product description must be ${MAX.description} characters or fewer`
    ),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .finite("Price must be a number")
    .min(0, "Price cannot be negative"),
  category: z.string().trim().max(MAX.category, `Category must be ${MAX.category} characters or fewer`).optional(),
});

export const generateRequestSchema = z.object({
  product: productSchema,
  ctaTone: ctaToneSchema.optional(),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

/** Shape-checks the raw model payload before platforms are normalised. */
export const llmResponseSchema = z.object({
  posts: z
    .array(z.object({ platform: z.string(), content: z.string() }))
    .min(1, "Model returned no posts"),
});

export type LlmResponse = z.infer<typeof llmResponseSchema>;

/**
 * The model is told to use lowercase platform keys but may capitalise or hyphenate
 * them anyway, so normalise before matching against the platform enum.
 */
const normalizePlatformKey = (value: string): string =>
  value.trim().toLowerCase().replace(/[\s\-/_.]/g, "");

const PLATFORM_ALIASES: Record<string, Platform> = {
  twitter: "twitter",
  twitterx: "twitter",
  x: "twitter",
  instagram: "instagram",
  linkedin: "linkedin",
};

const postSchema = z.object({
  platform: z.enum(PLATFORMS),
  content: z.string().trim().min(1),
});

/** Maps raw model posts onto the platform enum, silently dropping malformed entries. */
export function normalizeGeneratedPosts(posts: LlmResponse["posts"]): SocialMediaPost[] {
  return posts
    .map((post) => ({
      platform: PLATFORM_ALIASES[normalizePlatformKey(post.platform)],
      content: post.content.trim(),
    }))
    .filter((post): post is SocialMediaPost => postSchema.safeParse(post).success);
}

/** Flattens a ZodError into `{ "product.name": "Product name is required" }`. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((carry, issue) => {
    const path = issue.path.join(".") || "request";
    carry[path] ??= issue.message;
    return carry;
  }, {});
}
