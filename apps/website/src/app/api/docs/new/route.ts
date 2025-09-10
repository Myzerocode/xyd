import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const schema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    content: z.string().min(1),
    author: z.string().min(1).optional(),
});

function sanitizeSlug(slug: string) {
    return slug.replace(/^\/+/, '').replace(/\.{2,}/g, '.').replace(/[^a-zA-Z0-9\/_-]+/g, '-');
}

export async function POST(req: Request) {
    const token = process.env.ADMIN_TOKEN;
    const auth = req.headers.get('authorization');
    if (token && auth !== `Bearer ${token}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { title, slug, content, author } = parsed.data;
    const safeSlug = sanitizeSlug(slug).replace(/\/$/, '');
    const relative = safeSlug.replace(/^docs\//, '').replace(/^\/docs\//, '');
    const ext = relative.endsWith('.md') || relative.endsWith('.mdx') ? '' : '.mdx';
    const filePath = path.join(process.cwd(), 'apps', 'docs', 'docs', relative + ext);
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Create MDX content with metadata
    const metadata: any = { title };
    if (author) {
        metadata.author = author;
        metadata.createdAt = new Date().toISOString();
    }

    const metadataStr = Object.entries(metadata)
        .map(([key, value]) => `${key}: ${typeof value === 'string' ? `"${value}"` : value}`)
        .join('\n');

    const mdx = `---\n${metadataStr}\n---\n\n${content}\n`;
    await fs.writeFile(filePath, mdx, 'utf8');

    // Update user statistics if author is provided
    if (author) {
        try {
            await fetch(`${req.headers.get('origin') || 'http://localhost:3000'}/api/users/update-stats`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: author,
                    action: 'doc_created',
                }),
            });
        } catch (error) {
            // Don't fail the doc creation if user stats update fails
            console.warn('Failed to update user stats:', error);
        }
    }

    return NextResponse.json({ ok: true, href: `/docs/${relative}` });
}


