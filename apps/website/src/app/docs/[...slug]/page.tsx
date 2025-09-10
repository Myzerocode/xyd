"use client"

import * as React from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import PrimerProvider from "../../PrimerProvider";
import { AuthorInfo, CommentsList } from "../../components";

export const runtime = "edge";

interface DocMetadata {
    title?: string;
    author?: string;
    createdAt?: string;
}

function extractFrontmatter(content: string): { metadata: DocMetadata; body: string } {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
        return { metadata: {}, body: content };
    }

    const [, frontmatter, body] = match;
    const metadata: DocMetadata = {};

    // Parse frontmatter
    const lines = frontmatter.split('\n');
    for (const line of lines) {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            // Remove quotes if present
            const cleanValue = value.replace(/^["']|["']$/g, '');
            metadata[key.trim() as keyof DocMetadata] = cleanValue;
        }
    }

    return { metadata, body };
}

export default function DocPage() {
    const [content, setContent] = React.useState<string | null>(null)
    const [metadata, setMetadata] = React.useState<DocMetadata>({})
    const [error, setError] = React.useState<string | null>(null)
    const params = useParams<{ slug: string[] }>()
    const slug = Array.isArray(params?.slug) ? params.slug.join('/') : (typeof params?.slug === 'string' ? params.slug : '')

    React.useEffect(() => {
        let cancelled = false
        async function load() {
            try {
                const res = await fetch(`/api/doc-file?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
                const data = await res.json()
                if (!cancelled) {
                    if (res.ok && data.content) {
                        const { metadata: extractedMetadata, body } = extractFrontmatter(data.content);
                        setMetadata(extractedMetadata);
                        setContent(body);
                    } else if (res.status === 400 && data.type === 'directory') {
                        // Handle directory requests specially
                        setError(`This is a directory containing multiple documents. Please navigate to a specific document within the ${data.path} section.`)
                    } else {
                        setError(data?.error || 'Failed to load')
                    }
                }
            } catch (e) {
                if (!cancelled) setError(String((e as Error)?.message || e))
            }
        }
        load()
        return () => { cancelled = true }
    }, [slug])

    return <PrimerProvider>
        <main style={{maxWidth: 840, margin: '0 auto', padding: 24}}>
            {!content && !error && <div>Loading…</div>}
            {error && <div style={{color:'#ef4444'}}>{error}</div>}
            {content && (
                <>
                    {/* Display author info if available */}
                    {metadata.author && (
                        <AuthorInfo authorName={metadata.author} />
                    )}

                    {/* Display document content */}
                    <article>
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </article>

                    {/* Display comments section */}
                    <div style={{ marginTop: '2rem' }}>
                        <CommentsList slug={slug} />
                    </div>
                </>
            )}
        </main>
    </PrimerProvider>
}


