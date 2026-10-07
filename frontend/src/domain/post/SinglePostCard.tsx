"use client";

import { Row } from "../../components/atom/layout";
import {
  Badge,
  Caption,
  Icon,
  Text,
} from "../../components/atom/typography";
import { Card } from "../../components/atom/surface";
import { CopyButton } from "../../components/copy-button";
import type { SocialMediaPost } from "./model";

const PLATFORM_ICONS: Record<SocialMediaPost["platform"], string> = {
  Twitter: "𝕏",
  Instagram: "📷",
  Linkedin: "💼",
};

export function SinglePostCard({ post }: { post: SocialMediaPost }) {
  return (
    <Card>
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
  );
}
