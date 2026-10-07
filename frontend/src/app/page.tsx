"use client";

import { Page, Row } from "../components/atom/layout";
import { Heading1 } from "../components/atom/typography";
import { ThemeButton } from "../domain/theme/theme-button";
import { GeneratePostsButton } from "../domain/post/GeneratePostsButton";
import { PostsCard } from "../domain/post/PostsCard";
import { CtaToneForm } from "../domain/post/CtaToneForm";
import { ProductForm } from "../domain/product/ProductForm";

export default function Home() {
  return (
    <Page className="space-y-8">
      <Row className="justify-between">
        <Heading1 className="m-0">Social Media Post Generator</Heading1>
        <ThemeButton />
      </Row>

      <ProductForm />
      <CtaToneForm />
      <GeneratePostsButton className="w-full"/>

      <PostsCard className="mt-8" />
    </Page>
  );
}
