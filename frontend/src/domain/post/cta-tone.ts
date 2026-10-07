import type { Platform } from "./model";
import { PLATFORM_META } from "./model";

export type Tone =
  | "professional"
  | "friendly"
  | "playful"
  | "bold"
  | "inspirational"
  | "luxurious";

export type EmojiLevel = "none" | "subtle" | "heavy";

export type PostLength = "concise" | "standard" | "detailed";

/**
 * User chosen voice for the generated posts.
 * `tone` is the default for every platform; `overrides` only exists for
 * platforms edited individually, and changing `tone` clears them.
 */
export interface CtaTonePreferences {
  tone: Tone;
  overrides?: Partial<Record<Platform, Tone>>;
  emoji: EmojiLevel;
  length: PostLength;
  includeCta: boolean;
  customInstructions?: string;
}

export const TONE_OPTIONS: readonly {
  value: Tone;
  label: string;
  hint: string;
}[] = [
  { value: "professional", label: "Professional", hint: "Polished and credible" },
  { value: "friendly", label: "Friendly", hint: "Warm and approachable" },
  { value: "playful", label: "Playful", hint: "Light and fun" },
  { value: "bold", label: "Bold", hint: "Direct and opinionated" },
  { value: "inspirational", label: "Inspirational", hint: "Uplifting and aspirational" },
  { value: "luxurious", label: "Luxurious", hint: "Premium and exclusive" },
];

export const EMOJI_OPTIONS: readonly { value: EmojiLevel; label: string }[] = [
  { value: "none", label: "None" },
  { value: "subtle", label: "Subtle" },
  { value: "heavy", label: "Heavy" },
];

export const LENGTH_OPTIONS: readonly { value: PostLength; label: string }[] = [
  { value: "concise", label: "Concise" },
  { value: "standard", label: "Standard" },
  { value: "detailed", label: "Detailed" },
];

export const CUSTOM_INSTRUCTIONS_MAX = 300;

export const DEFAULT_CTA_TONE: CtaTonePreferences = {
  tone: "friendly",
  emoji: "subtle",
  length: "standard",
  includeCta: false,
  customInstructions: "",
};

const PLATFORM_KEYS = Object.keys(PLATFORM_META) as Platform[];

const TONE_VALUES: Tone[] = TONE_OPTIONS.map((option) => option.value);
const EMOJI_VALUES: EmojiLevel[] = EMOJI_OPTIONS.map((option) => option.value);
const LENGTH_VALUES: PostLength[] = LENGTH_OPTIONS.map((option) => option.value);

export const toneLabel = (tone: Tone): string =>
  TONE_OPTIONS.find((option) => option.value === tone)?.label ?? tone;

export const isOverridden = (
  ctaTone: CtaTonePreferences,
  platform: Platform
): boolean => ctaTone.overrides?.[platform] !== undefined;

export const effectiveTone = (
  ctaTone: CtaTonePreferences,
  platform: Platform
): Tone => ctaTone.overrides?.[platform] ?? ctaTone.tone;

/**
 * Rebuilds preferences from untrusted input (localStorage can be stale or
 * hand-edited), falling back field by field instead of crashing the form.
 */
export function sanitizeCtaTone(value: unknown): CtaTonePreferences {
  if (typeof value !== "object" || value === null) return DEFAULT_CTA_TONE;

  const raw = value as Record<string, unknown>;
  const tone = TONE_VALUES.includes(raw.tone as Tone)
    ? (raw.tone as Tone)
    : DEFAULT_CTA_TONE.tone;

  const overrides = (typeof raw.overrides === "object" && raw.overrides !== null
    ? raw.overrides
    : {}) as Record<string, unknown>;
  const validOverrides = Object.fromEntries(
    Object.entries(overrides).filter(
      ([key, entry]) =>
        PLATFORM_KEYS.includes(key as Platform) &&
        TONE_VALUES.includes(entry as Tone)
    )
  ) as Partial<Record<Platform, Tone>>;

  return {
    tone,
    overrides: validOverrides,
    emoji: EMOJI_VALUES.includes(raw.emoji as EmojiLevel)
      ? (raw.emoji as EmojiLevel)
      : DEFAULT_CTA_TONE.emoji,
    length: LENGTH_VALUES.includes(raw.length as PostLength)
      ? (raw.length as PostLength)
      : DEFAULT_CTA_TONE.length,
    includeCta: typeof raw.includeCta === "boolean" ? raw.includeCta : DEFAULT_CTA_TONE.includeCta,
    customInstructions:
      typeof raw.customInstructions === "string"
        ? raw.customInstructions.slice(0, CUSTOM_INSTRUCTIONS_MAX)
        : DEFAULT_CTA_TONE.customInstructions,
  };
}
