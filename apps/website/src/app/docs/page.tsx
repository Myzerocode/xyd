"use client"

import * as React from "react";
import Link from "next/link";
import PrimerProvider from "../PrimerProvider";
import { BookIcon, CodeIcon, BeakerIcon, FileIcon, PlusIcon, ArrowRightIcon } from "@primer/octicons-react";

export default function DocsHome() {
    const [busy, setBusy] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null)
    const [recentDocs, setRecentDocs] = React.useState<any[]>([])

    // Templates for different doc types
    const templates = {
        guide: {
            title: '',
            slug: '/docs/guides/',
            content: `# Guide Title

## Overview
Brief description of what this guide covers.

## Prerequisites
What users need before starting:
- Item 1
- Item 2

## Step-by-step Instructions

### Step 1
Detailed instructions for the first step.

### Step 2
Detailed instructions for the second step.

## Next Steps
What to do after completing this guide.

## Additional Resources
- [Link 1](https://example.com)
- [Link 2](https://example.com)
`
        },
        reference: {
            title: '',
            slug: '/docs/reference/',
            content: `# API Reference: ComponentName

## Description
Brief description of what this component/function does.

## Usage

\`\`\`typescript
// Example usage
import { ComponentName } from '@package/name'

<ComponentName
  prop1="value"
  prop2={callback}
/>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| prop1 | string | - | Description of prop1 |
| prop2 | function | - | Description of prop2 |

## Examples

### Basic Usage
\`\`\`typescript
<ComponentName prop1="Hello World" />
\`\`\`

### Advanced Usage
\`\`\`typescript
<ComponentName
  prop1="Custom"
  prop2={() => console.log('callback')}
/>
\`\`\`
`
        },
        sample: {
            title: '',
            slug: '/docs/samples/',
            content: `# Sample: Title

## Overview
This sample demonstrates [describe what it shows].

## Files

### \`filename.ext\`
\`\`\`language
// Sample code here
\`\`\`

## How it works
Explanation of the sample implementation.

## Running the Sample

1. Clone the repository
2. Navigate to this sample
3. Run the following commands:

\`\`\`bash
npm install
npm run dev
\`\`\`

## Key Concepts
- Concept 1
- Concept 2
- Concept 3
`
        }
    }

    // Load recent docs on component mount
    React.useEffect(() => {
        fetch('/api/docs')
            .then(res => res.json())
            .then(data => {
                if (data.docs) {
                    setRecentDocs(data.docs.slice(0, 5)) // Show last 5 docs
                }
            })
            .catch(err => console.log('Failed to load recent docs:', err))
    }, [])

    const applyTemplate = (templateType: keyof typeof templates) => {
        setSelectedTemplate(templateType)
        const template = templates[templateType]
        // Pre-fill form with template data
        const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement
        const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement
        const contentTextarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement

        if (titleInput) titleInput.value = template.title
        if (slugInput) slugInput.value = template.slug
        if (contentTextarea) contentTextarea.value = template.content

        // Focus on title input
        setTimeout(() => titleInput?.focus(), 100)
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        const fd = new FormData(e.currentTarget)
        const title = String(fd.get('title') || '')
        const slug = String(fd.get('slug') || '')
        const content = String(fd.get('content') || '')
        const author = String(fd.get('author') || '')

        if (!title.trim()) {
            setError('Please enter a title for your documentation')
            return
        }
        if (!slug.trim()) {
            setError('Please enter a slug (URL path) for your documentation')
            return
        }
        if (!content.trim()) {
            setError('Please add some content to your documentation')
            return
        }

        setBusy(true)
        try {
            const res = await fetch('/api/docs/new', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ title, slug, content, author: author || undefined })
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok && data?.href) {
                window.location.assign(data.href)
            } else {
                setError(typeof data?.error === 'string' ? data.error : 'Failed to create documentation')
            }
        } finally {
            setBusy(false)
        }
    }

    return <PrimerProvider>
        <main style={{maxWidth: 1200, margin: "0 auto", padding: 24}}>
            {/* Header Section */}
            <div style={{textAlign: 'center', marginBottom: '3rem'}}>
                <h1 className="shiny-text" style={{fontSize: '2.5rem', marginBottom: '1rem'}}>
                    Create Sophosic Documentation
                </h1>
                <p style={{fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto'}}>
                    Build comprehensive documentation for your project with Sophosic. Choose a template to get started quickly,
                    or create custom documentation from scratch.
                </p>
            </div>

            {/* Quick Start Templates */}
            <section style={{marginBottom: '3rem'}}>
                <h2 style={{fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <PlusIcon size={20} />
                    Quick Start Templates
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    {/* Guide Template Card */}
                    <div
                        onClick={() => applyTemplate('guide')}
                        style={{
                            padding: '2rem',
                            border: selectedTemplate === 'guide' ? '2px solid #0070f3' : '2px solid #e1e5e9',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: selectedTemplate === 'guide' ? '#f0f8ff' : '#fff',
                            boxShadow: selectedTemplate === 'guide' ? '0 4px 12px rgba(0, 112, 243, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                            if (selectedTemplate !== 'guide') {
                                e.currentTarget.style.borderColor = '#0070f3'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 112, 243, 0.1)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedTemplate !== 'guide') {
                                e.currentTarget.style.borderColor = '#e1e5e9'
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }
                        }}
                    >
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem'}}>
                            <BookIcon size={24} />
                            <h3 style={{margin: 0, fontSize: '1.25rem'}}>Guide</h3>
                        </div>
                        <p style={{color: '#666', margin: 0, lineHeight: 1.5}}>
                            Step-by-step tutorials and walkthroughs for users and developers.
                            Perfect for getting started guides, configuration tutorials, and how-to documentation.
                        </p>
                    </div>

                    {/* Reference Template Card */}
                    <div
                        onClick={() => applyTemplate('reference')}
                        style={{
                            padding: '2rem',
                            border: selectedTemplate === 'reference' ? '2px solid #0070f3' : '2px solid #e1e5e9',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: selectedTemplate === 'reference' ? '#f0f8ff' : '#fff',
                            boxShadow: selectedTemplate === 'reference' ? '0 4px 12px rgba(0, 112, 243, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                            if (selectedTemplate !== 'reference') {
                                e.currentTarget.style.borderColor = '#0070f3'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 112, 243, 0.1)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedTemplate !== 'reference') {
                                e.currentTarget.style.borderColor = '#e1e5e9'
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }
                        }}
                    >
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem'}}>
                            <CodeIcon size={24} />
                            <h3 style={{margin: 0, fontSize: '1.25rem'}}>API Reference</h3>
                        </div>
                        <p style={{color: '#666', margin: 0, lineHeight: 1.5}}>
                            Technical documentation for APIs, components, and functions.
                            Includes usage examples, parameters, and detailed specifications.
                        </p>
                    </div>

                    {/* Sample Template Card */}
                    <div
                        onClick={() => applyTemplate('sample')}
                        style={{
                            padding: '2rem',
                            border: selectedTemplate === 'sample' ? '2px solid #0070f3' : '2px solid #e1e5e9',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: selectedTemplate === 'sample' ? '#f0f8ff' : '#fff',
                            boxShadow: selectedTemplate === 'sample' ? '0 4px 12px rgba(0, 112, 243, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                            if (selectedTemplate !== 'sample') {
                                e.currentTarget.style.borderColor = '#0070f3'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 112, 243, 0.1)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedTemplate !== 'sample') {
                                e.currentTarget.style.borderColor = '#e1e5e9'
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }
                        }}
                    >
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem'}}>
                            <BeakerIcon size={24} />
                            <h3 style={{margin: 0, fontSize: '1.25rem'}}>Sample</h3>
                        </div>
                        <p style={{color: '#666', margin: 0, lineHeight: 1.5}}>
                            Code examples and demonstrations. Show how to use features
                            with complete, runnable examples and explanations.
                        </p>
                    </div>
                </div>
            </section>

            {/* Documentation Form */}
            <section>
                <h2 style={{fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <FileIcon size={20} />
                    Create Your Documentation
                </h2>

                <form onSubmit={onSubmit} style={{
                    backgroundColor: '#f8f9fa',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid #e1e5e9'
                }}>
                    <div style={{display: 'grid', gap: '1.5rem'}}>

                        {/* Title Field */}
                        <div>
                            <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem'}}>
                                Title *
                            </label>
                            <input
                                name="title"
                                placeholder="Enter a descriptive title for your documentation"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    transition: 'border-color 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#0070f3'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                required
                            />
                            <p style={{fontSize: '0.875rem', color: '#666', margin: '0.25rem 0 0 0'}}>
                                Choose a clear, descriptive title that explains what the documentation covers
                            </p>
                        </div>

                        {/* Author Field */}
                        <div>
                            <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem'}}>
                                Author
                </label>
                            <input
                                name="author"
                                placeholder="Your name or username"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    transition: 'border-color 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#0070f3'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>

                        {/* Slug Field */}
                        <div>
                            <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem'}}>
                                URL Slug *
                </label>
                            <input
                                name="slug"
                                placeholder="/docs/guides/getting-started"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    transition: 'border-color 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#0070f3'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                required
                            />
                            <p style={{fontSize: '0.875rem', color: '#666', margin: '0.25rem 0 0 0'}}>
                                The URL path where this documentation will be accessible
                            </p>
                        </div>

                        {/* Content Field */}
                        <div>
                            <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem'}}>
                                Content (Markdown) *
                </label>
                            <textarea
                                name="content"
                                placeholder="Write your documentation content here using Markdown formatting..."
                                rows={20}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    fontFamily: 'monospace',
                                    lineHeight: 1.5,
                                    resize: 'vertical',
                                    transition: 'border-color 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#0070f3'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                required
                            />
                            <p style={{fontSize: '0.875rem', color: '#666', margin: '0.25rem 0 0 0'}}>
                                Use Markdown formatting. Supports headings, code blocks, lists, links, and more.
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                padding: '1rem',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                color: '#dc2626'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            flexWrap: 'wrap',
                            alignItems: 'center'
                        }}>
                            <button
                                className="glass-surface"
                                type="submit"
                                disabled={busy}
                                style={{
                                    padding: '0.75rem 2rem',
                                    backgroundColor: '#0070f3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: '600',
                                    cursor: busy ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {busy ? (
                                    <>Creating...</>
                                ) : (
                                    <>
                                        <PlusIcon size={16} />
                                        Create Documentation
                                    </>
                                )}
                            </button>

                            <button
                                className="glass-surface"
                                type="button"
                                style={{
                                    padding: '0.75rem 2rem',
                                    backgroundColor: 'transparent',
                                    color: '#0070f3',
                                    border: '1px solid #0070f3',
                                    borderRadius: '6px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#0070f3'
                                    e.currentTarget.style.color = 'white'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                    e.currentTarget.style.color = '#0070f3'
                                }}
                            >
                                Import from File
                            </button>
                        </div>
                    </div>
                </form>
            </section>

            {/* Recent Docs Section */}
            {recentDocs.length > 0 && (
                <section style={{marginTop: '3rem'}}>
                    <h2 style={{fontSize: '1.5rem', marginBottom: '1.5rem'}}>
                        Recent Documentation
                    </h2>
                    <div style={{display: 'grid', gap: '1rem'}}>
                        {recentDocs.map((doc: any, index: number) => (
                            <Link
                                key={index}
                                href={doc.slug || `/docs/${doc.id}`}
                                style={{
                                    padding: '1rem',
                                    backgroundColor: '#fff',
                                    border: '1px solid #e1e5e9',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#0070f3'
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 112, 243, 0.1)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e1e5e9'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            >
                                <div>
                                    <h3 style={{margin: 0, fontSize: '1.1rem'}}>{doc.title || 'Untitled'}</h3>
                                    <p style={{margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem'}}>
                                        {doc.slug || `/docs/${doc.id}`}
                                    </p>
                                </div>
                                <ArrowRightIcon size={16} />
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Help Section */}
            <section style={{
                marginTop: '3rem',
                padding: '2rem',
                backgroundColor: '#f0f8ff',
                borderRadius: '12px',
                border: '1px solid #b3d9ff'
            }}>
                <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>Need Help Getting Started?</h2>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
                    <div>
                        <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>📚 Browse Guides</h3>
                        <p style={{margin: 0, color: '#666'}}>
                            Check out our comprehensive guides for different types of documentation.
                        </p>
                    </div>
                    <div>
                        <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>💡 View Samples</h3>
                        <p style={{margin: 0, color: '#666'}}>
                            See examples of well-written documentation across different categories.
                        </p>
                    </div>
                    <div>
                        <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>🔧 Use Templates</h3>
                        <p style={{margin: 0, color: '#666'}}>
                            Start with pre-built templates that include the right structure and formatting.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    </PrimerProvider>
}


