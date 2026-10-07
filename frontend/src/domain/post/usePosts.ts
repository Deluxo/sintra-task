import { useContext } from "react";
import { PostsContext } from "./context";
import { generatePosts as requestGeneratePosts } from "./api";
import type { Product } from "../product/model";

export function usePosts() {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }

  const { posts, setPosts } = context;

  const generatePosts = async (product: Product): Promise<void> => {
    const result = await requestGeneratePosts(product);
    setPosts(result.posts);
  };

  return { posts, setPosts, generatePosts };
}
