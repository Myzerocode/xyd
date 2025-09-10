import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const STORE_PATH = path.join(process.cwd(), ".xyd", "approvals.json");

async function readStore() {
    try {
        const raw = await fs.readFile(STORE_PATH, "utf8");
        return JSON.parse(raw);
    } catch {
        return { items: [
            { id: "doc-123", title: "Getting Started", author: "alice", href: "/docs/guides/quickstart", status: "pending" },
            { id: "doc-124", title: "Theme API", author: "bob", href: "/docs/guides/theme-api", status: "pending" },
            { id: "doc-125", title: "CLI Overview", author: "carol", href: "/docs/reference/cli/overview", status: "approved" },
        ]};
    }
}

async function writeStore(data: unknown) {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function GET() {
    const data = await readStore();
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const token = process.env.ADMIN_TOKEN;
    const auth = req.headers.get('authorization');
    if (token && auth !== `Bearer ${token}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const schema = z.object({ id: z.string().min(1).optional(), href: z.string().min(1).optional(), title: z.string().min(1).optional(), author: z.string().optional(), status: z.enum(['approved','rejected','pending']).default('pending') });
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { id, status, href, title, author } = parsed.data;
    const data = await readStore();
    const items: any[] = Array.isArray(data.items) ? data.items : [];
    const resolveId = id ?? (href ? `doc-${href.replace(/[^a-z0-9]+/gi,'-')}` : undefined);
    if (!resolveId) {
        return NextResponse.json({ error: 'id or href required' }, { status: 400 });
    }
    const idx = items.findIndex((x: any) => x.id === resolveId);
    if (idx >= 0) {
        items[idx] = { ...items[idx], status };
    } else {
        if (!href || !title) return NextResponse.json({ error: 'title and href required to create' }, { status: 400 });
        items.push({ id: resolveId, title, href, author: author ?? 'system', status });
    }
    await writeStore({ items });
    return NextResponse.json({ ok: true, id: resolveId });
}


