"use client"

import * as React from "react";
import Link from "next/link";
import PrimerProvider from "../../PrimerProvider";
import { FileIcon, CheckCircleIcon, ClockIcon } from "@primer/octicons-react";

interface SampleDoc {
    slug: string;
    title: string;
    status: 'approved' | 'pending';
    description?: string;
}

export default function SamplesPage() {
    const [samples, setSamples] = React.useState<SampleDoc[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Define sample documents
        const sampleDocs: SampleDoc[] = [
            { slug: 'approved-1', title: 'Approved Sample 1', status: 'approved', description: 'A comprehensive example of best practices' },
            { slug: 'approved-2', title: 'Approved Sample 2', status: 'approved', description: 'Advanced implementation patterns' },
            { slug: 'approved-3', title: 'Approved Sample 3', status: 'approved', description: 'Real-world use case demonstration' },
            { slug: 'pending-1', title: 'Pending Sample 1', status: 'pending', description: 'Under review for approval' },
            { slug: 'pending-2', title: 'Pending Sample 2', status: 'pending', description: 'Awaiting final review' },
        ];
        setSamples(sampleDocs);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <PrimerProvider>
                <main style={{maxWidth: 960, margin: '0 auto', padding: 24}}>
                    <div>Loading samples...</div>
                </main>
            </PrimerProvider>
        );
    }

    return (
        <PrimerProvider>
            <main style={{maxWidth: 960, margin: '0 auto', padding: 24}}>
                <div style={{marginBottom: '2rem'}}>
                    <h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>Sample Documents</h1>
                    <p style={{fontSize: '1.2rem', color: '#666'}}>
                        Explore approved and pending sample documentation to understand best practices and implementation patterns.
                    </p>
                </div>

                <div style={{display: 'grid', gap: '1rem'}}>
                    {samples.map((sample) => (
                        <Link
                            key={sample.slug}
                            href={`/docs/samples/${sample.slug}`}
                            style={{textDecoration: 'none'}}
                        >
                            <div style={{
                                padding: '1.5rem',
                                border: '1px solid #e1e4e8',
                                borderRadius: '8px',
                                backgroundColor: '#fff',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#0366d6';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(3, 102, 214, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e1e4e8';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            >
                                <FileIcon size={24} />
                                <div style={{flex: 1}}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '0.25rem'
                                    }}>
                                        <h3 style={{margin: 0, fontSize: '1.1rem'}}>{sample.title}</h3>
                                        {sample.status === 'approved' ? (
                                            <CheckCircleIcon size={16} style={{color: '#28a745'}} />
                                        ) : (
                                            <ClockIcon size={16} style={{color: '#ffc107'}} />
                                        )}
                                    </div>
                                    <p style={{margin: 0, color: '#666', fontSize: '0.9rem'}}>
                                        {sample.description}
                                    </p>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        color: sample.status === 'approved' ? '#28a745' : '#ffc107',
                                        fontWeight: '500'
                                    }}>
                                        {sample.status === 'approved' ? 'Approved' : 'Pending Review'}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div style={{marginTop: '3rem', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
                    <h3 style={{marginTop: 0}}>Contributing Samples</h3>
                    <p style={{marginBottom: '1rem'}}>
                        Want to contribute your own sample documentation? Follow these guidelines:
                    </p>
                    <ul style={{margin: 0, paddingLeft: '1.5rem'}}>
                        <li>Ensure your sample follows established patterns and best practices</li>
                        <li>Include comprehensive documentation and comments</li>
                        <li>Test your sample across different scenarios</li>
                        <li>Submit for review through the appropriate channels</li>
                    </ul>
                </div>
            </main>
        </PrimerProvider>
    );
}
