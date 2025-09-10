import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET() {
    const cwd = process.cwd();
    const testPath = path.join(cwd, '..', 'docs', 'docs', 'guides', 'introduction.md');

    try {
        await fs.access(testPath);
        return NextResponse.json({
            cwd,
            testPath,
            exists: true,
            message: 'File exists!'
        });
    } catch (e) {
        return NextResponse.json({
            cwd,
            testPath,
            exists: false,
            error: (e as Error).message,
            message: 'File does not exist'
        });
    }
}
