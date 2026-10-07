"use client";

import {
  createContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { pipe } from "fp-ts/lib/function";
import type { SocialMediaPost } from "./model";

const GENERATE_POSTS_CACHE_KEY = "cache.generatePosts";

interface PostsContextValue {
  posts: SocialMediaPost[];
  setPosts: (posts: SocialMediaPost[]) => void;
}

const PostsContext = createContext<PostsContextValue | null>(null);

export { PostsContext };

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPostsState] = useState<SocialMediaPost[]>([]);

  const setPosts = (next: SocialMediaPost[]) => {
    setPostsState(next);
    localStorage.setItem(GENERATE_POSTS_CACHE_KEY, JSON.stringify({ posts: next }));
  };

  useLayoutEffect(() => {
    if (!window || posts?.length) return;

    pipe(
      GENERATE_POSTS_CACHE_KEY,
      a => localStorage.getItem(a) || '{}',
      a => JSON.parse(a),
      a => a?.posts,
      setPostsState,
    )
  }, [posts, setPostsState])

  const value: PostsContextValue = { posts, setPosts };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}
