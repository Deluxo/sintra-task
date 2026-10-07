import dotenv from "dotenv";
dotenv.config();

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { generateSocialMediaPosts } from "./generate";
import { generateRequestSchema, toFieldErrors } from "./schema";
import { PORT } from "./env";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ hello: "world", timestamp: new Date().toISOString() });
});

// Generate social media posts
app.post("/api/generate", async (req: Request, res: Response, next: NextFunction) => {
  const parsed = generateRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: {
        message: "Invalid request",
        fields: toFieldErrors(parsed.error),
      },
    });
    return;
  }

  const { product, ctaTone } = parsed.data;

  try {
    const posts = await generateSocialMediaPosts(product, ctaTone);

    res.json({
      posts,
      generated_at: new Date().toISOString(),
      count: posts.length,
    });
  } catch (error) {
    // Express 4 does not forward rejected promises from async handlers.
    next(error);
  }
});

// Express only forwards errors thrown synchronously, so async handlers need
// their own catch — otherwise the request hangs until the client times out.
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(error);

  console.error(error);
  res.status(500).json({
    error: {
      message: error instanceof Error ? error.message : "Failed to generate posts",
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
