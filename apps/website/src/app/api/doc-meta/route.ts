import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const slug = url.searchParams.get('slug') || '';
        const clean = slug.replace(/^\/+/, '').replace(/^docs\//, '');
        const base = path.join(process.cwd(), 'apps', 'docs', 'docs');
        const tryPaths = [
            path.join(base, clean + '.mdx'),
            path.join(base, clean + '.md'),
            path.join(base, clean),
        ];
        let filePath: string | null = null;
        for (const p of tryPaths) {
            try { await fs.access(p); filePath = p; break; } catch {}
        }
        if (!filePath) return NextResponse.json({ error: 'not found' }, { status: 404 });
        const stat = await fs.stat(filePath);
        const raw = await fs.readFile(filePath, 'utf8');
        const content = raw.replace(/^---[\s\S]*?---\n/, '');
        const firstHeading = (content.match(/^#\s+(.+)$/m) || [])[1] || '';
        const excerpt = content.replace(/^#.*$/m, '').trim().slice(0, 160);
        return NextResponse.json({ mtime: stat.mtimeMs, title: firstHeading, excerpt });
    } catch (e) {
        return NextResponse.json({ error: String((e as Error)?.message || e) }, { status: 500 });
    }
}


