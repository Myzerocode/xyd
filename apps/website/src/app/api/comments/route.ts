import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const COMMENTS_STORE_PATH = path.join(process.cwd(), ".xyd", "comments.json");

interface Comment {
  id: string;
  slug: string;
  content: string;
  author: string;
  createdAt: string;
  likes?: number;
  replies?: Comment[];
}

async function readComments(): Promise<Comment[]> {
  try {
    const raw = await fs.readFile(COMMENTS_STORE_PATH, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data.comments) ? data.comments : [];
  } catch {
    return [];
  }
}

async function writeComments(comments: Comment[]) {
  await fs.mkdir(path.dirname(COMMENTS_STORE_PATH), { recursive: true });
  await fs.writeFile(COMMENTS_STORE_PATH, JSON.stringify({ comments }, null, 2), "utf8");
}

const commentSchema = z.object({
  slug: z.string().min(1),
  content: z.string().min(1).max(2000),
  author: z.string().min(1).max(100),
  parentId: z.string().optional(), // For replies
});

// GET /api/comments?slug=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "slug parameter required" }, { status: 400 });
    }

    const comments = await readComments();
    const filteredComments = comments.filter(comment => comment.slug === slug);

    return NextResponse.json({ comments: filteredComments });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST /api/comments
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const validated = commentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const { slug, content, author, parentId } = validated.data;

    const comments = await readComments();
    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slug,
      content,
      author,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    if (parentId) {
      // This is a reply - find the parent comment and add to its replies
      const parentIndex = comments.findIndex(c => c.id === parentId);
      if (parentIndex >= 0) {
        if (!comments[parentIndex].replies) {
          comments[parentIndex].replies = [];
        }
        comments[parentIndex].replies!.push(newComment);
      } else {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }
    } else {
      // This is a top-level comment
      comments.push(newComment);
    }

    await writeComments(comments);

    return NextResponse.json({
      comment: newComment,
      message: "Comment added successfully"
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
