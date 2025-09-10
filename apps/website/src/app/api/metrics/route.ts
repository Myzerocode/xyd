import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET() {
    const now = Date.now();

    // Count docs from filesystem
    async function countDocs() {
        try {
            const root = path.join(process.cwd(), "apps", "docs", "docs");
            const walk = async function(dir: string): Promise<number> {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                let count = 0;
                for (const ent of entries) {
                    const full = path.join(dir, ent.name);
                    if (ent.isDirectory()) count += await walk(full);
                    else if (ent.isFile() && (ent.name.endsWith('.md') || ent.name.endsWith('.mdx'))) count += 1;
                }
                return count;
            };
            return await walk(root);
        } catch {
            return 0;
        }
    }

    async function countPendingApprovals() {
        try {
            const store = path.join(process.cwd(), ".xyd", "approvals.json");
            const raw = await fs.readFile(store, 'utf8').catch(() => '{}');
            const json = JSON.parse(raw || '{}');
            const items: any[] = Array.isArray(json.items) ? json.items : [];
            return items.filter(x => x.status === 'pending').length;
        } catch {
            return 0;
        }
    }

    async function fetchPlausible() {
        try {
            const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
            const apiKey = process.env.PLAUSIBLE_API_KEY;
            if (!domain || !apiKey) return null;
            const url = `https://plausible.io/api/v1/stats/aggregate?site_id=${encodeURIComponent(domain)}&period=7d&metrics=visitors,pageviews`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
            if (!res.ok) return null;
            const data = await res.json().catch(() => null);
            const results = data?.results || {};
            return {
                uniqueUsers7d: Number(results?.visitors?.value ?? 0),
                pageViews7d: Number(results?.pageviews?.value ?? 0),
            };
        } catch {
            return null;
        }
    }

    const [totalDocs, pendingApprovals, plausible] = await Promise.all([
        countDocs(),
        countPendingApprovals(),
        fetchPlausible(),
    ]);

    const metrics = {
        totalDocs,
        pendingApprovals,
        pageViews7d: plausible?.pageViews7d ?? 0,
        uniqueUsers7d: plausible?.uniqueUsers7d ?? 0,
        updatedAt: now,
    };
    return NextResponse.json(metrics);
}


