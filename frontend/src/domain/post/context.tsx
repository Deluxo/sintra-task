"use client";

import {
  createContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { pipe } from "fp-ts/lib/function";
import type { Platform, SocialMediaPost } from "./model";
import { toPlatform } from "./model";
import {
  CtaTonePreferences,
  DEFAULT_CTA_TONE,
  sanitizeCtaTone,
  type Tone,
} from "./cta-tone";

const GENERATE_POSTS_CACHE_KEY = "cache.generatePosts";

interface PostsState {
  posts: SocialMediaPost[];
  ctaTone: CtaTonePreferences;
}

interface PostsContextValue extends PostsState {
  setPosts: (posts: SocialMediaPost[]) => void;
  /** Replaces the default tone and clears every per-platform override. */
  setTone: (tone: Tone) => void;
  setPlatformTone: (platform: Platform, tone: Tone) => void;
  clearPlatformTone: (platform: Platform) => void;
  /** Applies standalone edits (emoji, length, CTA, instructions). */
  patchCtaTone: (patch: Partial<CtaTonePreferences>) => void;
}

const PostsContext = createContext<PostsContextValue | null>(null);

export { PostsContext };

const INITIAL_STATE: PostsState = {
  posts: [],
  ctaTone: DEFAULT_CTA_TONE,
};

/** Reads the cache defensively: malformed JSON or stale shapes degrade to defaults. */
function readCache(): PostsState | null {
  const cached = pipe(
    GENERATE_POSTS_CACHE_KEY,
    (key) => localStorage.getItem(key),
    (raw) => (raw ? JSON.parse(raw) : null)
  );

  if (!cached || typeof cached !== "object") return null;

  const posts = Array.isArray(cached.posts)
    ? cached.posts
        .flatMap((post: unknown): SocialMediaPost[] => {
          if (typeof post !== "object" || post === null) return [];
          const { platform, content } = post as { platform?: unknown; content?: unknown };
          if (typeof content !== "string") return [];
          const normalized = toPlatform(String(platform));
          return normalized ? [{ platform: normalized, content }] : [];
        })
    : [];

  return {
    posts,
    ctaTone: sanitizeCtaTone(cached.ctaTone),
  };
}

export function PostsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PostsState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    try {
      const cached = readCache();
      if (cached) setState(cached);
    } catch (error) {
      console.error("Failed to restore cached posts", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(GENERATE_POSTS_CACHE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const update = (fn: (current: PostsState) => PostsState) =>
    setState((current) => fn(current));

  const value: PostsContextValue = {
    ...state,
    setPosts: (posts) => update((current) => ({ ...current, posts })),
    setTone: (tone) =>
      update((current) => ({
        ...current,
        ctaTone: { ...current.ctaTone, tone, overrides: {} },
      })),
    setPlatformTone: (platform, tone) =>
      update((current) => ({
        ...current,
        ctaTone: {
          ...current.ctaTone,
          overrides: { ...current.ctaTone.overrides, [platform]: tone },
        },
      })),
    clearPlatformTone: (platform) =>
      update((current) => {
        const overrides = { ...current.ctaTone.overrides };
        delete overrides[platform];
        return { ...current, ctaTone: { ...current.ctaTone, overrides } };
      }),
    patchCtaTone: (patch) =>
      update((current) => ({
        ...current,
        ctaTone: { ...current.ctaTone, ...patch },
      })),
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}
