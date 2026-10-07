import { useContext } from "react";
import { PostsContext } from "./context";
import { generatePosts as requestGeneratePosts } from "./api";
import type { Product } from "../product/model";

export function usePosts() {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }

  const {
    posts,
    setPosts,
    ctaTone,
    setTone,
    setPlatformTone,
    clearPlatformTone,
    patchCtaTone,
  } = context;

  const generatePosts = async (product: Product): Promise<void> => {
    const result = await requestGeneratePosts(product, ctaTone);
    setPosts(result.posts);
  };

  return {
    posts,
    setPosts,
    ctaTone,
    setTone,
    setPlatformTone,
    clearPlatformTone,
    patchCtaTone,
    generatePosts,
  };
}
