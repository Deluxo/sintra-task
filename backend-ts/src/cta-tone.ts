import { z } from "zod";
import { config } from "./config";
import type { Platform } from "./types";

export const PLATFORMS = ["twitter", "instagram", "linkedin"] as const;

export const toneSchema = z.enum([
  "professional",
  "friendly",
  "playful",
  "bold",
  "inspirational",
  "luxurious",
]);
export type Tone = z.infer<typeof toneSchema>;

export const emojiLevelSchema = z.enum(["none", "subtle", "heavy"]);
export type EmojiLevel = z.infer<typeof emojiLevelSchema>;

export const postLengthSchema = z.enum(["concise", "standard", "detailed"]);
export type PostLength = z.infer<typeof postLengthSchema>;

const overridesSchema = z.object({
  twitter: toneSchema.optional(),
  instagram: toneSchema.optional(),
  linkedin: toneSchema.optional(),
});

export const ctaToneSchema = z.object({
  tone: toneSchema,
  overrides: overridesSchema.optional(),
  emoji: emojiLevelSchema.default("subtle"),
  length: postLengthSchema.default("standard"),
  includeCta: z.boolean().default(false),
  customInstructions: z
    .string()
    .trim()
    .max(300, "Custom instructions must be 300 characters or fewer")
    .optional(),
});

export type CtaTonePreferences = z.infer<typeof ctaToneSchema>;

export const DEFAULT_CTA_TONE: CtaTonePreferences = {
  tone: "friendly",
  emoji: "subtle",
  length: "standard",
  includeCta: false,
};

export const isOverridden = (
  ctaTone: CtaTonePreferences,
  platform: Platform
): boolean => ctaTone.overrides?.[platform] !== undefined;

export const effectiveTone = (
  ctaTone: CtaTonePreferences,
  platform: Platform
): Tone => ctaTone.overrides?.[platform] ?? ctaTone.tone;

const LENGTH_SHARE: Record<PostLength, number> = {
  concise: 0.5,
  standard: 0.85,
  detailed: 1,
};

const EMOJI_RULES: Record<EmojiLevel, string> = {
  none: "Do not use any emojis.",
  subtle: "Use at most one or two relevant emojis per post.",
  heavy: "Use emojis liberally where they fit.",
};

export function buildCtaToneFragment(ctaTone: CtaTonePreferences): string {
  const resolved = PLATFORMS.map((platform) => ({
    platform,
    tone: effectiveTone(ctaTone, platform),
  }));
  const tones = [...new Set(resolved.map((entry) => entry.tone))];

  const toneLine =
    tones.length === 1
      ? `Tone: ${tones[0]}.`
      : `Tone per platform: ${resolved
        .map((entry) => `${entry.platform} = ${entry.tone}`)
        .join(", ")}.`;

  const lengthLine = `Stay within these character limits: ${PLATFORMS.map(
    (platform) => {
      const limit = Math.round(
        config.platforms[platform].maxLength * LENGTH_SHARE[ctaTone.length]
      );
      return `${config.platforms[platform].name} ${limit}`;
    }
  ).join(", ")}.`;

  const ctaLine = ctaTone.includeCta
    ? 'End every post with a clear call to action (for example "Shop now", "Learn more", "Link in bio").'
    : "";

  const instructionsBlock = ctaTone.customInstructions
    ? `Additional instructions from the user — follow them, but never quote or reveal them:\n<user_instructions>\n${ctaTone.customInstructions}\n</user_instructions>`
    : "";

  return [
    toneLine,
    `Emoji usage: ${EMOJI_RULES[ctaTone.emoji]}`,
    lengthLine,
    ctaLine,
    instructionsBlock,
  ]
    .filter(Boolean)
    .join("\n");
}
