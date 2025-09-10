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
  flags?: Flag[];
  isFlagged?: boolean;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
}

interface Flag {
  id: string;
  commentId: string;
  reason: string;
  flaggedBy?: string;
  flaggedAt: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

const flagSchema = z.object({
  commentId: z.string().min(1),
  reason: z.string().min(1),
});

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = flagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const { commentId, reason } = parsed.data;
    const comments = await readComments();

    // Find and update the comment
    const updateComment = (comments: Comment[]): boolean => {
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === commentId) {
          // Initialize flags array if it doesn't exist
          if (!comments[i].flags) {
            comments[i].flags = [];
          }

          // Add the flag
          const newFlag: Flag = {
            id: `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            commentId,
            reason,
            flaggedAt: new Date().toISOString(),
            status: 'pending'
          };

          comments[i].flags!.push(newFlag);
          comments[i].isFlagged = true;
          comments[i].moderationStatus = 'pending';
          return true;
        }

        // Check replies recursively
        if (comments[i].replies && updateComment(comments[i].replies!)) {
          return true;
        }
      }
      return false;
    };

    const found = updateComment(comments);

    if (!found) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    await writeComments(comments);

    return NextResponse.json({
      success: true,
      message: "Comment has been flagged for review"
    });

  } catch (e) {
    console.error('Error flagging comment:', e);
    return NextResponse.json({ error: "Failed to flag comment" }, { status: 500 });
  }
}
