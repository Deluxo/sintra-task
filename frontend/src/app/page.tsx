"use client";

import { useState } from "react";
import { generatePosts } from "../api";
import { Page, Row, Stack } from "../components/atom/layout";
import { Heading1 } from "../components/atom/typography";
import { Button, Input, Label, Textarea } from "../components/atom/form";
import { ThemeButton } from "../domain/theme/theme-button";
import { usePosts } from "../domain/post/usePosts";
import { PostsCard } from "../domain/post/PostsCard";

/** @TODO: move interfaces etc to better fitting file structure */
/** @TODO: refactor <div><label><input></div> into a molecule */

interface Product {
  name: string;
  description: string;
  price: number;
  category?: string;
}

export default function Home() {
  const [product, setProduct] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    category: "",
  });

  const { setPosts } = usePosts();

  const handleGeneratePosts = async () => {
    const result = await generatePosts(product);
    setPosts(result.posts);
  };

  return (
    <Page>
      <Row className="mb-8 justify-between">
        <Heading1 className="m-0">Social Media Post Generator</Heading1>
        <ThemeButton />
      </Row>

      <Stack className="mb-8">
        <div>
          <Label>Product Name</Label>
          <Input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            placeholder="EcoBottle Pro"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            rows={4}
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
            placeholder="Revolutionary reusable water bottle with built-in UV purification..."
          />
        </div>

        <div>
          <Label>Price</Label>
          <Input
            type="number"
            value={product.price}
            onChange={(e) =>
              setProduct({ ...product, price: parseFloat(e.target.value) || 0 })
            }
            placeholder="49.99"
          />
        </div>

        <div>
          <Label>Category (optional)</Label>
          <Input
            type="text"
            value={product.category || ""}
            onChange={(e) =>
              setProduct({ ...product, category: e.target.value })
            }
            placeholder="Health & Wellness"
          />
        </div>
      </Stack>

      <Button onClick={handleGeneratePosts}>Generate Posts</Button>

      <PostsCard className="mt-8"/>
    </Page>
  );
}
