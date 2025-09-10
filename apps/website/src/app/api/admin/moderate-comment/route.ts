import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

interface Comment {
  id: string;
  slug: string;
  content: string;
  author: string;
  createdAt: string;
  likes?: number;
  replies?: Comment[];
  flags?: Array<{
    id: string;
    reason: string;
    flaggedAt: string;
    status: 'pending' | 'reviewed' | 'dismissed';
  }>;
  isFlagged?: boolean;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
}

const COMMENTS_STORE_PATH = path.join(process.cwd(), ".xyd", "comments.json");

const moderateSchema = z.object({
  commentId: z.string().min(1),
  action: z.enum(['approve', 'reject', 'dismiss']),
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

// Recursive function to find and moderate a comment
function moderateComment(comments: Comment[], commentId: string, action: 'approve' | 'reject' | 'dismiss'): boolean {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].id === commentId) {
      // Update moderation status
      comments[i].moderationStatus = action === 'approve' ? 'approved' :
                                    action === 'reject' ? 'rejected' : 'approved'; // dismiss = approve

      // Update flag statuses
      if (comments[i].flags) {
        comments[i].flags.forEach(flag => {
          flag.status = action === 'dismiss' ? 'dismissed' : 'reviewed';
        });
      }

      // If rejecting, we might want to hide the comment or mark it for deletion
      if (action === 'reject') {
        comments[i].content = '[Content removed by moderator]';
        comments[i].isFlagged = false; // Remove from flagged list
      }

      return true;
    }

    // Check replies recursively
    if (comments[i].replies && moderateComment(comments[i].replies!, commentId, action)) {
      return true;
    }
  }
  return false;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = moderateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const { commentId, action } = parsed.data;
    const comments = await readComments();

    const found = moderateComment(comments, commentId, action);

    if (!found) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    await writeComments(comments);

    return NextResponse.json({
      success: true,
      message: `Comment ${action}d successfully`
    });

  } catch (e) {
    console.error('Error moderating comment:', e);
    return NextResponse.json({ error: "Failed to moderate comment" }, { status: 500 });
  }
}
