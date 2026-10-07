import { POST_COUNT } from "./env";
import { callOpenAI } from "./openai";
import { buildCtaToneFragment, CtaTonePreferences, DEFAULT_CTA_TONE } from "./cta-tone";
import { Product, SocialMediaPost } from "./types";

export async function generateSocialMediaPosts(
  product: Product,
  ctaTone: CtaTonePreferences = DEFAULT_CTA_TONE
): Promise<SocialMediaPost[]> {
  const prompt = buildPrompt(product, ctaTone);

  const posts = await callOpenAI(prompt);

  return posts;
}

function buildPrompt(product: Product, ctaTone: CtaTonePreferences): string {
  return `Generate ${POST_COUNT} social media posts for this product:

Product: ${product.name}
Description: ${product.description}
Price: $${product.price}
${product.category ? `Category: ${product.category}` : ""}

${buildCtaToneFragment(ctaTone)}

Include posts for Twitter, Instagram and LinkedIn.
`;
}
