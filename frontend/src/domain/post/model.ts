import type { TONE_OPTIONS, Tone } from "./cta-tone";

export type Platform = "twitter" | "instagram" | "linkedin";

export interface SocialMediaPost {
  platform: Platform;
  content: string;
}

export type ToneOption = (typeof TONE_OPTIONS)[number];

export type ChoiceOption<T extends string> = {
  value: T;
  label: string;
};

export type ToneChipProps = {
  option: ToneOption;
  selected: boolean;
  onSelect: (tone: Tone) => void;
};

export type PlatformToneRowProps = {
  platform: Platform;
};

export type SegmentedOptionProps<T extends string> = {
  option: ChoiceOption<T>;
  selected: boolean;
  onSelect: (value: T) => void;
};

export type SegmentedFieldProps<T extends string> = {
  label: string;
  options: readonly ChoiceOption<T>[];
  value: T;
  onSelect: (value: T) => void;
};

/** Display names and icons for every platform a post can belong to. */
export const PLATFORM_META: Record<Platform, { label: string; icon: string }> = {
  twitter: { label: "Twitter/X", icon: "𝕏" },
  instagram: { label: "Instagram", icon: "📷" },
  linkedin: { label: "LinkedIn", icon: "💼" },
};

const PLATFORM_ALIASES: Record<string, Platform> = {
  twitter: "twitter",
  twitterx: "twitter",
  x: "twitter",
  instagram: "instagram",
  linkedin: "linkedin",
};

/**
 * The model (and caches written before normalisation existed) capitalise
 * platforms inconsistently, so map any known spelling onto the enum.
 */
export function toPlatform(value: string): Platform | null {
  const key = value.trim().toLowerCase().replace(/[\s\-/_.]/g, "");
  return PLATFORM_ALIASES[key] ?? null;
}
