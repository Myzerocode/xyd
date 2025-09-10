"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeftIcon, CheckIcon, XIcon, EyeIcon, AlertIcon } from "@primer/octicons-react"

interface FlaggedComment {
  id: string
  slug: string
  content: string
  author: string
  createdAt: string
  flags: Array<{
    id: string
    reason: string
    flaggedAt: string
    status: 'pending' | 'reviewed' | 'dismissed'
  }>
  moderationStatus: 'pending' | 'approved' | 'rejected'
}

export default function AdminModerationPage() {
  const [flaggedComments, setFlaggedComments] = React.useState<FlaggedComment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    loadFlaggedComments()
  }, [])

  const loadFlaggedComments = async () => {
    try {
      const response = await fetch('/api/admin/flagged-comments')
      if (response.ok) {
        const data = await response.json()
        setFlaggedComments(data.comments || [])
      } else {
        setError("Failed to load flagged comments")
      }
    } catch (err) {
      setError("Failed to load flagged comments")
      console.error('Error loading flagged comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleModerate = async (commentId: string, action: 'approve' | 'reject' | 'dismiss') => {
    try {
      const response = await fetch('/api/admin/moderate-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          action
        }),
      })

      if (response.ok) {
        // Reload the comments after moderation
        await loadFlaggedComments()
      } else {
        alert(`Failed to ${action} comment`)
      }
    } catch (error) {
      console.error(`Error ${action}ing comment:`, error)
      alert(`Failed to ${action} comment`)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)',
        color: '#fff',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div>Loading flagged comments...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)',
        color: '#fff',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '4rem', color: '#ff6b6b' }}>
            <div>{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)',
      color: '#fff',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Link
            href="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#0070f3',
              textDecoration: 'none',
              padding: '0.5rem',
              borderRadius: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 112, 243, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <ArrowLeftIcon size={16} />
            Back to Admin
          </Link>

          <h1 style={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertIcon size={24} />
            Comment Moderation
          </h1>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff6b6b' }}>
              {flaggedComments.length}
            </div>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>Flagged Comments</div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffa726' }}>
              {flaggedComments.filter(c => c.moderationStatus === 'pending').length}
            </div>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>Pending Review</div>
          </div>
        </div>

        {/* Comments List */}
        {flaggedComments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            color: '#888'
          }}>
            <CheckIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <div>No flagged comments to review</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {flaggedComments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: comment.moderationStatus === 'pending' ? '1px solid #ffa726' : '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Comment Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <div style={{
                      fontWeight: 'bold',
                      color: '#fff',
                      marginBottom: '0.25rem'
                    }}>
                      {comment.author}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#888'
                    }}>
                      {new Date(comment.createdAt).toLocaleString()} •
                      <Link
                        href={`/docs/${comment.slug}`}
                        style={{
                          color: '#0070f3',
                          textDecoration: 'none',
                          marginLeft: '0.5rem'
                        }}
                      >
                        View in context
                      </Link>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      background: comment.moderationStatus === 'pending' ? '#ffa726' :
                                 comment.moderationStatus === 'approved' ? '#10b981' : '#ff6b6b',
                      color: '#000'
                    }}>
                      {comment.moderationStatus}
                    </span>
                  </div>
                </div>

                {/* Comment Content */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ color: '#fff', lineHeight: '1.5' }}>
                    {comment.content}
                  </div>
                </div>

                {/* Flags */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#888',
                    marginBottom: '0.5rem'
                  }}>
                    Flagged {comment.flags.length} time{comment.flags.length !== 1 ? 's' : ''}:
                  </div>
                  {comment.flags.map((flag) => (
                    <div
                      key={flag.id}
                      style={{
                        background: 'rgba(255, 107, 107, 0.1)',
                        border: '1px solid rgba(255, 107, 107, 0.2)',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#ff6b6b',
                        marginBottom: '0.25rem'
                      }}>
                        {new Date(flag.flaggedAt).toLocaleString()}
                      </div>
                      <div style={{ color: '#fff' }}>
                        {flag.reason}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Moderation Actions */}
                {comment.moderationStatus === 'pending' && (
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => handleModerate(comment.id, 'approve')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      <CheckIcon size={16} />
                      Approve
                    </button>

                    <button
                      onClick={() => handleModerate(comment.id, 'reject')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#ff6b6b',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      <XIcon size={16} />
                      Reject
                    </button>

                    <button
                      onClick={() => handleModerate(comment.id, 'dismiss')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#6b7280',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      <EyeIcon size={16} />
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
