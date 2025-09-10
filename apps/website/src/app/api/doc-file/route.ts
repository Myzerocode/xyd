import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const slug = url.searchParams.get('slug') || '';
        const clean = slug.replace(/^\/+/, '').replace(/^docs\//, '');
        const cwd = process.cwd();
        // Check both static docs and user-created docs directories
        const bases = [
            path.join(cwd, '..', 'docs', 'docs'), // Static docs
            path.join(cwd, 'apps', 'docs', 'docs') // User-created docs
        ];

        let filePath: string | null = null;
        for (const base of bases) {
            const tryPaths = [
                path.join(base, clean + '.mdx'),
                path.join(base, clean + '.md'),
                path.join(base, clean),
            ];

            for (const p of tryPaths) {
                try {
                    await fs.access(p);
                    filePath = p;
                    break;
                } catch (e) {
                    // File not found, continue to next path
                }
            }
            if (filePath) break; // Found the file, stop searching
        }

        if (!filePath) {
            return NextResponse.json({ error: 'not found' }, { status: 404 });
        }

        // Check if the path is a directory
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
            // If it's a directory, return directory information instead of trying to read it as a file
            return NextResponse.json({
                error: 'directory not supported',
                type: 'directory',
                path: clean
            }, { status: 400 });
        }

        const raw = await fs.readFile(filePath, 'utf8');
        const content = raw.replace(/^---[\s\S]*?---\n/, '');
        return NextResponse.json({ content });
    } catch (e) {
        return NextResponse.json({ error: String((e as Error)?.message || e) }, { status: 500 });
    }
}


