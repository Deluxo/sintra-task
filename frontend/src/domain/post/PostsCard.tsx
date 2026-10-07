"use client";

import { Stack } from "../../components/atom/layout";
import { Heading2 } from "../../components/atom/typography";
import { usePosts } from "./usePosts";
import { SinglePostCard } from "./SinglePostCard";
import { ComponentProps} from "react";

export function PostsCard(props: ComponentProps<"div">) {
  const { posts } = usePosts();

  if (!posts.length) return null;

  return (
    <Stack {...props}>
      <Heading2>Generated Posts</Heading2>
      {posts.map((post, index) => (
        <SinglePostCard key={index} post={post} />
      ))}
    </Stack>
  );
}
