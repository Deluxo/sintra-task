"use client";

import { ChangeEvent, useState } from "react";
import { Page, Row, Stack } from "../components/atom/layout";
import { Heading1 } from "../components/atom/typography";
import { Button, Input, Label, Textarea } from "../components/atom/form";
import { ThemeButton } from "../domain/theme/theme-button";
import { usePosts } from "../domain/post/usePosts";
import { PostsCard } from "../domain/post/PostsCard";
import type { Product } from "../domain/post/model";
import { FormControlRow } from "@/components/atom/molecule/FormControl";

export default function Home() {
  const [product, setProduct] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    category: "",
  });

  const { generatePosts } = usePosts();

  return (
    <Page>
      <Row className="mb-8 justify-between">
        <Heading1 className="m-0">Social Media Post Generator</Heading1>
        <ThemeButton />
      </Row>

      <Stack className="mb-8">
        <FormControlRow label="Product Name" inputProps={{
          onChange: (e: ChangeEvent<HTMLInputElement>) => setProduct({ ...product, name: e.target.value }),
          value: product.name,
          placeholder: "EcoBottle Pro",
        }} />

        <FormControlRow label="Product Name" InputComponent={Textarea} inputProps={{
          onChange: (e: ChangeEvent<HTMLTextAreaElement>) => setProduct({ ...product, name: e.target.value }),
          value: product.description,
          placeholder: "Revolutionary reusable water bottle with built-in UV purification...",
          rows: 4,
        }} />

        <FormControlRow label="Price" inputProps={{
          onChange: (e: ChangeEvent<HTMLInputElement>) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 }),
          type: "number",
          value: product.price,
          placeholder: "49.99",
        }} />

        <FormControlRow label="Category (optional)" inputProps={{
          onChange: (e: ChangeEvent<HTMLInputElement>) => setProduct({ ...product, category: e.target.value }),
          value: product.category || "",
          placeholder: "Health & Wellness",
        }} />

      </Stack>

      <Button onClick={() => generatePosts(product)}>Generate Posts</Button>

      <PostsCard className="mt-8" />
    </Page>
  );
}
