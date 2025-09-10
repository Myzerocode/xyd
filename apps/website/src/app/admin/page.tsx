"use client"

import * as React from "react";
import Link from "next/link";
import PrimerProvider from "../PrimerProvider";
import { AlertIcon, CommentIcon } from "@primer/octicons-react";

export default function AdminPage() {
    const [metrics, setMetrics] = React.useState<any>(null);
    const [approvals, setApprovals] = React.useState<Array<any>>([]);
    const [busy, setBusy] = React.useState<string | null>(null);
    const [token, setToken] = React.useState<string>("");
    const [editingDoc, setEditingDoc] = React.useState<any>(null);
    const [editForm, setEditForm] = React.useState({ title: '', slug: '', content: '' });

    React.useEffect(() => {
        // Load metrics
        fetch("/api/metrics", { cache: "no-store" }).then(r => r.json()).then(setMetrics).catch(() => {});
        // Load approvals
        fetch("/api/approvals", { cache: "no-store" }).then(r => r.json()).then(d => setApprovals(d.items || [])).catch(() => {});
    }, []);

    async function updateApproval(id: string, status: "approved" | "rejected") {
        setBusy(id);
        try {
            const headers: Record<string,string> = { 'content-type': 'application/json' };
            if (token) headers['authorization'] = `Bearer ${token}`;
            const res = await fetch('/api/approvals', { method: 'POST', headers, body: JSON.stringify({ id, status })});
            if (res.ok) {
                setApprovals(prev => prev.map(it => it.id === id ? { ...it, status } : it));
            }
        } finally {
            setBusy(null);
        }
    }

    async function editDocument(doc: any) {
        // Load the document content for editing
        try {
            const slug = doc.href.replace('/docs/', '').replace(/^\//, '');
            const docResponse = await fetch(`/api/doc-file?slug=${encodeURIComponent(slug)}`);
            if (docResponse.ok) {
                const docData = await docResponse.json();
                setEditingDoc(doc);
                setEditForm({
                    title: doc.title,
                    slug: slug,
                    content: docData.content || ''
                });
            } else {
                // If document doesn't exist yet, just use basic info
                setEditingDoc(doc);
                setEditForm({
                    title: doc.title,
                    slug: doc.href.replace('/docs/', '').replace(/^\//, ''),
                    content: ''
                });
            }
        } catch (error) {
            console.error('Error loading document for editing:', error);
            alert('Failed to load document for editing');
        }
    }

    async function saveEditedDocument() {
        if (!editingDoc) return;

        setBusy(editingDoc.id);
        try {
            const headers: Record<string,string> = { 'content-type': 'application/json' };
            if (token) headers['authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/docs/edit', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    id: editingDoc.id,
                    title: editForm.title,
                    slug: editForm.slug,
                    content: editForm.content
                })
            });

            if (res.ok) {
                setEditingDoc(null);
                setEditForm({ title: '', slug: '', content: '' });
                // Reload approvals
                fetch("/api/approvals", { cache: "no-store" })
                    .then(r => r.json())
                    .then(d => setApprovals(d.items || []))
                    .catch(() => {});
            } else {
                alert('Failed to save changes');
            }
        } catch (error) {
            console.error('Error saving document:', error);
            alert('Failed to save changes');
        } finally {
            setBusy(null);
        }
    }

    async function deleteDocument(id: string) {
        if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
            return;
        }

        setBusy(id);
        try {
            const headers: Record<string,string> = { 'content-type': 'application/json' };
            if (token) headers['authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/docs/delete', {
                method: 'POST',
                headers,
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                setApprovals(prev => prev.filter(it => it.id !== id));
            } else {
                alert('Failed to delete document');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Failed to delete document');
        } finally {
            setBusy(null);
        }
    }

    return <PrimerProvider>
        <main style={{maxWidth: 1024, margin: "0 auto", padding: 24}}>
            <h1 className="shiny-text">Admin</h1>
            <p>Manage site options, theme, and integrations.</p>

            <section className="glass-surface" style={{padding: 16, borderRadius: 12, marginTop: 16}}>
                <h2>Overview</h2>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12}}>
                    <MetricCard label="Total docs" value={metrics?.totalDocs ?? '—'}/>
                    <MetricCard label="Pending approvals" value={metrics?.pendingApprovals ?? '—'}/>
                    <MetricCard label="Views (7d)" value={metrics?.pageViews7d ?? '—'}/>
                    <MetricCard label="Users (7d)" value={metrics?.uniqueUsers7d ?? '—'}/>
                </div>
            </section>

            <section className="glass-surface" style={{padding: 16, borderRadius: 12, marginTop: 16}}>
                <h2>Moderation</h2>
                <p style={{marginBottom: 16, opacity: 0.8}}>
                    Manage flagged comments and content moderation.
                </p>
                <Link
                    href="/admin/moderation"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
                        color: '#fff',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 107, 107, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
                    }}
                >
                    <AlertIcon size={18} />
                    View Flagged Comments
                </Link>
            </section>

            <section className="glass-surface" style={{padding: 16, borderRadius: 12, marginTop: 16}}>
                <h2>Docs approvals</h2>
                <div style={{fontSize:12, opacity:0.7, marginBottom:8}}>
                    Pending: {approvals.filter(a => a.status === 'pending').length}
                </div>
                <table style={{width:'100%', borderCollapse:'separate', borderSpacing: 0}}>
                    <thead>
                        <tr>
                            <th style={{textAlign:'left', padding: 8}}>Title</th>
                            <th style={{textAlign:'left', padding: 8}}>Author</th>
                            <th style={{textAlign:'left', padding: 8}}>Link</th>
                            <th style={{textAlign:'left', padding: 8}}>Status</th>
                            <th style={{textAlign:'left', padding: 8}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...approvals].sort((a,b) => (a.status === 'pending' ? -1 : 0) - (b.status === 'pending' ? -1 : 0)).map(item => (
                            <tr key={item.id}>
                                <td style={{padding: 8}}>{item.title}</td>
                                <td style={{padding: 8}}>{item.author}</td>
                                <td style={{padding: 8}}><a href={item.href}>{item.href}</a></td>
                                <td style={{padding: 8}}><Badge status={item.status}/></td>
                                <td style={{padding: 8, display:'flex', gap:8, flexWrap: 'wrap'}}>
                                    <button disabled={busy === item.id} onClick={() => updateApproval(item.id, 'approved')} className="glass-surface" style={{background: '#10b981', color: 'white'}}>Approve</button>
                                    <button disabled={busy === item.id} onClick={() => updateApproval(item.id, 'rejected')} className="glass-surface" style={{background: '#ef4444', color: 'white'}}>Reject</button>
                                    <button disabled={busy === item.id} onClick={() => editDocument(item)} className="glass-surface" style={{background: '#3b82f6', color: 'white'}}>Edit</button>
                                    <button disabled={busy === item.id} onClick={() => deleteDocument(item.id)} className="glass-surface" style={{background: '#7c2d12', color: 'white'}}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Edit Modal */}
            {editingDoc && (
                <section className="glass-surface" style={{
                    padding: 24,
                    borderRadius: 12,
                    marginTop: 16,
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    width: '90%',
                    maxWidth: '800px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    background: 'rgba(0, 0, 0, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
                        <h2 style={{margin: 0}}>Edit Document</h2>
                        <button
                            onClick={() => setEditingDoc(null)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#888',
                                fontSize: '24px',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    <form style={{display: 'grid', gap: 16}} onSubmit={(e) => { e.preventDefault(); saveEditedDocument(); }}>
                        <div>
                            <label style={{display: 'block', marginBottom: 8, fontWeight: 'bold'}}>Title</label>
                            <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '6px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#fff'
                                }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{display: 'block', marginBottom: 8, fontWeight: 'bold'}}>Slug</label>
                            <input
                                type="text"
                                value={editForm.slug}
                                onChange={(e) => setEditForm(prev => ({ ...prev, slug: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '6px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#fff'
                                }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{display: 'block', marginBottom: 8, fontWeight: 'bold'}}>Content (Markdown)</label>
                            <textarea
                                value={editForm.content}
                                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                rows={20}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '6px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#fff',
                                    fontFamily: 'monospace',
                                    resize: 'vertical'
                                }}
                                required
                            />
                        </div>

                        <div style={{display: 'flex', gap: 12, justifyContent: 'flex-end'}}>
                            <button
                                type="button"
                                onClick={() => setEditingDoc(null)}
                                className="glass-surface"
                                style={{background: '#6b7280'}}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={busy === editingDoc.id}
                                className="glass-surface"
                                style={{background: '#10b981'}}
                            >
                                {busy === editingDoc.id ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Modal Overlay */}
            {editingDoc && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        zIndex: 999
                    }}
                    onClick={() => setEditingDoc(null)}
                />
            )}

            <section className="glass-surface" style={{padding: 16, borderRadius: 12, marginTop: 16}}>
                <h2>Appearance</h2>
                <div style={{display: 'grid', gap: 12}}>
                    <label>
                        <input type="checkbox" defaultChecked/>
                        &nbsp; Enable dark mode by default
                    </label>
                    <label>
                        <input type="checkbox" defaultChecked/>
                        &nbsp; Use gradient hero background
                    </label>
                </div>
            </section>

            <section className="glass-surface" style={{padding: 16, borderRadius: 12, marginTop: 16}}>
                <h2>Integrations</h2>
                <div style={{display: 'grid', gap: 12}}>
                    <label>
                        Search API Key
                        <input type="password" placeholder="••••••••" style={{display:'block', width:'100%'}}/>
                    </label>
                    <label>
                        Analytics DSN
                        <input placeholder="https://..." style={{display:'block', width:'100%'}}/>
                    </label>
                    <label>
                        Admin Token (for approvals)
                        <input value={token} onChange={e => setToken(e.currentTarget.value)} placeholder="paste token" style={{display:'block', width:'100%'}}/>
                    </label>
                </div>
            </section>

            <div style={{display:'flex', gap:12, marginTop:16}}>
                <button className="glass-surface">Save</button>
                <button className="glass-surface">Reset</button>
            </div>
        </main>
    </PrimerProvider>
}

function MetricCard({ label, value }: { label: string; value: React.ReactNode }) {
    return <div className="glass-surface" style={{padding: 16, borderRadius: 12}}>
        <div style={{opacity: 0.7, fontSize: 12}}>{label}</div>
        <div style={{fontWeight: 700, fontSize: 24}}>{value}</div>
    </div>
}

function Badge({ status }: { status: string }) {
    const color = status === 'approved' ? '#16a34a' : status === 'rejected' ? '#ef4444' : '#f59e0b';
    return <span style={{background: color, color: 'white', padding: '2px 8px', borderRadius: 999, fontSize: 12}}>{status}</span>
}


