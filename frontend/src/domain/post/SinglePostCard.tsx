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
import { PLATFORM_META, SocialMediaPost } from "./model";

export function SinglePostCard({ post }: { post: SocialMediaPost }) {
  // Cached posts may predate platform normalisation, so fall back gracefully.
  const meta = PLATFORM_META[post.platform] ?? { label: post.platform, icon: "•" };

  return (
    <Card>
      <Row className="mb-2 justify-between">
        <Row>
          <Icon>{meta.icon}</Icon>
          <Badge>{meta.label}</Badge>
          <Caption>{post.content.length} chars</Caption>
        </Row>
        <CopyButton text={post.content} label={`${meta.label} post`} />
      </Row>
      <Text>{post.content}</Text>
    </Card>
  );
}
