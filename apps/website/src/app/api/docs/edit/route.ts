import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const editSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = editSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const { id, title, slug, content } = parsed.data;

    // Construct the file path
    const cwd = process.cwd();
    const base = path.join(cwd, '..', 'docs', 'docs');
    const safeSlug = slug.replace(/^\/+/, '').replace(/^docs\//, '');
    const ext = safeSlug.endsWith('.md') || safeSlug.endsWith('.mdx') ? '' : '.mdx';
    const filePath = path.join(base, safeSlug + ext);

    // Check if file exists and read existing frontmatter
    let existingFrontmatter = '';
    try {
      const existingContent = await fs.readFile(filePath, 'utf8');
      const frontmatterMatch = existingContent.match(/^---[\s\S]*?---\n/);
      if (frontmatterMatch) {
        existingFrontmatter = frontmatterMatch[0];
      }
    } catch (e) {
      // File doesn't exist, that's fine
    }

    // Create or update the frontmatter
    const frontmatter = `---\ntitle: ${title}\nauthor: "admin"\ncreatedAt: "${new Date().toISOString()}"\n---\n\n`;

    // Write the file
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const mdx = frontmatter + content;
    await fs.writeFile(filePath, mdx, 'utf8');

    return NextResponse.json({
      success: true,
      message: "Document updated successfully",
      href: `/docs/${safeSlug}`
    });

  } catch (e) {
    console.error('Error editing document:', e);
    return NextResponse.json({ error: "Failed to edit document" }, { status: 500 });
  }
}
