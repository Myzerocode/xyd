import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

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

async function readComments(): Promise<Comment[]> {
  try {
    const raw = await fs.readFile(COMMENTS_STORE_PATH, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data.comments) ? data.comments : [];
  } catch {
    return [];
  }
}

// Recursive function to find all flagged comments
function findFlaggedComments(comments: Comment[]): Comment[] {
  const flagged: Comment[] = [];

  for (const comment of comments) {
    if (comment.isFlagged && comment.flags && comment.flags.length > 0) {
      flagged.push(comment);
    }

    // Check replies recursively
    if (comment.replies && comment.replies.length > 0) {
      flagged.push(...findFlaggedComments(comment.replies));
    }
  }

  return flagged;
}

export async function GET() {
  try {
    const comments = await readComments();
    const flaggedComments = findFlaggedComments(comments);

    // Sort by most recent flag
    flaggedComments.sort((a, b) => {
      const aLatestFlag = a.flags?.[a.flags.length - 1]?.flaggedAt || a.createdAt;
      const bLatestFlag = b.flags?.[b.flags.length - 1]?.flaggedAt || b.createdAt;
      return new Date(bLatestFlag).getTime() - new Date(aLatestFlag).getTime();
    });

    return NextResponse.json({
      comments: flaggedComments,
      total: flaggedComments.length
    });

  } catch (e) {
    console.error('Error fetching flagged comments:', e);
    return NextResponse.json(
      { error: "Failed to fetch flagged comments" },
      { status: 500 }
    );
  }
}
