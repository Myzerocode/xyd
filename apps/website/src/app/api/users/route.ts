import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const USERS_STORE_PATH = path.join(process.cwd(), ".xyd", "users.json");

interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatar?: string;
  bio?: string;
  reputation: number;
  level: string;
  docsCreated: number;
  commentsPosted: number;
  joinedAt: string;
  lastActive: string;
  badges?: string[];
}

async function readUsers(): Promise<User[]> {
  try {
    const raw = await fs.readFile(USERS_STORE_PATH, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data.users) ? data.users : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: User[]) {
  await fs.mkdir(path.dirname(USERS_STORE_PATH), { recursive: true });
  await fs.writeFile(USERS_STORE_PATH, JSON.stringify({ users }, null, 2), "utf8");
}

function calculateLevel(reputation: number): string {
  if (reputation >= 1000) return "Expert";
  if (reputation >= 500) return "Advanced";
  if (reputation >= 200) return "Intermediate";
  if (reputation >= 50) return "Contributor";
  return "Beginner";
}

function calculateReputation(docsCreated: number, commentsPosted: number): number {
  // Reputation calculation: 10 points per doc + 2 points per comment
  return (docsCreated * 10) + (commentsPosted * 2);
}

// GET /api/users - Get all users or specific user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    const users = await readUsers();

    if (username) {
      const user = users.find(u => u.username === username);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ user });
    }

    // Return all users sorted by reputation
    const sortedUsers = users.sort((a, b) => b.reputation - a.reputation);
    return NextResponse.json({ users: sortedUsers });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/users - Create or update user
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const userSchema = z.object({
      username: z.string().min(1).max(50),
      displayName: z.string().min(1).max(100),
      email: z.string().email().optional(),
      avatar: z.string().url().optional(),
      bio: z.string().max(500).optional(),
    });

    const validated = userSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const { username, displayName, email, avatar, bio } = validated.data;
    const users = await readUsers();

    // Check if user already exists
    let user = users.find(u => u.username === username);

    if (user) {
      // Update existing user
      user.displayName = displayName;
      if (email) user.email = email;
      if (avatar) user.avatar = avatar;
      if (bio) user.bio = bio;
      user.lastActive = new Date().toISOString();
    } else {
      // Create new user
      user = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        username,
        displayName,
        email,
        avatar,
        bio,
        reputation: 0,
        level: "Beginner",
        docsCreated: 0,
        commentsPosted: 0,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        badges: [],
      };
      users.push(user);
    }

    await writeUsers(users);

    return NextResponse.json({
      user,
      message: user ? "User updated successfully" : "User created successfully"
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}

// PUT /api/users/update-stats - Update user statistics
export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const updateSchema = z.object({
      username: z.string().min(1),
      action: z.enum(["doc_created", "comment_posted"]),
    });

    const validated = updateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const { username, action } = validated.data;
    const users = await readUsers();

    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[userIndex];

    if (action === "doc_created") {
      user.docsCreated += 1;
    } else if (action === "comment_posted") {
      user.commentsPosted += 1;
    }

    // Recalculate reputation and level
    user.reputation = calculateReputation(user.docsCreated, user.commentsPosted);
    user.level = calculateLevel(user.reputation);
    user.lastActive = new Date().toISOString();

    await writeUsers(users);

    return NextResponse.json({
      user,
      message: "User statistics updated successfully"
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user statistics" }, { status: 500 });
  }
}
