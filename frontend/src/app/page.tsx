"use client";

import { Page, Row } from "../components/atom/layout";
import { Heading1 } from "../components/atom/typography";
import { Button } from "../components/atom/form";
import { ThemeButton } from "../domain/theme/theme-button";
import { usePosts } from "../domain/post/usePosts";
import { PostsCard } from "../domain/post/PostsCard";
import { useProduct } from "../domain/product/useProduct";
import { ProductForm } from "../domain/product/ProductForm";

export default function Home() {
  const { product } = useProduct();
  const { generatePosts } = usePosts();

  return (
    <Page className="space-y-8">
      <Row className="justify-between">
        <Heading1 className="m-0">Social Media Post Generator</Heading1>
        <ThemeButton />
      </Row>

      <ProductForm />
      <Button onClick={() => generatePosts(product)}>
        Generate Posts
      </Button>

      <PostsCard className="mt-8" />
    </Page>
  );
}
