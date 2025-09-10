"use client"

import * as React from "react";
import PrimerProvider from "./PrimerProvider";

import {Footer} from "@/app/components";
import Fuse from "fuse.js";
// Removed default landing sections in favor of custom content

export default function HomePage() {
    const [query, setQuery] = React.useState("");
    const [pages, setPages] = React.useState<Array<{ title: string; href: string; group?: string }>>([]);
    const [loading, setLoading] = React.useState(false);
    const [approved, setApproved] = React.useState<Array<{ id: string; title: string; href: string; mtime?: number; excerpt?: string }>>([])
    const [loadingApproved, setLoadingApproved] = React.useState(false)

    React.useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            try {
                const res = await fetch("/api/docs", { cache: "no-store" });
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled) setPages(Array.isArray(data?.pages) ? data.pages : []);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true };
    }, []);

    React.useEffect(() => {
        let cancelled = false
        async function loadApproved() {
            setLoadingApproved(true)
            try {
                const res = await fetch('/api/approvals', { cache: 'no-store' })
                if (!res.ok) return
                const data = await res.json()
                const items = Array.isArray(data?.items) ? data.items : []
                const base = items.filter((x: any) => x.status === 'approved').map((x: any) => ({ id: String(x.id), title: String(x.title || x.href), href: String(x.href) }))
                // Fetch metadata (mtime/excerpt) in parallel
                const withMeta = await Promise.all(base.map(async (d: { id: string; title: string; href: string }) => {
                    try {
                        const res = await fetch(`/api/doc-meta?slug=${encodeURIComponent(d.href)}`, { cache: 'no-store' })
                        if (res.ok) {
                            const meta = await res.json()
                            return { ...d, mtime: Number(meta?.mtime || 0), excerpt: String(meta?.excerpt || '') }
                        }
                    } catch {}
                    return d
                }))
                // Sort by last modified desc
                withMeta.sort((a, b) => (b.mtime || 0) - (a.mtime || 0))
                if (!cancelled) setApproved(withMeta)
            } finally {
                if (!cancelled) setLoadingApproved(false)
            }
        }
        loadApproved()
        return () => { cancelled = true }
    }, [])

    const filtered = React.useMemo(() => {
        const q = query.trim();
        if (!q) return pages.slice(0, 10);
        const fuse = new Fuse(pages, { keys: ["title", "href", "group"], threshold: 0.4 });
        return fuse.search(q).map(r => r.item).slice(0, 20);
    }, [pages, query]);

    return <PrimerProvider>
        <div style={{maxWidth: 960, margin: "0 auto", padding: 24}}>
            <div className="glass-surface" style={{padding: 16, borderRadius: 12, marginBottom: 16}}>
                <label style={{display:'block'}}>
                    <div style={{marginBottom: 6}}>Search docs</div>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.currentTarget.value)}
                        placeholder="Search by title, path, or group..."
                        style={{width:'100%'}}
                        aria-label="Search docs"
                    />
                </label>
                <div style={{marginTop: 8, fontSize: 12, opacity: 0.7}}>
                    {loading ? "Loading docs…" : `Showing ${filtered.length} of ${pages.length} entries`}
                </div>
            </div>

            <SearchResults query={query} items={filtered}/>

            <div style={{height: 24}}/>
            <section className="glass-surface" style={{padding: 16, borderRadius: 12}}>
                <h2 style={{marginTop:0}}>Approved Docs</h2>
                <div style={{fontSize: 12, opacity: 0.7, marginBottom: 8}}>
                    {loadingApproved ? 'Loading…' : `${approved.length} approved`}
                </div>
                <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:8}}>
                    {approved.map(doc => (
                        <li key={doc.id}>
                            <a href={doc.href} className="glass-surface" style={{display:'block', padding:12, borderRadius:10, textDecoration:'none'}}>
                                <div style={{fontWeight:600}}>{doc.title}</div>
                                <div style={{fontSize:12, opacity:0.7}}>{doc.href}{doc.mtime ? ` • ${new Date(doc.mtime).toLocaleString()}` : ''}</div>
                                {doc.excerpt && <div style={{fontSize:12, opacity:0.8, marginTop:6}}>{doc.excerpt}</div>}
                            </a>
                        </li>
                    ))}
                    {!loadingApproved && approved.length === 0 && (
                        <li style={{opacity:0.7}}>No approved docs yet.</li>
                    )}
                </ul>
            </section>
        </div>

        <Footer/>
    </PrimerProvider>
}

function highlight(text: string, query: string) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark>{text.slice(idx, idx + query.length)}</mark>
            {text.slice(idx + query.length)}
        </>
    )
}

function SearchResults({ query, items }: { query: string; items: Array<{ title: string; href: string; group?: string }> }) {
    return <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8}}>
        {items.map((p, i) => (
            <li key={p.href} className="glass-surface" style={{padding: 12, borderRadius: 10}}>
                <a href={p.href} style={{textDecoration:'none'}}>
                    <div style={{fontWeight: 600}}>{highlight(p.title, query)}</div>
                    <div style={{fontSize: 12, opacity: 0.7}}>{p.group ? <>{highlight(p.group, query)} • </> : ''}{highlight(p.href, query)}</div>
                </a>
            </li>
        ))}
    </ul>
}