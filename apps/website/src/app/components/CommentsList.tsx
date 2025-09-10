"use client"

import * as React from "react"
import { CommentForm } from "./CommentForm"
import { CommentIcon, HeartIcon, ReportIcon } from "@primer/octicons-react"

interface Comment {
  id: string
  slug: string
  content: string
  author: string
  createdAt: string
  likes?: number
  replies?: Comment[]
  parentId?: string
}

interface CommentsListProps {
  slug: string
  className?: string
}

function CommentItem({
  comment,
  slug,
  depth = 0,
  onReply
}: {
  comment: Comment
  slug: string
  depth?: number
  onReply?: (commentId: string) => void
}) {
  const [showReplyForm, setShowReplyForm] = React.useState(false)
  const [likes, setLikes] = React.useState(comment.likes || 0)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`

    return date.toLocaleDateString()
  }

  const handleLike = () => {
    setLikes(prev => prev + 1)
    // TODO: Implement actual like functionality with API
  }

  const handleReply = () => {
    setShowReplyForm(!showReplyForm)
  }

  const handleFlag = async (commentId: string) => {
    try {
      const response = await fetch('/api/comments/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          reason: 'Reported for review'
        }),
      })

      if (response.ok) {
        alert('Comment has been flagged for review. Thank you for helping keep our community safe!')
      } else {
        alert('Failed to flag comment. Please try again.')
      }
    } catch (error) {
      console.error('Error flagging comment:', error)
      alert('Failed to flag comment. Please try again.')
    }
  }

  return (
    <div style={{
      marginLeft: depth > 0 ? `${depth * 2}rem` : 0,
      marginBottom: '1.5rem',
      padding: depth > 0 ? '1rem' : 0,
      borderLeft: depth > 0 ? '2px solid rgba(255, 255, 255, 0.1)' : 'none'
    }}>
      <div style={{
        background: depth > 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
        border: depth > 0 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
        borderRadius: '8px',
        padding: depth > 0 ? '1rem' : 0
      }}>
        {/* Comment Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{
              fontWeight: '600',
              color: '#0070f3',
              fontSize: '0.9rem'
            }}>
              {comment.author}
            </span>
            <span style={{
              fontSize: '0.8rem',
              color: '#888',
              opacity: 0.7
            }}>
              {formatDate(comment.createdAt)}
            </span>
            {depth > 0 && (
              <span style={{
                fontSize: '0.8rem',
                color: '#666',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '0.2rem 0.5rem',
                borderRadius: '10px'
              }}>
                Reply
              </span>
            )}
          </div>
        </div>

        {/* Comment Content */}
        <div style={{
          color: '#fff',
          lineHeight: '1.5',
          marginBottom: '0.75rem',
          whiteSpace: 'pre-wrap'
        }}>
          {comment.content}
        </div>

        {/* Comment Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <button
            onClick={handleLike}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '0.8rem',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#888'
            }}
          >
            <HeartIcon size={14} />
            <span>{likes}</span>
          </button>

          {depth < 2 && ( // Limit reply depth to 2 levels
            <button
              onClick={handleReply}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: 'transparent',
                border: 'none',
                color: '#888',
                fontSize: '0.8rem',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#888'
              }}
            >
              ↩️
              <span>Reply</span>
            </button>
          )}

          <button
            onClick={() => handleFlag(comment.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '0.8rem',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.color = '#ff6b6b'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#888'
            }}
            title="Flag for review"
          >
            <ReportIcon size={14} />
            <span>Flag</span>
          </button>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div style={{ marginTop: '1rem' }}>
            <CommentForm
              slug={slug}
              parentId={comment.id}
              placeholder={`Reply to ${comment.author}...`}
              onCommentAdded={() => {
                setShowReplyForm(false)
                // TODO: Refresh comments list
              }}
            />
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                slug={slug}
                depth={depth + 1}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function CommentsList({ slug, className = "" }: CommentsListProps) {
  const [comments, setComments] = React.useState<Comment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch comments")
      }

      setComments(data.comments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchComments()
  }, [slug])

  const handleCommentAdded = () => {
    fetchComments() // Refresh comments after new comment is added
  }

  if (loading) {
    return (
      <div className={`comments-list ${className}`} style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#888'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <CommentIcon size={16} />
          <span>Loading comments...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`comments-list ${className}`} style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#ef4444'
      }}>
        <div>Error loading comments: {error}</div>
      </div>
    )
  }

  return (
    <div className={`comments-list ${className}`}>
      {/* Comment Form */}
      <CommentForm
        slug={slug}
        onCommentAdded={handleCommentAdded}
      />

      {/* Comments Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <CommentIcon size={16} />
        <h3 style={{
          margin: 0,
          color: '#fff',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#888',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '8px'
        }}>
          <CommentIcon size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <div>No comments yet. Be the first to share your thoughts!</div>
        </div>
      ) : (
        <div>
          {comments
            .filter(comment => !comment.parentId) // Only show top-level comments
            .map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                slug={slug}
                onReply={(commentId) => {
                  // Handle reply functionality if needed
                }}
              />
            ))}
        </div>
      )}
    </div>
  )
}
