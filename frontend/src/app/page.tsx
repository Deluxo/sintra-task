"use client";

import { useState } from "react";
import { generatePosts } from "../api";
import { Page, Row, Stack } from "../components/atom/layout";
import {
  Badge,
  Caption,
  Heading1,
  Heading2,
  Icon,
  Text,
} from "../components/atom/typography";
import { Button, Input, Label, Textarea } from "../components/atom/form";
import { Card } from "../components/atom/surface";
import { CopyButton } from "../components/copy-button";
import { ThemeToggle } from "../components/theme-toggle";

const GENERATE_POSTS_CACHE_KEY = 'cache.generatePosts';

interface Product {
  name: string;
  description: string;
  price: number;
  category?: string;
}

interface SocialMediaPost {
  platform: "Twitter" | "Instagram" | "Linkedin";
  content: string;
}

const PLATFORM_ICONS = {
  Twitter: "𝕏",
  Instagram: "📷",
  Linkedin: "💼",
};

export default function Home() {
  const [product, setProduct] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    category: "",
  });
  const [posts, setPosts] = useState<SocialMediaPost[]>(
    JSON.parse(localStorage.getItem(GENERATE_POSTS_CACHE_KEY) || '{}')?.posts || []
  );

  const handleGeneratePosts = async () => {
    const result = await generatePosts(product);
    localStorage.setItem(GENERATE_POSTS_CACHE_KEY, JSON.stringify(result));
    setPosts(result.posts);
  };

  return (
    <Page>
      <Row className="mb-8 justify-between">
        <Heading1 className="m-0">Social Media Post Generator</Heading1>
        <ThemeToggle />
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

      {posts.length > 0 && (
        <Stack className="mt-8">
          <Heading2>Generated Posts</Heading2>
          {posts.map((post, index) => (
            <Card key={index}>
              <Row className="mb-2 justify-between">
                <Row>
                  <Icon>{PLATFORM_ICONS[post.platform]}</Icon>
                  <Badge>{post.platform}</Badge>
                  <Caption>{post.content.length} chars</Caption>
                </Row>
                <CopyButton text={post.content} label={`${post.platform} post`} />
              </Row>
              <Text>{post.content}</Text>
            </Card>
          ))}
        </Stack>
      )}
    </Page>
  );
}
