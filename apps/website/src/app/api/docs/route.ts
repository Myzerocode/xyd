import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

// Reads docs.json in apps/docs if available and returns a minimal list of pages
export async function GET() {
    try {
        const docsJsonPath = path.join(process.cwd(), "apps", "docs", "docs.json");
        let pages: Array<{ title: string; href: string; group?: string }> = [];
        try {
            const raw = await fs.readFile(docsJsonPath, "utf8");
            const json = JSON.parse(raw);
            const sidebar = json?.navigation?.sidebar ?? [];
            for (const section of sidebar) {
                const route = section?.route;
                const groups = Array.isArray(section?.pages) ? section.pages : [];
                for (const group of groups) {
                    if (typeof group === "string") {
                        pages.push({ title: group.split("/").pop() || group, href: `/${group}` });
                        continue;
                    }
                    const groupName = group?.group;
                    const groupPages = Array.isArray(group?.pages) ? group.pages : [];
                    for (const p of groupPages) {
                        if (typeof p === "string") {
                            pages.push({ title: p.split("/").pop() || p, href: `/${p}`, group: groupName });
                        } else if (p && typeof p === "object" && p.page) {
                            pages.push({ title: p.title || p.page.split("/").pop() || p.page, href: `/${p.page}`, group: groupName });
                        }
                    }
                }
            }
        } catch {
            // Fallback: minimal items if docs.json missing
            pages = [
                { title: "Introduction", href: "/docs/guides/introduction" },
                { title: "Quickstart", href: "/docs/guides/quickstart" },
            ];
        }

        // Additionally scan filesystem for .md and .mdx files in both locations
        const scanDirs = [
            path.join(process.cwd(), "apps", "docs", "docs"), // Static docs
            path.join(process.cwd(), "apps", "website", "apps", "docs", "docs") // User-created docs
        ];

        for (const docsDir of scanDirs) {
            try {
                const walk = async function(dir: string, base = ""): Promise<string[]> {
                    const entries = await fs.readdir(dir, { withFileTypes: true });
                    const result: string[] = [];
                    for (const ent of entries) {
                        if (ent.isDirectory()) {
                            result.push(...await walk(path.join(dir, ent.name), path.join(base, ent.name)));
                        } else if (ent.isFile() && (ent.name.endsWith(".md") || ent.name.endsWith(".mdx"))) {
                            result.push(path.join(base, ent.name));
                        }
                    }
                    return result;
                };
                const files = await walk(docsDir);
                const filePages = files.map(rel => {
                    const noExt = rel.replace(/\.(md|mdx)$/i, "");
                    const href = `/docs/${noExt.replace(/\\/g, "/")}`;
                    return { title: noExt.split("/").pop() || noExt, href };
                });
                // Merge unique by href
                const seen = new Set(pages.map(p => p.href));
                for (const fp of filePages) {
                    if (!seen.has(fp.href)) {
                        pages.push(fp);
                        seen.add(fp.href);
                    }
                }
            } catch {
                // ignore fs scan errors for this directory
            }
        }
        return NextResponse.json({ pages });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}


